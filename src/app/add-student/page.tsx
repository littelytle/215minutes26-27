"use client";

import { useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { GRADES, SUBJECTS } from "@/lib/constants";
import type { Grade, Subject } from "@/lib/types";
import Card from "@/components/ui/Card";

const DEFAULTS: Record<Subject, number> = { Math: 60, English: 90, "Task Completion": 45 };

export default function AddStudentPage() {
  const { addStudent } = useAppData();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>("6th");
  const [goals, setGoals] = useState<Record<Subject, number>>({ ...DEFAULTS });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) { setError("Please enter a student name."); return; }
    setError(null);
    await addStudent(name.trim(), grade, goals);
    setSuccess(`Added ${name.trim()}`);
    setName("");
    setGoals({ ...DEFAULTS });
  }

  return (
    <div className="max-w-lg space-y-5">
      <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">Add Student</h2>

      {success && (
        <div className="rounded-lg border border-[var(--accent-green)]/40 bg-[var(--accent-green-soft)] text-[var(--accent-green)] px-4 py-3 text-sm font-medium">
          {success}
        </div>
      )}
      {error && <div className="rounded-lg border border-red-400/40 bg-red-400/10 text-red-300 px-4 py-2 text-sm">{error}</div>}

      <Card className="space-y-4">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Student Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="input" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Grade</label>
            <select value={grade} onChange={e => setGrade(e.target.value as Grade)} className="input">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Weekly Goals (minutes)</p>
          <p className="text-xs text-[var(--text-faint)] mb-3">Set a subject to 0 if it doesn&apos;t apply to this student.</p>
          <div className="grid grid-cols-3 gap-3">
            {SUBJECTS.map(subj => (
              <div key={subj}>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  {subj === "Task Completion" ? "Tasks" : subj} (min/wk)
                </label>
                <input type="number" min={0} value={goals[subj]}
                  onChange={e => setGoals(g => ({ ...g, [subj]: Number(e.target.value) }))}
                  className="input" />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} className="btn-primary w-full py-3 text-sm">+ Add Student</button>
      </Card>
    </div>
  );
}
