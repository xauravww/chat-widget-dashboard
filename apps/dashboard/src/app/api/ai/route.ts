import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content, // Import Content type for history
  GenerateContentRequest,
} from "@google/generative-ai";

// Use a more recent/available model like gemini-1.5-flash-latest
const MODEL_NAME = "gemini-2.0-flash"; 
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable not set.");
  // Optionally throw an error during build/startup if key is essential
}

// Type for individual history message parts expected by Gemini
interface GeminiMessagePart { text: string; }
// Type for individual history messages expected by Gemini
interface GeminiHistoryMessage { role: "user" | "model"; parts: GeminiMessagePart[]; }

// Updated request body type to include askForName flag
interface RequestBody {
  prompt: string;
  history?: GeminiHistoryMessage[];
  askForName?: boolean; // <-- Added flag
}

// Helper function to create responses with CORS headers
const createCorsResponse = (body: any, status: number): NextResponse => {
  const response = NextResponse.json(body, { status });
  // Allow requests from the widget's development origin
  response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '*'); // Adjust production origin as needed
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
};

// Helper function for error responses with CORS
const createCorsErrorResponse = (message: string, status: number): NextResponse => {
  const response = new NextResponse(message, { status });
  response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '*'); // Adjust production origin as needed
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
};

// Add handler for OPTIONS preflight requests
export async function OPTIONS(req: Request) {
  // Create an empty response for the preflight
  const response = new NextResponse(null, { status: 204 }); // 204 No Content is typical for successful preflights

  // Set the necessary CORS headers for the preflight response
  response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '*'); // Match the POST handler's origin
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // Specify allowed methods
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type'); // Specify allowed headers
  response.headers.set('Access-Control-Max-Age', '86400'); // Optional: Cache preflight response for 1 day

  console.log("Responding to OPTIONS preflight request for /api/ai");
  return response;
}

// --- Healthcare Bot System Prompt ---
const SYSTEM_PROMPT = `You are a helpful and empathetic healthcare assistant bot. 
Your goal is to provide preliminary information and guidance on general health topics in a clear and concise manner. 
Keep your replies relatively short and easy to understand. 
Do not provide medical diagnoses or replace professional medical advice. 
If asked for a diagnosis or treatment, advise the user to consult a healthcare professional.`;

export async function POST(req: Request) {
  if (!API_KEY) {
    console.error("AI API key not configured server-side.");
    return createCorsErrorResponse("AI API key not configured", 500);
  }

  try {
    const body = await req.json() as RequestBody;
    const { prompt, history = [], askForName } = body;

    if (!prompt) {
      return createCorsErrorResponse("Prompt is required", 400);
    }

    const genAI = new GoogleGenerativeAI(API_KEY as string); // Added assertion
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = { temperature: 0.8, topK: 1, topP: 1, maxOutputTokens: 250 }; // Adjusted temp/tokens slightly
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // --- Construct the request for Gemini API ---
    const request: GenerateContentRequest = {
      // Use the new Healthcare bot system prompt
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, 
        // Updated initial model response
        { role: "model", parts: [{ text: "Hello! I'm a healthcare assistant bot. How can I help you today?" }] }, 
        ...history, 
        { role: "user", parts: [{ text: prompt }] } 
      ],
      generationConfig,
      safetySettings,
    };

    console.log("Sending request to Gemini:", JSON.stringify(request, null, 2));

    const result = await model.generateContent(request);
    const response = result.response;
    const aiText = response.text();

    return createCorsResponse({ response: aiText }, 200);

  } catch (error) {
    console.error("[API_AI_POST]", error);
    // Determine if it's a specific API error or general error
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message.includes("API key not valid") ? 401 : 500;
    // Use helper to add CORS headers to caught error response
    return createCorsErrorResponse(message, status);
  }
} 