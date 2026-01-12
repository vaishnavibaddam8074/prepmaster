import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

// Initialize the Google GenAI SDK strictly as per requirements
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
    throw new Error("Failed to parse AI output. The response was not in a valid format.");
  }
}

export async function summarizeNotes(rawContent: string, fileData?: { data: string, mimeType: string }) {
  // Check for key presence
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable in your project settings.");
  }

  const prompt = `You are a high-level academic assistant. Analyze the provided study material.
  Return a valid JSON object with the following structure:
  {
    "summary": "A 2-3 paragraph detailed summary",
    "formulas": ["List of formulas found"],
    "definitions": ["Key terms and their definitions"],
    "importantQuestions": [
      {"question": "Potential exam question", "priority": "Critical" | "Important" | "Optional" | "Less Important"}
    ]
  }
  
  User Notes: ${rawContent || 'Analyze the attached file content.'}`;

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
      model: 'gemini-3-pro-preview',
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
    
    // Provide specific feedback for common API errors
    if (error.status === 403) {
      throw new Error("API Key Invalid or Permission Denied (403). Ensure the Gemini API is enabled for your project.");
    }
    if (error.status === 429) {
      throw new Error("Quota Exceeded (429). Please wait a moment before trying again.");
    }
    if (error.message?.includes('Safety')) {
      throw new Error("The content was blocked by AI safety filters. Please try a different document.");
    }
    
    throw new Error(error?.message || "Analysis failed. The file might be too large or unsupported.");
  }
}

export async function getAIAnswer(query: string, language: string = 'English') {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are PrepMaster Assistant, managed by Baddam Vaishnavi. Answer in ${language}. 
      Query: ${query}`,
      config: {
        systemInstruction: "Provide academically sound, concise answers for exam preparation."
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    throw error;
  }
}

export async function generateSchedule(subjects: string[], startDate: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create an exam timetable for: ${subjects.join(", ")}. Start: ${startDate}. Return JSON array of objects with subject, date, timeSlot, room.`,
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