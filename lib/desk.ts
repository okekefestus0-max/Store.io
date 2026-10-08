import fs from "fs";
import path from "path";
import { products as seedProducts } from "./products";
import { sellers } from "./sellers";
import type { Category, Gender, Occasion, Product, SitePlugin, Style, PluginKind, PluginSlotName } from "./types";

const dataDir = path.join(process.cwd(), "data");
const catalogFile = path.join(dataDir, "catalog.json");
const pluginFile = path.join(dataDir, "plugins.json");
const orderFile = path.join(dataDir, "orders.json");
const deskFile = path.join(dataDir, "desk.json");

export const PLUGIN_SLOTS: PluginSlotName[] = [
  "announcement",
  "home-after-hero",
  "home-before-footer",
  "product-aside",
  "cart-note",
  "checkout-aside",
  "footer",
];

export const PLUGIN_KINDS: PluginKind[] = ["html", "script", "link", "webhook"];

export const PLUGIN_EVENTS = [
  "product_view",
  "search",
  "filter_usage",
  "add_to_cart",
  "wishlist",
  "checkout_started",
  "payment_completed",
  "payment_pending",
  "product_purchase",
  "coupon_use",
  "seller_conversion",
  "referral_conversion",
  "newsletter_signup",
];

const GENDERS = new Set<Gender>(["women", "men", "kids"]);
const CATEGORIES = new Set<Category>([
  "Dresses", "Tops", "T-shirts", "Shirts", "Jeans", "Trousers", "Two-Piece Sets", "Native Wear", "Shoes", "Bags", "Accessories",
]);

export interface CatalogFile {
  patches: Record<string, Record<string, unknown>>;
  added: Product[];
  removed: string[];
}

let queue: Promise<unknown> = Promise.resolve();

function withDesk<T>(fn: () => T): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

function ensure() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown) {
  ensure();
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

export function readPin() {
  const saved = readJson<{ pin?: string }>(deskFile, {});
  return typeof saved.pin === "string" && saved.pin.length >= 4 ? saved.pin : "stylesort";
}

export function pinOk(req: Request) {
  const header = req.headers.get("x-stylesort-pin") || "";
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const pin = readPin();
  return header === pin || bearer === pin;
}

export function setPin(next: string) {
  const pin = next.trim();
  if (pin.length < 4 || pin.length > 40) throw new Error("PIN needs 4 to 40 characters.");
  writeJson(deskFile, { pin });
  return { ok: true };
}

function emptyCatalog(): CatalogFile {
  return { patches: {}, added: [], removed: [] };
}

export function readCatalog(): CatalogFile {
  const raw = readJson<Partial<CatalogFile>>(catalogFile, emptyCatalog());
  return {
    patches: raw.patches && typeof raw.patches === "object" ? raw.patches : {},
    added: Array.isArray(raw.added) ? raw.added : [],
    removed: Array.isArray(raw.removed) ? raw.removed : [],
  };
}

function writeCatalog(data: CatalogFile) {
  writeJson(catalogFile, data);
}

function slugify(name: string) {
  return name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fileShot(id: string) {
  const dir = path.join(process.cwd(), "public", "images", "products");
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (fs.existsSync(path.join(dir, `${id}.${ext}`))) {
      return `/images/products/${id}.${ext === "jpeg" ? "jpg" : ext}`;
    }
  }
  return undefined;
}

function applyPatch(product: Product, patch?: Record<string, unknown>): Product {
  const next: Product = { ...product, colors: [...product.colors], images: [...product.images], sizes: [...product.sizes], occasions: [...product.occasions], styles: [...product.styles], tags: [...product.tags], details: [...product.details] };
  if (!patch) return attachShot(next);
  if (typeof patch.name === "string" && patch.name.trim()) next.name = patch.name.trim().slice(0, 80);
  if (patch.price != null && Number.isFinite(Number(patch.price))) next.price = clamp(Number(patch.price), 0, 5_000_000);
  if (patch.compareAt === null) delete next.compareAt;
  else if (patch.compareAt != null && Number.isFinite(Number(patch.compareAt))) {
    const compare = clamp(Number(patch.compareAt), 0, 5_000_000);
    if (compare > next.price) next.compareAt = compare;
    else delete next.compareAt;
  }
  if (patch.inventory != null && Number.isFinite(Number(patch.inventory))) next.inventory = clamp(Math.round(Number(patch.inventory)), 0, 9999);
  if (typeof patch.description === "string") next.description = patch.description.trim().slice(0, 800);
  if (typeof patch.material === "string") next.material = patch.material.trim().slice(0, 120);
  if (typeof patch.care === "string") next.care = patch.care.trim().slice(0, 240);
  if (typeof patch.note === "string") next.note = patch.note.trim().slice(0, 240) || undefined;
  if (typeof patch.gender === "string" && GENDERS.has(patch.gender as Gender)) next.gender = patch.gender as Gender;
  if (typeof patch.category === "string" && CATEGORIES.has(patch.category as Category)) next.category = patch.category as Category;
  if (typeof patch.sellerId === "string" && sellers.some((s) => s.id === patch.sellerId)) next.sellerId = patch.sellerId;
  if (Array.isArray(patch.colors)) next.colors = cleanColors(patch.colors);
  if (Array.isArray(patch.sizes)) next.sizes = patch.sizes.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 16);
  if (Array.isArray(patch.occasions)) next.occasions = patch.occasions.map(String).slice(0, 12) as Occasion[];
  if (Array.isArray(patch.styles)) next.styles = patch.styles.map(String).slice(0, 8) as Style[];
  if (Array.isArray(patch.tags)) next.tags = patch.tags.map(String).map((t) => t.trim()).filter(Boolean).slice(0, 16);
  if (Array.isArray(patch.images)) next.images = patch.images.map(String).filter((u) => safeUrl(u)).slice(0, 8);
  if (typeof patch.shot === "string" && safeUrl(patch.shot)) next.shot = patch.shot;
  if (typeof patch.video === "string") next.video = safeUrl(patch.video) ? patch.video : undefined;
  for (const flag of ["featured", "trending", "bestSeller", "newArrival", "deal", "hidden", "returnable", "plusSize"] as const) {
    if (typeof patch[flag] === "boolean") next[flag] = patch[flag];
  }
  if (next.sizes.some((s) => s === "XXL" || s === "XXXL" || s === "Plus Size")) next.plusSize = true;
  if (next.compareAt && next.compareAt > next.price) next.deal = true;
  return attachShot(next);
}

