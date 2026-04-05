import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { type NextRequest } from "next/server";

const ALLOWED_FOLDERS = ["panel_1_home", "slider", "videos"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

function isAllowed(folder: string | null): folder is AllowedFolder {
  return ALLOWED_FOLDERS.includes(folder as AllowedFolder);
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];

const IMAGE_MAX = 10 * 1024 * 1024;   // 10 MB
const VIDEO_MAX = 200 * 1024 * 1024;  // 200 MB

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as string | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (!isAllowed(folder)) {
    return Response.json({ error: "Invalid folder" }, { status: 400 });
  }

  const isVideo = folder === "videos";
  const allowed = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  const maxSize = isVideo ? VIDEO_MAX : IMAGE_MAX;

  if (!allowed.includes(file.type)) {
    return Response.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > maxSize) {
    return Response.json({ error: `File too large (max ${maxSize / 1024 / 1024} MB)` }, { status: 400 });
  }

  const origExt = file.name.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "jpg");
  const safeName = `${formatDate(new Date())}_${Math.random().toString(36).slice(2, 6)}.${origExt}`;

  const dirPath = join(process.cwd(), "public", folder);
  mkdirSync(dirPath, { recursive: true });
  const filePath = join(dirPath, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(filePath, buffer);

  return Response.json({ filename: safeName });
}
