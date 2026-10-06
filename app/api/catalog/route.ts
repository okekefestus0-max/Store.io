import { NextResponse } from "next/server";
import { createProduct, managedCatalog, pinOk, publicCatalog, removeProduct, restoreProduct, updateProduct } from "@/lib/desk";

export const dynamic = "force-dynamic";

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(req: Request) {
  const manage = new URL(req.url).searchParams.get("manage") === "1";
  if (manage) {
    if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
    return noStore({ ok: true, ...managedCatalog() });
  }
  return noStore({ ok: true, products: publicCatalog() });
}

export async function POST(req: Request) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  const body = await req.json().catch(() => ({}));
  try {
    if (body.restore) {
      const product = await restoreProduct(String(body.id || ""));
      return noStore({ ok: true, product });
    }
    const product = await createProduct(body);
    return noStore({ ok: true, product }, 201);
  } catch (err) {
    return noStore({ ok: false, error: err instanceof Error ? err.message : "Could not save that piece." }, 400);
  }
}

export async function PATCH(req: Request) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  const body = await req.json().catch(() => ({}));
  try {
    const product = await updateProduct(String(body.id || ""), body.patch || {});
    return noStore({ ok: true, product });
  } catch (err) {
    return noStore({ ok: false, error: err instanceof Error ? err.message : "Could not update that piece." }, 400);
  }
}

export async function DELETE(req: Request) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  const id = new URL(req.url).searchParams.get("id") || "";
  try {
    await removeProduct(id);
    return noStore({ ok: true });
  } catch (err) {
    return noStore({ ok: false, error: err instanceof Error ? err.message : "Could not remove that piece." }, 400);
  }
}
