import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fanout } from "@/lib/desk";

const file = path.join(process.cwd(), "data", "events.json");

function read() {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const events = read();
  const event = { ...body, receivedAt: new Date().toISOString() };
  events.push(event);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(events.slice(-2000)));
  if (event.name) fanout(event).catch(() => undefined);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ events: read().slice(-400) });
}
