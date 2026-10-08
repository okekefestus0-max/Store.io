"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BRAND, BUDGETS, CAMPAIGN, COLOR_FAMILIES, OCCASION_PAGES, OCCASIONS, STATES, STYLES, naira, waLink } from "@/lib/brand";
import { COUPONS, articles, looks } from "@/lib/content";
import { buildOutfit, colorFamily, deliveryQuote, dominantHex, filterLooks, lookTotal, nearestFamily, sortProducts } from "@/lib/catalog";
import { sellers } from "@/lib/sellers";
import type { Gender, Occasion } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Picture, Price, ProductCard, Stars } from "./ui";

export function LooksPage() {
  const params = useSearchParams();
  const { products, addToCart, toast } = useStore();
  const [gender, setGender] = useState(params.get("gender") || "all");
  const [occasion, setOccasion] = useState(params.get("occasion") || "");
  const [colour, setColour] = useState("");
  const [budget, setBudget] = useState(Number(params.get("budget") || 0));
  const list = filterLooks(looks, products, { gender, occasion, colour, budget: budget || undefined });
  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">Shop complete looks</p>
        <h1>Buy the outfit, not the scavenger hunt.</h1>
        <p>Each look has a real total. Add every piece in one tap.</p>
      </header>
      <div className="toolbar">
        <select className="sort" aria-label="Gender" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="all">All genders</option><option value="women">Women</option><option value="men">Men</option><option value="kids">Kids</option>
        </select>
        <select className="sort" aria-label="Occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
          <option value="">Any occasion</option>
          {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select className="sort" aria-label="Colour" value={colour} onChange={(e) => setColour(e.target.value)}>
          <option value="">Any colour</option>
          {Object.keys(COLOR_FAMILIES).map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="sort" aria-label="Budget" value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
          <option value={0}>Any budget</option>
          <option value={20000}>Under ₦20,000</option>
          <option value={50000}>Under ₦50,000</option>
          <option value={100000}>Under ₦100,000</option>
        </select>
      </div>
      <div className="grid three" style={{ marginTop: 18 }}>
        {list.map((look) => {
          const { items, total } = lookTotal(look, products);
          const cover = items.find((p) => p.shot)?.shot;
          return (
            <article key={look.id} className="panel">
              {cover ? (
                <img src={cover} alt="" style={{ aspectRatio: "4/5", objectFit: "cover", objectPosition: "center 16%", width: "100%" }} />
              ) : (
                <div className="ph" style={{ aspectRatio: "4/5", ["--swatch" as string]: items[0]?.colors[0]?.hex || "#8d2e3c" }}>
                  <em>{look.occasion}</em>
                  <strong>{look.name}</strong>
                </div>
              )}
              <p className="kicker">{look.occasion}</p>
              <h2 style={{ fontSize: "1.8rem" }}>{look.name}</h2>
              <p>{look.description}</p>
              <p><strong>{naira(total)}</strong> <span className="muted">for {items.length} pieces</span></p>
              <ul>{items.map((p) => <li key={p.id}><Link href={`/product/${p.slug}`}>{p.name}</Link> · {naira(p.price)}</li>)}</ul>
              <button className="btn btn-primary" onClick={() => { items.forEach((p) => addToCart(p.id, { size: p.sizes[0], color: p.colors[0].name })); toast("Look added"); }}>Add look to bag</button>
            </article>
          );
        })}
      </div>
      {!list.length && <p className="empty">No full look inside that budget. Try Build My Outfit and we will piece one together.</p>}
    </div>
  );
}

export function BuildPage() {
  const { products, addToCart } = useStore();
  const [gender, setGender] = useState<Gender>("women");
  const [occasion, setOccasion] = useState<Occasion>("Date");
  const [colour, setColour] = useState("");
  const [budget, setBudget] = useState(30000);
  const [size, setSize] = useState("L");
  const [result, setResult] = useState<ReturnType<typeof buildOutfit> | null>(null);
  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">Build my outfit</p>
        <h1>Tell us the day. Keep the budget.</h1>
        <p>Gender, occasion, colour, the number you actually have. We will not sneak a gown past it.</p>
      </header>
      <form className="panel" onSubmit={(e) => { e.preventDefault(); setResult(buildOutfit({ gender, occasion, colour: colour || undefined, budget, size }, products)); }}>
        <div className="form-grid two">
          <label className="lbl"><span>Gender</span>
            <select className="input" value={gender} onChange={(e) => setGender(e.target.value as Gender)}><option value="women">Women</option><option value="men">Men</option><option value="kids">Kids</option></select>
          </label>
          <label className="lbl"><span>Occasion</span>
            <select className="input" value={occasion} onChange={(e) => setOccasion(e.target.value as Occasion)}>{OCCASIONS.map((o) => <option key={o}>{o}</option>)}</select>
          </label>
          <label className="lbl"><span>Preferred colour</span>
            <select className="input" value={colour} onChange={(e) => setColour(e.target.value)}><option value="">No preference</option>{Object.keys(COLOR_FAMILIES).map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="lbl"><span>Budget (₦)</span>
            <input className="input" type="number" min={5000} step={1000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
          </label>
          <label className="lbl"><span>Size</span>
            <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>{["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Plus Size"].map((s) => <option key={s}>{s}</option>)}</select>
          </label>
        </div>
        <button className="btn btn-primary" type="submit">Build my outfit</button>
      </form>
      {result && (
        <section className="section">
          {result.notes.map((n) => <p key={n}>{n}</p>)}
          <p><strong>Outfit total {naira(result.total)}</strong> of {naira(budget)}</p>
          <div className="grid">{result.items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          {result.items.length > 0 && <button className="btn btn-ink" style={{ marginTop: 12 }} onClick={() => result.items.forEach((p) => addToCart(p.id, { size: p.sizes.includes(size) ? size : p.sizes[0], color: p.colors[0].name }))}>Add outfit to bag</button>}
        </section>
      )}
    </div>
  );
}

export function FindPage() {
  const params = useSearchParams();
  const { products } = useStore();
  const like = products.find((p) => p.slug === params.get("like"));
  const [family, setFamily] = useState(like ? colorFamily(like.colors[0].name) : "");
  const [gender, setGender] = useState(like?.gender || "women");
  const [preview, setPreview] = useState("");
  const matches = products.filter((p) => p.gender === gender && (!family || colorFamily(p.colors[0].name) === family) && p.id !== like?.id).slice(0, 8);
  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">Find something like this</p>
        <h1>Upload a photo. We will sort the rail.</h1>
        <p>This reads the colour of your image and matches the edit. A fuller visual search is ready to plug in behind the same screen.</p>
      </header>
      <div className="panel">
        <label className="lbl"><span>Outfit photo</span>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            setPreview(url);
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = 40; canvas.height = 40;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.drawImage(img, 0, 0, 40, 40);
              const hex = dominantHex(ctx.getImageData(0, 0, 40, 40).data);
              setFamily(nearestFamily(hex));
            };
            img.src = url;
          }} />
        </label>
        {preview && <img src={preview} alt="Uploaded outfit" style={{ maxHeight: 280, objectFit: "cover" }} />}
        <div className="form-grid two">
          <label className="lbl"><span>Colour we see</span>
            <select className="input" value={family} onChange={(e) => setFamily(e.target.value)}>
              <option value="">Any</option>
              {Object.keys(COLOR_FAMILIES).map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="lbl"><span>Gender</span>
            <select className="input" value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
              <option value="women">Women</option><option value="men">Men</option><option value="kids">Kids</option>
            </select>
          </label>
        </div>
      </div>
      <div className="grid" style={{ marginTop: 18 }}>{matches.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </div>
  );
}

export function SellPage() {
  const { submitApp } = useStore();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ brand: "", owner: "", phone: "", email: "", city: "Enugu", state: "Enugu", type: "Boutique", instagram: "", products: "10-30", story: "" });
  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">STYLESORT Seller</p>
        <h1>List where shoppers are already sorting.</h1>
        <p>Boutiques, thrift sellers, fashion designers, shoe sellers, bag sellers, native-wear designers and accessory sellers can list on STYLESORT.</p>
      </header>
      <div className="grid three" style={{ marginBottom: 22 }}>
        {[["Customers", "Shoppers in Enugu first, then the Southeast, then the country."], ["Marketing", "Collections, deals, WhatsApp and the journal. You do not have to shout alone."], ["Discovery", "Filters for size, budget, occasion and location. The right person finds the right piece."], ["Storefront", "A page with your story, ratings, response time and delivery score."]].map(([t, d]) => (
          <article key={t} className="panel"><h2 style={{ fontSize: "1.6rem" }}>{t}</h2><p>{d}</p></article>
        ))}
      </div>
      {done ? <div className="panel"><h2>Application received.</h2><p>We will WhatsApp you from {BRAND.phoneDisplay} within two working days.</p></div> : (
        <form className="panel" onSubmit={(e) => { e.preventDefault(); submitApp(form); setDone(true); }}>
          <div className="form-grid two">
            <label className="lbl"><span>Brand name</span><input required className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></label>
            <label className="lbl"><span>Your name</span><input required className="input" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></label>
            <label className="lbl"><span>Phone</span><input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="lbl"><span>Email</span><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="lbl"><span>City</span><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label className="lbl"><span>State</span><select className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="lbl"><span>You are a</span>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Boutique", "Thrift seller", "Fashion designer", "Shoe seller", "Bag seller", "Native-wear designer", "Accessory seller"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="lbl"><span>Instagram</span><input className="input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@yourbrand" /></label>
          </div>
          <label className="lbl"><span>How many pieces are ready?</span>
            <select className="input" value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })}>
              {["Under 10", "10-30", "30-100", "100+"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="lbl"><span>Tell us what you make</span><textarea required className="input" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} /></label>
          <button className="btn btn-primary" type="submit">Submit application</button>
        </form>
      )}
    </div>
  );
}

