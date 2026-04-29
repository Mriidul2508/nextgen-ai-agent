import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // THE ULTIMATE SCRUBBER: Hunts down the text regardless of SDK version
    const cleanMessages = messages.map((m: any) => {
      let extractedText = '';
      
      // If the text is stored the old v4 way
      if (typeof m.content === 'string' && m.content.trim() !== '') {
        extractedText = m.content;
      } 
      // If the text is stored the new v5 way
      else if (Array.isArray(m.parts)) {
        extractedText = m.parts.map((p: any) => p.text || '').join('');
      }

      return {
        // Enforce strict roles that Gemini recognizes
        role: m.role === 'assistant' ? 'assistant' : 'user', 
        // Gemini crashes if content is empty, so we provide a safe fallback
        content: extractedText || " " 
      };
    });

    const result = streamText({
      model: google('gemini-2.5-flash'), 
      messages: cleanMessages,
      system: "You are a helpful, concise, and professional conversational AI agent."
    });

    return result.toUIMessageStreamResponse();
    
  } catch (error: any) {
    console.error("Backend Crash Details:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Backend failed to process request" }), 
      { status: 500 }
    );
  }
}