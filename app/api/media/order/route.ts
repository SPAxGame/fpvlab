import { writeFileSync } from "fs";
import { join } from "path";
import { type NextRequest } from "next/server";

const ALLOWED_FOLDERS = ["panel_1_home", "slider", "videos", "panel_drony_fpv"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

function isAllowed(folder: string | null): folder is AllowedFolder {
  return ALLOWED_FOLDERS.includes(folder as AllowedFolder);
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { folder?: string; order?: unknown };
  const { folder, order } = body;

  if (!isAllowed(folder ?? null)) {
    return Response.json({ error: "Invalid folder" }, { status: 400 });
  }
  if (!Array.isArray(order)) {
    return Response.json({ error: "order must be an array" }, { status: 400 });
  }
  // Validate filenames before writing
  const sanitized = (order as unknown[])
    .filter((f): f is string => typeof f === "string")
    .filter((f) => !f.includes("..") && !f.includes("/") && !f.includes("\\"));

  const filePath = join(process.cwd(), "public", folder!, "_order.json");
  writeFileSync(filePath, JSON.stringify(sanitized));
  return Response.json({ ok: true });
}
