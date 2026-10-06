import { NextResponse } from "next/server";
import { pinOk, saveProductImage, updateProduct } from "@/lib/desk";

export const dynamic = "force-dynamic";

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: Request) {
  if (!pinOk(req)) return noStore({ ok: false, error: "Staff PIN required." }, 401);
  const type = req.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) {
      const body = await req.json();
      const url = String(body.url || "");
      if (!url.startsWith("/images/") && !url.startsWith("https://")) {
        return noStore({ ok: false, error: "Use a photo already on the site, or an https link." }, 400);
      }
      const product = await updateProduct(String(body.id || ""), { shot: url, images: [url] });
      return noStore({ ok: true, url, product });
    }
    const form = await req.formData();
    const file = form.get("file");
    const id = String(form.get("productId") || "");
    if (!(file instanceof File) || !id) return noStore({ ok: false, error: "Choose a photo and a piece." }, 400);
    if (file.size > 4_000_000) return noStore({ ok: false, error: "That photo is over 4MB. Try a smaller one." }, 400);
    if (!/image\/(jpeg|jpg|png|webp)/i.test(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      return noStore({ ok: false, error: "Use a JPG, PNG or WebP photo." }, 400);
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const saved = await saveProductImage(id, bytes);
    return noStore({ ok: true, ...saved });
  } catch (err) {
    return noStore({ ok: false, error: err instanceof Error ? err.message : "Could not save that photo." }, 400);
  }
}
