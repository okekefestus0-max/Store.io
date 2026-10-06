import { NextResponse } from "next/server";
import { pinOk, removePlugin, updatePlugin } from "@/lib/desk";

export const dynamic = "force-dynamic";

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  const body = await req.json().catch(() => ({}));
  try {
    const plugin = await updatePlugin(params.id, body);
    return noStore({ ok: true, plugin });
  } catch (err) {
    return noStore({ ok: false, error: err instanceof Error ? err.message : "Could not update that plugin." }, 400);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  await removePlugin(params.id);
  return noStore({ ok: true });
}