function attachShot(product: Product): Product {
  if (!product.shot) {
    const found = fileShot(product.id);
    if (found) product.shot = found;
  }
  if (product.shot) {
    const bare = product.shot.split("?")[0];
    product.images = [product.shot, ...product.images.filter((img) => img.split("?")[0] !== bare && img !== product.shot)];
  }
  return product;
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function cleanColors(value: unknown[]) {
  return value
    .map((c) => {
      const row = c as { name?: string; hex?: string };
      const name = String(row?.name || "").trim().slice(0, 24);
      const hex = String(row?.hex || "").trim();
      if (!name) return null;
      return { name, hex: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : "#8d2e3c" };
    })
    .filter(Boolean)
    .slice(0, 6) as Product["colors"];
}

function safeUrl(url: string) {
  if (url.startsWith("/images/") || url.startsWith("/uploads/")) return true;
  return /^https:\/\/[^\s]+$/i.test(url);
}

export function publicCatalog() {
  return merge(false);
}

export function managedCatalog() {
  const data = readCatalog();
  return { products: merge(true), removed: data.removed };
}

function merge(includeHidden: boolean) {
  const data = readCatalog();
  const removed = new Set(data.removed);
  const list: Product[] = [];
  const seen = new Set<string>();
  for (const product of [...seedProducts, ...data.added]) {
    if (seen.has(product.id) || removed.has(product.id)) continue;
    seen.add(product.id);
    const next = applyPatch(product, data.patches[product.id]);
    if (!includeHidden && next.hidden) continue;
    list.push(next);
  }
  return list;
}

export function productById(id: string, includeHidden = true) {
  return merge(includeHidden).find((p) => p.id === id);
}

function nextId(data: CatalogFile) {
  const ids = [...seedProducts, ...data.added].map((p) => Number(p.id.replace(/\D/g, ""))).filter((n) => n > 0 && n < 100000);
  return `ss${String(Math.max(114, ...ids) + 1).padStart(3, "0")}`;
}

export function createProduct(input: Record<string, unknown>) {
  return withDesk(() => {
    const data = readCatalog();
    const name = String(input.name || "").trim();
    if (name.length < 2) throw new Error("Give the piece a name.");
    const price = clamp(Number(input.price), 0, 5_000_000);
    if (!price) throw new Error("Add a price in naira.");
    const gender = GENDERS.has(input.gender as Gender) ? (input.gender as Gender) : "women";
    const category = CATEGORIES.has(input.category as Category) ? (input.category as Category) : "Dresses";
    const sellerId = sellers.some((s) => s.id === input.sellerId) ? String(input.sellerId) : sellers[0].id;
    const id = nextId(data);
    const taken = new Set(merge(true).map((p) => p.slug));
    let slug = slugify(name) || id;
    let n = 2;
    while (taken.has(slug)) slug = `${slugify(name)}-${n++}`;
    const colors = Array.isArray(input.colors) && input.colors.length ? cleanColors(input.colors) : [{ name: "Black", hex: "#161616" }];
    const sizes = Array.isArray(input.sizes) && input.sizes.length ? input.sizes.map(String) : defaultSizes(gender, category);
    const product: Product = {
      id,
      slug,
      name: name.slice(0, 80),
      sellerId,
      gender,
      category,
      price,
      images: [],
      colors,
      sizes,
      occasions: Array.isArray(input.occasions) ? (input.occasions as Occasion[]) : ["Casual"],
      styles: Array.isArray(input.styles) ? (input.styles as Style[]) : ["Classic"],
      material: String(input.material || "See the label").slice(0, 120),
      care: String(input.care || "Follow the care label. Message us on WhatsApp if you are unsure.").slice(0, 240),
      description: String(input.description || `${name}. Added from the STYLESORT desk.`).slice(0, 800),
      details: [String(input.material || "Listed from the desk.")],
      rating: 4.6,
      reviewCount: 0,
      inventory: clamp(Math.round(Number(input.inventory ?? 5)), 0, 9999),
      sales: 0,
      popularity: 40,
      createdAt: new Date().toISOString().slice(0, 10),
      featured: false,
      newArrival: true,
      deal: false,
      plusSize: sizes.some((s) => ["XXL", "XXXL", "Plus Size"].includes(s)),
      tags: ["desk"],
      returnable: true,
    };
    data.added.unshift(product);
    writeCatalog(data);
    return applyPatch(product);
  });
}

function defaultSizes(gender: Gender, category: Category) {
  if (category === "Shoes") return gender === "men" ? ["41", "42", "43", "44", "45"] : gender === "kids" ? ["28", "30", "32", "34"] : ["37", "38", "39", "40", "41"];
  if (category === "Bags" || category === "Accessories") return ["One Size"];
  if (gender === "kids") return ["4–5Y", "6–7Y", "8–9Y", "10–11Y"];
  if (gender === "men") return ["S", "M", "L", "XL", "XXL"];
  return ["XS", "S", "M", "L", "XL", "XXL"];
}

export function updateProduct(id: string, patch: Record<string, unknown>) {
  return withDesk(() => {
    const data = readCatalog();
    const current = [...seedProducts, ...data.added].find((p) => p.id === id);
    if (!current || data.removed.includes(id)) throw new Error("That piece is not on the desk.");
    data.patches[id] = { ...(data.patches[id] || {}), ...patch };
    writeCatalog(data);
    return applyPatch(current, data.patches[id]);
  });
}

export function removeProduct(id: string) {
  return withDesk(() => {
    const data = readCatalog();
    if (![...seedProducts, ...data.added].some((p) => p.id === id)) throw new Error("That piece is not on the desk.");
    if (!data.removed.includes(id)) data.removed.push(id);
    writeCatalog(data);
    return { ok: true };
  });
}

export function restoreProduct(id: string) {
  return withDesk(() => {
    const data = readCatalog();
    data.removed = data.removed.filter((x) => x !== id);
    if (data.patches[id]) data.patches[id].hidden = false;
    writeCatalog(data);
    return productById(id);
  });
}

export function adjustStock(lines: { productId: string; qty: number }[]) {
  return withDesk(() => {
    const data = readCatalog();
    for (const line of lines) {
      const qty = Math.round(Number(line.qty));
      if (!line.productId || !Number.isFinite(qty) || qty <= 0 || qty > 20) continue;
      const current = [...seedProducts, ...data.added].find((p) => p.id === line.productId);
      if (!current || data.removed.includes(line.productId)) continue;
      const live = applyPatch(current, data.patches[line.productId]);
      data.patches[line.productId] = { ...(data.patches[line.productId] || {}), inventory: Math.max(0, live.inventory - qty) };
    }
    writeCatalog(data);
  });
}

export function saveProductImage(id: string, bytes: Buffer) {
  return withDesk(() => {
    const data = readCatalog();
    const current = [...seedProducts, ...data.added].find((p) => p.id === id);
    if (!current) throw new Error("That piece is not on the desk.");
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error("Send a JPEG photo. The desk converts phone photos before upload.");
    const safe = id.replace(/[^a-z0-9_-]/gi, "");
    const dir = path.join(process.cwd(), "public", "images", "products");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${safe}.jpg`), bytes);
    const shot = `/images/products/${safe}.jpg?v=${Date.now()}`;
    data.patches[id] = { ...(data.patches[id] || {}), shot, images: [shot] };
    writeCatalog(data);
    return { url: shot, product: applyPatch(current, data.patches[id]) };
  });
}

export function listMedia() {
  const root = path.join(process.cwd(), "public", "images");
  const out: { url: string; name: string }[] = [];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (/\.(jpe?g|png|webp)$/i.test(ent.name)) {
        const url = full.slice(path.join(process.cwd(), "public").length).replace(/\\/g, "/");
        out.push({ url, name: ent.name });
      }
    }
  };
  walk(root);
  return out;
}

function cleanHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(\"[^\"]*\"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .slice(0, 8000);
}

function cleanPlugin(input: Partial<SitePlugin>, prev?: SitePlugin): SitePlugin {
  const name = String(input.name || prev?.name || "").trim().slice(0, 60);
  if (name.length < 2) throw new Error("Give the plugin a name.");
  const kind = PLUGIN_KINDS.includes(input.kind as PluginKind) ? (input.kind as PluginKind) : prev?.kind || "html";
  const slots = (Array.isArray(input.slots) ? input.slots : prev?.slots || []).filter((s): s is PluginSlotName => PLUGIN_SLOTS.includes(s as PluginSlotName));
  const events = (Array.isArray(input.events) ? input.events : prev?.events || []).map(String).filter((e) => PLUGIN_EVENTS.includes(e));
  const scriptSrc = String(input.scriptSrc ?? prev?.scriptSrc ?? "").trim();
  if (scriptSrc && !/^https:\/\/[^\s]+$/i.test(scriptSrc) && !scriptSrc.startsWith("/")) throw new Error("Script plugins need an https URL or a path on this site.");
  const webhookUrl = String(input.webhookUrl ?? prev?.webhookUrl ?? "").trim();
  if (webhookUrl && !/^https:\/\/[^\s]+$/i.test(webhookUrl)) throw new Error("Webhook URL must start with https.");
  const href = String(input.href ?? prev?.href ?? "").trim();
  if (href && !safeUrl(href) && !href.startsWith("/")) throw new Error("Link must be a site path or https URL.");
  const now = new Date().toISOString();
  const slug = slugify(name) || prev?.slug || "plugin";
  return {
    id: prev?.id || `plg-${slug}-${Date.now().toString(36)}`,
    name,
    slug: prev?.slug || slug,
    enabled: typeof input.enabled === "boolean" ? input.enabled : prev?.enabled ?? false,
    version: String(input.version || prev?.version || "1.0.0").slice(0, 16),
    description: String(input.description ?? prev?.description ?? "").slice(0, 240),
    author: String(input.author ?? prev?.author ?? "").slice(0, 60) || undefined,
    slots,
    kind,
    html: cleanHtml(String(input.html ?? prev?.html ?? "")),
    scriptSrc: scriptSrc || undefined,
    href: href || undefined,
    label: String(input.label ?? prev?.label ?? "").slice(0, 40) || undefined,
    webhookUrl: webhookUrl || undefined,
    events,
    config: { ...(prev?.config || {}), ...(input.config || {}) },
    createdAt: prev?.createdAt || now,
    updatedAt: now,
  };
}

export function readPlugins() {
  const list = readJson<SitePlugin[]>(pluginFile, []);
  return Array.isArray(list) ? list : [];
}

function writePlugins(list: SitePlugin[]) {
  writeJson(pluginFile, list);
}

export function publicPlugins() {
  return readPlugins()
    .filter((p) => p.enabled)
    .map(({ webhookUrl: _webhook, config: _config, ...safe }) => safe);
}

export function installPlugin(input: Partial<SitePlugin>) {
  return withDesk(() => {
    const list = readPlugins();
    const plugin = cleanPlugin(input);
    list.unshift(plugin);
    writePlugins(list);
    return plugin;
  });
}

export function updatePlugin(id: string, input: Partial<SitePlugin>) {
  return withDesk(() => {
    const list = readPlugins();
    const index = list.findIndex((p) => p.id === id);
    if (index < 0) throw new Error("That plugin is not installed.");
    list[index] = cleanPlugin({ ...list[index], ...input }, list[index]);
    writePlugins(list);
    return list[index];
  });
}

export function removePlugin(id: string) {
  return withDesk(() => {
    const list = readPlugins().filter((p) => p.id !== id);
    writePlugins(list);
    return { ok: true };
  });
}

export async function fanout(event: { name: string; props?: Record<string, unknown>; at?: string }) {
  const hooks = readPlugins().filter((p) => p.enabled && p.webhookUrl && p.events.includes(event.name));
  await Promise.all(hooks.map((p) => fetch(p.webhookUrl as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pluginId: p.id, plugin: p.slug, event, config: p.config }),
    signal: AbortSignal.timeout(1500),
  }).catch(() => undefined)));
}

export function readOrders() {
  const list = readJson<Record<string, unknown>[]>(orderFile, []);
  return Array.isArray(list) ? list : [];
}

export function saveOrder(order: Record<string, unknown>) {
  return withDesk(() => {
    const items = Array.isArray(order.items) ? order.items : [];
    if (!items.length) throw new Error("Order has no items.");
    const clean = {
      ...order,
      card: undefined,
      payment: order.payment && typeof order.payment === "object"
        ? { method: (order.payment as { method?: string }).method, status: (order.payment as { status?: string }).status, last4: (order.payment as { last4?: string }).last4 }
        : undefined,
    };
    const all = readOrders();
    all.unshift(clean);
    writeJson(orderFile, all.slice(0, 500));
    return clean;
  });
}

export function updateOrder(id: string, patch: { status?: string }) {
  return withDesk(() => {
    const all = readOrders();
    const index = all.findIndex((o) => o.id === id || o.number === id);
    if (index < 0) throw new Error("Order not found.");
    const payment = (all[index].payment || {}) as Record<string, unknown>;
    if (patch.status === "paid" || patch.status === "pending" || patch.status === "failed") payment.status = patch.status;
    all[index] = { ...all[index], payment };
    writeJson(orderFile, all);
    return all[index];
  });
}

export const pluginManifest = {
  name: "STYLESORT plugins",
  install: "POST /api/plugins",
  update: "PATCH /api/plugins/:id",
  remove: "DELETE /api/plugins/:id",
  list: "GET /api/plugins",
  auth: "Send the staff PIN in the x-stylesort-pin header, or Authorization: Bearer <pin>.",
  slots: PLUGIN_SLOTS,
  kinds: {
    html: "Rendered in the chosen slots. Scripts are stripped.",
    script: "Loads scriptSrc once on every page. https or a path on this site.",
    link: "A labelled link in the chosen slots.",
    webhook: "No visual. Receives shop events at webhookUrl.",
  },
  events: PLUGIN_EVENTS,
  example: {
    name: "Friday drop note",
    kind: "html",
    enabled: true,
    slots: ["home-after-hero"],
    html: "<p>New drop Friday, 6pm. Enugu pickup is free.</p>",
    events: ["add_to_cart"],
    webhookUrl: "https://example.com/stylesort-hook",
  },
};
