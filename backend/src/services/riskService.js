const severityWeights = {
  low: 10,
  medium: 25,
  high: 40,
  critical: 60,
};

const calculateRiskScore = (detections = []) => {
  if (!detections.length) {
    return {
      score: 0,
      level: "LOW",
    };
  }

  let score = 0;

  detections.forEach((detection) => {
    const weight = severityWeights[detection.severity] || 0;
    score += weight;
  });

  // Maximum score 100
  score = Math.min(score, 100);

  let level = "LOW";

  if (score >= 81) {
    level = "CRITICAL";
  } else if (score >= 61) {
    level = "HIGH";
  } else if (score >= 31) {
    level = "MEDIUM";
  }

  return {
    score,
    level,
  };
};

module.exports = {
  calculateRiskScore,
};