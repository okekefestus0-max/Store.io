"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, OCCASIONS, STYLES } from "@/lib/brand";
import { sellers } from "@/lib/sellers";
import type { Category, Gender, Product, SitePlugin } from "@/lib/types";
import { naira } from "@/lib/brand";

const PIN_KEY = "stylesort.desk";
const SLOTS = ["announcement", "home-after-hero", "home-before-footer", "product-aside", "cart-note", "checkout-aside", "footer"] as const;
const EVENTS = ["product_view", "search", "add_to_cart", "wishlist", "checkout_started", "payment_completed", "product_purchase", "coupon_use"];

type Tab = "clothes" | "add" | "plugins" | "orders" | "more";

interface Draft {
  name: string;
  price: string;
  compareAt: string;
  inventory: string;
  gender: Gender;
  category: Category;
  sellerId: string;
  description: string;
  material: string;
  care: string;
  sizes: string;
  colorName: string;
  colorHex: string;
  extraColors: string;
  occasions: string[];
  styles: string[];
  tags: string;
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  deal: boolean;
  hidden: boolean;
  note: string;
}

function headers(pin: string, json = true): HeadersInit {
  return json ? { "Content-Type": "application/json", "x-stylesort-pin": pin } : { "x-stylesort-pin": pin };
}

function draftFrom(p: Product): Draft {
  return {
    name: p.name,
    price: String(p.price),
    compareAt: p.compareAt ? String(p.compareAt) : "",
    inventory: String(p.inventory),
    gender: p.gender,
    category: p.category,
    sellerId: p.sellerId,
    description: p.description,
    material: p.material,
    care: p.care,
    sizes: p.sizes.join(", "),
    colorName: p.colors[0]?.name || "Black",
    colorHex: p.colors[0]?.hex || "#161616",
    extraColors: p.colors.slice(1).map((c) => `${c.name}:${c.hex}`).join(", "),
    occasions: p.occasions,
    styles: p.styles,
    tags: p.tags.join(", "),
    featured: !!p.featured,
    trending: !!p.trending,
    bestSeller: !!p.bestSeller,
    newArrival: !!p.newArrival,
    deal: !!p.deal,
    hidden: !!p.hidden,
    note: p.note || "",
  };
}

function colorsFrom(draft: Draft) {
  const extra = draft.extraColors.split(",").map((part) => {
    const [name, hex] = part.split(":").map((s) => s.trim());
    return name ? { name, hex: hex || "#8d2e3c" } : null;
  }).filter(Boolean);
  return [{ name: draft.colorName || "Black", hex: draft.colorHex || "#161616" }, ...extra];
}

function patchFrom(draft: Draft) {
  return {
    name: draft.name.trim(),
    price: Number(draft.price),
    compareAt: draft.compareAt.trim() ? Number(draft.compareAt) : null,
    inventory: Number(draft.inventory),
    gender: draft.gender,
    category: draft.category,
    sellerId: draft.sellerId,
    description: draft.description,
    material: draft.material,
    care: draft.care,
    sizes: draft.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    colors: colorsFrom(draft),
    occasions: draft.occasions,
    styles: draft.styles,
    tags: draft.tags.split(",").map((s) => s.trim()).filter(Boolean),
    featured: draft.featured,
    trending: draft.trending,
    bestSeller: draft.bestSeller,
    newArrival: draft.newArrival,
    deal: draft.deal,
    hidden: draft.hidden,
    note: draft.note,
  };
}

async function fileToJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  if (!blob) throw new Error("Could not read that photo.");
  return blob;
}

