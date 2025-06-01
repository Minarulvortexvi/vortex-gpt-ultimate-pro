import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/db";

export async function POST(req: NextRequest) {
  const { userId, settings } = await req.json();
  
  if (!userId || !settings) {
    return NextResponse.json({ error: "Missing userId or settings" }, { status: 400 });
  }
  
  try {
    const existingUser = db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId);
    if (existingUser) {
      db.prepare("UPDATE users SET settings = ? WHERE user_id = ?").run(JSON.stringify(settings), userId);
    } else {
      db.prepare("INSERT INTO users (user_id, settings, profile) VALUES (?, ?, ?)").run(userId, JSON.stringify(settings), "{}");
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User settings error:", error);
    return NextResponse.json({ error: "Failed to save settings: " + (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  
  try {
    const user = db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId);
    if (!user) {
      return NextResponse.json({ settings: {} });
    }
    return NextResponse.json({ settings: JSON.parse(user.settings) });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings: " + (error as Error).message }, { status: 500 });
  }
}