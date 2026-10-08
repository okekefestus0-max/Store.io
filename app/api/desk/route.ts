import { NextResponse } from "next/server";
import { pinOk, readPin, setPin } from "@/lib/desk";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin || "");
  if (pin !== readPin()) return NextResponse.json({ ok: false, error: "That PIN is not right." }, { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!pinOk(req)) return NextResponse.json({ ok: false, error: "Staff PIN required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    await setPin(String(body.pin || ""));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Could not change the PIN." }, { status: 400 });
  }
}
