import crypto from "node:crypto";

import { Kafka, logLevel } from "kafkajs";

import { BROKERS, TOPIC_CONFIGS, TOPICS } from "./config.mjs";

const totalMessages = Number.parseInt(process.env.COUNT ?? "100", 10);
const failEvery = Number.parseInt(process.env.FAIL_EVERY ?? "10", 10);
const runId = process.env.RUN_ID ?? `smoke-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

const kafka = new Kafka({
  clientId: "kafka-smoke-test",
  brokers: BROKERS,
  logLevel: logLevel.NOTHING,
});

const admin = kafka.admin();
const producer = kafka.producer({ idempotent: true, retry: { retries: 10 } });

const makeEvent = (index) => {
  const projectId = `project-${(index % 8) + 1}`;
  return {
    key: projectId,
    value: JSON.stringify({
      event_id: crypto.randomUUID(),
      event_type: "project.created",
      schema_version: 1,
      occurred_at: new Date().toISOString(),
      run_id: runId,
      project_id: projectId,
      name: `Project ${index + 1}`,
      force_fail: failEvery > 0 && index % failEvery === 0,
    }),
  };
};

const runWorker = async () => {
  const groupId = `smoke-worker-${Date.now()}`;
  const consumer = kafka.consumer({ groupId });
  const dlqProducer = kafka.producer({ retry: { retries: 10 } });
  let okCount = 0;
  let dlqCount = 0;
  let scanned = 0;

  await Promise.all([consumer.connect(), dlqProducer.connect()]);
  await consumer.subscribe({ topic: TOPICS.projectsCreated, fromBeginning: true });
  const expectedTotal = totalMessages;
  let resolveDone;
  let rejectDone;
  const done = new Promise((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });
  console.log(`[kafka-test] worker start (group_id=${groupId})`);
  const timeoutHandle = setTimeout(() => {
    rejectDone(new Error("worker timeout: run_id message consumption not completed in time"));
  }, 30_000);

  await consumer.run({
    autoCommit: false,
    eachBatchAutoResolve: false,
    eachBatch: async ({
      batch,
      heartbeat,
      resolveOffset,
      commitOffsetsIfNecessary,
      isRunning,
      isStale,
    }) => {
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) {
          break;
        }
        scanned += 1;
        const rawValue = message.value?.toString() ?? "";
        let payload;

        try {
          payload = JSON.parse(rawValue);
        } catch {
          payload = null;
        }

        if (payload?.run_id !== runId) {
          // 다른 실행(run_id)의 과거 메시지는 건너뜀.
          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
          await heartbeat();
          continue;
        }

        if (payload.force_fail) {
          await dlqProducer.send({
            topic: TOPICS.dlq,
            messages: [
              {
                key: message.key?.toString(),
                value: JSON.stringify({
                  source_topic: TOPICS.projectsCreated,
                  failed_offset: message.offset,
                  failed_at: new Date().toISOString(),
                  reason: "force_fail=true",
                  run_id: runId,
                  original_value: rawValue,
                }),
              },
            ],
          });
          dlqCount += 1;
        } else {
          okCount += 1;
        }

        const handled = okCount + dlqCount;
        if (handled % 20 === 0 || handled === expectedTotal) {
          console.log(
            `[kafka-test] worker progress handled=${handled}/${expectedTotal} (ok=${okCount}, dlq=${dlqCount})`,
          );
        }

        resolveOffset(message.offset);
        await commitOffsetsIfNecessary();
        await heartbeat();

        if (okCount + dlqCount >= totalMessages) {
          clearTimeout(timeoutHandle);
          resolveDone();
          break;
        }

        if (scanned > totalMessages * 50) {
          // 토픽이 너무 오래 쌓였을 때 무한 스캔을 방지.
          clearTimeout(timeoutHandle);
          rejectDone(
            new Error("too many historical records scanned; clean topic or adjust retention"),
          );
          break;
        }
      }
    },
  });

  await done;
  await consumer.stop();
  await Promise.all([consumer.disconnect(), dlqProducer.disconnect()]);
  return { okCount, dlqCount };
};

const verifyDlq = async (expectedDlqCount) => {
  if (expectedDlqCount === 0) {
    console.log("[kafka-test] dlq verify skipped (expected=0)");
    return 0;
  }
  const groupId = `smoke-dlq-${Date.now()}`;
  const consumer = kafka.consumer({ groupId });
  let dlqFound = 0;
  let scanned = 0;
  let resolveDone;
  let rejectDone;
  const done = new Promise((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });
  console.log(`[kafka-test] dlq verify start (group_id=${groupId}, expected=${expectedDlqCount})`);
  const timeoutHandle = setTimeout(() => {
    rejectDone(new Error("dlq verify timeout: expected run_id messages not found"));
  }, 30_000);

  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.dlq, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      scanned += 1;
      const raw = message.value?.toString() ?? "";
      if (raw.includes(runId)) {
        dlqFound += 1;
        if (dlqFound % 5 === 0 || dlqFound === expectedDlqCount) {
          console.log(`[kafka-test] dlq verify progress found=${dlqFound}/${expectedDlqCount}`);
        }
      }
      if (dlqFound >= expectedDlqCount) {
        clearTimeout(timeoutHandle);
        resolveDone();
      }
      if (scanned > totalMessages * 50) {
        clearTimeout(timeoutHandle);
        rejectDone(new Error("too many historical DLQ records scanned"));
      }
    },
  });

  await done;
  await consumer.stop();
  await consumer.disconnect();
  return dlqFound;
};

const main = async () => {
  // 1) 토픽 보장
  console.log("[kafka-test] step 1/3: ensure topics");
  await admin.connect();
  await admin.createTopics({ waitForLeaders: true, topics: TOPIC_CONFIGS });
  await admin.disconnect();
  console.log("[kafka-test] topics ready");

  // 2) 테스트 이벤트 발행
  console.log(
    `[kafka-test] step 2/3: produce messages (count=${totalMessages}, fail_every=${failEvery}, run_id=${runId})`,
  );
  await producer.connect();
  const messages = Array.from({ length: totalMessages }, (_, index) => makeEvent(index));
  await producer.send({ topic: TOPICS.projectsCreated, acks: -1, messages });
  await producer.disconnect();
  console.log("[kafka-test] produce done");

  // 3) 워커 처리 + DLQ 검증
  console.log("[kafka-test] step 3/3: consume + dlq verify");
  const expectedDlqCount = failEvery > 0 ? Math.ceil(totalMessages / failEvery) : 0;
  const { okCount, dlqCount } = await runWorker();
  const dlqVerified = await verifyDlq(expectedDlqCount);

  console.log(
    `[kafka-test] run_id=${runId} total=${totalMessages} ok=${okCount} dlq=${dlqCount} dlq_verified=${dlqVerified}`,
  );

  if (dlqCount !== expectedDlqCount || dlqVerified !== expectedDlqCount) {
    throw new Error(
      `DLQ mismatch: expected=${expectedDlqCount}, worker=${dlqCount}, verified=${dlqVerified}`,
    );
  }
};

try {
  await main();
} catch (error) {
  console.error("[kafka-test] smoke test failed", error);
  process.exitCode = 1;
} finally {
  await Promise.allSettled([admin.disconnect(), producer.disconnect()]);
}
