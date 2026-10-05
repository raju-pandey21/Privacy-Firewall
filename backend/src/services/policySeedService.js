const PrivacyPolicy = require("../models/PrivacyPolicy");

// --------------------------------------------------
// Default Privacy Policy
// --------------------------------------------------

const defaultRules = [
  {
    dataType: "email",
    action: "redact",
    enabled: true,
  },

  {
    dataType: "phone",
    action: "redact",
    enabled: true,
  },

  {
    dataType: "creditCard",
    action: "block",
    enabled: true,
  },

  {
    dataType: "pan",
    action: "block",
    enabled: true,
  },

  {
    dataType: "aadhaar",
    action: "block",
    enabled: true,
  },

  {
    dataType: "apiKey",
    action: "block",
    enabled: true,
  },

  {
    dataType: "password",
    action: "block",
    enabled: true,
  },

  {
    dataType: "upiId",
    action: "redact",
    enabled: true,
  },

  {
    dataType: "person",
    action: "anonymize",
    enabled: true,
  },

  {
    dataType: "organization",
    action: "redact",
    enabled: true,
  },

  {
    dataType: "health",
    action: "block",
    enabled: true,
  },

  {
    dataType: "financial",
    action: "block",
    enabled: true,
  },

  {
    dataType: "credential",
    action: "block",
    enabled: true,
  },
];

// --------------------------------------------------
// Seed Global Default Policy
// --------------------------------------------------

const seedDefaultPolicy = async () => {
  try {
    const existingPolicy =
      await PrivacyPolicy.findOne({
        scope: "GLOBAL",
        isDefault: true,
      });

    if (existingPolicy) {
      console.log(
        "Default privacy policy already exists"
      );

      return existingPolicy;
    }

    const policy =
      await PrivacyPolicy.create({
        user: null,

        scope: "GLOBAL",

        name:
          "Default Enterprise Privacy Policy",

        description:
          "Default security policy for protecting sensitive data before it reaches an external LLM.",

        rules:
          defaultRules,

        isDefault: true,

        isActive: true,
      });

    console.log(
      "Default privacy policy created successfully"
    );

    return policy;
  } catch (error) {
    console.error(
      "Default privacy policy seeding failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  seedDefaultPolicy,
};