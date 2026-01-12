import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

// Initialize the Google GenAI SDK strictly as per requirements
// Note: Ensure API_KEY is set in your Vercel Environment Variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Robust JSON parser that handles potential AI markdown wrapping
 */
function safeJsonParse(text: string | undefined) {
  if (!text) throw new Error("AI returned an empty response.");
  try {
    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI Response was not valid JSON:", text);
    throw new Error("Failed to parse AI output. Try again with clearer content.");
  }
}

export async function summarizeNotes(rawContent: string, fileData?: { data: string, mimeType: string }) {
  const prompt = `Analyze these student study materials. 
  Extract and structure the following into a JSON object:
  1. "summary": A concise overview of the material.
  2. "formulas": A list of mathematical or technical formulas.
  3. "definitions": Key terms and their meanings.
  4. "importantQuestions": A list of objects with "question" (string) and "priority" (string: "Critical", "Important", "Optional", or "Less Important").
  
  User provided context: ${rawContent || 'No additional text provided.'}`;

  const parts: any[] = [{ text: prompt }];

  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            formulas: { type: Type.ARRAY, items: { type: Type.STRING } },
            definitions: { type: Type.ARRAY, items: { type: Type.STRING } },
            importantQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  priority: { type: Type.STRING }
                },
                required: ["question", "priority"]
              }
            }
          },
          required: ["summary", "formulas", "definitions", "importantQuestions"]
        }
      }
    });

    return safeJsonParse(response.text);
  } catch (error: any) {
    console.error("Gemini Summarization Error:", error);
    if (error?.message?.includes('API_KEY_INVALID')) {
      throw new Error("Invalid API Key. Please check your project settings.");
    }
    throw new Error(error?.message || "Analysis failed. The file might be too complex or blocked by safety filters.");
  }
}

export async function getAIAnswer(query: string, language: string = 'English') {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are PrepMaster Assistant, managed by Baddam Vaishnavi. Answer in ${language}. 
      Query: ${query}`,
      config: {
        systemInstruction: "Provide academically sound, concise answers suitable for college exam preparation."
      }
    });
    return response.text || "I couldn't generate an answer. Please try again.";
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    throw error;
  }
}

export async function generateSchedule(subjects: string[], startDate: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a JSON exam timetable for: ${subjects.join(", ")}. Start: ${startDate}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              date: { type: Type.STRING },
              timeSlot: { type: Type.STRING },
              room: { type: Type.STRING }
            },
            required: ["subject", "date", "timeSlot", "room"]
          }
        }
      }
    });
    return safeJsonParse(response.text);
  } catch (error) {
    console.error("Gemini Scheduler Error:", error);
    throw error;
  }
}