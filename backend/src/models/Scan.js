const mongoose = require("mongoose");

// --------------------------------------------------
// Detection Schema
// --------------------------------------------------

const detectionSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
        trim: true,
      },

      category: {
        type: String,
        required: true,
        enum: [
          "Personal Data",
          "Credentials",
          "Financial Data",
          "Health Data",
          "Identity",
          "Confidential Data",
          "Unknown",
        ],
        default: "Unknown",
      },

      risk: {
        type: String,
        required: true,
        enum: [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
        ],
      },

      action: {
        type: String,
        required: true,
        enum: [
          "BLOCKED",
          "REDACTED",
          "ANONYMIZED",
          "ALLOWED",
        ],
      },

      // Raw sensitive value is intentionally not stored.
      value: {
        type: String,
        select: false,
        default: undefined,
      },

      protectedValue: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

// --------------------------------------------------
// Scan Schema
// --------------------------------------------------

const scanSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      policy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PrivacyPolicy",
        required: true,
        index: true,
      },

      requestId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
      },

      source: {
        type: String,
        trim: true,
        default: "Web Scanner",
        maxlength: 100,
      },

      // Raw user request is never persisted.
      originalText: {
        type: String,
        default: "[PROTECTED_REQUEST_NOT_STORED]",
        select: false,
        maxlength: 100,
      },

      protectedText: {
        type: String,
        default: "",
        maxlength: 100000,
      },

      riskScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      riskLevel: {
        type: String,
        required: true,
        enum: [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
          "SAFE",
        ],
      },

      detectionCount: {
        type: Number,
        required: true,
        min: 0,
      },

      detectedTypes: {
        type: [String],
        default: [],
      },

      detections: {
        type: [detectionSchema],
        default: [],
      },

      decision: {
        type: String,
        required: true,
        enum: [
          "ALLOW",
          "PROTECT",
          "BLOCK",
        ],
        default: "ALLOW",
      },

      protected: {
        type: Boolean,
        default: false,
      },

      blocked: {
        type: Boolean,
        default: false,
      },

      llmAllowed: {
        type: Boolean,
        default: false,
      },

      processingTimeMs: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

// --------------------------------------------------
// Indexes
// --------------------------------------------------

scanSchema.index({
  createdAt: -1,
});

scanSchema.index({
  riskLevel: 1,
});

scanSchema.index({
  decision: 1,
});

scanSchema.index({
  "detections.type": 1,
});

scanSchema.index({
  user: 1,
  createdAt: -1,
});

// --------------------------------------------------
// Export
// --------------------------------------------------

module.exports =
  mongoose.model(
    "Scan",
    scanSchema
  );