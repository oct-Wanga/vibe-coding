import { Kafka, logLevel } from "kafkajs";

import { BROKERS, TOPICS } from "./config.mjs";

const groupId = process.env.GROUP_ID ?? `project-events-worker-${Date.now()}`;
const runIdFilter = process.env.RUN_ID ?? "";
const maxMessages = Number.parseInt(process.env.MAX_MESSAGES ?? "0", 10);

const kafka = new Kafka({
  clientId: "project-events-consumer",
  brokers: BROKERS,
  logLevel: logLevel.NOTHING,
});

const consumer = kafka.consumer({ groupId });
const producer = kafka.producer({ retry: { retries: 10 } });

let processed = 0;

const toMessage = (bufferValue) => (bufferValue ? bufferValue.toString() : "");

const handleRecord = async ({ key, value, offset }) => {
  const keyText = toMessage(key);
  const rawValue = toMessage(value);

  try {
    const event = JSON.parse(rawValue);
    if (runIdFilter && event.run_id !== runIdFilter) {
      return "skip";
    }
    if (event.force_fail === true) {
      throw new Error("force_fail=true");
    }

    processed += 1;
    console.log(`[ok] offset=${offset} key=${keyText} project=${event.project_id}`);
    return "ok";
  } catch (error) {
    // 재처리/원인분석이 가능하도록 실패 컨텍스트를 DLQ에 저장
    const dlqEvent = {
      source_topic: TOPICS.projectsCreated,
      failed_offset: offset,
      failed_at: new Date().toISOString(),
      reason: error instanceof Error ? error.message : String(error),
      original_key: keyText,
      original_value: rawValue,
    };

    await producer.send({
      topic: TOPICS.dlq,
      messages: [{ key: keyText, value: JSON.stringify(dlqEvent) }],
      acks: -1,
    });

    processed += 1;
    console.error(`[dlq] offset=${offset} key=${keyText}`);
    return "dlq";
  }
};

const stopIfNeeded = async () => {
  if (maxMessages > 0 && processed >= maxMessages) {
    await consumer.stop();
  }
};

const main = async () => {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.projectsCreated, fromBeginning: true });

  await consumer.run({
    // 수동 커밋으로 "처리하지 못한 레코드의 오프셋 선커밋"을 방지
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

        await handleRecord(message);
        resolveOffset(message.offset);
        await commitOffsetsIfNecessary();
        await heartbeat();
        await stopIfNeeded();
      }
    },
  });
};

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await consumer.stop();
  });
}

try {
  await main();
} catch (error) {
  console.error("[kafka] consumer failed", error);
  process.exitCode = 1;
} finally {
  await Promise.allSettled([consumer.disconnect(), producer.disconnect()]);
}
