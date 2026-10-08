"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BRAND, naira, stockLabel, waLink } from "@/lib/brand";
import { completeTheLook, deliveryQuote, findSimilar, relatedProducts } from "@/lib/catalog";
import { getSeller } from "@/lib/sellers";
import { useStore } from "@/lib/store";
import { PluginSlot } from "./Plugins";
import { Icon, Picture, Price, ProductCard, Stars, sourcesFor, useImageIndex } from "./ui";

export default function ProductView({ slug }: { slug: string }) {
  const store = useStore();
  const product = store.products.find((p) => p.slug === slug);
  const have = useImageIndex();
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [guide, setGuide] = useState(false);
  const [shot, setShot] = useState(0);
  const [review, setReview] = useState({ name: "", rating: 5, title: "", body: "", photo: "" });

  useEffect(() => {
    if (!product) return;
    store.viewProduct(product.id);
    setColor(product.colors[0]?.name || "");
    setSize(product.sizes.includes("M") ? "M" : product.sizes[0]);
    setShot(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const seller = product ? getSeller(product.sellerId) : undefined;
  const sources = product ? sourcesFor(product, have) : [];
  const look = useMemo(() => (product ? completeTheLook(product, store.products) : null), [product, store.products]);
  const similar = useMemo(() => (product ? findSimilar(product, store.products) : []), [product, store.products]);
  const related = useMemo(() => (product ? relatedProducts(product, store.products) : []), [product, store.products]);
  const reviews = product ? store.reviewsForProduct(product.id) : [];

  if (!product) {
    return <div className="wrap page-hero"><h1>That piece has moved.</h1><Link className="btn btn-ink" href="/shop">Back to the shop</Link></div>;
  }
  const piece: NonNullable<typeof product> = product;

  const quote = deliveryQuote("Enugu", piece.price, "standard");
  const share = waLink(`Have you seen this on STYLESORT? ${piece.name} - ${naira(piece.price)}`);

  function add(now = false) {
    if (!size) { store.toast("Choose a size"); return; }
    if (now) store.buyNowItem(piece.id, { size, color, qty });
    else store.addToCart(piece.id, { size, color, qty });
  }

  return (
    <div className="wrap">
      <p className="muted" style={{ paddingTop: 16 }}><Link href="/shop">Shop</Link> / <Link href={`/${product.gender}`}>{product.gender}</Link> / {product.category}</p>
      <article className="pdp">
        <div>
          <div className="gallery-main">
            {sources[shot] ? (
              <img src={sources[shot]} alt={`${product.name}, view ${shot + 1}`} />
            ) : (
              <Picture product={product} eager />
            )}
          </div>
          {sources.length > 1 && (
            <div className="thumbs">
              {sources.map((src, i) => (
                <button key={src + i} className={i === shot ? "on" : ""} onClick={() => setShot(i)} aria-label={`Image ${i + 1}`}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
          {product.video && <video src={product.video} controls poster={sources[0]} style={{ width: "100%", marginTop: 8 }} />}
        </div>
        <div className="pdp-info">
          {seller && (
            <Link href={`/seller/${seller.slug}`} className="verified">
              {seller.verified ? <><Icon name="check" size={14} /> STYLESORT Verified</> : seller.name}
              <span className="muted"> · {seller.name}</span>
            </Link>
          )}
          <h1>{product.name}</h1>
          <Stars value={product.rating} />
          <p className="muted">{product.reviewCount} reviews</p>
          <Price price={product.price} compareAt={product.compareAt} />
          <p className={product.inventory <= 4 ? "error" : "ok"}>{stockLabel(product.inventory)}</p>
          <div>
            <p className="muted">Colour · {color}</p>
            <div className="choices" style={{ marginTop: 6 }}>
              {product.colors.map((c) => (
                <button key={c.name} className={`choice ${color === c.name ? "on" : ""}`} onClick={() => setColor(c.name)} aria-label={c.name}>
                  <span className="swatch" style={{ background: c.hex, display: "inline-block", marginRight: 6 }} />{c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="between">
              <p className="muted">Size</p>
              <button className="muted" onClick={() => setGuide(true)}>Size guide</button>
            </div>
            <div className="choices" style={{ marginTop: 6 }}>
              {product.sizes.map((s) => (
                <button key={s} className={`choice ${size === s ? "on" : ""}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
            {product.ukSizes ? <p className="muted">UK {product.ukSizes[0]}–{product.ukSizes[product.ukSizes.length - 1]}. Size 12 is L.</p> : null}
          </div>
          <div className="stepper" aria-label="Quantity">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">-</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(product.inventory || 1, q + 1))} aria-label="Increase quantity">+</button>
          </div>
          <div className="row">
            <button className="btn btn-primary" disabled={product.inventory <= 0} onClick={() => add(false)}>Add to bag</button>
            <button className="btn btn-ink" disabled={product.inventory <= 0} onClick={() => add(true)}>Buy now</button>
            <button className="btn btn-line" onClick={() => store.toggleWish(product.id)}>{store.wished(product.id) ? "Saved" : "Save"}</button>
          </div>
          {product.inventory <= 0 && <a className="btn btn-line" href={waLink(`Please tell me when ${product.name} is back.`)}>WhatsApp me when it is back</a>}
          <p className="muted">{quote.label}: {quote.fee === 0 ? "Free" : naira(quote.fee || 0)} · {quote.estimate}. Free delivery over ₦50,000. Enter your state at checkout for the exact fee.</p>
          {product.note && <p>{product.note}</p>}
          <div className="row">
            <a className="btn btn-line btn-sm" href={share} target="_blank" rel="noreferrer">Share on WhatsApp</a>
            <Link className="btn btn-line btn-sm" href={`/find?like=${product.slug}`}>Find something like this</Link>
          </div>
          <PluginSlot name="product-aside" />
          <div className="seller-card">
            <strong>{seller?.name}</strong>
            <p className="muted">{seller?.type} · {seller?.area}, {seller?.city}</p>
            <p>★ {seller?.rating} · {seller?.reviews} seller reviews</p>
            <p className="muted">Replies {seller?.responseTime} · {seller?.responseRate}% response · {seller?.deliveryScore}% on-time delivery</p>
            <Link href={`/seller/${seller?.slug}`}>Visit storefront</Link>
          </div>
          <div className="accordion">
            <details open>
              <summary>Description</summary>
              <p style={{ marginTop: 8 }}>{product.description}</p>
              <ul>{product.details.map((d) => <li key={d}>{d}</li>)}</ul>
            </details>
            <details>
              <summary>Material and care</summary>
              <p style={{ marginTop: 8 }}>{product.material}</p>
              <p>{product.care}</p>
            </details>
            <details>
              <summary>Delivery and returns</summary>
              <p style={{ marginTop: 8 }}>Enugu rider 1–2 days from ₦1,500. Southeast 2–4 days. Lagos, Abuja and Port Harcourt 3–5 days. Other states 4–7 days. Free over ₦50,000.</p>
              <p>{product.returnable ? "7-day returns on unworn items with tags. Drop off at Independence Layout or request pickup in select cities." : "This one-of-one piece is returnable only if we missed a fault."}</p>
              <Link href="/returns">Full returns policy</Link>
            </details>
          </div>
        </div>
      </article>

      {look && look.items.length > 1 && (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="kicker">Complete the look</p>
              <h2>The rest of the outfit.</h2>
              <p>Full look {naira(look.total)}</p>
            </div>
            <button className="btn btn-ink btn-sm" onClick={() => look.items.forEach((p) => store.addToCart(p.id, { size: p.id === product.id ? size : p.sizes[0], color: p.colors[0].name, qty: 1 }))}>Add look to bag</button>
          </div>
          <div className="look-row">
            {look.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <p className="kicker">Reviews</p>
            <h2>{product.rating.toFixed(1)} from {product.reviewCount} shoppers</h2>
          </div>
        </div>
        <div className="quote-grid">
          {reviews.map((r) => (
            <article key={r.id} className="quote">
              <div>
                <Stars value={r.rating} />
                <p style={{ marginTop: 8 }}>{r.title}</p>
                <p className="muted" style={{ marginTop: 8 }}>{r.body}</p>
                {r.photos?.map((src) => <img key={src} src={src} alt="Customer wearing the piece" style={{ marginTop: 10, aspectRatio: "1", objectFit: "cover" }} />)}
              </div>
              <footer>{r.name} · {r.city} · {r.verified ? "Verified purchase" : "Review"} · {r.size}
                <button onClick={() => store.markHelpful(r.id)}> Helpful ({r.helpful || 0})</button>
              </footer>
            </article>
          ))}
        </div>
        <form className="panel" style={{ marginTop: 16 }} onSubmit={(e) => {
          e.preventDefault();
          if (!review.body.trim()) return;
          store.addReview({ productId: product.id, name: review.name || store.user?.name || "STYLESORT shopper", city: "Enugu", rating: Number(review.rating), title: review.title || "My review", body: review.body, size, photos: review.photo ? [review.photo] : undefined });
          setReview({ name: "", rating: 5, title: "", body: "", photo: "" });
        }}>
          <strong>Write a review</strong>
          <div className="form-grid two">
            <label className="lbl"><span>Name</span><input className="input" value={review.name} onChange={(e) => setReview({ ...review, name: e.target.value })} placeholder={store.user?.name || "Your name"} /></label>
            <label className="lbl"><span>Stars</span>
              <select className="input" value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <input className="input" placeholder="Title" value={review.title} onChange={(e) => setReview({ ...review, title: e.target.value })} />
          <textarea className="input" required placeholder="How did it fit, and where did you wear it?" value={review.body} onChange={(e) => setReview({ ...review, body: e.target.value })} />
          <label className="lbl"><span>Photo of you in it, optional</span>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setReview((r) => ({ ...r, photo: String(reader.result) }));
              reader.readAsDataURL(file);
            }} />
          </label>
          <button className="btn btn-ink" type="submit">Publish review</button>
        </form>
      </section>

      <section className="section">
        <div className="section-head"><div><p className="kicker">You may also like</p><h2>Related</h2></div></div>
        <div className="grid">{related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
      {similar.length > 0 && (
        <section className="section">
          <div className="section-head"><div><p className="kicker">Find something like this</p><h2>Same feeling, different piece.</h2></div></div>
          <div className="grid">{similar.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
      {store.recent.filter((p) => p.id !== product.id).length > 0 && (
        <section className="section">
          <div className="section-head"><div><h2>Recently viewed</h2></div></div>
          <div className="grid">{store.recent.filter((p) => p.id !== product.id).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      <div className="sticky-atc">
        <button className="btn btn-primary btn-full" disabled={product.inventory <= 0} onClick={() => add(false)}>Add to bag · {naira(product.price)}</button>
      </div>

      {guide && (
        <div className="modal" role="dialog" aria-label="Size guide">
          <header><h2>Size guide</h2><button onClick={() => setGuide(false)}>Close</button></header>
          <div className="body prose">
            <p>Women’s dresses and sets follow UK sizing. Size 12 is L. If you are between sizes, size up in linen and native, size to your hip in crepe.</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Label</th><th>UK</th><th>Bust</th><th>Hip</th></tr></thead>
                <tbody>
                  {[["XS", "6", "31", "34"], ["S", "8", "33", "36"], ["M", "10", "35", "38"], ["L", "12", "37", "41"], ["XL", "14", "40", "44"], ["XXL", "16", "43", "47"], ["XXXL", "18", "46", "50"]].map((r) => (
                    <tr key={r[0]}>{r.map((c) => <td key={c}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Men: S chest 36–38, M 39–41, L 42–44, XL 45–47, XXL 48–50, XXXL 51–54. Shoes are EU. Kids sizes are age bands.</p>
            <p>Need a human? <a href={waLink(`Size help for ${product.name}`)}>WhatsApp {BRAND.phoneDisplay}</a></p>
          </div>
        </div>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: sources,
        brand: seller?.name,
        aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
        offers: { "@type": "Offer", priceCurrency: "NGN", price: product.price, availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
      }) }} />
    </div>
  );
}
