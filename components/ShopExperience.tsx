"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CLOTHING_SIZES, COLOR_FAMILIES, OCCASIONS, STYLES, naira } from "@/lib/brand";
import { applyFilters, emptyFilters, parseQuery, sortProducts } from "@/lib/catalog";
import type { Filters, SortKey } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ProductCard } from "./ui";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "bestselling", label: "Best Selling" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
  { id: "popular", label: "Most Popular" },
];

export default function ShopExperience({
  title,
  eyebrow = "Shop",
  intro,
  image,
  preset = {},
  query = "",
}: {
  title: string;
  eyebrow?: string;
  intro?: string;
  image?: string;
  preset?: Partial<Filters>;
  query?: string;
}) {
  const router = useRouter();
  const { products, sellers, track } = useStore();
  const parsed = query ? parseQuery(query) : null;
  const initial = emptyFilters({ ...preset, ...(parsed?.filters || {}), sort: preset.sort || parsed?.filters.sort || "featured" });
  const [filters, setFilters] = useState<Filters>(initial);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(12);
  const text = parsed?.text || "";

  useEffect(() => {
    setFilters(initial);
    setShown(12);
    if (query) track("search", { query, understood: parsed?.understood, intent: parsed?.intent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, title]);

  const results = useMemo(() => sortProducts(applyFilters(products, sellers, filters, text), filters.sort), [products, sellers, filters, text]);
  const cities = Array.from(new Set(sellers.map((s) => (s.city === "FCT" ? "Abuja" : s.city))));

  function update(partial: Partial<Filters>) {
    const next = { ...filters, ...partial };
    setFilters(next);
    track("filter_usage", { ...partial, title });
  }

  function toggle(key: "categories" | "sizes" | "colors" | "occasions" | "styles" | "locations", value: string) {
    const arr = filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value];
    update({ [key]: arr } as Partial<Filters>);
  }

  const chips = [
    filters.gender !== "all" ? filters.gender : "",
    ...filters.categories,
    ...filters.colors,
    ...filters.sizes,
    ...filters.occasions,
    ...filters.styles,
    ...filters.locations,
    filters.priceMax ? `Up to ${naira(filters.priceMax)}` : "",
    filters.availability !== "all" ? filters.availability : "",
  ].filter(Boolean);

  const FilterBody = (
    <>
      <details className="filter-group" open>
        <summary>Gender</summary>
        {(["all", "women", "men", "kids"] as const).map((g) => (
          <label key={g}><input type="radio" checked={filters.gender === g} onChange={() => update({ gender: g })} /> {g === "all" ? "All" : g[0].toUpperCase() + g.slice(1)}</label>
        ))}
      </details>
      <details className="filter-group" open>
        <summary>Category</summary>
        {CATEGORIES.map((c) => (
          <label key={c}><input type="checkbox" checked={filters.categories.includes(c)} onChange={() => toggle("categories", c)} /> {c}</label>
        ))}
      </details>
      <details className="filter-group">
        <summary>Price</summary>
        {[[0, 10000, "Under ₦10,000"], [0, 20000, "Under ₦20,000"], [20000, 50000, "₦20,000–₦50,000"], [50000, 100000, "₦50,000–₦100,000"], [100000, 10000000, "₦100,000+"]] .map(([min, max, label]) => (
          <label key={String(label)}>
            <input type="radio" checked={filters.priceMin === min && filters.priceMax === max} onChange={() => update({ priceMin: Number(min), priceMax: Number(max) })} /> {label}
          </label>
        ))}
        <button className="muted" onClick={() => update({ priceMin: undefined, priceMax: undefined })}>Any price</button>
      </details>
      <details className="filter-group">
        <summary>Size</summary>
        {CLOTHING_SIZES.map((s) => (
          <label key={s}><input type="checkbox" checked={filters.sizes.includes(s)} onChange={() => toggle("sizes", s)} /> {s}</label>
        ))}
        <p className="muted">Shoe sizes appear on the product. UK 12 is L.</p>
      </details>
      <details className="filter-group">
        <summary>Colour</summary>
        <div className="swatches">
          {Object.keys(COLOR_FAMILIES).map((c) => (
            <button key={c} className={`swatch ${filters.colors.includes(c) ? "on" : ""}`} title={c} aria-label={c} style={{ background: swatchHex(c) }} onClick={() => toggle("colors", c)} />
          ))}
        </div>
      </details>
      <details className="filter-group">
        <summary>Occasion</summary>
        {OCCASIONS.map((o) => (
          <label key={o}><input type="checkbox" checked={filters.occasions.includes(o)} onChange={() => toggle("occasions", o)} /> {o}</label>
        ))}
      </details>
      <details className="filter-group">
        <summary>Style</summary>
        {STYLES.map((s) => (
          <label key={s}><input type="checkbox" checked={filters.styles.includes(s)} onChange={() => toggle("styles", s)} /> {s}</label>
        ))}
      </details>
      <details className="filter-group">
        <summary>Location</summary>
        {cities.map((c) => (
          <label key={c}><input type="checkbox" checked={filters.locations.includes(c)} onChange={() => toggle("locations", c)} /> {c}</label>
        ))}
      </details>
      <details className="filter-group">
        <summary>Availability</summary>
        {([["all", "All"], ["in", "In stock"], ["low", "Low stock"]] as const).map(([id, label]) => (
          <label key={id}><input type="radio" checked={filters.availability === id} onChange={() => update({ availability: id })} /> {label}</label>
        ))}
      </details>
    </>
  );

  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">{eyebrow}</p>
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
        {parsed?.understood.length ? (
          <p className="muted" style={{ marginTop: 8 }}>We read that as {parsed.understood.join(" · ")}</p>
        ) : null}
        {parsed?.intent === "look" ? (
          <p style={{ marginTop: 10 }}><button className="btn btn-line btn-sm" onClick={() => router.push(`/looks?budget=${parsed.budget || ""}&occasion=${parsed.filters.occasions[0] || ""}&gender=${parsed.filters.gender}`)}>Shop this as a complete look</button></p>
        ) : null}
      </header>
      {image ? <img src={image} alt="" style={{ width: "100%", maxHeight: 360, objectFit: "cover", margin: "8px 0 18px" }} /> : null}
      <div className="shop">
        <aside className="filters" aria-label="Filters">{FilterBody}</aside>
        <div>
          <div className="toolbar">
            <button className="btn btn-line btn-sm filter-toggle" onClick={() => setOpen(true)}>Filter</button>
            <span className="muted">{results.length} pieces</span>
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select id="sort" className="sort" value={filters.sort} onChange={(e) => update({ sort: e.target.value as SortKey })}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          {chips.length > 0 && (
            <div className="chips">
              {chips.map((c) => <span className="chip" key={c}>{c}</span>)}
              <button className="chip" onClick={() => setFilters(emptyFilters({ sort: filters.sort }))}>Clear</button>
            </div>
          )}
          {results.length === 0 ? (
            <div className="empty">
              <h2>Nothing in that sort yet.</h2>
              <p>Widen the budget, drop a filter, or tell us on WhatsApp and we will look.</p>
              <button className="btn btn-ink" onClick={() => setFilters(emptyFilters())}>Reset filters</button>
            </div>
          ) : (
            <>
              <div className="grid">
                {results.slice(0, shown).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {shown < results.length && <p style={{ marginTop: 18 }}><button className="btn btn-line" onClick={() => setShown((n) => n + 12)}>Load more</button></p>}
            </>
          )}
        </div>
      </div>
      {open && (
        <div className="sheet" role="dialog" aria-label="Filters">
          <header>
            <h2>Filter</h2>
            <button onClick={() => setOpen(false)}>Close</button>
          </header>
          <div className="body">{FilterBody}</div>
          <div className="summary"><button className="btn btn-primary btn-full" onClick={() => setOpen(false)}>Show {results.length} pieces</button></div>
        </div>
      )}
    </div>
  );
}

function swatchHex(name: string) {
  const map: Record<string, string> = {
    Black: "#161616", White: "#f4f1ec", Cream: "#f3e6d4", Red: "#8d2e3c", Blue: "#1e2a44",
    Green: "#1f6b45", Brown: "#6b4a32", Yellow: "#e6c85c", Gold: "#c6a15b", Pink: "#e7b7c2",
    Grey: "#8a8680", Multicolour: "conic-gradient(#8d2e3c, #1f6b45, #c6a15b, #1e2a44, #8d2e3c)",
  };
  return map[name] || "#ccc";
}
