import { Kafka, logLevel } from "kafkajs";

import { BROKERS, TOPIC_CONFIGS } from "./config.mjs";

// 토픽 초기 생성(부트스트랩) 전용 Admin 클라이언트
const kafka = new Kafka({
  clientId: "kafka-topic-admin",
  brokers: BROKERS,
  logLevel: logLevel.NOTHING,
});

const admin = kafka.admin();

const main = async () => {
  await admin.connect();
  // 같은 토픽이 이미 있으면 그대로 유지되는 멱등 호출
  await admin.createTopics({
    waitForLeaders: true,
    topics: TOPIC_CONFIGS,
  });
  console.log(
    `[kafka] topics ready: ${TOPIC_CONFIGS.map((topicConfig) => topicConfig.topic).join(", ")}`,
  );
};

try {
  await main();
} catch (error) {
  console.error("[kafka] failed to create topics", error);
  process.exitCode = 1;
} finally {
  await admin.disconnect();
}
