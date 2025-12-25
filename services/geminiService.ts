import { GoogleGenAI } from "@google/genai";

// We'll initialize the client lazily inside the function to avoid top-level crashes 
// if the environment variable is temporarily missing.
let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY || "";
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateWellnessAdvice = async (query: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Using 'gemini-3-flash-preview' for wellness Q&A
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
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    return response.text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The wellness assistant is resting. Please try again later.";
  }
};