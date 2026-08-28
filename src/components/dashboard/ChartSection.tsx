"use client";

import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { Student, LogEntry } from "@/lib/types";
import { SUBJECTS, SUBJ_LABEL, SUBJ_COLOR } from "@/lib/constants";
import { hasGoal, safeGoal, toISO, type Week } from "@/lib/calculations";
import { ChevronDown, ChevronRight } from "lucide-react";

function countAtGoal(students: Student[], logs: LogEntry[], subj: (typeof SUBJECTS)[number], startISO: string, endISO: string) {
  let count = 0;
  for (const s of students) {
    if (!hasGoal(s, subj)) continue;
    const g = safeGoal(s, subj);
    const m = logs
      .filter(l => l.studentId === s.id && l.subject === subj && l.date >= startISO && l.date <= endISO)
      .reduce((a, l) => a + l.minutes, 0);
    if (m >= g) count++;
  }
  return count;
}

function tooltipStyle() {
  return {
    background: "#0d120b", border: "1px solid rgba(233,227,201,0.15)", borderRadius: 8,
    color: "#f2ecd9", fontSize: 12,
  };
}

export default function ChartSection({
  students, logs, weeks, monthLabel, weekStart,
}: { students: Student[]; logs: LogEntry[]; weeks: Week[]; monthLabel: string; weekStart: Date }) {
  const [showMonth, setShowMonth] = useState(false);
  const [open, setOpen] = useState(true);

  const dailyData = useMemo(() => {
    const days = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(d.getDate() + i);
      return d;
    });
    return days.map(d => {
      const iso = toISO(d);
      const wkStartISO = toISO(weekStart);
      const row: Record<string, number | string> = {
        label: d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
      };
      for (const subj of SUBJECTS) row[subj] = countAtGoal(students, logs, subj, wkStartISO, iso);
      return row;
    });
  }, [students, logs, weekStart]);

  const monthlyData = useMemo(() => {
    return weeks.map(w => {
      const row: Record<string, number | string> = { label: w.label };
      for (const subj of SUBJECTS) row[subj] = countAtGoal(students, logs, subj, toISO(w.start), toISO(w.end));
      return row;
    });
  }, [students, logs, weeks]);

  const title = showMonth ? `Weekly Goal Progress (${monthLabel})` : "Daily Goal Progress (This Week)";
  const data = showMonth ? monthlyData : dailyData;
  const maxY = Math.max(students.length, 1);

  return (
    <div className="rounded-xl border border-[var(--card-border)]">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-serif font-bold text-[var(--text-primary)]">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2 cursor-pointer select-none">
            <span
              onClick={() => setShowMonth(v => !v)}
              className="relative inline-block w-9 h-5 rounded-full transition-colors"
              style={{ background: showMonth ? "var(--accent-green)" : "var(--track)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#0d120b] transition-transform"
                style={{ transform: showMonth ? "translateX(16px)" : "translateX(0)" }}
              />
            </span>
            Show month trend
          </label>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(233,227,201,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--text-faint)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-faint)" fontSize={11} tickLine={false} allowDecimals={false} domain={[0, maxY]} />
              <Tooltip contentStyle={tooltipStyle()} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
              {SUBJECTS.map(subj => (
                <Line key={subj} type="monotone" dataKey={subj} name={SUBJ_LABEL[subj]}
                  stroke={SUBJ_COLOR[subj]} strokeWidth={2.5} dot={{ r: 4, fill: SUBJ_COLOR[subj] }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
