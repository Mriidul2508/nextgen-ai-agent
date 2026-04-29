import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'), 
    messages,
    system: "You are a helpful, concise, and professional conversational AI agent."
  });

  // Bypass Vercel's default error masking to reveal the actual Google API error
  return result.toDataStreamResponse({
    getErrorMessage: (error: any) => {
      console.error("Gemini Error:", error);
      return error?.message || String(error) || "Unknown error from Google Gemini";
    }
  });
}