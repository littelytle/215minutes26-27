import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { LogUpdate } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updates = (await req.json()) as LogUpdate;
  await db.updateLog(Number(id), updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.deleteLog(Number(id));
  return NextResponse.json({ ok: true });
}
