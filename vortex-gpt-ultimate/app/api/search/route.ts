import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db/db";
import Fuse from "fuse.js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const userId = searchParams.get("userId");

  if (!userId || !query) {
    return NextResponse.json({ error: "Missing userId or query" }, { status: 400 });
  }

  try {
    const history = db.prepare("SELECT * FROM clones WHERE user_id = ?").all(userId);
    const fuse = new Fuse(history, {
      keys: ["url", "created_at"],
      threshold: 0.3,
    });
    const results = fuse.search(query);
    return NextResponse.json(results.map((result) => result.item));
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search: " + (error as Error).message }, { status: 500 });
  }
}