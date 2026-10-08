import { NextResponse } from "next/server";
import { installPlugin, pinOk, pluginManifest, publicPlugins, readPlugins } from "@/lib/desk";

export const dynamic = "force-dynamic";

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("manage") === "1") {
    if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
    return noStore({ ok: true, plugins: readPlugins(), manifest: pluginManifest });
  }
  return noStore({ ok: true, plugins: publicPlugins() });
}

export async function POST(req: Request) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return noStore({ ok: false, error: "Send a plugin manifest as JSON." }, 400);
  try {
    const plugin = await installPlugin(body);
    return noStore({ ok: true, plugin }, 201);
  } catch (err) {
    return noStore({ ok: false, error: err instanceof Error ? err.message : "Could not install that plugin." }, 400);
  }
}
