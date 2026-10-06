"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { discountPercent, naira } from "@/lib/brand";
import { getSeller } from "@/lib/sellers";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true as const };
  switch (name) {
    case "search":
      return <svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></svg>;
    case "bag":
      return <svg {...p}><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" /></svg>;
    case "heart":
      return <svg {...p}><path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" /></svg>;
    case "heart-fill":
      return <svg {...p} fill="currentColor" stroke="none"><path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" /></svg>;
    case "user":
      return <svg {...p}><circle cx="12" cy="8" r="3.2" /><path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" /></svg>;
    case "home":
      return <svg {...p}><path d="M4 11l8-7 8 7v8H4v-8z" /></svg>;
    case "close":
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "menu":
      return <svg {...p}><path d="M4 7h16M4 12h16M4 17h10" /></svg>;
    case "star":
      return <svg {...p} fill="currentColor" stroke="none"><path d="M12 3.5l2.4 5 5.6.7-4.1 3.8 1.1 5.5L12 16.8 7 18.5l1.1-5.5L4 9.2l5.6-.7L12 3.5z" /></svg>;
    case "check":
      return <svg {...p}><path d="M5 12.5l4.2 4.2L19 7" /></svg>;
    case "wa":
      return <svg {...p} fill="currentColor" stroke="none" viewBox="0 0 24 24"><path d="M12 3.2A8.7 8.7 0 0 0 4.6 16.3L3.4 20.6l4.4-1.2A8.8 8.8 0 1 0 12 3.2zm4.9 12.4c-.2.6-1.2 1.1-1.7 1.2-.4.1-.9.1-1.5-.1-.3-.1-.8-.3-1.3-.5-2.3-1-3.8-3.4-3.9-3.5-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.6.7 2 .7 2.1.1.1 0 .3-.1.4l-.3.4c-.1.1-.2.3-.1.5.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3.1.3 0 .8-.2 1.2z" /></svg>;
    case "filter":
      return <svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
    default:
      return null;
  }
}

let imageCache: Set<string> | null = null;
export function useImageIndex() {
  const [have, setHave] = useState<Set<string>>(imageCache || new Set());
  useEffect(() => {
    if (imageCache) {
      setHave(imageCache);
      return;
    }
    fetch("/api/images")
      .then((r) => r.json())
      .then((d) => {
        imageCache = new Set((d.files || []).map((f: string) => f.replace(/\.(jpe?g|png|webp)$/i, "")));
        setHave(imageCache);
      })
      .catch(() => undefined);
  }, []);
  return have;
}

export function sourcesFor(p: Product, have: Set<string>) {
  const list: string[] = [];
  if (p.shot) list.push(p.shot);
  const local = `/images/products/${p.id}.jpg`;
  const shotPath = (p.shot || "").split("?")[0];
  if (have.has(p.id) && shotPath !== local && !list.includes(local)) list.push(local);
  p.images.forEach((img) => {
    if (img.includes(`/products/${p.id}.`) && !have.has(p.id)) return;
    if (!list.includes(img)) list.push(img);
  });
  return list;
}

export function Picture({ product, eager = false }: { product: Product; eager?: boolean }) {
  const have = useImageIndex();
  const sources = sourcesFor(product, have);
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [product.id, sources[0]]);
  if (!sources[i]) {
    return (
      <div className="ph" style={{ ["--swatch" as string]: product.colors[0]?.hex || "#8d2e3c" }}>
        <em>{product.category}</em>
        <strong>{product.name}</strong>
      </div>
    );
  }
  return (
    <img
      src={sources[i]}
      alt={`${product.name} by ${getSeller(product.sellerId)?.name || "STYLESORT"}`}
      onError={() => setI((n) => n + 1)}
      loading={eager ? "eager" : "lazy"}
    />
  );
}

export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {"★".repeat(full)}{"☆".repeat(5 - full)} <span className="rating">{value.toFixed(1)}</span>
    </span>
  );
}

export function Price({ price, compareAt }: { price: number; compareAt?: number }) {
  const off = discountPercent(price, compareAt);
  return (
    <p className="price">
      {compareAt && compareAt > price ? <s>{naira(compareAt)}</s> : null}
      <strong className={off ? "now" : ""}>{naira(price)}</strong>
      {off ? <span className="rating">-{off}%</span> : null}
    </p>
  );
}

export function Verified({ sellerId }: { sellerId: string }) {
  const seller = getSeller(sellerId);
  if (!seller) return null;
  return (
    <span className="card-seller">
      {seller.name}
      {seller.verified ? <span className="verified"><Icon name="check" size={12} /> Verified</span> : null}
    </span>
  );
}

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { toggleWish, wished } = useStore();
  const on = wished(product.id);
  const off = discountPercent(product.price, product.compareAt);
  return (
    <article className="card">
      <Link href={`/product/${product.slug}`} className="card-media">
        <Picture product={product} eager={eager} />
        {product.newArrival ? <span className="card-badge">New</span> : product.bestSeller ? <span className="card-badge">Bestseller</span> : null}
        {off ? <span className="card-badge sale">-{off}%</span> : null}
        {product.inventory <= 0 ? <span className="card-badge" style={{ top: "auto", bottom: 10 }}>Sold out</span> : null}
      </Link>
      <button className={`card-wish ${on ? "on" : ""}`} aria-label={on ? "Remove from wishlist" : "Save to wishlist"} onClick={() => toggleWish(product.id)}>
        <Icon name={on ? "heart-fill" : "heart"} size={18} />
      </button>
      <div className="card-body">
        <Verified sellerId={product.sellerId} />
        <h3 className="card-name"><Link href={`/product/${product.slug}`}>{product.name}</Link></h3>
        <p className="card-meta">{product.colors[0]?.name} · {product.category}</p>
        <div className="between">
          <Price price={product.price} compareAt={product.compareAt} />
          <span className="rating">★ {product.rating.toFixed(1)}</span>
        </div>
      </div>
    </article>
  );
}

export function ProductRail({ items }: { items: Product[] }) {
  if (!items.length) return null;
  return (
    <div className="rail">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
