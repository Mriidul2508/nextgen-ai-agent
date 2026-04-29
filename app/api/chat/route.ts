import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  // Call the language model
  const result = streamText({
    model: google('gemini-2.5-flash'), // Extremely fast model for conversational AI
    messages,
    system: "You are a helpful, concise, and professional conversational AI agent."
  });

  // Respond with the stream
  return result.toTextStreamResponse();
}