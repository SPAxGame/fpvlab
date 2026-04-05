import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { type NextRequest } from "next/server";
import type { Product } from "../../../lib/products";

const DATA_FILE = join(process.cwd(), "data", "products.json");

function readProducts(): Product[] {
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeProducts(products: Product[]) {
  writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const products = readProducts();
  const idx = products.findIndex((p) => p.id === id);

  if (idx === -1) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  products[idx] = { ...products[idx], ...body, id };
  writeProducts(products);

  return Response.json(products[idx]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const products = readProducts();
  const filtered = products.filter((p) => p.id !== id);

  if (filtered.length === products.length) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  writeProducts(filtered);
  return new Response(null, { status: 204 });
}
