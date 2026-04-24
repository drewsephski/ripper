import { OpenRouter } from "@openrouter/sdk";

export const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Common models available on OpenRouter
export const AVAILABLE_MODELS = {
  "google/gemini-3.1-flash-lite-preview": "Gemini 3.1 Flash Lite",
  "qwen/qwen3-coder-next": "Qwen 3 Coder Next",
  "deepseek/deepseek-v3.2": "DeepSeek V3.2",
  "qwen/qwen3-vl-32b-instruct": "Qwen 3 VL 32B",
  "openrouter/free": "Free",
} as const;

export type ModelId = keyof typeof AVAILABLE_MODELS;

export async function* streamCodeGeneration(
  prompt: string,
  systemPrompt: string,
  model: ModelId = "qwen/qwen3-coder-next"
) {
  const stream = await openrouter.chat.send({
    chatRequest: {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      stream: true,
    },
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
