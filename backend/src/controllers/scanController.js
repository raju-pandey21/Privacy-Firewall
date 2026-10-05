const { scanRequest } = require("../services/scanService");
const { forwardToLLM } = require("../services/llmGatewayService");

const Scan = require("../models/Scan");
const PrivacyPolicy = require("../models/PrivacyPolicy");

// ==================================================
// Create Privacy Scan
// ==================================================

const createScan = async (req, res, next) => {
  try {
    const {
      text,
      policyId,
      source = "Web Scanner",
    } = req.body;

    // Authentication check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Input validation
    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    // ==================================================
    // Find Privacy Policy
    // ==================================================

    let policy = null;

    // Find policy by provided policyId
    if (policyId) {
      policy = await PrivacyPolicy.findOne({
        _id: policyId,
        scope: "GLOBAL",
        isActive: true,
      });
    }

    // If policyId is not provided or not found,
    // use the default global policy
    if (!policy) {
      policy = await PrivacyPolicy.findOne({
        scope: "GLOBAL",
        isDefault: true,
        isActive: true,
      });
    }

    // No policy found
    if (!policy) {
      return res.status(503).json({
        success: false,
        message:
          "No active privacy policy is configured",
      });
    }

    // ==================================================
    // Run Privacy Firewall
    // ==================================================

    const result = await scanRequest({
      text,
      policyRules: policy.rules,
      source,
    });

    // ==================================================
    // LLM Security Gateway
    // ==================================================

    const llmGatewayResult =
      await forwardToLLM({
        text: result.protectedText,
        llmAllowed: result.llmAllowed,
        decision: result.decision,
      });

    // ==================================================
    // Sanitize Detection Data
    // ==================================================

    const auditDetections =
      result.detections.map((detection) => ({
        type: detection.type,
        category: detection.category,
        risk: detection.risk,
        action: detection.action,
        protectedValue:
          detection.protectedValue,
      }));

    // ==================================================
    // Save Privacy Audit
    // ==================================================

    const scan = await Scan.create({
      user: req.user._id,
      policy: policy._id,

      requestId:
        result.requestId,

      source:
        result.source,

      originalText:
        "[PROTECTED_REQUEST_NOT_STORED]",

      protectedText:
        result.protectedText,

      riskScore:
        result.riskScore,

      riskLevel:
        result.riskLevel,

      detectionCount:
        result.detectionCount,

      detectedTypes:
        result.detectedTypes,

      detections:
        auditDetections,

      decision:
        result.decision,

      protected:
        result.protected,

      blocked:
        result.blocked,

      llmAllowed:
        result.llmAllowed,

      processingTimeMs:
        result.processingTimeMs,
    });

    // ==================================================
    // Send Response
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Privacy scan completed successfully",

      data: {
        scanId:
          scan._id,

        requestId:
          result.requestId,

        source:
          result.source,

        originalText:
          result.originalText,

        protectedText:
          result.protectedText,

        riskScore:
          result.riskScore,

        riskLevel:
          result.riskLevel,

        detectionCount:
          result.detectionCount,

        detectedTypes:
          result.detectedTypes,

        detections:
          result.detections,

        decision:
          result.decision,

        protected:
          result.protected,

        blocked:
          result.blocked,

        llmAllowed:
          result.llmAllowed,

        policyId:
          policy._id,

        policyName:
          policy.name,

        policyScope:
          policy.scope,

        processingTimeMs:
          result.processingTimeMs,

        llmGateway:
          llmGatewayResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// Get Single Scan
// ==================================================

const getScanById = async (
  req,
  res,
  next
) => {
  try {
    const scan =
      await Scan.findOne({
        _id: req.params.id,
        user: req.user._id,
      })
        .select(
          "-originalText -detections.value"
        )
        .populate(
          "policy",
          "name description scope"
        );

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: scan,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// Get Scan History
// ==================================================

const getScanHistory = async (
  req,
  res,
  next
) => {
  try {
    const scans =
      await Scan.find({
        user: req.user._id,
      })
        .select(
          "-originalText -detections.value"
        )
        .populate(
          "policy",
          "name description scope"
        )
        .sort({
          createdAt: -1,
        })
        .limit(100);

    return res.status(200).json({
      success: true,
      count: scans.length,
      data: scans,
    });
  } catch (error) {
    next(error);
  }
};

// ==================================================
// Export Controllers
// ==================================================

module.exports = {
  createScan,
  getScanById,
  getScanHistory,
};