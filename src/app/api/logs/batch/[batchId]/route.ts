import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { LogUpdate } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const updates = (await req.json()) as LogUpdate;
  await db.updateLogsByBatch(batchId, updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  await db.deleteLogsByBatch(batchId);
  return NextResponse.json({ ok: true });
}