export default function Desk() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("clothes");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [media, setMedia] = useState<{ url: string; name: string }[]>([]);
  const [plugins, setPlugins] = useState<SitePlugin[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [apps, setApps] = useState<Record<string, unknown>[]>([]);
  const [events, setEvents] = useState<Record<string, unknown>[]>([]);
  const [q, setQ] = useState("");
  const [needsPhoto, setNeedsPhoto] = useState(false);
  const [selected, setSelected] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [pluginDraft, setPluginDraft] = useState({
    name: "", description: "", kind: "html", html: "", scriptSrc: "", href: "", label: "", webhookUrl: "", slots: ["home-after-hero"] as string[], events: [] as string[], enabled: true,
  });
  const [newPiece, setNewPiece] = useState({ name: "", price: "", gender: "women" as Gender, category: "Dresses" as Category, sellerId: "adaora", colorName: "Black", colorHex: "#161616", inventory: "5" });
  const [nextPin, setNextPin] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_KEY);
    if (saved) {
      setPin(saved);
      enter(saved);
    }
  }, []);

  const piece = products.find((p) => p.id === selected);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (needsPhoto && p.shot) return false;
      if (!query) return true;
      return p.name.toLowerCase().includes(query) || p.id.includes(query) || p.category.toLowerCase().includes(query);
    });
  }, [products, q, needsPhoto]);

  async function enter(value = pin) {
    setError("");
    const res = await fetch("/api/desk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: value }) });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "That PIN is not right.");
      setAuthed(false);
      return;
    }
    sessionStorage.setItem(PIN_KEY, value);
    setPin(value);
    setAuthed(true);
    await reload(value);
  }

  async function reload(value = pin) {
    const [catalog, photos, plugs, orderRes, appRes, eventRes] = await Promise.all([
      fetch("/api/catalog?manage=1", { headers: headers(value, false), cache: "no-store" }).then((r) => r.json()),
      fetch("/api/media", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/plugins?manage=1", { headers: headers(value, false), cache: "no-store" }).then((r) => r.json()),
      fetch("/api/orders", { headers: headers(value, false), cache: "no-store" }).then((r) => r.json()),
      fetch("/api/sellers", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ applications: [] })),
      fetch("/api/events", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ events: [] })),
    ]);
    setProducts(catalog.products || []);
    setRemoved(catalog.removed || []);
    setMedia(photos.files || []);
    setPlugins(plugs.plugins || []);
    setOrders(orderRes.orders || []);
    setApps(appRes.applications || []);
    setEvents(eventRes.events || []);
  }

  function choose(p: Product) {
    setSelected(p.id);
    setDraft(draftFrom(p));
    setNote("");
    setError("");
  }

  async function save() {
    if (!draft || !piece) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/catalog", { method: "PATCH", headers: headers(pin), body: JSON.stringify({ id: piece.id, patch: patchFrom(draft) }) });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setError(data.error || "Could not save.");
    setNote("Saved. The shop is using this version.");
    await reload();
  }

  async function upload(file: File, id = selected) {
    setBusy(true);
    setError("");
    try {
      const blob = await fileToJpeg(file);
      const form = new FormData();
      form.set("productId", id);
      form.set("file", new File([blob], `${id}.jpg`, { type: "image/jpeg" }));
      const res = await fetch("/api/catalog/image", { method: "POST", headers: headers(pin, false), body: form });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not save that photo.");
      setNote("Photo replaced. Refresh the shop if you still see the old one.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that photo.");
    } finally {
      setBusy(false);
    }
  }

  async function useExisting(url: string) {
    setBusy(true);
    const res = await fetch("/api/catalog/image", { method: "POST", headers: headers(pin), body: JSON.stringify({ id: selected, url }) });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setError(data.error || "Could not use that photo.");
    setNote("Photo updated.");
    await reload();
  }

  async function removePiece(id: string) {
    if (!confirm("Remove this piece from the shop? You can restore it from the list below.")) return;
    await fetch(`/api/catalog?id=${id}`, { method: "DELETE", headers: headers(pin, false) });
    setSelected("");
    setDraft(null);
    await reload();
  }

  async function restore(id: string) {
    await fetch("/api/catalog", { method: "POST", headers: headers(pin), body: JSON.stringify({ restore: true, id }) });
    await reload();
  }

  async function addPiece(file?: File) {
    setBusy(true);
    setError("");
    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: headers(pin),
      body: JSON.stringify({
        ...newPiece,
        price: Number(newPiece.price),
        inventory: Number(newPiece.inventory),
        colors: [{ name: newPiece.colorName, hex: newPiece.colorHex }],
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setBusy(false);
      return setError(data.error || "Could not add that piece.");
    }
    if (file) await upload(file, data.product.id);
    else setBusy(false);
    setTab("clothes");
    setSelected(data.product.id);
    setNote(`${data.product.name} is on the shop.`);
    await reload();
  }

  async function installPlugin() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/plugins", { method: "POST", headers: headers(pin), body: JSON.stringify(pluginDraft) });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) return setError(data.error || "Could not install that plugin.");
    setNote("Plugin installed. Turn it on if it is not already live.");
    setPluginDraft({ ...pluginDraft, name: "", html: "" });
    await reload();
  }

  if (!authed) {
    return (
      <div className="wrap page-hero">
        <p className="kicker">Staff desk</p>
        <h1>Change the clothes.</h1>
        <form className="panel desk-login" onSubmit={(e) => { e.preventDefault(); enter(); }}>
          <label className="lbl"><span>Staff PIN</span>
            <input className="input" type="password" value={pin} onChange={(e) => setPin(e.target.value)} aria-label="Staff PIN" />
          </label>
          <button className="btn btn-ink" type="submit">Enter</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="wrap desk">
      <header className="page-hero">
        <p className="kicker">House desk</p>
        <h1>The clothes, from here.</h1>
        <p>A save updates the shop for every visitor. Photos, prices, stock and plugins live on the server, not in this browser.</p>
      </header>
      <div className="tabs">
        {([["clothes", "Clothes"], ["add", "Add a piece"], ["plugins", "Plugins"], ["orders", "Orders"], ["more", "More"]] as const).map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {note && <p className="ok">{note}</p>}
      {error && <p className="error">{error}</p>}

      {tab === "clothes" && (
        <div className="desk-layout">
          <aside>
            <input className="input" placeholder="Search a piece" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search pieces" />
            <label className="check"><input type="checkbox" checked={needsPhoto} onChange={(e) => setNeedsPhoto(e.target.checked)} /> Only pieces without a photo</label>
            <p className="muted">{shown.length} showing · {products.filter((p) => !p.shot).length} still need a photo</p>
            <div className="desk-list">
              {shown.map((p) => (
                <button key={p.id} className={`desk-item ${selected === p.id ? "on" : ""}`} onClick={() => choose(p)}>
                  {p.shot ? <img src={p.shot} alt="" /> : <span className="ph" style={{ ["--swatch" as string]: p.colors[0]?.hex }} />}
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.id} · {naira(p.price)} · {p.inventory} left{p.hidden ? " · hidden" : ""}</small>
                  </span>
                </button>
              ))}
            </div>
          </aside>
          {piece && draft ? (
            <form className="desk-editor panel" onSubmit={(e) => { e.preventDefault(); save(); }}>
              <div className="desk-photo-wrap">
                {piece.shot ? <img src={piece.shot} alt="" /> : <div className="ph" style={{ ["--swatch" as string]: draft.colorHex }}><em>No photo</em><strong>{draft.name}</strong></div>}
                <label className="btn btn-primary">
                  Change photo
                  <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = ""; }} />
                </label>
              </div>
              <p className="muted">{piece.slug} · drop a new photo here or pick one already on the site. The card updates as soon as it saves.</p>
              <div className="media-pick">
                {media.slice(0, 18).map((file) => (
                  <button type="button" key={file.url} onClick={() => useExisting(file.url)} title={file.name}>
                    <img src={file.url} alt="" />
                  </button>
                ))}
              </div>
              <label className="lbl"><span>Or paste a photo URL</span>
                <input className="input" placeholder="/images/… or https://…" onBlur={(e) => { if (e.target.value.trim()) useExisting(e.target.value.trim()); }} />
              </label>
              <div className="form-grid two">
                <label className="lbl"><span>Name</span><input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
                <label className="lbl"><span>Seller</span>
                  <select className="input" value={draft.sellerId} onChange={(e) => setDraft({ ...draft, sellerId: e.target.value })}>
                    {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="lbl"><span>Price ₦</span><input className="input" inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></label>
                <label className="lbl"><span>Was ₦</span><input className="input" inputMode="numeric" value={draft.compareAt} onChange={(e) => setDraft({ ...draft, compareAt: e.target.value })} placeholder="Leave blank if no discount" /></label>
                <label className="lbl"><span>Stock</span><input className="input" inputMode="numeric" value={draft.inventory} onChange={(e) => setDraft({ ...draft, inventory: e.target.value })} /></label>
                <label className="lbl"><span>Gender</span>
                  <select className="input" value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value as Gender })}>
                    <option value="women">Women</option><option value="men">Men</option><option value="kids">Kids</option>
                  </select>
                </label>
                <label className="lbl"><span>Category</span>
                  <select className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="lbl"><span>Sizes, comma separated</span><input className="input" value={draft.sizes} onChange={(e) => setDraft({ ...draft, sizes: e.target.value })} /></label>
                <label className="lbl"><span>Colour name</span><input className="input" value={draft.colorName} onChange={(e) => setDraft({ ...draft, colorName: e.target.value })} /></label>
                <label className="lbl"><span>Colour</span><input className="input" type="color" value={draft.colorHex} onChange={(e) => setDraft({ ...draft, colorHex: e.target.value })} /></label>
              </div>
              <label className="lbl"><span>More colours</span><input className="input" value={draft.extraColors} onChange={(e) => setDraft({ ...draft, extraColors: e.target.value })} placeholder="Navy:#1e2a44, Cream:#f3e6d4" /></label>
              <label className="lbl"><span>Description</span><textarea className="input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
              <div className="form-grid two">
                <label className="lbl"><span>Material</span><input className="input" value={draft.material} onChange={(e) => setDraft({ ...draft, material: e.target.value })} /></label>
                <label className="lbl"><span>Care</span><input className="input" value={draft.care} onChange={(e) => setDraft({ ...draft, care: e.target.value })} /></label>
              </div>
              <label className="lbl"><span>Desk note</span><input className="input" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} /></label>
              <fieldset className="checks">
                <legend>Occasion</legend>
                {OCCASIONS.map((o) => (
                  <label key={o} className="check"><input type="checkbox" checked={draft.occasions.includes(o)} onChange={() => setDraft({ ...draft, occasions: toggle(draft.occasions, o) })} /> {o}</label>
                ))}
              </fieldset>
              <fieldset className="checks">
                <legend>Style</legend>
                {STYLES.map((s) => (
                  <label key={s} className="check"><input type="checkbox" checked={draft.styles.includes(s)} onChange={() => setDraft({ ...draft, styles: toggle(draft.styles, s) })} /> {s}</label>
                ))}
              </fieldset>
              <div className="checks">
                {([
                  ["featured", "Featured"],
                  ["newArrival", "New arrival"],
                  ["trending", "Trending"],
                  ["bestSeller", "Best seller"],
                  ["deal", "Deal"],
                  ["hidden", "Hide from shop"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="check"><input type="checkbox" checked={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })} /> {label}</label>
                ))}
              </div>
              <div className="row desk-save">
                <button className="btn btn-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save piece"}</button>
                <button className="btn btn-line" type="button" onClick={() => removePiece(piece.id)}>Remove</button>
              </div>
            </form>
          ) : <div className="panel"><p>Choose a piece to change the photo, price, stock or description.</p></div>}
        </div>
      )}

      {tab === "add" && (
        <form className="panel desk-editor" onSubmit={(e) => { e.preventDefault(); const file = (e.currentTarget.elements.namedItem("photo") as HTMLInputElement).files?.[0]; addPiece(file); }}>
          <h2>Add a piece</h2>
          <label className="lbl"><span>Photo</span><input className="input" name="photo" type="file" accept="image/*" /></label>
          <label className="lbl"><span>Name</span><input className="input" required value={newPiece.name} onChange={(e) => setNewPiece({ ...newPiece, name: e.target.value })} /></label>
          <div className="form-grid two">
            <label className="lbl"><span>Price ₦</span><input className="input" required inputMode="numeric" value={newPiece.price} onChange={(e) => setNewPiece({ ...newPiece, price: e.target.value })} /></label>
            <label className="lbl"><span>Stock</span><input className="input" inputMode="numeric" value={newPiece.inventory} onChange={(e) => setNewPiece({ ...newPiece, inventory: e.target.value })} /></label>
            <label className="lbl"><span>Gender</span>
              <select className="input" value={newPiece.gender} onChange={(e) => setNewPiece({ ...newPiece, gender: e.target.value as Gender })}>
                <option value="women">Women</option><option value="men">Men</option><option value="kids">Kids</option>
              </select>
            </label>
            <label className="lbl"><span>Category</span>
              <select className="input" value={newPiece.category} onChange={(e) => setNewPiece({ ...newPiece, category: e.target.value as Category })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="lbl"><span>Seller</span>
              <select className="input" value={newPiece.sellerId} onChange={(e) => setNewPiece({ ...newPiece, sellerId: e.target.value })}>
                {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="lbl"><span>Colour</span><input className="input" value={newPiece.colorName} onChange={(e) => setNewPiece({ ...newPiece, colorName: e.target.value })} /></label>
          </div>
          <button className="btn btn-primary" disabled={busy} type="submit">{busy ? "Adding…" : "Add to the shop"}</button>
        </form>
      )}

      {tab === "plugins" && (
        <div className="desk-split">
          <div>
            <h2>Installed</h2>
            {plugins.map((p) => (
              <article key={p.id} className="panel">
                <div className="between"><strong>{p.name}</strong><span className="muted">{p.kind}</span></div>
                <p className="muted">{p.description || "No description."} · slots: {p.slots.join(", ") || "none"}</p>
                <div className="row">
                  <button className="btn btn-line btn-sm" onClick={async () => { await fetch(`/api/plugins/${p.id}`, { method: "PATCH", headers: headers(pin), body: JSON.stringify({ enabled: !p.enabled }) }); await reload(); }}>{p.enabled ? "Turn off" : "Turn on"}</button>
                  <button className="btn btn-line btn-sm" onClick={async () => { await fetch(`/api/plugins/${p.id}`, { method: "DELETE", headers: headers(pin, false) }); await reload(); }}>Remove</button>
                </div>
              </article>
            ))}
          </div>
          <form className="panel desk-editor" onSubmit={(e) => { e.preventDefault(); installPlugin(); }}>
            <h2>Add a plugin</h2>
            <label className="lbl"><span>Name</span><input className="input" required value={pluginDraft.name} onChange={(e) => setPluginDraft({ ...pluginDraft, name: e.target.value })} /></label>
            <label className="lbl"><span>What it does</span><input className="input" value={pluginDraft.description} onChange={(e) => setPluginDraft({ ...pluginDraft, description: e.target.value })} /></label>
            <label className="lbl"><span>Kind</span>
              <select className="input" value={pluginDraft.kind} onChange={(e) => setPluginDraft({ ...pluginDraft, kind: e.target.value })}>
                <option value="html">HTML note</option>
                <option value="script">Script</option>
                <option value="link">Link</option>
                <option value="webhook">Webhook only</option>
              </select>
            </label>
            {pluginDraft.kind === "html" && <label className="lbl"><span>HTML</span><textarea className="input" value={pluginDraft.html} onChange={(e) => setPluginDraft({ ...pluginDraft, html: e.target.value })} placeholder="<p>New drop Friday.</p>" /></label>}
            {pluginDraft.kind === "script" && <label className="lbl"><span>Script URL</span><input className="input" value={pluginDraft.scriptSrc} onChange={(e) => setPluginDraft({ ...pluginDraft, scriptSrc: e.target.value })} placeholder="https://… or /plugins/mine.js" /></label>}
            {pluginDraft.kind === "link" && (
              <div className="form-grid two">
                <label className="lbl"><span>Label</span><input className="input" value={pluginDraft.label} onChange={(e) => setPluginDraft({ ...pluginDraft, label: e.target.value })} /></label>
                <label className="lbl"><span>URL</span><input className="input" value={pluginDraft.href} onChange={(e) => setPluginDraft({ ...pluginDraft, href: e.target.value })} /></label>
              </div>
            )}
            <label className="lbl"><span>Webhook, optional</span><input className="input" value={pluginDraft.webhookUrl} onChange={(e) => setPluginDraft({ ...pluginDraft, webhookUrl: e.target.value })} placeholder="https://example.com/stylesort" /></label>
            <fieldset className="checks">
              <legend>Where it shows</legend>
              {SLOTS.map((slot) => (
                <label key={slot} className="check"><input type="checkbox" checked={pluginDraft.slots.includes(slot)} onChange={() => setPluginDraft({ ...pluginDraft, slots: toggle(pluginDraft.slots, slot) })} /> {slot}</label>
              ))}
            </fieldset>
            <fieldset className="checks">
              <legend>Events to send</legend>
              {EVENTS.map((event) => (
                <label key={event} className="check"><input type="checkbox" checked={pluginDraft.events.includes(event)} onChange={() => setPluginDraft({ ...pluginDraft, events: toggle(pluginDraft.events, event) })} /> {event}</label>
              ))}
            </fieldset>
            <label className="check"><input type="checkbox" checked={pluginDraft.enabled} onChange={(e) => setPluginDraft({ ...pluginDraft, enabled: e.target.checked })} /> Live as soon as it is installed</label>
            <button className="btn btn-primary" disabled={busy} type="submit">Install plugin</button>
            <p className="muted">Other tools can install themselves with POST /api/plugins and the staff PIN in the x-stylesort-pin header. The contract is at /api/plugins/manifest.</p>
          </form>
        </div>
      )}

      {tab === "orders" && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Number</th><th>Total</th><th>Payment</th><th></th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={4}>No server orders yet. A checkout from the shop lands here.</td></tr>}
              {orders.map((o) => {
                const payment = (o.payment || {}) as { status?: string; method?: string };
                return (
                  <tr key={String(o.id)}>
                    <td>{String(o.number || o.id)}</td>
                    <td>{naira(Number(o.total || 0))}</td>
                    <td>{payment.method} · {payment.status}</td>
                    <td>{payment.status !== "paid" && <button className="btn btn-line btn-sm" onClick={async () => { await fetch("/api/orders", { method: "PATCH", headers: headers(pin), body: JSON.stringify({ id: o.id, status: "paid" }) }); await reload(); }}>Mark paid</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "more" && (
        <div className="desk-split">
          <section className="panel">
            <h2>Removed pieces</h2>
            {removed.length === 0 && <p>Nothing in the bin.</p>}
            {removed.map((id) => (
              <div className="between" key={id}><span>{id}</span><button className="btn btn-line btn-sm" onClick={() => restore(id)}>Restore</button></div>
            ))}
            <h2>Change PIN</h2>
            <div className="row">
              <input className="input" type="password" value={nextPin} onChange={(e) => setNextPin(e.target.value)} placeholder="New PIN" aria-label="New PIN" />
              <button className="btn btn-ink" onClick={async () => {
                const res = await fetch("/api/desk", { method: "PATCH", headers: headers(pin), body: JSON.stringify({ pin: nextPin }) });
                const data = await res.json();
                if (!data.ok) return setError(data.error);
                sessionStorage.setItem(PIN_KEY, nextPin);
                setPin(nextPin);
                setNextPin("");
                setNote("PIN updated.");
              }}>Update</button>
            </div>
          </section>
          <section>
            <h2>Seller applications</h2>
            {apps.length === 0 && <p className="muted">No applications on the server yet.</p>}
            {apps.slice(0, 8).map((a) => <article key={String(a.id)} className="panel"><strong>{String(a.brand || "")}</strong><p>{String(a.owner || "")} · {String(a.city || "")}</p></article>)}
            <h2>Recent events</h2>
            <div className="table-wrap">
              <table>
                <tbody>
                  {events.slice(-12).reverse().map((e, i) => <tr key={i}><td>{String(e.name || "")}</td><td className="muted">{JSON.stringify(e.props || {}).slice(0, 80)}</td></tr>)}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}
