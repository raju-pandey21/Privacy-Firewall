const express = require("express");

const router = express.Router();

// ---------------------------------------------------------
// GET /api/policies
// ---------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Policy routes working",
      data: [],
    });
  } catch (error) {
    console.error("Policy GET error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch policies",
    });
  }
});

// ---------------------------------------------------------
// POST /api/policies
// ---------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { name, description, active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Policy name is required",
      });
    }

    const policy = {
      name,
      description: description || "",
      active: active !== false,
    };

    res.status(201).json({
      success: true,
      message: "Policy created successfully",
      data: policy,
    });
  } catch (error) {
    console.error("Policy POST error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create policy",
    });
  }
});

module.exports = router;