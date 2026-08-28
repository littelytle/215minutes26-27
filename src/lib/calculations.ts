import type { Student, LogEntry, Subject, Staff } from "./types";

export function safeGoal(student: Student, subject: Subject): number {
  switch (subject) {
    case "Math": return student.goalMath;
    case "English": return student.goalEnglish;
    case "Task Completion": return student.goalTaskCompletion;
  }
}

export function hasGoal(student: Student, subject: Subject): boolean {
  return safeGoal(student, subject) > 0;
}

// date helpers work on plain "YYYY-MM-DD" strings + local Date objects
export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function inRange(dateISO: string, startISO: string, endISO: string): boolean {
  return dateISO >= startISO && dateISO <= endISO;
}

export function pivotMinutes(
  logs: LogEntry[], studentId: number, subject: Subject, startISO: string, endISO: string
): number {
  return logs
    .filter(l => l.studentId === studentId && l.subject === subject && inRange(l.date, startISO, endISO))
    .reduce((sum, l) => sum + l.minutes, 0);
}

export function pivotStaffBreakdown(
  logs: LogEntry[], studentId: number, subject: Subject, startISO: string, endISO: string, staffNames: string[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const n of staffNames) result[n] = 0;
  for (const l of logs) {
    if (l.studentId === studentId && l.subject === subject && inRange(l.date, startISO, endISO)) {
      if (l.staff in result) result[l.staff] += l.minutes;
    }
  }
  return result;
}

export function summaryData(
  logs: LogEntry[], staffNames: string[], startISO: string, endISO: string
): { grand: number; byStaff: Record<string, number> } {
  const byStaff: Record<string, number> = {};
  for (const n of staffNames) byStaff[n] = 0;
  let grand = 0;
  for (const l of logs) {
    if (inRange(l.date, startISO, endISO)) {
      grand += l.minutes;
      if (l.staff in byStaff) byStaff[l.staff] += l.minutes;
    }
  }
  return { grand, byStaff };
}

export function schoolYearFor(d: Date): number {
  return d.getMonth() + 1 >= 8 ? d.getFullYear() : d.getFullYear() - 1;
}

export interface Week {
  label: string;
  start: Date;
  end: Date; // Sunday, inclusive
}

export function monthWeeks(year: number, month: number): Week[] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0); // last day of month
  const weeks: Week[] = [];
  // Monday of the week containing `first`
  const dow = (first.getDay() + 6) % 7; // 0 = Monday
  let cur = new Date(first);
  cur.setDate(cur.getDate() - dow);
  while (cur <= last) {
    const mon = new Date(cur);
    const fri = new Date(cur); fri.setDate(fri.getDate() + 4);
    const sun = new Date(cur); sun.setDate(sun.getDate() + 6);
    const label = `${mon.getMonth() + 1}/${mon.getDate()}–${fri.getMonth() + 1}/${fri.getDate()}`;
    weeks.push({ label, start: mon, end: sun });
    cur = new Date(cur); cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

export function monthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
}

export function weekContaining(weeks: Week[], d: Date): Week | undefined {
  const iso = toISO(d);
  return weeks.find(w => inRange(iso, toISO(w.start), toISO(w.end)));
}
