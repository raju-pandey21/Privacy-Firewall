const PrivacyPolicy = require("../models/PrivacyPolicy");

// --------------------------------------------------
// Create Global Privacy Policy
// Admin Only
// --------------------------------------------------

const createPolicy = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      description,
      rules,
      isDefault = false,
    } = req.body;

    // ----------------------------------------------
    // Authentication
    // ----------------------------------------------

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ----------------------------------------------
    // Validate Policy Name
    // ----------------------------------------------

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Policy name is required",
      });
    }

    // ----------------------------------------------
    // Validate Rules
    // ----------------------------------------------

    if (
      !Array.isArray(rules) ||
      rules.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one policy rule is required",
      });
    }

    // ----------------------------------------------
    // If new global policy is default,
    // remove previous global default
    // ----------------------------------------------

    if (Boolean(isDefault)) {
      await PrivacyPolicy.updateMany(
        {
          scope: "GLOBAL",
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    // ----------------------------------------------
    // Create Global Policy
    // ----------------------------------------------

    const policy =
      await PrivacyPolicy.create({
        // Global policy
        user: null,

        scope: "GLOBAL",

        name: name.trim(),

        description:
          typeof description === "string"
            ? description.trim()
            : "",

        rules,

        isDefault:
          Boolean(isDefault),

        isActive: true,
      });

    return res.status(201).json({
      success: true,

      message:
        "Global privacy policy created successfully",

      data: policy,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Get Policies
// --------------------------------------------------

const getPolicies = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ----------------------------------------------
    // Admin sees all global policies
    // ----------------------------------------------

    if (req.user.role === "admin") {
      const policies =
        await PrivacyPolicy.find({
          scope: "GLOBAL",
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,

        count: policies.length,

        data: policies,
      });
    }

    // ----------------------------------------------
    // Normal users see active global policies
    // ----------------------------------------------

    const policies =
      await PrivacyPolicy.find({
        scope: "GLOBAL",
        isActive: true,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,

      count: policies.length,

      data: policies,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// Get Single Policy
// --------------------------------------------------

const getPolicyById = async (
  req,
  res,
  next
) => {
  try {
    const policy =
      await PrivacyPolicy.findOne({
        _id: req.params.id,
        scope: "GLOBAL",
        isActive: true,
      }).lean();

    if (!policy) {
      return res.status(404).json({
        success: false,
        message:
          "Privacy policy not found",
      });
    }

    return res.status(200).json({
      success: true,

      data: policy,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPolicy,
  getPolicies,
  getPolicyById,
};