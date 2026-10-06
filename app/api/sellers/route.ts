import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "applications.json");

function read() {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.brand) return NextResponse.json({ ok: false }, { status: 400 });
  const all = read();
  all.unshift(body);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(all.slice(0, 500)));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ applications: read() });
}
