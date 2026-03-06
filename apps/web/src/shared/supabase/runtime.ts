type MockDecisionInput = {
  hasEnv: boolean;
  hasClaims: boolean;
  nodeEnv?: string;
};

export function shouldUseMockProjects({
  hasEnv,
  hasClaims,
  nodeEnv = process.env.NODE_ENV,
}: MockDecisionInput) {
  if (!hasEnv) return true;
  if (hasClaims) return false;
  return nodeEnv !== "production";
}
