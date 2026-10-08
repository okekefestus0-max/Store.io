"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BRAND, SUGGESTIONS, naira, waLink } from "@/lib/brand";
import { deliveryQuote, priceCoupon } from "@/lib/catalog";
import { getSeller } from "@/lib/sellers";
import { useStore } from "@/lib/store";
import { PluginSlot } from "./Plugins";
import { Icon, Picture, Price } from "./ui";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const store = useStore();
  const [q, setQ] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [menu, setMenu] = useState(false);
  const [code, setCode] = useState(store.coupon);

  useEffect(() => { setCode(store.coupon); }, [store.coupon]);
  useEffect(() => {
    if (!store.ready || store.seenDrop || path !== "/") return;
    const t = setTimeout(() => setShowDrop(true), 6500);
    return () => clearTimeout(t);
  }, [store.ready, store.seenDrop, path]);

  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    const ideas = SUGGESTIONS.filter((x) => !s || x.toLowerCase().includes(s)).slice(0, 6);
    const hits = s
      ? store.products.filter((p) => p.name.toLowerCase().includes(s) || p.tags.some((t) => t.includes(s))).slice(0, 5)
      : [];
    return { ideas, hits };
  }, [q, store.products]);

  const lines = store.cart.map((line) => ({ line, product: store.products.find((p) => p.id === line.productId) })).filter((x) => x.product);
  const subtotal = lines.reduce((s, x) => s + x.product!.price * x.line.qty, 0);
  const quote = deliveryQuote("Enugu", subtotal, "standard");
  const coupon = priceCoupon(code, { subtotal, state: "Enugu", firstOrder: store.orders.length === 0, insider: !!store.user?.insider, deliveryFee: quote.fee || 0 });

  function goSearch(value: string) {
    store.track("search", { query: value });
    store.setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  const waText = `Hello STYLESORT, I need help${path && path !== "/" ? ` on ${path}` : ""}.`;

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="topbar" aria-hidden="true">
        <div className="marquee">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              First Drop · Enugu <i>✦</i> Free delivery over ₦50,000 <i>✦</i> Weekend deals <i>✦</i> Pay by transfer, card or OPay <i>✦</i> WhatsApp {BRAND.phoneDisplay} <i>✦</i>
            </span>
          ))}
        </div>
      </div>
      <header className="header">
        <div className="header-row">
          <nav className="nav" aria-label="Primary">
            <Link href="/women">Women</Link>
            <Link href="/men">Men</Link>
            <Link href="/occasion">Occasion</Link>
            <Link href="/budget">Budget</Link>
            <Link href="/looks">Looks</Link>
          </nav>
          <Link href="/" className="logo" aria-label="STYLESORT home">
            <strong>STYLESORT</strong>
            <small>Find It. Sort It. Wear It.</small>
          </Link>
          <div className="tools">
            <form className="search-inline desktop-search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) goSearch(q); }} role="search">
              <Icon name="search" size={16} />
              <input aria-label="Search STYLESORT" placeholder="Try red dress under ₦20K" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => store.setSearchOpen(true)} />
            </form>
            <Link className="iconbtn" href="/account" aria-label="Account"><Icon name="user" /></Link>
            <Link className="iconbtn" href="/wishlist" aria-label="Wishlist">
              <Icon name="heart" />
              {store.wish.length ? <span className="count">{store.wish.length}</span> : null}
            </Link>
            <button className="iconbtn" aria-label="Open bag" onClick={() => store.setCartOpen(true)}>
              <Icon name="bag" />
              {store.cart.length ? <span className="count">{store.cart.reduce((s, l) => s + l.qty, 0)}</span> : null}
            </button>
            <button className="iconbtn mobile-menu" aria-label="Menu" onClick={() => setMenu(true)}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
        <div className="header-search">
          <button className="search-inline" onClick={() => store.setSearchOpen(true)} aria-label="Open search">
            <Icon name="search" size={18} />
            <span className="muted">Search styles, sizes, budgets</span>
          </button>
        </div>
      </header>
      <PluginSlot name="announcement" />
      <main id="main">{children}</main>
      <footer className="footer">
        <div className="wrap"><PluginSlot name="footer" /></div>
        <div className="wrap footer-grid">
          <div>
            <h3>STYLESORT</h3>
            <p>Find It. Sort It. Wear It.</p>
            <p className="muted" style={{ color: "#d9d0c6", marginTop: 8 }}>{BRAND.promise}</p>
            <p style={{ marginTop: 12 }}>{BRAND.address}</p>
            <p>{BRAND.hours}</p>
            <p><a href={waLink("Hello STYLESORT")}>{BRAND.phoneDisplay}</a> · <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
          </div>
          <div>
            <h3>Shop</h3>
            <ul>
              <li><Link href="/women">Women</Link></li>
              <li><Link href="/men">Men</Link></li>
              <li><Link href="/kids">Kids</Link></li>
              <li><Link href="/new">New arrivals</Link></li>
              <li><Link href="/deals">Deals</Link></li>
              <li><Link href="/looks">Complete looks</Link></li>
              <li><Link href="/build">Build my outfit</Link></li>
            </ul>
          </div>
          <div>
            <h3>Help</h3>
            <ul>
              <li><Link href="/delivery">Delivery</Link></li>
              <li><Link href="/returns">Returns</Link></li>
              <li><Link href="/size-guide">Size guide</Link></li>
              <li><Link href="/track">Track an order</Link></li>
              <li><Link href="/help">Help</Link></li>
              <li><Link href="/journal">Journal</Link></li>
            </ul>
          </div>
          <div>
            <h3>House</h3>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/sell">Sell on STYLESORT</Link></li>
              <li><Link href="/insider">Insider</Link></li>
              <li><Link href="/refer">Refer a friend</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/admin">Staff</Link></li>
            </ul>
          </div>
        </div>
        <div className="wrap fine">
          <span>© {new Date().getFullYear()} STYLESORT · Launching from Enugu</span>
          <span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span>
        </div>
      </footer>

      <nav className="tabbar" aria-label="Mobile">
        <Link href="/" aria-current={path === "/" ? "page" : undefined}><Icon name="home" size={20} />Home</Link>
        <Link href="/shop" aria-current={path.startsWith("/shop") || path === "/women" ? "page" : undefined}><Icon name="search" size={20} />Shop</Link>
        <button onClick={() => store.setSearchOpen(true)}><Icon name="search" size={20} />Search</button>
        <Link href="/wishlist"><Icon name="heart" size={20} />Saved</Link>
        <Link href="/account"><Icon name="user" size={20} />Account</Link>
      </nav>

      <a className="wa" href={waLink(waText)} target="_blank" rel="noreferrer" aria-label="Chat with STYLESORT on WhatsApp">
        <Icon name="wa" size={28} />
      </a>

      {store.cartOpen && (
        <>
          <div className="overlay" onClick={() => store.setCartOpen(false)} />
          <aside className="drawer" role="dialog" aria-label="Your bag">
            <header>
              <h2>Your bag</h2>
              <button className="iconbtn" aria-label="Close bag" onClick={() => store.setCartOpen(false)}><Icon name="close" /></button>
            </header>
            <div className="body">
              {!lines.length && <div className="empty"><p>Your bag is empty.</p><Link className="btn btn-ink" href="/women" onClick={() => store.setCartOpen(false)}>Shop women</Link></div>}
              {lines.map(({ line, product }) => (
                <div className="line" key={line.lineId}>
                  <Link href={`/product/${product!.slug}`} onClick={() => store.setCartOpen(false)}><Picture product={product!} /></Link>
                  <div>
                    <strong>{product!.name}</strong>
                    <p className="muted">{line.color} · {line.size}</p>
                    <p className="muted">{getSeller(product!.sellerId)?.name}</p>
                    <div className="between" style={{ marginTop: 8 }}>
                      <div className="stepper">
                        <button aria-label="Decrease" onClick={() => store.updateQty(line.lineId, line.qty - 1)}>-</button>
                        <span>{line.qty}</span>
                        <button aria-label="Increase" onClick={() => store.updateQty(line.lineId, Math.min(product!.inventory, line.qty + 1))}>+</button>
                      </div>
                      <strong>{naira(product!.price * line.qty)}</strong>
                    </div>
                    <button className="muted" onClick={() => store.removeLine(line.lineId)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            {lines.length > 0 && (
              <div className="summary">
                <div className="between"><span>Subtotal</span><strong>{naira(subtotal)}</strong></div>
                <p className="muted">Delivery from {naira(quote.fee || 0)} in Enugu · {quote.estimate}. Free over ₦50,000.</p>
                <form className="row" onSubmit={(e) => { e.preventDefault(); store.setCoupon(code); store.toast(coupon.ok ? coupon.message : coupon.message); if (coupon.ok) store.track("coupon_use", { code, stage: "cart" }); }}>
                  <input className="input" aria-label="Discount code" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} />
                  <button className="btn btn-line btn-sm" type="submit">Apply</button>
                </form>
                {store.coupon && <p className={coupon.ok ? "ok" : "error"}>{store.coupon}: {coupon.message}</p>}
                <PluginSlot name="cart-note" />
                <Link className="btn btn-primary btn-full" href="/checkout" onClick={() => { store.setCartOpen(false); store.track("checkout_started", { value: subtotal, items: lines.length }); }}>Checkout</Link>
              </div>
            )}
          </aside>
        </>
      )}

      {store.searchOpen && (
        <div className="sheet" role="dialog" aria-label="Search">
          <header>
            <h2>Search</h2>
            <button className="iconbtn" aria-label="Close search" onClick={() => store.setSearchOpen(false)}><Icon name="close" /></button>
          </header>
          <div className="body search-panel">
            <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) goSearch(q); }}>
              <label className="search-inline">
                <Icon name="search" size={18} />
                <input autoFocus aria-label="Search" placeholder="red dress under ₦20K" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            </form>
            <div className="suggest">
              {suggestions.ideas.map((idea) => (
                <button key={idea} onClick={() => goSearch(idea)}>{idea} <span className="muted">Search</span></button>
              ))}
              {suggestions.hits.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} onClick={() => store.setSearchOpen(false)}>
                  {p.name} <Price price={p.price} compareAt={p.compareAt} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {menu && (
        <div className="sheet" role="dialog" aria-label="Menu">
          <header>
            <h2>Menu</h2>
            <button className="iconbtn" aria-label="Close menu" onClick={() => setMenu(false)}><Icon name="close" /></button>
          </header>
          <div className="body" style={{ display: "grid", gap: 14, fontFamily: "var(--serif)", fontSize: "2rem" }}>
            {[
              ["/women", "Women"], ["/men", "Men"], ["/kids", "Kids"], ["/occasion", "Occasion"],
              ["/budget", "Budget"], ["/looks", "Looks"], ["/new", "New arrivals"], ["/deals", "Deals"],
              ["/build", "Build my outfit"], ["/sell", "Sell"], ["/journal", "Journal"], ["/account", "Account"],
            ].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenu(false)}>{label}</Link>
            ))}
          </div>
        </div>
      )}

      {showDrop && (
        <aside className="drop" role="dialog" aria-label="First drop offer">
          <p className="kicker" style={{ color: "#e7b7c0" }}>First Drop · Enugu</p>
          <strong style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 500 }}>10% off your first order</strong>
          <p>Use WELCOME10 at checkout. New drops, deals and trending styles, before the group chat.</p>
          <div className="row">
            <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard?.writeText("WELCOME10"); store.toast("Code copied"); store.dismissDrop(); setShowDrop(false); }}>Copy WELCOME10</button>
            <button className="link" onClick={() => { store.dismissDrop(); setShowDrop(false); }}>Not now</button>
          </div>
        </aside>
      )}

      <div className="toast-wrap" aria-live="polite">
        {store.toasts.map((t) => <div className="toast" key={t.id}>{t.message}</div>)}
      </div>
      </>
  );
}
