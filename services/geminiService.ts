import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

// Initialize the Google GenAI SDK strictly as per requirements
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
  const prompt = `Analyze these student study materials and extract key information. 
  Output MUST be a valid JSON object with:
  1. "summary": A structured overview.
  2. "formulas": Array of strings.
  3. "definitions": Array of strings.
  4. "importantQuestions": Array of objects { "question": string, "priority": string }.
  
  Context: ${rawContent || 'Study material analysis.'}`;

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
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing from the environment configuration.");
    }
    throw new Error(error?.message || "Analysis failed. Please check your connection and the uploaded file.");
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