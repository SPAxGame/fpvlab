import { writeFileSync } from "fs";
import { join } from "path";
import { type NextRequest } from "next/server";
import { CATEGORY_LABELS } from "../../lib/products";
import type { Category } from "../../lib/products";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ąà]/g, "a")
    .replace(/[ćç]/g, "c")
    .replace(/ę/g, "e")
    .replace(/[łl]/g, "l")
    .replace(/[ńn]/g, "n")
    .replace(/[óò]/g, "o")
    .replace(/[śs]/g, "s")
    .replace(/[źżz]/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(d: Date): { date: string; time: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return { date, time };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: "Invalid file type" }, { status: 400 });
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const now = new Date();
  const { date, time } = formatDate(now);

  const rawCategory = formData.get("category") as Category | null;
  const rawName = formData.get("name") as string | null;

  let safeName: string;
  if (rawCategory && rawName?.trim()) {
    const categoryLabel = CATEGORY_LABELS[rawCategory] ?? rawCategory;
    const categorySlug = slugify(categoryLabel);
    const nameSlug = slugify(rawName.trim());
    safeName = `${categorySlug}-${nameSlug}-${date}-${time}.${ext}`;
  } else {
    safeName = `${date}-${time}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  }

  const filePath = join(process.cwd(), "public", "products", safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(filePath, buffer);

  return Response.json({ filename: safeName });
}
