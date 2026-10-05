const crypto = require("crypto");

const {
  detectSensitiveData,
} = require("./detectionService");

const {
  applyPolicy,
} = require("./policyService");

const {
  protectText,
} = require("./protectionService");

// --------------------------------------------------
// Generate Request ID
// --------------------------------------------------

const generateRequestId = () => {
  return `PF-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
};

// --------------------------------------------------
// Scan Request
// --------------------------------------------------

const scanRequest = async ({
  text,
  policyRules = [],
  source = "Web Scanner",
}) => {
  const startTime =
    Date.now();

  // ----------------------------------------------
  // Validate Input
  // ----------------------------------------------

  if (
    typeof text !== "string"
  ) {
    throw new TypeError(
      "Scan text must be a string"
    );
  }

  const trimmedText =
    text.trim();

  if (!trimmedText) {
    throw new Error(
      "Scan text cannot be empty"
    );
  }

  if (
    trimmedText.length >
    100000
  ) {
    throw new Error(
      "Scan text cannot exceed 100,000 characters"
    );
  }

  // ----------------------------------------------
  // STEP 1: Detection
  // ----------------------------------------------

  const detectionResult =
    detectSensitiveData(
      trimmedText
    );

  // ----------------------------------------------
  // STEP 2: Policy
  // ----------------------------------------------

  const policyResult =
    applyPolicy(
      detectionResult.detections,
      policyRules
    );

  // ----------------------------------------------
  // STEP 3: Protection
  // ----------------------------------------------

  const protectionResult =
    protectText(
      trimmedText,
      policyResult
    );

  // ----------------------------------------------
  // STEP 4: Final Security Decision
  // ----------------------------------------------

  let decision =
    protectionResult.decision;

  let llmAllowed =
    protectionResult.llmAllowed;

  // Critical data blocked by policy
  const criticalBlocked =
    protectionResult.detections.some(
      (detection) =>
        detection.risk ===
          "CRITICAL" &&
        detection.action ===
          "BLOCKED"
    );

  if (criticalBlocked) {
    decision = "BLOCK";

    llmAllowed = false;
  }

  // ----------------------------------------------
  // Processing Time
  // ----------------------------------------------

  const processingTimeMs =
    Date.now() -
    startTime;

  // ----------------------------------------------
  // Final Detection Types
  // ----------------------------------------------

  const finalDetections =
    protectionResult.detections;

  const detectedTypes = [
    ...new Set(
      finalDetections.map(
        (detection) =>
          detection.type
      )
    ),
  ];

  // ----------------------------------------------
  // Final Result
  // ----------------------------------------------

  return {
    requestId:
      generateRequestId(),

    source,

    originalText:
      trimmedText,

    protectedText:
      protectionResult.protectedText,

    riskScore:
      detectionResult.riskScore,

    riskLevel:
      detectionResult.riskLevel,

    detectionCount:
      finalDetections.length,

    detectedTypes,

    detections:
      finalDetections,

    decision,

    protected:
      protectionResult.protected,

    blocked:
      protectionResult.blocked ||
      criticalBlocked,

    llmAllowed,

    policyApplied:
      Array.isArray(
        policyRules
      ) &&
      policyRules.length > 0
        ? "CUSTOM"
        : "DEFAULT",

    processingTimeMs,
  };
};

module.exports = {
  scanRequest,
};