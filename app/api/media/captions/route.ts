import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const ALLOWED_FOLDERS = ["panel_1_home", "slider", "videos"];

function captionsPath(folder: string) {
  return path.join(process.cwd(), "public", folder, "_captions.json");
}

export async function GET(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get("folder") ?? "";
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }
  const filePath = captionsPath(folder);
  if (!existsSync(filePath)) return NextResponse.json({ captions: {} });
  try {
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    return NextResponse.json({ captions: data });
  } catch {
    return NextResponse.json({ captions: {} });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder, captions } = body as {
      folder: string;
      captions: Record<string, string>;
    };
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }
    if (typeof captions !== "object" || captions === null || Array.isArray(captions)) {
      return NextResponse.json({ error: "Invalid captions" }, { status: 400 });
    }
    // Sanitize — only plain strings, max 200 chars per caption, no metadata keys
    const METADATA = new Set(["_order.json", "_captions.json"]);
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(captions)) {
      if (typeof k === "string" && typeof v === "string" && !METADATA.has(k)) {
        clean[k] = v.slice(0, 200);
      }
    }
    writeFileSync(captionsPath(folder), JSON.stringify(clean, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
