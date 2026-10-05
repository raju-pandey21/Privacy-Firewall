const patterns = [
  // --------------------------------------------------
  // Email
  // --------------------------------------------------
  {
    type: "EMAIL",
    category: "Personal Data",
    risk: "HIGH",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },

  // --------------------------------------------------
  // Indian Phone Number
  // --------------------------------------------------
  {
    type: "PHONE",
    category: "Personal Data",
    risk: "HIGH",
    regex: /(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)/g,
  },

  // --------------------------------------------------
  // Aadhaar
  // --------------------------------------------------
  {
    type: "AADHAAR",
    category: "Identity",
    risk: "CRITICAL",
    regex: /(?<!\d)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?!\d)/g,
  },

  // --------------------------------------------------
  // PAN
  // --------------------------------------------------
  {
    type: "PAN",
    category: "Identity",
    risk: "CRITICAL",
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
  },

  // --------------------------------------------------
  // API Keys
  // --------------------------------------------------
  {
    type: "API_KEY",
    category: "Credentials",
    risk: "CRITICAL",
    regex:
      /\b(?:sk_(?:live|test)_[A-Za-z0-9_-]+|AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16})\b/g,
  },

  // --------------------------------------------------
  // Password
  // --------------------------------------------------
  {
    type: "PASSWORD",
    category: "Credentials",
    risk: "CRITICAL",
    regex:
      /\b(?:password|passwd|pwd)\s*[:=]\s*["']?([^\s"',;]+)["']?/gi,
  },

  // --------------------------------------------------
  // Credit / Debit Card
  // --------------------------------------------------
  {
    type: "CARD",
    category: "Financial Data",
    risk: "CRITICAL",
    regex: /(?<!\d)(?:\d[ -]?){13,19}(?!\d)/g,
  },

  // --------------------------------------------------
  // UPI ID
  // --------------------------------------------------
  // Normal email is NOT detected as UPI.
  // UPI is detected only with UPI/VPA/payment context.
  // --------------------------------------------------
  {
    type: "UPI_ID",
    category: "Financial Data",
    risk: "HIGH",
    regex:
      /\b(?:upi|upi[_\s-]?id|vpa|payment[_\s-]?id)\s*(?:is|:|=)?\s*[a-zA-Z0-9][a-zA-Z0-9._-]{1,}@[a-zA-Z][a-zA-Z0-9.-]{1,}\b/gi,
  },

  // --------------------------------------------------
  // Person Name
  // --------------------------------------------------
  {
    type: "PERSON",
    category: "Identity",
    risk: "MEDIUM",
    regex:
      /\b(?:my name is|name is|employee name is|customer name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g,
  },
];

// --------------------------------------------------
// Risk Weights
// --------------------------------------------------

const riskWeight = {
  CRITICAL: 38,
  HIGH: 25,
  MEDIUM: 14,
  LOW: 5,
};

// --------------------------------------------------
// Calculate Risk Score
// --------------------------------------------------

function calculateRiskScore(detections) {
  if (!detections.length) {
    return 0;
  }

  const rawScore = detections.reduce(
    (total, detection) => {
      return total + (riskWeight[detection.risk] || 0);
    },
    0
  );

  return Math.min(100, Math.max(10, rawScore));
}

// --------------------------------------------------
// Risk Level
// --------------------------------------------------

function getRiskLevel(score) {
  if (score >= 90) {
    return "CRITICAL";
  }

  if (score >= 70) {
    return "HIGH";
  }

  if (score >= 40) {
    return "MEDIUM";
  }

  if (score > 0) {
    return "LOW";
  }

  return "SAFE";
}

// --------------------------------------------------
// Detection Engine
// --------------------------------------------------

function detectSensitiveData(text) {
  if (typeof text !== "string") {
    throw new TypeError("Text must be a string");
  }

  if (!text.trim()) {
    return {
      detections: [],
      riskScore: 0,
      riskLevel: "SAFE",
      detectionCount: 0,
      detectedTypes: [],
    };
  }

  const detections = [];

  // ------------------------------------------------
  // Run all detection patterns
  // ------------------------------------------------

  for (const pattern of patterns) {
    const regex = new RegExp(
      pattern.regex.source,
      pattern.regex.flags
    );

    let match;

    while ((match = regex.exec(text)) !== null) {
      const value = match[0];

      if (!value) {
        break;
      }

      detections.push({
        type: pattern.type,
        category: pattern.category,
        risk: pattern.risk,
        value,
      });

      // Prevent infinite loops for zero-length matches
      if (regex.lastIndex === match.index) {
        regex.lastIndex += 1;
      }
    }
  }

  // ------------------------------------------------
  // Remove exact duplicate detections
  // ------------------------------------------------

  const uniqueDetections = detections.filter(
    (detection, index, array) => {
      return (
        index ===
        array.findIndex(
          (item) =>
            item.type === detection.type &&
            item.value === detection.value
        )
      );
    }
  );

  // ------------------------------------------------
  // Calculate Risk Score
  // ------------------------------------------------

  const riskScore =
    calculateRiskScore(uniqueDetections);

  // ------------------------------------------------
  // Detected Types
  // ------------------------------------------------

  const detectedTypes = [
    ...new Set(
      uniqueDetections.map(
        (detection) => detection.type
      )
    ),
  ];

  // ------------------------------------------------
  // Final Result
  // ------------------------------------------------

  return {
    detections: uniqueDetections,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    detectionCount: uniqueDetections.length,
    detectedTypes,
  };
}

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  detectSensitiveData,
  calculateRiskScore,
  getRiskLevel,
};