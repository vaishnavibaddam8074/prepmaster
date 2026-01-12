
import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

// Initialize the Google GenAI SDK strictly as per requirements
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Strips markdown code blocks and whitespace from AI responses before parsing as JSON.
 */
function safeJsonParse(text: string) {
  try {
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON response from AI:", text);
    throw new Error("Invalid AI response format");
  }
}

export async function summarizeNotes(rawContent: string, fileData?: { data: string, mimeType: string }) {
  const parts: any[] = [
    { text: `Analyze the following lecture notes and provide a structured summary.
    Identify:
    1. Key Concepts
    2. Critical Formulas
    3. Essential Definitions
    4. Important Questions categorized by priority (Critical, Important, Optional, Less Important)
    
    Output MUST be a valid JSON object.
    
    Additional Text Context: ${rawContent}` }
  ];

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
                  priority: { type: Type.STRING, enum: Object.values(Priority) }
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
  } catch (error) {
    console.error("Gemini API Error (Summarization):", error);
    throw error;
  }
}

export async function getAIAnswer(query: string, language: string = 'English') {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are PrepMaster Assistant, a college exam expert managed by Baddam Vaishnavi.
      Answer the following query clearly and concisely to satisfy both students and faculty.
      Provide the answer in ${language}.
      
      Query: ${query}`,
      config: {
        systemInstruction: "Ensure answers are academically rigorous yet easy to understand for revision."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Assistant):", error);
    throw error;
  }
}

export async function generateSchedule(subjects: string[], startDate: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create an optimized exam timetable for the following subjects: ${subjects.join(", ")}.
      Start date: ${startDate}.
      Constraints: 
      - Max 1 exam per day.
      - No exams on Sundays.
      - Balanced time slots (9 AM - 12 PM or 2 PM - 5 PM).
      - Allow prep days for difficult subjects.`,
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
    console.error("Gemini API Error (Scheduler):", error);
    throw error;
  }
}
