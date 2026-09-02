"use client";

import { useEffect, useState } from "react";
import type { Student, Staff, LogEntry, Subject } from "@/lib/types";
import { SUBJECTS, SUBJ_SHORT, SUBJ_COLOR, GRADE_COLOR } from "@/lib/constants";
import { safeGoal, pivotMinutes, pivotStaffBreakdown } from "@/lib/calculations";
import { useAppData } from "@/lib/AppDataContext";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import clsx from "clsx";

interface Props {
  student: Student;
  activeSubject: Subject;
  staff: Staff[];
  logs: LogEntry[];
  viewStart: string;
  viewEnd: string;
}

export default function StudentCard({ student, activeSubject, staff, logs, viewStart, viewEnd }: Props) {
  const { updateStudent, deleteStudent } = useAppData();
  const [displaySubject, setDisplaySubject] = useState<Subject>(activeSubject);
  useEffect(() => setDisplaySubject(activeSubject), [activeSubject]);

  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [name, setName] = useState(student.name);
  const [goals, setGoals] = useState({
    Math: student.goalMath, English: student.goalEnglish, "Task Completion": student.goalTaskCompletion,
  });

  const goal = safeGoal(student, displaySubject);
  const staffNames = staff.map(s => s.name);
  const byStaff = pivotStaffBreakdown(logs, student.id, displaySubject, viewStart, viewEnd, staffNames);
  const totalMin = Object.values(byStaff).reduce((a, b) => a + b, 0);
  const goalMet = goal > 0 && totalMin >= goal;
  const subjColor = SUBJ_COLOR[displaySubject];
  const arcColor = goalMet ? "var(--accent-green)" : subjColor;
  const gradeColor = GRADE_COLOR[student.grade];

  async function handleSave() {
    await updateStudent(student.id, name, goals);
    setEditOpen(false);
  }

  async function handleDelete() {
    await deleteStudent(student.id);
  }

  return (
    <div
      className="card-surface p-4"
      style={{ borderLeft: `4px solid ${subjColor}` }}
    >
      {/* header: grade badge + M/E/T status dots */}
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="text-[10px] font-bold rounded px-1.5 py-0.5"
          style={{ background: `color-mix(in srgb, ${gradeColor} 20%, transparent)`, color: gradeColor }}
        >
          {student.grade}
        </span>
        <span className="flex gap-1">
          {SUBJECTS.map(subj => {
            const g = safeGoal(student, subj);
            const m = pivotMinutes(logs, student.id, subj, viewStart, viewEnd);
            const done = g > 0 && m >= g;
            return (
              <span
                key={subj}
                title={g <= 0 ? `${subj}: N/A` : `${subj}: ${m}m / ${g}m`}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold"
                style={{
                  background: done ? SUBJ_COLOR[subj] : "var(--track)",
                  color: done ? "#0d120b" : "var(--text-muted)",
                  opacity: done ? 1 : 0.7,
                }}
              >
                {SUBJ_SHORT[subj]}
              </span>
            );
          })}
        </span>
      </div>

      {/* name */}
      <div className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2 leading-tight">
        {student.name}
      </div>

      {/* minutes */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-3xl font-extrabold leading-none" style={{ color: arcColor }}>
          {totalMin}
        </span>
        <span className="text-xs text-[var(--text-muted)] font-medium">min</span>
        <span className="text-xs text-[var(--text-muted)]">
          {goal <= 0 ? "No goal set" : `/ ${goal}m goal`}
        </span>
        {goalMet && <Check size={14} className="text-[var(--accent-green)]" />}
      </div>

      {/* segmented progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden flex mb-1.5" style={{ background: "var(--track)" }}>
        {staff.map(s => {
          const m = byStaff[s.name] || 0;
          if (m <= 0 || goal <= 0) return null;
          const pct = Math.min((m / goal) * 100, 100);
          return <div key={s.id} title={`${s.name}: ${m}m`} style={{ width: `${pct}%`, background: s.color }} />;
        })}
      </div>

      {/* staff chips */}
      <div className="flex flex-wrap gap-1 mb-3">
        {staff.map(s => {
          const m = byStaff[s.name] || 0;
          if (m <= 0) return null;
          return (
            <span key={s.id} className="inline-flex items-center gap-1 text-[9px] rounded px-1.5 py-0.5"
              style={{ background: "var(--track)", color: "var(--text-muted)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              {s.name.split(" ").pop()}: {m}m
            </span>
          );
        })}
      </div>

      {/* subject switcher */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {SUBJECTS.map(subj => (
          <button
            key={subj}
            title={`View ${subj}`}
            onClick={() => setDisplaySubject(subj)}
            className={clsx(
              "pill-btn text-xs py-1.5 border",
              subj === displaySubject
                ? "bg-[var(--accent-green-soft)] border-[var(--accent-green)] text-[var(--accent-green)]"
                : "border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {SUBJ_SHORT[subj]}
          </button>
        ))}
      </div>

      {/* edit / remove */}
      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
        <button onClick={() => setEditOpen(o => !o)}
          className="flex items-center gap-1 text-xs rounded-lg border border-[var(--card-border)] px-2 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          {editOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Edit
        </button>
        <button onClick={() => setRemoveOpen(o => !o)}
          className="flex items-center gap-1 text-xs rounded-lg border border-[var(--card-border)] px-2 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          {removeOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Remove
        </button>
      </div>

      {editOpen && (
        <div className="rounded-lg border border-[var(--card-border)] p-3 mb-1.5 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-black/20 border border-[var(--card-border)] rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] outline-none" />
          <p className="text-[10px] text-[var(--text-faint)]">Weekly goals (min) — 0 = doesn&apos;t apply</p>
          {SUBJECTS.map(subj => (
            <div key={subj} className="flex items-center justify-between gap-2">
              <label className="text-xs text-[var(--text-muted)]">{subj === "Task Completion" ? "Tasks" : subj}</label>
              <input type="number" min={0} value={goals[subj]}
                onChange={e => setGoals(g => ({ ...g, [subj]: Number(e.target.value) }))}
                className="w-20 bg-black/20 border border-[var(--card-border)] rounded-md px-2 py-1 text-sm text-right text-[var(--text-primary)] outline-none" />
            </div>
          ))}
          <button onClick={handleSave}
            className="pill-btn w-full bg-[var(--accent-green-soft)] text-[var(--accent-green)] py-1.5 text-sm">
            Save
          </button>
        </div>
      )}

      {removeOpen && (
        <div className="rounded-lg border border-[var(--card-border)] p-3 mb-1.5">
          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-xs text-amber-300/90">Permanently remove {student.name}? This can&apos;t be undone.</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={handleDelete}
                  className="pill-btn bg-red-500/20 text-red-300 py-1.5 text-xs">Yes, remove</button>
                <button onClick={() => setConfirmDelete(false)}
                  className="pill-btn border border-[var(--card-border)] text-[var(--text-muted)] py-1.5 text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] text-[var(--text-faint)] mb-1.5">This can&apos;t be undone.</p>
              <button onClick={() => setConfirmDelete(true)}
                className="pill-btn w-full border border-[var(--card-border)] text-[var(--text-muted)] py-1.5 text-xs">
                Remove student
              </button>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setNotesOpen(o => !o)}
        className="w-full flex items-center gap-1 text-xs rounded-lg border border-[var(--card-border)] px-2 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        {notesOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Notes
      </button>

      {notesOpen && (
        <div className="mt-1.5 space-y-1.5">
          {(() => {
            const notes = logs
              .filter(l => l.studentId === student.id && l.subject === displaySubject && l.note.trim() !== "")
              .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : b.id - a.id));
            if (notes.length === 0) return <p className="text-[10px] text-[var(--text-faint)]">No notes for {displaySubject}</p>;
            return notes.map(n => {
              const s = staff.find(x => x.name === n.staff);
              return (
                <div key={n.id} className="rounded-md p-2" style={{ background: "var(--track)" }}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] flex items-center gap-1 text-[var(--text-muted)]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s?.color || "#888" }} />
                      {n.staff.split(" ").pop()}
                    </span>
                    <span className="text-[10px] text-[var(--text-faint)]">{n.date.slice(5)}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">{n.note}</p>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
