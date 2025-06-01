import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  const { clonedData } = await req.json();
  
  if (!clonedData || !clonedData.html) {
    return NextResponse.json({ error: "No cloned data provided" }, { status: 400 });
  }
  
  try {
    const zip = new JSZip();
    zip.file("index.html", clonedData.html);
    
    const content = await zip.generateAsync({ type: "blob" });
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=cloned-site.zip",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export: " + (error as Error).message }, { status: 500 });
  }
}