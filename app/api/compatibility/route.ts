import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const FILE = join(process.cwd(), "data", "compatibility.json");

export interface CompatRule {
  id: string;
  productA: string;
  productB: string;
  reason: string;
}

export function readRules(): CompatRule[] {
  try {
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function GET() {
  return Response.json(readRules());
}

export async function POST(req: Request) {
  const body = await req.json() as { productA: string; productB: string; reason: string };
  const { productA, productB, reason } = body;
  if (!productA || !productB || !reason?.trim()) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  const rules = readRules();
  const newRule: CompatRule = {
    id: `c-${Date.now()}`,
    productA,
    productB,
    reason: reason.trim(),
  };
  rules.push(newRule);
  writeFileSync(FILE, JSON.stringify(rules, null, 2), "utf-8");
  return Response.json(newRule, { status: 201 });
}
