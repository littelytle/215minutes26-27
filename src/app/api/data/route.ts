import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export async function GET() {
  try {
    const [staff, students, logs] = await Promise.all([
      db.getStaff(), db.getStudents(), db.getLogs(),
    ]);
    return NextResponse.json({ staff, students, logs });
  } catch (err) {
    console.error("GET /api/data failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
