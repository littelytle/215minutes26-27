import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export async function POST(req: Request) {
  const { name, color } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  await db.addStaffMember(name.trim(), color);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { names } = await req.json() as { names: Record<string, string> };
  await db.updateStaffNames(names);
  return NextResponse.json({ ok: true });
}
