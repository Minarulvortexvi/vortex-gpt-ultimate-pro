import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const history = db.prepare("SELECT * FROM clones WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    return NextResponse.json(history || []);
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch history: " + (error as Error).message }, { status: 500 });
  }
}