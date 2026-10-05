const mongoose = require("mongoose");

// --------------------------------------------------
// Policy Rule Schema
// --------------------------------------------------

const policyRuleSchema = new mongoose.Schema(
  {
    dataType: {
      type: String,

      required: true,

      enum: [
        "email",
        "phone",
        "creditCard",
        "pan",
        "aadhaar",
        "apiKey",
        "password",
        "name",
        "organization",
        "health",
        "financial",
        "credential",
        "upiId",
        "person",
      ],

      trim: true,
    },

    action: {
      type: String,

      required: true,

      enum: [
        "allow",
        "redact",
        "mask",
        "anonymize",
        "tokenize",
        "block",
      ],

      trim: true,
    },

    enabled: {
      type: Boolean,

      default: true,
    },
  },
  {
    _id: false,
  }
);

// --------------------------------------------------
// Privacy Policy Schema
// --------------------------------------------------

const privacyPolicySchema =
  new mongoose.Schema(
    {
      // --------------------------------------------
      // Policy Owner
      //
      // null = Global/Admin policy
      // ObjectId = User-specific policy
      // --------------------------------------------

      user: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,

        index: true,
      },

      // --------------------------------------------
      // Policy Scope
      // --------------------------------------------

      scope: {
        type: String,

        enum: [
          "GLOBAL",
          "USER",
        ],

        default: "GLOBAL",

        index: true,
      },

      // --------------------------------------------
      // Policy Information
      // --------------------------------------------

      name: {
        type: String,

        required: true,

        trim: true,

        maxlength: 100,
      },

      description: {
        type: String,

        trim: true,

        maxlength: 500,

        default: "",
      },

      // --------------------------------------------
      // Privacy Rules
      // --------------------------------------------

      rules: {
        type: [policyRuleSchema],

        required: true,

        validate: {
          validator: (rules) =>
            Array.isArray(rules) &&
            rules.length > 0,

          message:
            "At least one policy rule is required",
        },
      },

      // --------------------------------------------
      // Policy Status
      // --------------------------------------------

      isDefault: {
        type: Boolean,

        default: false,

        index: true,
      },

      isActive: {
        type: Boolean,

        default: true,

        index: true,
      },
    },

    {
      timestamps: true,
    }
  );

// --------------------------------------------------
// Indexes
// --------------------------------------------------

privacyPolicySchema.index({
  user: 1,
  isDefault: 1,
});

privacyPolicySchema.index({
  user: 1,
  isActive: 1,
});

privacyPolicySchema.index({
  scope: 1,
  isDefault: 1,
  isActive: 1,
});

// --------------------------------------------------
// Export
// --------------------------------------------------

module.exports = mongoose.model(
  "PrivacyPolicy",
  privacyPolicySchema
);