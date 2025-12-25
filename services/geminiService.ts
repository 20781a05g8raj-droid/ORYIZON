
import { GoogleGenAI } from "@google/genai";

/**
 * Generates wellness advice using the Gemini API.
 * Follows @google/genai guidelines for client initialization and response handling.
 */
export const generateWellnessAdvice = async (query: string): Promise<string> => {
  try {
    // Initializing the AI client with the correct named parameter as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using 'gemini-3-flash-preview' for basic text tasks like Q&A
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `You are the ORYIZON Wellness Assistant, a friendly and knowledgeable nutritionist expert on Moringa Oleifera. 
        Your goal is to educate users on the health benefits of Moringa products.
        Tone: Professional, warm, and brand-aligned (Premium, Organic, Purity).
        
        Key Brand Facts:
        - ORYIZON products are 100% organic, sun-dried, and ethically sourced.
        
        Keep answers concise (under 150 words).`,
        // Disabling thinking to improve response latency for real-time wellness advice
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    // Accessing the extracted text directly via the .text property as required
    return response.text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The wellness assistant is resting. Please try again later.";
  }
};
