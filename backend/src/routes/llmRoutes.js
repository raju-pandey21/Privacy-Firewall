const express = require("express");

const {
  forwardLLMRequest,
} = require("../controllers/llmController");

const router = express.Router();

// POST /api/llm/forward
router.post("/forward", forwardLLMRequest);

module.exports = router;