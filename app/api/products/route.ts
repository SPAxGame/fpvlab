import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { type NextRequest } from "next/server";
import type { Product } from "../../lib/products";

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

export async function GET() {
  return Response.json(readProducts());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const products = readProducts();

  const newProduct: Product = {
    id: `p-${Date.now()}`,
    inStock: true,
    ...body,
  };

  products.push(newProduct);
  writeProducts(products);

  return Response.json(newProduct, { status: 201 });
}
