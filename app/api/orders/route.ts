import { NextResponse } from "next/server";
import { adjustStock, pinOk, readOrders, saveOrder, updateOrder } from "@/lib/desk";

export const dynamic = "force-dynamic";

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(req: Request) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  return noStore({ ok: true, orders: readOrders() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return noStore({ ok: false, error: "Send the order as JSON." }, 400);
  try {
    const order = await saveOrder(body);
    const items = Array.isArray(body.items) ? body.items : [];
    await adjustStock(items.map((item: { productId?: string; qty?: number }) => ({ productId: String(item.productId || ""), qty: Number(item.qty || 0) })));
    return noStore({ ok: true, order }, 201);
  } catch (err) {
    return noStore({ ok: false, error: err instanceof Error ? err.message : "Could not save that order." }, 400);
  }
}

export async function PATCH(req: Request) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  const body = await req.json().catch(() => ({}));
  try {
    const order = await updateOrder(String(body.id || ""), { status: body.status });
    return noStore({ ok: true, order });
  } catch (err) {
    return noStore({ ok: false, error: err instanceof Error ? err.message : "Could not update that order." }, 400);
  }
}
