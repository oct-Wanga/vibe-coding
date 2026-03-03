// 학습/데모용 단일 브로커 로컬 구성
export const BROKERS = ["localhost:9094"];

// 스키마 변경을 안전하게 관리하기 위해 토픽명에 버전을 포함
export const TOPICS = {
  projectsCreated: "projects.project-created.v1",
  dlq: "events.dlq.v1",
};

// 로컬 스모크 테스트 기본 토픽 설정
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
