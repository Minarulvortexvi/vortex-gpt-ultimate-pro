import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/db";

export async function POST(req: NextRequest) {
  const { userId, profile } = await req.json();
  
  if (!userId || !profile) {
    return NextResponse.json({ error: "Missing userId or profile" }, { status: 400 });
  }
  
  try {
    const existingUser = db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId);
    if (existingUser) {
      db.prepare("UPDATE users SET profile = ? WHERE user_id = ?").run(JSON.stringify(profile), userId);
    } else {
      db.prepare("INSERT INTO users (user_id, profile, settings) VALUES (?, ?, ?)").run(userId, JSON.stringify(profile), "{}");
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json({ error: "Failed to save profile: " + (error as Error).message }, { status: 500 });
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
      return NextResponse.json({ profile: {} });
    }
    return NextResponse.json({ profile: JSON.parse(user.profile) });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile: " + (error as Error).message }, { status: 500 });
  }
}