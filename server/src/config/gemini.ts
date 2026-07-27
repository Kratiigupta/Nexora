import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

/**
 * Google Gemini AI client.
 * Used for teammate recommendations, skill suggestions,
 * team compatibility analysis, and project matching.
 */
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Default model for general text generation.
 * Gemini 1.5 Flash offers a good balance of speed and quality.
 */
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/**
 * Helper: Send a prompt to Gemini and return the text response.
 */
export const generateAIResponse = async (prompt: string): Promise<string> => {
  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  return response.text();
};

export { genAI };
