import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ' ');

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow specific methods
  'Access-Control-Allow-Headers': 'Content-Type', // Allow specific headers
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const { prompt, history, askForName } = await request.json();

    // Basic validation
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400, headers: corsHeaders });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    let chatHistory = history || [];
    // Prepend initial system instructions if needed, based on history or askForName flag
    // Example: Add persona instructions if history is empty
    if (askForName || chatHistory.length === 0) {
      chatHistory = [
        {
          role: "user",
          parts: [{ text: "Introduce yourself briefly and ask for the user's name." }]
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm a friendly AI assistant. What's your name?" }]
        },
        ...chatHistory // Add existing history after the initial prompt
      ];
    }

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 150,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    // Return the response with CORS headers
    return NextResponse.json({ response: text }, { headers: corsHeaders });

  } catch (error) {
    console.error("AI API Error:", error);
    // Return error response with CORS headers
    return NextResponse.json(
      { error: 'Failed to get response from AI' }, 
      { status: 500, headers: corsHeaders }
    );
  }
} 