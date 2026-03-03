import { Kafka, logLevel } from "kafkajs";

import { BROKERS, TOPIC_CONFIGS } from "./config.mjs";

const kafka = new Kafka({
  clientId: "kafka-topic-admin",
  brokers: BROKERS,
  logLevel: logLevel.NOTHING,
});

const admin = kafka.admin();

const main = async () => {
  await admin.connect();
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
