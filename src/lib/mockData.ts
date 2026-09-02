import type { Staff, Student, LogEntry } from "./types";
import { toISO } from "./calculations";

export const MOCK_STAFF: Staff[] = [
  { id: 1, name: "Ms. Rivera", color: "#8fc7e8" },
  { id: 2, name: "Mr. Thompson", color: "#f0c391" },
  { id: 3, name: "Ms. Chen", color: "#9bd6ac" },
  { id: 4, name: "Mr. Davis", color: "#f0a3a3" },
  { id: 5, name: "Ms. Patel", color: "#e3a3d6" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 1, name: "Alex Kim", grade: "6th", goalMath: 60, goalEnglish: 90, goalTaskCompletion: 45 },
  { id: 2, name: "Jamie Rivera", grade: "7th", goalMath: 60, goalEnglish: 90, goalTaskCompletion: 45 },
  { id: 3, name: "Sam Patel", grade: "8th", goalMath: 60, goalEnglish: 90, goalTaskCompletion: 45 },
  { id: 4, name: "Riley Chen", grade: "6th", goalMath: 60, goalEnglish: 90, goalTaskCompletion: 0 },
];

const today = new Date();
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const MOCK_LOGS: LogEntry[] = [
  { id: 1, studentId: 1, subject: "Math", staff: "Ms. Rivera", minutes: 60, date: toISO(today), note: "Great focus today", batchId: "seed-1" },
  { id: 2, studentId: 2, subject: "English", staff: "Mr. Thompson", minutes: 90, date: toISO(yesterday), note: "", batchId: "seed-2" },
  { id: 3, studentId: 3, subject: "Task Completion", staff: "Ms. Chen", minutes: 10, date: toISO(twoDaysAgo), note: "", batchId: "seed-2" },
];
