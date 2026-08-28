"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { GRADES, SUBJECTS, SUBJ_LABEL, GRADE_COLOR } from "@/lib/constants";
import Card from "@/components/ui/Card";

export default function HistoryPage() {
  const { staff, students, logs } = useAppData();
  const [grade, setGrade] = useState("All");
  const [subject, setSubject] = useState("All");
  const [staffFilter, setStaffFilter] = useState("All");
  const [student, setStudent] = useState("All");

  const rows = useMemo(() => {
    return logs
      .map(l => {
        const s = students.find(x => x.id === l.studentId);
        return { ...l, studentName: s?.name || "Unknown", grade: s?.grade || "" };
      })
      .filter(r => grade === "All" || r.grade === grade)
      .filter(r => subject === "All" || r.subject === subject)
      .filter(r => staffFilter === "All" || r.staff === staffFilter)
      .filter(r => student === "All" || r.studentName === student)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [logs, students, grade, subject, staffFilter, student]);

  const totalMinutes = rows.reduce((a, r) => a + r.minutes, 0);
  const studentNames = Array.from(new Set(students.map(s => s.name))).sort();

  return (
    <div className="max-w-6xl space-y-5">
      <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">Session History</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select label="Grade" value={grade} onChange={setGrade} options={["All", ...GRADES]} />
        <Select label="Subject" value={subject} onChange={setSubject} options={["All", ...SUBJECTS]} />
        <Select label="Staff" value={staffFilter} onChange={setStaffFilter} options={["All", ...staff.map(s => s.name)]} />
        <Select label="Student" value={student} onChange={setStudent} options={["All", ...studentNames]} />
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        {rows.length} session{rows.length !== 1 ? "s" : ""} · {totalMinutes} total minutes
      </p>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-faint)] text-xs uppercase border-b border-[var(--card-border)]">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Minutes</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-[var(--card-border)] last:border-0">
                <td className="px-4 py-2.5 text-[var(--text-muted)]">{r.date}</td>
                <td className="px-4 py-2.5 text-[var(--text-primary)] font-medium">{r.studentName}</td>
                <td className="px-4 py-2.5">
                  {r.grade && (
                    <span className="text-[10px] font-bold rounded px-1.5 py-0.5"
                      style={{ background: `color-mix(in srgb, ${GRADE_COLOR[r.grade as keyof typeof GRADE_COLOR]} 20%, transparent)`, color: GRADE_COLOR[r.grade as keyof typeof GRADE_COLOR] }}>
                      {r.grade}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-[var(--text-muted)]">{SUBJ_LABEL[r.subject]}</td>
                <td className="px-4 py-2.5 text-[var(--text-muted)]">{r.staff}</td>
                <td className="px-4 py-2.5 text-[var(--text-primary)]">{r.minutes}m</td>
                <td className="px-4 py-2.5 text-[var(--text-faint)]">{r.note || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--text-faint)]">No sessions logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="input">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
