
import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function summarizeNotes(rawContent: string, fileData?: { data: string, mimeType: string }) {
  const parts: any[] = [
    { text: `Analyze the following lecture notes and provide a structured summary.
    Identify:
    1. Key Concepts
    2. Critical Formulas
    3. Essential Definitions
    4. Important Questions categorized by priority (Critical, Important, Optional, Less Important)
    
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

  return JSON.parse(response.text);
}

export async function getAIAnswer(query: string, language: string = 'English') {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are PrepMaster Assistant, a college exam expert.
    Answer the following query clearly and concisely to satisfy both students and faculty.
    Provide the answer in ${language}.
    
    Query: ${query}`,
    config: {
      systemInstruction: "Ensure answers are academically rigorous yet easy to understand for revision."
    }
  });
  return response.text;
}

export async function generateSchedule(subjects: string[], startDate: string) {
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
  return JSON.parse(response.text);
}
