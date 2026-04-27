import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { type NextRequest } from "next/server";

const FILE = join(process.cwd(), "data", "compatibility.json");

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rules: Array<{ id: string }> = JSON.parse(readFileSync(FILE, "utf-8"));
    const filtered = rules.filter((r) => r.id !== id);
    writeFileSync(FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Error" }, { status: 500 });
  }
}
