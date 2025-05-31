import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db/db";

export async function POST(req: NextRequest) {
  const { usage } = await req.json();
  
  if (!usage) {
    return NextResponse.json({ error: "Missing usage data" }, { status: 400 });
  }
  
  try {
    db.prepare("INSERT INTO usage (calls, limit, updated_at) VALUES (?, ?, ?)")
      .run(usage.calls, usage.limit, new Date().toISOString());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usage save error:", error);
    return NextResponse.json({ error: "Failed to save usage: " + (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const usage = db.prepare("SELECT * FROM usage ORDER BY updated_at DESC LIMIT 1").get();
    return NextResponse.json(usage || { calls: 0, limit: 100 });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch usage: " + (error as Error).message }, { status: 500 });
  }
}