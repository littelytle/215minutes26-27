import type { Subject, Grade } from "./types";

export const SUBJECTS: Subject[] = ["Math", "English", "Task Completion"];
export const GRADES: Grade[] = ["6th", "7th", "8th"];

// [monthNumber (1-12), label] for the school year, Aug through May
export const SCHOOL_MONTHS: [number, string][] = [
  [8, "Aug"], [9, "Sep"], [10, "Oct"], [11, "Nov"], [12, "Dec"],
  [1, "Jan"], [2, "Feb"], [3, "Mar"], [4, "Apr"], [5, "May"],
];

export const SUBJ_COLOR: Record<Subject, string> = {
  Math: "var(--subj-math)",
  English: "var(--subj-english)",
  "Task Completion": "var(--subj-task)",
};

export const SUBJ_SHORT: Record<Subject, string> = {
  Math: "M",
  English: "E",
  "Task Completion": "T",
};

export const SUBJ_LABEL: Record<Subject, string> = {
  Math: "Math",
  English: "English",
  "Task Completion": "Tasks",
};

export const GRADE_COLOR: Record<Grade, string> = {
  "6th": "var(--grade-6)",
  "7th": "var(--grade-7)",
  "8th": "var(--grade-8)",
};

