import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { Subject } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { studentId, subject, staff, minutes, date, note, batchId } = body as {
    studentId: number; subject: Subject; staff: string; minutes: number; date: string; note: string; batchId: string;
  };
  await db.addLog(studentId, subject, staff, minutes, date, note || "", batchId);
  return NextResponse.json({ ok: true });
}
