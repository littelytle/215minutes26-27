import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { Grade } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, grade, goals } = body as {
    name: string; grade: Grade; goals: { Math: number; English: number; "Task Completion": number };
  };
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  await db.addStudent(name.trim(), grade, goals);
  return NextResponse.json({ ok: true });
}