export function SellerPage({ slug }: { slug: string }) {
  const { products } = useStore();
  const seller = sellers.find((s) => s.slug === slug);
  if (!seller) return <div className="wrap page-hero"><h1>Seller not found.</h1></div>;
  const items = products.filter((p) => p.sellerId === seller.id);
  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">{seller.type} · {seller.area}, {seller.city}</p>
        <h1>{seller.name}</h1>
        {seller.verified && <p className="verified">STYLESORT Verified · since {seller.since}</p>}
        <p>{seller.bio}</p>
        <p>★ {seller.rating} · {seller.reviews} reviews · replies {seller.responseTime} · {seller.responseRate}% response · {seller.deliveryScore}% on-time</p>
      </header>
      <div className="grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </div>
  );
}

export function InsiderPage() {
  const { user, joinInsider } = useStore();
  const spent = 0;
  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">STYLESORT Insider</p>
        <h1>Early, quieter, better.</h1>
        <p>Early access, special discounts, birthday offers, new-arrival previews, exclusive drops and referral rewards.</p>
      </header>
      <div className="grid three">
        {[["Sort", "Free", "The list, a birthday offer, and referral rewards."], ["Style", "₦75,000 spent", "10% twice a year, free Enugu delivery, previews."], ["Icon", "₦200,000 spent", "15% with INSIDER15, exclusive drops, priority WhatsApp."]].map(([t, s, d]) => (
          <article key={t} className="panel"><p className="kicker">{s}</p><h2>{t}</h2><p>{d}</p></article>
        ))}
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        {user?.insider ? <p>You are an Insider{user.insiderSince ? ` since ${user.insiderSince.slice(0, 10)}` : ""}. Use INSIDER15 at checkout. Spend so far this browser: {naira(spent)}.</p> : user ? <button className="btn btn-primary" onClick={joinInsider}>Join Insider, free</button> : <Link className="btn btn-ink" href="/account">Create an account to join</Link>}
        <p className="muted">Tiers move with what you spend. Sort is free. Style and Icon unlock as orders add up.</p>
      </div>
    </div>
  );
}

