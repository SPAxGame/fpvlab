import { readdirSync, unlinkSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { type NextRequest } from "next/server";

const ALLOWED_FOLDERS = ["panel_1_home", "slider", "videos"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

function isAllowed(folder: string | null): folder is AllowedFolder {
  return ALLOWED_FOLDERS.includes(folder as AllowedFolder);
}

export async function GET(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get("folder");
  if (!isAllowed(folder)) {
    return Response.json({ error: "Invalid folder" }, { status: 400 });
  }
  const dirPath = join(process.cwd(), "public", folder);
  try {
    const allFiles = readdirSync(dirPath).filter(
      (f) => !f.startsWith(".") && !f.endsWith(".keep") && f !== "_order.json" && f !== "_captions.json"
    );
    // Apply _order.json if present
    let ordered: string[] = [];
    try {
      const raw = readFileSync(join(dirPath, "_order.json"), "utf8");
      const saved: unknown = JSON.parse(raw);
      if (Array.isArray(saved)) {
        ordered = (saved as string[]).filter((f) => allFiles.includes(f));
        allFiles.forEach((f) => { if (!ordered.includes(f)) ordered.push(f); });
      }
    } catch {
      ordered = [...allFiles].sort();
    }
    return Response.json({ files: ordered });
  } catch {
    return Response.json({ files: [] });
  }
}

export async function DELETE(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get("folder");
  const filename = request.nextUrl.searchParams.get("filename");

  if (!isAllowed(folder)) {
    return Response.json({ error: "Invalid folder" }, { status: 400 });
  }
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return Response.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = join(process.cwd(), "public", folder, filename);
  try {
    unlinkSync(filePath);
    // Remove from _order.json if exists
    try {
      const orderPath = join(process.cwd(), "public", folder, "_order.json");
      const raw = readFileSync(orderPath, "utf8");
      const order: unknown = JSON.parse(raw);
      if (Array.isArray(order)) {
        writeFileSync(orderPath, JSON.stringify((order as string[]).filter((f) => f !== filename)));
      }
    } catch { /* order file missing or malformed, ignore */ }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}
