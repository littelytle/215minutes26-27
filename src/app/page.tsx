"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { SCHOOL_MONTHS, SUBJECTS, SUBJ_LABEL, GRADES } from "@/lib/constants";
import { schoolYearFor, monthWeeks, monthRange, weekContaining, toISO } from "@/lib/calculations";
import type { Subject } from "@/lib/types";
import PillButton from "@/components/ui/PillButton";
import Card from "@/components/ui/Card";
import SummaryRow from "@/components/dashboard/SummaryRow";
import GoalTracker from "@/components/dashboard/GoalTracker";
import ChartSection from "@/components/dashboard/ChartSection";
import StudentCard from "@/components/dashboard/StudentCard";
import clsx from "clsx";

const today = new Date();
const sy = schoolYearFor(today);
const MONTH_TABS = SCHOOL_MONTHS.map(([m, label]) => ({
  year: m >= 8 ? sy : sy + 1, month: m, label,
}));
const DEFAULT_MONTH_IDX = Math.max(
  0, MONTH_TABS.findIndex(mt => mt.year === today.getFullYear() && mt.month === today.getMonth() + 1)
);

export default function DashboardPage() {
  const { staff, students, logs, loading } = useAppData();
  const [monthIdx, setMonthIdx] = useState(DEFAULT_MONTH_IDX === -1 ? 0 : DEFAULT_MONTH_IDX);
  const { year, month } = MONTH_TABS[monthIdx];

  const weeks = useMemo(() => monthWeeks(year, month), [year, month]);
  const { start: monthStart, end: monthEnd } = useMemo(() => monthRange(year, month), [year, month]);

  const defaultWeekLabel = useMemo(() => {
    const w = weekContaining(weeks, today);
    return w ? w.label : "Whole Month";
  }, [weeks]);
  const [selectedWeek, setSelectedWeek] = useState(defaultWeekLabel);
  useEffect(() => setSelectedWeek(defaultWeekLabel), [defaultWeekLabel]);

  const { viewStart, viewEnd } = useMemo(() => {
    if (selectedWeek === "Whole Month") return { viewStart: toISO(monthStart), viewEnd: toISO(monthEnd) };
    const w = weeks.find(w => w.label === selectedWeek);
    return w ? { viewStart: toISO(w.start), viewEnd: toISO(w.end) } : { viewStart: toISO(monthStart), viewEnd: toISO(monthEnd) };
  }, [selectedWeek, weeks, monthStart, monthEnd]);

  const chartWeekStart = useMemo(() => {
    if (selectedWeek === "Whole Month") {
      const w = weekContaining(weeks, today);
      return w ? w.start : weeks[0]?.start ?? today;
    }
    const w = weeks.find(w => w.label === selectedWeek);
    return w ? w.start : weeks[0]?.start ?? today;
  }, [selectedWeek, weeks]);

  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [activeSubject, setActiveSubject] = useState<Subject>("Math");

  const visibleStudents = gradeFilter === "All" ? students : students.filter(s => s.grade === gradeFilter);

  if (loading) {
    return <p className="text-[var(--text-muted)] text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Month tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MONTH_TABS.map((mt, i) => (
          <PillButton key={i} size="sm" active={i === monthIdx} onClick={() => setMonthIdx(i)}>
            {mt.label}
          </PillButton>
        ))}
      </div>

      {/* Week pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <PillButton size="sm" active={selectedWeek === "Whole Month"} onClick={() => setSelectedWeek("Whole Month")}>
          Whole Month
        </PillButton>
        {weeks.map(w => (
          <PillButton key={w.label} size="sm" active={selectedWeek === w.label} onClick={() => setSelectedWeek(w.label)}>
            {w.label}
          </PillButton>
        ))}
      </div>

      <Card>
        <SummaryRow
          label={selectedWeek === "Whole Month" ? "Month" : selectedWeek || "This Week"}
          staff={staff} logs={logs} viewStart={viewStart} viewEnd={viewEnd}
        />
      </Card>

      <Card>
        <GoalTracker
          students={visibleStudents} logs={logs} viewStart={viewStart} viewEnd={viewEnd}
          periodLabel={selectedWeek === "Whole Month" ? "Month" : selectedWeek || "This Week"}
        />
      </Card>

      <ChartSection
        students={visibleStudents} logs={logs} weeks={weeks}
        monthLabel={MONTH_TABS[monthIdx].label} weekStart={chartWeekStart}
      />

      <h3 className="font-serif text-xl font-bold text-[var(--text-primary)] pt-2">Individual Student Progress</h3>

      {/* Grade filter */}
      <div className="flex gap-2">
        {["All", ...GRADES].map(g => (
          <PillButton key={g} active={gradeFilter === g} onClick={() => setGradeFilter(g)}>
            {g}
          </PillButton>
        ))}
      </div>

      {/* Subject tabs */}
      <div className="flex justify-center gap-3 border-b border-[var(--card-border)] pb-0">
        {SUBJECTS.map(subj => (
          <button
            key={subj}
            onClick={() => setActiveSubject(subj)}
            className={clsx(
              "font-serif text-lg font-bold px-6 py-3 border-b-2 -mb-px transition-colors",
              activeSubject === subj
                ? "text-[var(--accent-green)] border-[var(--accent-green)]"
                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
            )}
          >
            {SUBJ_LABEL[subj]}
          </button>
        ))}
      </div>

      {visibleStudents.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No students yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleStudents.map(s => (
            <StudentCard
              key={s.id} student={s} activeSubject={activeSubject} staff={staff} logs={logs}
              viewStart={viewStart} viewEnd={viewEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
