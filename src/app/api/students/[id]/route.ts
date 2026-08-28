import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { Subject } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, goals } = body as { name?: string; goals?: Partial<Record<Subject, number>> };
  await db.updateStudent(Number(id), name, goals);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.deleteStudent(Number(id));
  return NextResponse.json({ ok: true });
}
