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
    throw new Error("Failed to parse AI output. The response format was unexpected.");
  }
}

export async function summarizeNotes(rawContent: string, fileData?: { data: string, mimeType: string }) {
  const prompt = `You are a college academic assistant. Analyze the provided study material.
  Return a valid JSON object with EXACTLY this structure:
  {
    "summary": "Detailed summary paragraph",
    "formulas": ["formula 1", "formula 2"],
    "definitions": ["term 1: definition 1", "term 2: definition 2"],
    "importantQuestions": [
      {"question": "Exam question here", "priority": "Critical"}
    ]
  }
  
  Content to analyze: ${rawContent || 'Please analyze the attached file.'}`;

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
    console.error("Gemini API Error:", error);
    
    if (error.status === 403 || error.message?.includes('API_KEY')) {
      throw new Error("The API Key provided is either missing or invalid for this project.");
    }
    
    throw new Error(error?.message || "Analysis failed. Please try a simpler file or clearer text.");
  }
}

export async function getAIAnswer(query: string, language: string = 'English') {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are PrepMaster Assistant. Answer concisely in ${language}. Query: ${query}`,
    });
    return response.text || "I'm sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error("Assistant Error:", error);
    throw error;
  }
}

export async function generateSchedule(subjects: string[], startDate: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create an exam timetable for: ${subjects.join(", ")}. Start: ${startDate}. Return JSON array.`,
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
    console.error("Scheduler Error:", error);
    throw error;
  }
}