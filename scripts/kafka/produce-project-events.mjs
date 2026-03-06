import crypto from "node:crypto";

import { CompressionTypes, Kafka, Partitioners, logLevel } from "kafkajs";

import { BROKERS, TOPICS } from "./config.mjs";

const count = Number.parseInt(process.env.COUNT ?? "100", 10);
const failEvery = Number.parseInt(process.env.FAIL_EVERY ?? "10", 10);
const runId = process.env.RUN_ID ?? `run-${Date.now()}`;

const kafka = new Kafka({
  clientId: "project-events-producer",
  brokers: BROKERS,
  logLevel: logLevel.NOTHING,
});

const producer = kafka.producer({
  // 실무 기본 안전값: 안정적 파티셔닝 + 멱등 프로듀서
  createPartitioner: Partitioners.DefaultPartitioner,
  idempotent: true,
  maxInFlightRequests: 1,
  retry: { retries: 10 },
});

const buildMessage = (index) => {
  const projectId = `project-${(index % 8) + 1}`;
  // force_fail 플래그로 워커에서 DLQ 흐름을 재현
  const shouldFail = failEvery > 0 && index % failEvery === 0;
  const payload = {
    event_id: crypto.randomUUID(),
    event_type: "project.created",
    schema_version: 1,
    occurred_at: new Date().toISOString(),
    run_id: runId,
    project_id: projectId,
    name: `Project ${index + 1}`,
    force_fail: shouldFail,
  };

  return {
    key: projectId,
    value: JSON.stringify(payload),
    headers: {
      "event-type": "project.created",
      "schema-version": "1",
      "run-id": runId,
    },
  };
};

const main = async () => {
  await producer.connect();
  const messages = Array.from({ length: count }, (_, index) => buildMessage(index));

  await producer.send({
    topic: TOPICS.projectsCreated,
    acks: -1,
    compression: CompressionTypes.GZIP,
    messages,
  });

  console.log(
    `[kafka] produced ${messages.length} events to ${TOPICS.projectsCreated} (run_id=${runId}, fail_every=${failEvery})`,
  );
};

try {
  await main();
} catch (error) {
  console.error("[kafka] failed to produce events", error);
  process.exitCode = 1;
} finally {
  await producer.disconnect();
}
