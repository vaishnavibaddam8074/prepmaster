
export enum Priority {
  CRITICAL = 'Critical',
  IMPORTANT = 'Important',
  OPTIONAL = 'Optional',
  LESS_IMPORTANT = 'Less Important'
}

export enum NoteType {
  LECTURE_NOTE = 'Lecture Note',
  PREVIOUS_YEAR_PAPER = 'Previous Year Paper',
  QUICK_REVISE = 'Quick Revise'
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  facultyName: string;
  dateUploaded: string;
  importantQuestions: ImportantQuestion[];
  formulas: string[];
  definitions: string[];
  type: NoteType;
}

export interface ImportantQuestion {
  id: string;
  question: string;
  priority: Priority;
}

export interface ExamSchedule {
  id: string;
  subject: string;
  date: string;
  timeSlot: string;
  duration: string;
  room: string;
}

export interface Reminder {
  id: string;
  text: string;
  date: string;
  isCompleted: boolean;
}

export interface UserPreferences {
  language: string;
  voiceEnabled: boolean;
}
