export type Subject = "Math" | "English" | "Task Completion";
export type Grade = "6th" | "7th" | "8th";

export interface Staff {
  id: number;
  name: string;
  color: string;
}

export interface Student {
  id: number;
  name: string;
  grade: Grade;
  goalMath: number;
  goalEnglish: number;
  goalTaskCompletion: number;
}

export interface LogEntry {
  id: number;
  studentId: number;
  subject: Subject;
  staff: string;
  minutes: number;
  date: string; // YYYY-MM-DD
  note: string;
}
