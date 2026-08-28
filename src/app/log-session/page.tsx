"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { GRADES, SUBJECTS, SUBJ_LABEL, GRADE_COLOR } from "@/lib/constants";
import { toISO } from "@/lib/calculations";
import type { Grade, Subject } from "@/lib/types";
import Card from "@/components/ui/Card";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function LogSessionPage() {
  const { staff, students, logs, addLog } = useAppData();

  const [grade, setGrade] = useState<Grade | "select">("select");
  const [subject, setSubject] = useState<Subject>("Math");
  const [staffName, setStaffName] = useState("select");
  const [minutes, setMinutes] = useState(30);
  const [date, setDate] = useState(toISO(new Date()));
  const [note, setNote] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [absentIds, setAbsentIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [recentOpen, setRecentOpen] = useState(false);

  const REMEMBER_KEY = "iep-log-session-staff";

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved && staff.some(s => s.name === saved)) setStaffName(saved);
  }, [staff]);

  function handleStaffChange(name: string) {
    setStaffName(name);
    if (name !== "select") localStorage.setItem(REMEMBER_KEY, name);
  }

  const gradeStudents = useMemo(
    () => (grade === "select" ? [] : students.filter(s => s.grade === grade)),
    [grade, students]
  );

  function toggleStudent(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setAbsentIds(a => { const n = new Set(a); n.delete(id); return n; }); }
      else next.add(id);
      return next;
    });
  }

  function toggleAbsent(id: number) {
    setAbsentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() { setSelectedIds(new Set(gradeStudents.map(s => s.id))); }
  function selectNone() { setSelectedIds(new Set()); setAbsentIds(new Set()); }

  async function handleSubmit() {
    const errs: string[] = [];
    if (grade === "select") errs.push("Select a grade.");
    if (staffName === "select") errs.push("Select a staff member.");
    if (selectedIds.size === 0) errs.push("Select at least one student.");
    setErrors(errs);
    if (errs.length > 0) return;

    const present: string[] = [];
    const absent: string[] = [];
    for (const id of selectedIds) {
      const s = students.find(x => x.id === id)!;
      if (absentIds.has(id)) {
        await addLog(id, subject, staffName, 0, date, `Absent - ${date}`);
        absent.push(s.name);
      } else {
        await addLog(id, subject, staffName, minutes, date, note);
        present.push(s.name);
      }
    }
    const parts: string[] = [];
    if (present.length) parts.push(`Logged ${minutes}m of ${subject} for: ${present.join(", ")}`);
    if (absent.length) parts.push(`Marked absent: ${absent.join(", ")}`);
    setMessage(parts.join(" · "));
    setSelectedIds(new Set());
    setAbsentIds(new Set());
    setNote("");
  }

  const nSel = selectedIds.size;
  const btnLabel = nSel > 0 ? `Log ${nSel} Student${nSel !== 1 ? "s" : ""} ✓` : "Log Session ✓";

  return (
    <div className="max-w-5xl space-y-5">
      <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">Log Session</h2>

      {message && (
        <div className="rounded-lg border border-[var(--accent-green)]/40 bg-[var(--accent-green-soft)] text-[var(--accent-green)] px-4 py-3 text-sm font-medium">
          {message}
        </div>
      )}
      {errors.map(e => (
        <div key={e} className="rounded-lg border border-red-400/40 bg-red-400/10 text-red-300 px-4 py-2 text-sm">{e}</div>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade">
              <select value={grade} onChange={e => setGrade(e.target.value as Grade | "select")} className="input">
                <option value="select">select</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Subject">
              <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="input">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Staff">
              <select value={staffName} onChange={e => handleStaffChange(e.target.value)} className="input">
                <option value="select">select</option>
                {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Minutes">
              <input type="number" min={1} value={minutes} onChange={e => setMinutes(Number(e.target.value))} className="input" />
            </Field>
          </div>
          <Field label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </Field>
          <Field label="Notes (optional)">
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="input resize-none" />
          </Field>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Students</p>
          {grade === "select" ? (
            <p className="text-sm text-[var(--accent-blue)] bg-[var(--accent-blue-soft)] rounded-lg px-3 py-2">Select a grade above.</p>
          ) : gradeStudents.length === 0 ? (
            <p className="text-sm text-amber-300/80">No students in {grade} yet.</p>
          ) : (
            <>
              <div className="flex gap-2 mb-3">
                <button onClick={selectAll} className="btn-secondary flex-1">Select All</button>
                <button onClick={selectNone} className="btn-secondary flex-1">Select None</button>
              </div>
              <div className="space-y-2">
                {gradeStudents.map(s => {
                  const checked = selectedIds.has(s.id);
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={() => toggleStudent(s.id)}
                          className="accent-[var(--accent-green)]" />
                        {s.name}
                      </label>
                      {checked && (
                        <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer">
                          <input type="checkbox" checked={absentIds.has(s.id)} onChange={() => toggleAbsent(s.id)}
                            className="accent-amber-400" />
                          Absent
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full py-3 text-sm">{btnLabel}</button>

      <div className="rounded-xl border border-[var(--card-border)]">
        <button onClick={() => setRecentOpen(o => !o)} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-primary)]">
          {recentOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Recent Sessions
        </button>
        {recentOpen && (
          <div className="px-4 pb-4 space-y-1.5">
            {logs.length === 0 ? (
              <p className="text-xs text-[var(--text-faint)]">No sessions logged yet.</p>
            ) : (
              [...logs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10).map(row => {
                const stu = students.find(s => s.id === row.studentId);
                const s = staff.find(x => x.name === row.staff);
                return (
                  <div key={row.id} className="flex items-center justify-between text-[11px] rounded-md px-3 py-1.5" style={{ background: "var(--track)" }}>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s?.color || "#888" }} />
                      <b className="text-[var(--text-primary)]">{stu?.name || "Unknown"}</b>
                      {stu && (
                        <span className="text-[9px] font-bold rounded px-1 py-0.5"
                          style={{ background: `color-mix(in srgb, ${GRADE_COLOR[stu.grade]} 20%, transparent)`, color: GRADE_COLOR[stu.grade] }}>
                          {stu.grade}
                        </span>
                      )}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {SUBJ_LABEL[row.subject]} <b className="text-[var(--text-primary)]">{row.minutes}m</b> {row.date.slice(5)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      {children}
    </div>
  );
}
