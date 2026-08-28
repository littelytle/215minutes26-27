import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export async function GET() {
  const [staff, students, logs] = await Promise.all([
    db.getStaff(), db.getStudents(), db.getLogs(),
  ]);
  return NextResponse.json({ staff, students, logs });
}
