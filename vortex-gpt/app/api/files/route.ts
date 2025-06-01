import { NextRequest, NextResponse } from "next/server";
import { uploadToGCS, downloadFromGCS } from "../../utils/gcs";

export async function POST(req: NextRequest) {
  const { userId, fileContent, fileName } = await req.json();

  if (!userId || !fileContent || !fileName) {
    return NextResponse.json({ error: "Missing userId, fileContent, or fileName" }, { status: 400 });
  }

  try {
    await uploadToGCS(userId, fileContent, fileName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload file: " + (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const files = await downloadFromGCS(userId);
    return NextResponse.json(files);
  } catch (error) {
    console.error("File fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch files: " + (error as Error).message }, { status: 500 });
  }
}