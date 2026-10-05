const { GoogleGenAI } = require("@google/genai");

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not defined in .env file"
    );
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const generateLLMResponse = async (protectedText) => {
  if (
    typeof protectedText !== "string" ||
    !protectedText.trim()
  ) {
    throw new TypeError("Protected text is required");
  }

  const ai = getGeminiClient();

  const model =
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash-lite";

  const maxAttempts = 3;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `[Gemini] Request attempt ${attempt}/${maxAttempts}`
      );

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: protectedText,
              },
            ],
          },
        ],
      });

      const responseText =
        typeof response.text === "string"
          ? response.text.trim()
          : "";

      if (!responseText) {
        throw new Error(
          "Gemini returned an empty response"
        );
      }

      console.log(
        "[Gemini] AI response received successfully"
      );

      return {
        provider: "Google Gemini",
        model,
        response: responseText,
      };
    } catch (error) {
      lastError = error;

      console.error(
        `[Gemini] Attempt ${attempt} failed:`,
        error.message
      );

      const isTemporaryError =
        error.message?.includes("503") ||
        error.message?.includes("UNAVAILABLE") ||
        error.message?.includes("429") ||
        error.message?.includes("RESOURCE_EXHAUSTED");

      if (
        !isTemporaryError ||
        attempt === maxAttempts
      ) {
        break;
      }

      const delay = attempt * 2000;

      console.log(
        `[Gemini] Temporary error. Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw new Error(
    `Gemini AI request failed after ${maxAttempts} attempts: ${
      lastError?.message || "Unknown error"
    }`
  );
};

module.exports = {
  generateLLMResponse,
};