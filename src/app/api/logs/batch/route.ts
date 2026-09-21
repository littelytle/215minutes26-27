import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { Subject } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { entries } = body as {
    entries: { studentId: number; subject: Subject; staff: string; minutes: number; date: string; note: string; batchId: string }[];
  };
  await db.addLogs(entries);
  return NextResponse.json({ ok: true });
}
