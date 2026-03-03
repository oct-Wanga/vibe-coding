import { Kafka, logLevel } from "kafkajs";

import { BROKERS, TOPICS } from "./config.mjs";

const groupId = process.env.GROUP_ID ?? `dlq-reader-${Date.now()}`;
const runIdFilter = process.env.RUN_ID ?? "";
const maxMessages = Number.parseInt(process.env.MAX_MESSAGES ?? "20", 10);

const kafka = new Kafka({
  clientId: "dlq-consumer",
  brokers: BROKERS,
  logLevel: logLevel.NOTHING,
});

const consumer = kafka.consumer({ groupId });

let seen = 0;

const toText = (bufferValue) => (bufferValue ? bufferValue.toString() : "");

const main = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.dlq, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (maxMessages > 0 && seen >= maxMessages) {
        await consumer.stop();
        return;
      }

      const valueText = toText(message.value);

      try {
        const item = JSON.parse(valueText);
        if (runIdFilter && !valueText.includes(runIdFilter)) {
          return;
        }
        seen += 1;
        console.log(`[dlq] key=${toText(message.key)} reason=${item.reason}`);
      } catch {
        seen += 1;
        console.log(`[dlq] key=${toText(message.key)} raw=${valueText}`);
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
  console.error("[kafka] dlq consumer failed", error);
  process.exitCode = 1;
} finally {
  await consumer.disconnect();
}
