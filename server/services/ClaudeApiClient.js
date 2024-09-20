// File: ./server/services/ClaudeApiClient.js

import Anthropic from "@anthropic-ai/sdk";
import logger from "../../shared/logger.js";
import Neo4jApiCallRepository from "../repositories/Neo4jApiCallRepository.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callClaude(prompt, model = "claude-3-5-sonnet-20240620" ) {
  try {
    logger.info(`Calling Claude API with model: ${model}`);

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 4096,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    if (!response || !response.content || !response.content[0]) {
      throw new Error("Malformed response from Claude API");
    }

    const result = response.content[0].text;

    // Record API call
    await Neo4jApiCallRepository.saveApiCall({
      timestamp: new Date(),
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      message: prompt.substring(0, 200), // Truncate to 200 characters
    });

    logger.success("Claude API call successful");
    return result;
  } catch (error) {
    logger.error(`Error calling Claude API: ${error.message}`);
    throw error;
  }
}