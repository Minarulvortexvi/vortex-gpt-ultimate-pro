import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/db";

export async function POST(req: NextRequest) {
  const { userId, feedback, rating } = await req.json();

  if (!userId || !feedback || !rating) {
    return NextResponse.json({ error: "Missing userId, feedback, or rating" }, { status: 400 });
  }

  try {
    db.prepare("INSERT INTO feedback (user_id, feedback, rating, created_at) VALUES (?, ?, ?, ?)")
      .run(userId, feedback, rating, new Date().toISOString());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback save error:", error);
    return NextResponse.json({ error: "Failed to save feedback: " + (error as Error).message }, { status: 500 });
  }
}