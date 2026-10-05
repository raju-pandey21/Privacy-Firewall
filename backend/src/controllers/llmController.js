const {
  forwardToLLM,
} = require("../services/llmGatewayService");

// ==================================================
// Forward Request to LLM Controller
// ==================================================

const forwardLLMRequest = async (req, res, next) => {
  try {
    const {
      text,
      llmAllowed,
      decision,
    } = req.body;

    // Call LLM Security Gateway Service
    const result = await forwardToLLM({
      text,
      llmAllowed,
      decision,
    });

    // Blocked request
    if (result.blocked) {
      return res.status(403).json({
        success: false,
        ...result,
      });
    }

    // Allowed request
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  forwardLLMRequest,
};