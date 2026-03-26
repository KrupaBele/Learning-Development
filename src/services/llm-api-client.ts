export class LLMClient {
  private apiUrl: string;
  private apiKey: string;
  private modelId: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_LLM_URL;
    this.apiKey = import.meta.env.VITE_API_KEY;
    this.modelId = "openai/gpt-4o-mini";
  }

  /**
   * Stream response from the LLM API.
   * @param prompt - The user prompt.
   * @param systemMessage - The system message context for the prompt.
   * @param maxTokens - Maximum number of tokens to generate in the response.
   * @returns An async generator yielding chunks of the response.
   */
  async *streamResponse(
    prompt: string,
    systemMessage: string,
    maxTokens: number = 100
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-API-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          system_message: systemMessage,
          model_id: this.modelId,
          conversation_id: "default",
          user_id: "default",
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to read response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        yield chunk;
      }
    } catch (error: any) {
      throw new Error("Failed to communicate with LLM API: " + error.message);
    }
  }
}
