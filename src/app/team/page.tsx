"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import Card from "@/components/ui/Card";

export default function TeamPage() {
  const { staff, addStaffMember, updateStaffNames } = useAppData();
  const [names, setNames] = useState<Record<number, string>>({});
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#8fc7e8");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setNames(Object.fromEntries(staff.map(s => [s.id, s.name])));
  }, [staff]);

  async function handleSaveNames() {
    await updateStaffNames(Object.fromEntries(Object.entries(names).map(([k, v]) => [k, v])));
    setSavedMsg("Staff names updated!");
  }

  async function handleAddStaff() {
    if (!newName.trim()) return;
    await addStaffMember(newName.trim(), newColor);
    setNewName("");
    setSavedMsg(`Added ${newName.trim()}`);
  }

  return (
    <div className="max-w-lg space-y-5">
      <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">Team Setup</h2>

      {savedMsg && (
        <div className="rounded-lg border border-[var(--accent-green)]/40 bg-[var(--accent-green-soft)] text-[var(--accent-green)] px-4 py-3 text-sm font-medium">
          {savedMsg}
        </div>
      )}

      <Card className="space-y-3">
        {staff.map(s => (
          <div key={s.id} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
            <input
              value={names[s.id] ?? s.name}
              onChange={e => setNames(n => ({ ...n, [s.id]: e.target.value }))}
              className="input"
            />
          </div>
        ))}
        <button onClick={handleSaveNames} className="btn-primary w-full py-2.5 text-sm">Save Changes</button>
      </Card>

      <div className="border-t border-[var(--card-border)]" />

      <p className="text-sm font-semibold text-[var(--text-primary)]">Add Team Member</p>
      <Card className="space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Ms. Garcia" className="input" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Color</label>
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
              className="w-12 h-9 rounded-md border border-[var(--card-border)] bg-transparent cursor-pointer" />
          </div>
        </div>
        <button onClick={handleAddStaff} className="btn-primary w-full py-2.5 text-sm">+ Add Team Member</button>
      </Card>
    </div>
  );
}
