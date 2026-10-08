import { NextResponse } from "next/server";
import { pluginManifest } from "@/lib/desk";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(pluginManifest, { headers: { "Cache-Control": "no-store" } });
}
