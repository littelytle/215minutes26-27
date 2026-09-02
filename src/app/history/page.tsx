"use client";

import { Fragment, useMemo, useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { GRADES, SUBJECTS, SUBJ_LABEL, GRADE_COLOR } from "@/lib/constants";
import type { LogEntry, Subject } from "@/lib/types";
import Card from "@/components/ui/Card";
import { Pencil, Trash2, Users } from "lucide-react";

export default function HistoryPage() {
  const { staff, students, logs, updateLog, deleteLog, updateLogsBatch, deleteLogsBatch } = useAppData();
  const [grade, setGrade] = useState("All");
  const [subject, setSubject] = useState("All");
  const [staffFilter, setStaffFilter] = useState("All");
  const [student, setStudent] = useState("All");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ subject: Subject; minutes: number; date: string; note: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [editingBatch, setEditingBatch] = useState<string | null>(null);
  const [batchDraft, setBatchDraft] = useState<{ subject: Subject; minutes: number } | null>(null);
  const [confirmDeleteBatch, setConfirmDeleteBatch] = useState<string | null>(null);

  // Row deletes/edits look up their sheet position fresh on each call. Firing
  // two of these at once (e.g. double-clicking Confirm on two different rows
  // before the first finishes) can race and corrupt a different row than
  // intended, since positions shift as rows above them are removed. This lock
  // makes every edit/delete action here strictly one-at-a-time.
  const [busy, setBusy] = useState(false);

  const batchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of logs) if (l.batchId) counts[l.batchId] = (counts[l.batchId] || 0) + 1;
    return counts;
  }, [logs]);

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

  function startEdit(row: LogEntry) {
    setEditingBatch(null);
    setConfirmDeleteBatch(null);
    setEditingId(row.id);
    setConfirmDeleteId(null);
    setEditDraft({ subject: row.subject, minutes: row.minutes, date: row.date, note: row.note });
  }

  async function saveEdit(id: number) {
    if (!editDraft || busy) return;
    setBusy(true);
    try {
      await updateLog(id, editDraft);
      setEditingId(null);
      setEditDraft(null);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete(id: number) {
    if (busy) return;
    setBusy(true);
    try {
      await deleteLog(id);
      setConfirmDeleteId(null);
    } finally {
      setBusy(false);
    }
  }

  function startBatchEdit(row: LogEntry) {
    setEditingId(null);
    setConfirmDeleteId(null);
    setEditingBatch(row.batchId);
    setConfirmDeleteBatch(null);
    setBatchDraft({ subject: row.subject, minutes: row.minutes });
  }

  async function saveBatchEdit(batchId: string) {
    if (!batchDraft || busy) return;
    setBusy(true);
    try {
      await updateLogsBatch(batchId, batchDraft);
      setEditingBatch(null);
      setBatchDraft(null);
    } finally {
      setBusy(false);
    }
  }

  async function confirmBatchDelete(batchId: string) {
    if (busy) return;
    setBusy(true);
    try {
      await deleteLogsBatch(batchId);
      setConfirmDeleteBatch(null);
    } finally {
      setBusy(false);
    }
  }

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
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const groupSize = r.batchId ? batchCounts[r.batchId] || 1 : 1;
              const isEditing = editingId === r.id;
              const isBatchEditing = editingBatch === r.batchId && groupSize > 1;
              return (
                <Fragment key={r.id}>
                  <tr className="border-b border-[var(--card-border)] last:border-0 align-top">
                    <td className="px-4 py-2.5 text-[var(--text-muted)] whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-2.5 text-[var(--text-primary)] font-medium whitespace-nowrap">{r.studentName}</td>
                    <td className="px-4 py-2.5">
                      {r.grade && (
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5"
                          style={{ background: `color-mix(in srgb, ${GRADE_COLOR[r.grade as keyof typeof GRADE_COLOR]} 20%, transparent)`, color: GRADE_COLOR[r.grade as keyof typeof GRADE_COLOR] }}>
                          {r.grade}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-muted)] whitespace-nowrap">{SUBJ_LABEL[r.subject]}</td>
                    <td className="px-4 py-2.5 text-[var(--text-muted)] whitespace-nowrap">{r.staff}</td>
                    <td className="px-4 py-2.5 text-[var(--text-primary)]">{r.minutes}m</td>
                    <td className="px-4 py-2.5 text-[var(--text-faint)] max-w-[16rem]">{r.note || "—"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => startEdit(r)} title="Edit this entry" disabled={busy}
                          className="text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors disabled:opacity-40">
                          <Pencil size={15} />
                        </button>
                        {confirmDeleteId === r.id ? (
                          <span className="flex items-center gap-1">
                            <button onClick={() => confirmDelete(r.id)} disabled={busy} className="pill-btn bg-red-500/20 text-red-300 text-[11px] px-2 py-1 disabled:opacity-40">Confirm</button>
                            <button onClick={() => setConfirmDeleteId(null)} disabled={busy} className="pill-btn border border-[var(--card-border)] text-[var(--text-muted)] text-[11px] px-2 py-1 disabled:opacity-40">Cancel</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(r.id)} title="Delete this entry" disabled={busy}
                            className="text-[var(--text-muted)] hover:text-red-300 transition-colors disabled:opacity-40">
                            <Trash2 size={15} />
                          </button>
                        )}
                        {groupSize > 1 && (
                          <button onClick={() => startBatchEdit(r)} title={`Edit all ${groupSize} entries logged together`} disabled={busy}
                            className="flex items-center gap-1 text-[10px] rounded-full border border-[var(--card-border)] px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap disabled:opacity-40">
                            <Users size={11} /> Group of {groupSize}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {isEditing && editDraft && (
                    <tr className="border-b border-[var(--card-border)] last:border-0" style={{ background: "var(--track)" }}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <MiniField label="Subject">
                            <select value={editDraft.subject} onChange={e => setEditDraft(d => d && { ...d, subject: e.target.value as Subject })} className="input">
                              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </MiniField>
                          <MiniField label="Minutes">
                            <input type="number" min={0} value={editDraft.minutes}
                              onChange={e => setEditDraft(d => d && { ...d, minutes: Number(e.target.value) })} className="input w-24" />
                          </MiniField>
                          <MiniField label="Date">
                            <input type="date" value={editDraft.date}
                              onChange={e => setEditDraft(d => d && { ...d, date: e.target.value })} className="input" />
                          </MiniField>
                          <MiniField label="Note">
                            <input type="text" value={editDraft.note}
                              onChange={e => setEditDraft(d => d && { ...d, note: e.target.value })} className="input w-56" />
                          </MiniField>
                          <button onClick={() => saveEdit(r.id)} disabled={busy} className="btn-primary px-4 py-2 text-sm disabled:opacity-40">{busy ? "Saving…" : "Save"}</button>
                          <button onClick={() => { setEditingId(null); setEditDraft(null); }} disabled={busy} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {isBatchEditing && batchDraft && (
                    <tr className="border-b border-[var(--card-border)] last:border-0" style={{ background: "var(--track)" }}>
                      <td colSpan={8} className="px-4 py-3">
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                          Editing all {groupSize} sessions logged together on {r.date} — changes apply to every student in this group.
                        </p>
                        <div className="flex flex-wrap items-end gap-3">
                          <MiniField label="Subject">
                            <select value={batchDraft.subject} onChange={e => setBatchDraft(d => d && { ...d, subject: e.target.value as Subject })} className="input">
                              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </MiniField>
                          <MiniField label="Minutes">
                            <input type="number" min={0} value={batchDraft.minutes}
                              onChange={e => setBatchDraft(d => d && { ...d, minutes: Number(e.target.value) })} className="input w-24" />
                          </MiniField>
                          <button onClick={() => saveBatchEdit(r.batchId)} disabled={busy} className="btn-primary px-4 py-2 text-sm disabled:opacity-40">{busy ? "Saving…" : `Save All ${groupSize}`}</button>
                          <button onClick={() => { setEditingBatch(null); setBatchDraft(null); }} disabled={busy} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Cancel</button>
                          <span className="grow" />
                          {confirmDeleteBatch === r.batchId ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-xs text-amber-300/90">Delete all {groupSize}?</span>
                              <button onClick={() => confirmBatchDelete(r.batchId)} disabled={busy} className="pill-btn bg-red-500/20 text-red-300 text-[11px] px-2 py-1.5 disabled:opacity-40">Confirm</button>
                              <button onClick={() => setConfirmDeleteBatch(null)} disabled={busy} className="pill-btn border border-[var(--card-border)] text-[var(--text-muted)] text-[11px] px-2 py-1.5 disabled:opacity-40">Cancel</button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmDeleteBatch(r.batchId)} disabled={busy} className="flex items-center gap-1 text-xs text-red-300/80 hover:text-red-300 disabled:opacity-40">
                              <Trash2 size={13} /> Delete whole group
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[var(--text-faint)]">No sessions logged yet.</td></tr>
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

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-[var(--text-faint)] mb-1">{label}</label>
      {children}
    </div>
  );
}
