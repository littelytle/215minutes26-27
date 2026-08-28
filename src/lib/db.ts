// In-memory data layer for local development. Same function signatures as
// lib/sheetsDb.ts (the real Google Sheets–backed version) so swapping between
// them is a one-line change in lib/data.ts — nothing else needs to change.
import type { Staff, Student, LogEntry, Subject } from "./types";
import { MOCK_STAFF, MOCK_STUDENTS, MOCK_LOGS } from "./mockData";

let staff: Staff[] = MOCK_STAFF.map(s => ({ ...s }));
let students: Student[] = MOCK_STUDENTS.map(s => ({ ...s }));
let logs: LogEntry[] = MOCK_LOGS.map(l => ({ ...l }));

function nextId(items: { id: number }[]): number {
  return items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
}

export async function getStaff(): Promise<Staff[]> {
  return staff.map(s => ({ ...s }));
}

export async function getStudents(): Promise<Student[]> {
  return students.map(s => ({ ...s }));
}

export async function getLogs(): Promise<LogEntry[]> {
  return logs.map(l => ({ ...l }));
}

export async function addStudent(
  name: string, grade: Student["grade"], goals: { Math: number; English: number; "Task Completion": number }
): Promise<void> {
  students.push({
    id: nextId(students), name, grade,
    goalMath: goals.Math, goalEnglish: goals.English, goalTaskCompletion: goals["Task Completion"],
  });
}

export async function updateStudent(
  id: number, newName: string | undefined, goals: Partial<Record<Subject, number>> | undefined
): Promise<void> {
  const s = students.find(x => x.id === id);
  if (!s) return;
  if (newName) s.name = newName;
  if (goals) {
    if (goals.Math !== undefined) s.goalMath = goals.Math;
    if (goals.English !== undefined) s.goalEnglish = goals.English;
    if (goals["Task Completion"] !== undefined) s.goalTaskCompletion = goals["Task Completion"];
  }
}

export async function deleteStudent(id: number): Promise<void> {
  students = students.filter(s => s.id !== id);
}

export async function addStaffMember(name: string, color: string): Promise<void> {
  staff.push({ id: nextId(staff), name, color });
}

export async function updateStaffNames(newNames: Record<string, string>): Promise<void> {
  for (const [idStr, name] of Object.entries(newNames)) {
    const id = Number(idStr);
    const s = staff.find(x => x.id === id);
    if (!s) continue;
    const old = s.name;
    s.name = name;
    if (old !== name) {
      for (const l of logs) if (l.staff === old) l.staff = name;
    }
  }
}

export async function addLog(
  studentId: number, subject: Subject, staffName: string, minutes: number, dateISO: string, note: string
): Promise<void> {
  logs.push({ id: nextId(logs), studentId, subject, staff: staffName, minutes, date: dateISO, note });
}
