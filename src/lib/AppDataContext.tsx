"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import type { Staff, Student, LogEntry, Subject, Grade, LogUpdate } from "./types";

interface AppData {
  staff: Staff[];
  students: Student[];
  logs: LogEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
  addStudent: (name: string, grade: Grade, goals: Record<Subject, number>) => Promise<void>;
  updateStudent: (id: number, name: string | undefined, goals: Partial<Record<Subject, number>> | undefined) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  addStaffMember: (name: string, color: string) => Promise<void>;
  updateStaffNames: (names: Record<string, string>) => Promise<void>;
  addLog: (studentId: number, subject: Subject, staff: string, minutes: number, date: string, note: string, batchId: string) => Promise<void>;
  updateLog: (id: number, updates: LogUpdate) => Promise<void>;
  deleteLog: (id: number) => Promise<void>;
  updateLogsBatch: (batchId: string, updates: LogUpdate) => Promise<void>;
  deleteLogsBatch: (batchId: string) => Promise<void>;
}

const Ctx = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/data", { cache: "no-store" });
    const data = await res.json();
    setStaff(data.staff);
    setStudents(data.students);
    setLogs(data.logs);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addStudent = useCallback(async (name: string, grade: Grade, goals: Record<Subject, number>) => {
    await fetch("/api/students", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, grade, goals }),
    });
    await refresh();
  }, [refresh]);

  const updateStudent = useCallback(async (
    id: number, name: string | undefined, goals: Partial<Record<Subject, number>> | undefined
  ) => {
    await fetch(`/api/students/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, goals }),
    });
    await refresh();
  }, [refresh]);

  const deleteStudent = useCallback(async (id: number) => {
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    await refresh();
  }, [refresh]);

  const addStaffMember = useCallback(async (name: string, color: string) => {
    await fetch("/api/staff", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    await refresh();
  }, [refresh]);

  const updateStaffNames = useCallback(async (names: Record<string, string>) => {
    await fetch("/api/staff", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    });
    await refresh();
  }, [refresh]);

  const addLog = useCallback(async (
    studentId: number, subject: Subject, staffName: string, minutes: number, date: string, note: string, batchId: string
  ) => {
    await fetch("/api/logs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, subject, staff: staffName, minutes, date, note, batchId }),
    });
    await refresh();
  }, [refresh]);

  const updateLog = useCallback(async (id: number, updates: LogUpdate) => {
    await fetch(`/api/logs/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    await refresh();
  }, [refresh]);

  const deleteLog = useCallback(async (id: number) => {
    await fetch(`/api/logs/${id}`, { method: "DELETE" });
    await refresh();
  }, [refresh]);

  const updateLogsBatch = useCallback(async (batchId: string, updates: LogUpdate) => {
    await fetch(`/api/logs/batch/${batchId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    await refresh();
  }, [refresh]);

  const deleteLogsBatch = useCallback(async (batchId: string) => {
    await fetch(`/api/logs/batch/${batchId}`, { method: "DELETE" });
    await refresh();
  }, [refresh]);

  return (
    <Ctx.Provider value={{
      staff, students, logs, loading, refresh,
      addStudent, updateStudent, deleteStudent, addStaffMember, updateStaffNames,
      addLog, updateLog, deleteLog, updateLogsBatch, deleteLogsBatch,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppData(): AppData {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
