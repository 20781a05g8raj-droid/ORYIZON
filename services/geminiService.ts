
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client using the API key from environment variables.
// Following @google/genai guidelines for direct initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWellnessAdvice = async (query: string): Promise<string> => {
  try {
    // Using 'gemini-3-flash-preview' for basic wellness Q&A tasks as per task-specific model selection rules.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `You are the ORYIZON Wellness Assistant, a friendly and knowledgeable nutritionist expert on Moringa Oleifera. 
        Your goal is to educate users on the health benefits of Moringa products (powder, tea, oil, capsules).
        Tone: Professional, warm, scientific but accessible, and brand-aligned (Premium, Organic, Purity).
        
        Key Brand Facts:
        - ORYIZON products are 100% organic, sun-dried, and ethically sourced.
        - Emphasize sustainability and natural purity.
        
        Do not give medical advice for treating serious diseases. Always suggest consulting a doctor for medical conditions.
        Keep answers concise (under 150 words) unless asked for a detailed article.`,
        // Disabling thinking budget for low-latency conversational responses.
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    // Accessing the .text property directly as it is a getter, not a function.
    return response.text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong. Please try again.";
  }
};
