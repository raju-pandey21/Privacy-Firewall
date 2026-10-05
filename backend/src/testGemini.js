require("dotenv").config();

const {
  generateLLMResponse,
} = require("./services/llmProviderService");

const testGemini = async () => {
  try {
    console.log("================================");
    console.log("Testing Google Gemini AI...");
    console.log("================================");

    const result = await generateLLMResponse(
      "Explain in one short sentence what a privacy firewall does."
    );

    console.log("Provider:", result.provider);
    console.log("Model:", result.model);
    console.log("AI Response:");
    console.log(result.response);

    console.log("================================");
    console.log("Gemini AI test successful");
    console.log("================================");
  } catch (error) {
    console.error("================================");
    console.error("Gemini AI test failed");
    console.error("Error:", error.message);
    console.error("================================");

    process.exit(1);
  }
};

testGemini();