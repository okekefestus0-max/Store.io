import { NextResponse } from "next/server";
import { listMedia } from "@/lib/desk";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ files: listMedia() }, { headers: { "Cache-Control": "no-store" } });
}
