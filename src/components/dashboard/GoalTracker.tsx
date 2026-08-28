"use client";

import { useState } from "react";
import type { Student, LogEntry, Subject } from "@/lib/types";
import { SUBJECTS, SUBJ_LABEL } from "@/lib/constants";
import { hasGoal, safeGoal, pivotMinutes } from "@/lib/calculations";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  students: Student[];
  logs: LogEntry[];
  viewStart: string;
  viewEnd: string;
  periodLabel: string;
}

export default function GoalTracker({ students, logs, viewStart, viewEnd, periodLabel }: Props) {
  return (
    <div>
      <h3 className="font-serif text-base font-bold text-[var(--text-primary)] mb-3">
        Goal Completion — {periodLabel}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUBJECTS.map(subj => (
          <SubjectTracker key={subj} subj={subj} students={students} logs={logs} viewStart={viewStart} viewEnd={viewEnd} />
        ))}
      </div>
    </div>
  );
}

function SubjectTracker({
  subj, students, logs, viewStart, viewEnd,
}: { subj: Subject; students: Student[]; logs: LogEntry[]; viewStart: string; viewEnd: string }) {
  const [open, setOpen] = useState(false);
  const applicable = students.filter(s => hasGoal(s, subj));
  const total = applicable.length;
  const missing: { name: string; m: number; g: number }[] = [];
  let met = 0;
  for (const s of applicable) {
    const g = safeGoal(s, subj);
    const m = pivotMinutes(logs, s.id, subj, viewStart, viewEnd);
    if (m >= g) met++;
    else missing.push({ name: s.name, m, g });
  }
  missing.sort((a, b) => (a.m - a.g) - (b.m - b.g));

  return (
    <div className="rounded-xl border border-[var(--card-border)]">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--text-primary)]">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>{SUBJ_LABEL[subj]} — {met} / {total} at goal</span>
      </button>
      {open && (
        <div className="px-3 pb-3 text-xs">
          {total === 0 ? (
            <p className="text-[var(--text-faint)]">No students have a {SUBJ_LABEL[subj]} goal set.</p>
          ) : missing.length === 0 ? (
            <p className="text-[var(--text-faint)]">Everyone has hit their {SUBJ_LABEL[subj]} goal.</p>
          ) : (
            <>
              <p className="text-[var(--text-faint)] mb-1">Still need minutes:</p>
              <ul className="space-y-1">
                {missing.map(m => (
                  <li key={m.name} className="text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-primary)]">{m.name}</span> — {m.m} / {m.g}m
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
