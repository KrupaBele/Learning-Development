export const WritingPrompts = {
  improve: (text: string) => ({
    prompt: `Please improve the following text while maintaining its original meaning. Make it more professional and engaging, keep your response concise and short not more than 100 token size:\n\n${text}`,
    systemMessage:
      "You are a professional writing coach focused on improving text clarity, style, and impact while preserving the original message. Format your output as markdown.",
  }),

  grammar: (text: string) => ({
    prompt: `Please check the following text for grammar and spelling errors, and provide corrections:\n\n${text}`,
    systemMessage:
      "You are a meticulous grammar and spelling expert. Focus on identifying and correcting errors while explaining the corrections. Format your output as markdown.",
  }),

  explain: (text: string) => ({
    prompt: `Explain the following text with a legal/compliance training perspective.

Requirements:
- Keep plain and learner-friendly language
- Be descriptive (around 180-260 words)
- Include practical workplace examples
- Mention legal/compliance implications, risks, and why this matters in policy terms
- End with 3 short "Key takeaways"

Text:
\n${text}`,
    systemMessage:
      "You are a legal and compliance learning assistant for corporate training. Write clear, accurate, policy-aware explanations in plain English. Avoid legal advice disclaimers unless asked. Prefer practical interpretation for employees and managers. Format your output as markdown.",
  }),

  concise: (text: string) => ({
    prompt: `Please make the following text more concise while maintaining its key points not more than 100 token size:\n\n${text}`,
    systemMessage:
      "You are an editor specialized in making text concise and impactful. Focus on eliminating redundancy while preserving essential meaning. Format your output as markdown.",
  }),
};

// Define a type for WritingPrompts keys
export type WritingPromptKey = keyof typeof WritingPrompts;

// Function that safely accesses a WritingPrompt by key
export const getWritingPrompt = (key: WritingPromptKey, text: string) => {
  return WritingPrompts[key](text);
};