export function ReferPage() {
  const { user } = useStore();
  const link = user ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${user.referralCode}` : "";
  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">Referral</p>
        <h1>Send the link. Keep ₦2,000.</h1>
        <p>When a friend places a first order with your code, you get ₦2,000 credit and they get ₦1,000. Share a product, or share the shop.</p>
      </header>
      {user ? (
        <div className="panel">
          <p>Your code</p>
          <h2>{user.referralCode}</h2>
          <p>Credit waiting: {naira(user.referralCredits)}</p>
          <div className="row">
            <button className="btn btn-line" onClick={() => navigator.clipboard?.writeText(link)}>Copy link</button>
            <a className="btn btn-primary" href={waLink(`Shop STYLESORT with my code ${user.referralCode}: ${link}`)}>Share on WhatsApp</a>
          </div>
        </div>
      ) : <Link className="btn btn-ink" href="/account">Log in to get your code</Link>}
    </div>
  );
}

export function JournalIndex() {
  return (
    <div className="wrap">
      <header className="page-hero"><p className="kicker">Journal</p><h1>How to wear the week.</h1></header>
      <div className="journal">{articles.map((a) => (
        <Link key={a.slug} href={`/journal/${a.slug}`}><img src={a.image} alt="" /><small>{a.category} · {a.read}</small><h3>{a.title}</h3><p>{a.excerpt}</p></Link>
      ))}</div>
    </div>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const article = articles.find((a) => a.slug === slug);
  if (!article) return <div className="wrap page-hero"><h1>Story not found.</h1></div>;
  return (
    <article className="wrap">
      <header className="page-hero"><p className="kicker">{article.category} · {article.date} · {article.read}</p><h1>{article.title}</h1><p>{article.excerpt}</p></header>
      <div className="article-hero"><img src={article.image} alt="" /></div>
      <div className="prose" style={{ padding: "22px 0 40px" }}>{article.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
      <Link className="btn btn-ink" href="/occasion">Shop the occasion</Link>
    </article>
  );
}

export function AccountPage() {
  const store = useStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [addr, setAddr] = useState({ id: "", label: "Home", name: "", phone: "", line1: "", city: "Enugu", state: "Enugu" });
  if (!store.user) {
    return (
      <div className="wrap">
        <header className="page-hero"><h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1></header>
        <form className="panel" onSubmit={(e) => {
          e.preventDefault();
          const res = mode === "login" ? store.login(form.email, form.password) : store.register(form);
          setError(res.ok ? "" : res.message);
        }}>
          {mode === "register" && <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
          {mode === "register" && <input className="input" placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
          <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit">{mode === "login" ? "Log in" : "Create account"}</button>
          <button type="button" className="muted" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Need an account?" : "Already have one?"}</button>
        </form>
      </div>
    );
  }
  const u = store.user;
  const tabs = ["profile", "orders", "addresses", "recent", "sizes", "style", "budget", "insider"];
  return (
    <div className="wrap account">
      <header className="page-hero"><p className="kicker">{u.referralCode}</p><h1>{u.name.split(" ")[0]}.</h1></header>
      <div className="tabs">{tabs.map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
      {tab === "profile" && (
        <form className="panel" onSubmit={(e) => { e.preventDefault(); store.updateUser({ name: u.name, phone: u.phone, birthday: u.birthday }); }}>
          <label className="lbl"><span>Name</span><input className="input" value={u.name} onChange={(e) => store.updateUser({ name: e.target.value })} /></label>
          <label className="lbl"><span>Phone</span><input className="input" value={u.phone} onChange={(e) => store.updateUser({ phone: e.target.value })} /></label>
          <label className="lbl"><span>Email</span><input className="input" value={u.email} disabled /></label>
          <label className="lbl"><span>Birthday</span><input className="input" type="date" value={u.birthday || ""} onChange={(e) => store.updateUser({ birthday: e.target.value })} /></label>
          <button className="btn btn-line" type="button" onClick={store.logout}>Log out</button>
        </form>
      )}
      {tab === "orders" && (
        <div className="form-grid">{store.orders.length === 0 ? <p>No orders yet.</p> : store.orders.map((o) => (
          <Link key={o.id} href={`/order/${o.id}`} className="panel"><strong>{o.number}</strong><span>{naira(o.total)} · {o.payment.status}</span></Link>
        ))}</div>
      )}
      {tab === "addresses" && (
        <div className="form-grid">
          {u.addresses.map((a) => <div key={a.id} className="panel"><strong>{a.label}</strong><p>{a.line1}, {a.city}, {a.state}</p><button onClick={() => store.removeAddress(a.id)}>Remove</button></div>)}
          <form className="panel" onSubmit={(e) => { e.preventDefault(); store.saveAddress({ ...addr, id: addr.id || `ad-${Date.now()}`, name: u.name, phone: u.phone }); }}>
            <input className="input" placeholder="Label" value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
            <input className="input" placeholder="Street" required value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
            <input className="input" placeholder="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
            <select className="input" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })}>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
            <button className="btn btn-ink" type="submit">Save address</button>
          </form>
        </div>
      )}
      {tab === "recent" && <div className="grid">{store.recent.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      {tab === "sizes" && (
        <div className="panel form-grid two">
          {(["dress", "top", "bottom", "shoe"] as const).map((k) => (
            <label key={k} className="lbl"><span>{k}</span>
              <input className="input" value={u.sizes[k] || ""} onChange={(e) => store.updateUser({ sizes: { ...u.sizes, [k]: e.target.value } })} />
            </label>
          ))}
        </div>
      )}
      {tab === "style" && (
        <div className="panel">
          <div className="chips">
            {STYLES.map((s) => (
              <button key={s} className="chip" onClick={() => store.updateUser({ stylePreferences: u.stylePreferences.includes(s) ? u.stylePreferences.filter((x) => x !== s) : [...u.stylePreferences, s] })} style={{ background: u.stylePreferences.includes(s) ? "#141210" : "white", color: u.stylePreferences.includes(s) ? "#f3eee6" : "inherit" }}>{s}</button>
            ))}
          </div>
        </div>
      )}
      {tab === "budget" && (
        <div className="panel">
          {BUDGETS.map((b) => (
            <label key={b.slug} className="check"><input type="radio" name="bud" checked={u.budgetPreference === b.slug} onChange={() => store.updateUser({ budgetPreference: b.slug })} /> {b.label}</label>
          ))}
        </div>
      )}
      {tab === "insider" && <InsiderPage />}
    </div>
  );
}

export function WishlistPage() {
  const { wish, products } = useStore();
  const items = wish.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className="wrap">
      <header className="page-hero"><h1>Saved.</h1><p>Pieces you are not ready to forget.</p></header>
      {items.length === 0 ? <p>Nothing saved yet.</p> : <div className="grid">{items.map((p) => <ProductCard key={p!.id} product={p!} />)}</div>}
    </div>
  );
}

export function AdminPage() {
  const store = useStore();
  const [pin, setPin] = useState("");
  const [ok, setOk] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [tab, setTab] = useState("overview");
  const [q, setQ] = useState("");
  if (!ok) {
    return (
      <div className="wrap page-hero">
        <h1>Staff</h1>
        <form className="panel" onSubmit={(e) => { e.preventDefault(); const pass = pin === "stylesort"; setOk(pass); setPinError(!pass); }}>
          <input className="input" type="password" placeholder="Staff PIN" value={pin} onChange={(e) => { setPin(e.target.value); setPinError(false); }} aria-label="Staff PIN" />
          <button className="btn btn-ink" type="submit">Enter</button>
          {pinError && <p className="error">That PIN is not right.</p>}
        </form>
      </div>
    );
  }
  const revenue = store.orders.reduce((s, o) => s + o.total, 0);
  const views = store.events.filter((e) => e.name === "product_view").length;
  const carts = store.events.filter((e) => e.name === "add_to_cart").length;
  const pays = store.events.filter((e) => e.name === "payment_completed").length;
  const list = store.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="wrap admin">
      <header className="page-hero"><p className="kicker">House desk</p><h1>Today in the shop.</h1><p className="muted">Orders and edits on this browser stay here until a database is connected. Catalogue lives in lib/products.ts.</p></header>
      <div className="tabs">{["overview", "products", "orders", "sellers", "customers", "events"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
      {tab === "overview" && (
        <div className="kpis">
          <div className="kpi"><span>Revenue</span><b>{naira(revenue)}</b></div>
          <div className="kpi"><span>Orders</span><b>{store.orders.length}</b></div>
          <div className="kpi"><span>Product views</span><b>{views}</b></div>
          <div className="kpi"><span>Add to bag → paid</span><b>{carts} → {pays}</b></div>
        </div>
      )}
      {tab === "products" && (
        <div>
          <input className="input" placeholder="Find a product" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a product" />
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <thead><tr><th>Piece</th><th>Price</th><th>Stock</th><th>Flags</th></tr></thead>
              <tbody>
                {list.slice(0, 40).map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}<br /><span className="muted">{p.id}</span></td>
                    <td><input className="input" type="number" defaultValue={p.price} onBlur={(e) => store.updateProduct(p.id, { price: Number(e.target.value) })} /></td>
                    <td><input className="input" type="number" defaultValue={p.inventory} onBlur={(e) => store.updateProduct(p.id, { inventory: Number(e.target.value) })} /></td>
                    <td>
                      {(["featured", "newArrival", "deal", "bestSeller"] as const).map((f) => (
                        <label key={f} className="check"><input type="checkbox" defaultChecked={!!p[f]} onChange={(e) => store.updateProduct(p.id, { [f]: e.target.checked })} /> {f}</label>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === "orders" && (
        <div className="table-wrap"><table><thead><tr><th>Number</th><th>Total</th><th>Status</th><th>When</th></tr></thead><tbody>
          {store.orders.map((o) => <tr key={o.id}><td>{o.number}</td><td>{naira(o.total)}</td><td>{o.payment.status}</td><td>{o.createdAt.slice(0, 16)}</td></tr>)}
        </tbody></table></div>
      )}
      {tab === "sellers" && (
        <div className="form-grid">
          {sellers.map((s) => <div key={s.id} className="panel"><strong>{s.name}</strong> {s.verified && <span className="verified">Verified</span>}<p>{s.city} · ★ {s.rating} · {s.deliveryScore}% delivery · {s.responseRate}% response</p></div>)}
          <h2>Applications</h2>
          {store.apps.length === 0 && <p>No new applications on this browser.</p>}
          {store.apps.map((a) => <div key={a.id} className="panel"><strong>{a.brand}</strong><p>{a.owner} · {a.phone} · {a.city} · {a.type}</p><p>{a.story}</p></div>)}
        </div>
      )}
      {tab === "customers" && <p>{store.user ? `${store.user.name} · ${store.user.email} · ${store.user.phone}` : "No customer signed in on this browser."}</p>}
      {tab === "events" && (
        <div className="table-wrap"><table><thead><tr><th>Event</th><th>When</th><th>Detail</th></tr></thead><tbody>
          {store.events.slice(-40).reverse().map((e) => <tr key={e.id}><td>{e.name}</td><td>{e.at.slice(11, 19)}</td><td>{JSON.stringify(e.props).slice(0, 80)}</td></tr>)}
        </tbody></table></div>
      )}
      <p className="muted">Codes live: {COUPONS.map((c) => c.code).join(", ")}</p>
    </div>
  );
}

export function TrackPage() {
  const store = useStore();
  const [num, setNum] = useState("");
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<string | null>(null);
  const all = store.orders;
  return (
    <div className="wrap">
      <header className="page-hero"><h1>Track an order.</h1></header>
      <form className="panel" onSubmit={(e) => {
        e.preventDefault();
        const hit = all.find((o: { number: string; contact: { phone: string }; id: string }) => o.number.toLowerCase() === num.trim().toLowerCase() && o.contact.phone.replace(/\s/g, "").endsWith(phone.replace(/\s/g, "").slice(-10)));
        setFound(hit ? hit.id : "");
      }}>
        <input className="input" placeholder="SS-ENU-00000" value={num} onChange={(e) => setNum(e.target.value)} aria-label="Order number" />
        <input className="input" placeholder="Phone on the order" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Phone" />
        <button className="btn btn-ink" type="submit">Find order</button>
        {found === "" && <p className="error">No order matches that number and phone on this device.</p>}
        {found && <Link href={`/order/${found}`}>Open order</Link>}
      </form>
    </div>
  );
}

export function BudgetIndex() {
  return (
    <div className="wrap">
      <header className="page-hero"><p className="kicker">Shop by budget</p><h1>Start with the number.</h1></header>
      <div className="budget-row">{BUDGETS.map((b) => <Link key={b.slug} className="budget-card" href={`/budget/${b.slug}`}><strong>{b.label}</strong><span>{b.blurb}</span></Link>)}</div>
    </div>
  );
}

export function OccasionIndex() {
  return (
    <div className="wrap">
      <header className="page-hero"><p className="kicker">Shop by occasion</p><h1>What is the day?</h1></header>
      <div className="mosaic">{OCCASION_PAGES.map((o) => <Link key={o.slug} href={`/occasion/${o.slug}`}><img src={o.image} alt="" /><span>{o.title}</span></Link>)}</div>
    </div>
  );
}

export function StaticPage({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return <div className="wrap"><header className="page-hero">{kicker && <p className="kicker">{kicker}</p>}<h1>{title}</h1></header><div className="prose" style={{ paddingBottom: 40 }}>{children}</div></div>;
}

export function AboutPage() {
  return <StaticPage title="A shop that starts in Enugu." kicker="About">
    <p>STYLESORT is a fashion marketplace launching in Enugu and built to travel. Women first, men close behind, ages 18 to 40, and anyone who is tired of scrolling three apps to find a dress in their size under a number they can say out loud.</p>
    <p>Find It. Sort It. Wear It. Your style. Your size. Your budget. Your choice.</p>
    <p>We work with boutiques, designers, thrift editors, Aba shoemakers and native houses. Verified sellers carry a badge because the badge should mean something. Lumi is still earning theirs.</p>
    <p>Studio: {BRAND.address}. {BRAND.hours}.</p>
  </StaticPage>;
}

export function HelpPage() {
  return <StaticPage title="Help, without the hold music." kicker="Help">
    <p>Orders, sizing, a seller who has not replied: WhatsApp {BRAND.phoneDisplay}. That is the fastest door.</p>
    <p>Delivery fees show before you pay. Returns are 7 days, unworn, tags on, except one-of-one thrift.</p>
    <p>Codes: WELCOME10 for a first order, ENUGU2K for Enugu delivery, SORT5 over ₦40,000, INSIDER15 for members, WEEKEND from Friday to Sunday.</p>
    <p><Link href="/size-guide">Size guide</Link> · <Link href="/delivery">Delivery</Link> · <Link href="/returns">Returns</Link> · <Link href="/track">Track</Link></p>
  </StaticPage>;
}

export function DeliveryPage() {
  const q = deliveryQuote("Enugu", 10000, "standard");
  return <StaticPage title="Delivery, said before you pay." kicker="Delivery">
    <p>Enugu rider: from ₦1,500, 1–2 working days. Same day on express if you order before 1pm.</p>
    <p>Southeast — Anambra, Ebonyi, Abia, Imo: from ₦2,500, 2–4 days. Lagos, Abuja, Port Harcourt: from ₦3,500, 3–5 days. Other states: from ₦4,500, 4–7 days.</p>
    <p>Free delivery over ₦50,000. Half price over ₦30,000. Studio pickup at {BRAND.address} is free.</p>
    <p>Example for a ₦10,000 Enugu order: {q.label}, {naira(q.fee || 0)}, {q.estimate}.</p>
  </StaticPage>;
}

export function ReturnsPage() {
  return <StaticPage title="Seven days. Unworn. Tags on." kicker="Returns">
    <p>If it is not right, tell us within 7 days. Drop it at Independence Layout or ask for pickup in Enugu, Lagos and Abuja. Refunds go back the way you paid, after we see the piece.</p>
    <p>Thrift is one of one. We accept a return only if we missed a fault. Native made-to-measure, if you request it on WhatsApp, is not returnable once cut.</p>
  </StaticPage>;
}

export function SizePage() {
  return <StaticPage title="Size, without the guess." kicker="Size guide">
    <p>Women: XS 6, S 8, M 10, L 12, XL 14, XXL 16, XXXL 18. Plus size is XXL and XXXL, cut with hip ease.</p>
    <p>Men: S 36–38, M 39–41, L 42–44, XL 45–47, XXL 48–50, XXXL 51–54. Size up for agbada and kaftan if you want drape.</p>
    <p>Shoes are EU. Kids are age bands, 2–3Y through 10–11Y.</p>
  </StaticPage>;
}

export function ContactPage() {
  return <StaticPage title="Talk to a person." kicker="Contact">
    <p>{BRAND.address}</p>
    <p>{BRAND.hours}</p>
    <p><a href={waLink("Hello STYLESORT")}>{BRAND.phoneDisplay}</a></p>
    <p><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
    <p>{BRAND.instagram}</p>
  </StaticPage>;
}

export function PrivacyPage() {
  return <StaticPage title="Privacy" kicker="House">
    <p>We keep your name, phone, address and orders so we can deliver clothes. We do not sell that list. WhatsApp messages stay on WhatsApp. Card numbers are not stored in full. On this preview, your bag and account live in this browser until a secure database is connected.</p>
  </StaticPage>;
}

export function TermsPage() {
  return <StaticPage title="Terms" kicker="House">
    <p>By ordering, you agree the price, delivery fee and estimate shown at checkout are the ones that apply. Sellers are responsible for the pieces they list. STYLESORT holds the order and the conversation. Title passes when the rider hands you the bag, or when you collect it in Enugu.</p>
  </StaticPage>;
}

export function NotFoundView() {
  return <div className="wrap page-hero"><h1>That page is not in the edit.</h1><Link className="btn btn-ink" href="/shop">Shop the edit</Link></div>;
}
