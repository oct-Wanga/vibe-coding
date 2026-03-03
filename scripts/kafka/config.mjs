export const BROKERS = ["localhost:9092"];

export const TOPICS = {
  projectsCreated: "projects.project-created.v1",
  dlq: "events.dlq.v1",
};

export const TOPIC_CONFIGS = [
  {
    topic: TOPICS.projectsCreated,
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [{ name: "retention.ms", value: String(7 * 24 * 60 * 60 * 1000) }],
  },
  {
    topic: TOPICS.dlq,
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [{ name: "retention.ms", value: String(7 * 24 * 60 * 60 * 1000) }],
  },
];
