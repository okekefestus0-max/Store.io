"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BUDGETS, CAMPAIGN, OCCASION_PAGES, waLink } from "@/lib/brand";
import { articles } from "@/lib/content";
import { sortProducts } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { PluginSlot } from "./Plugins";
import { ProductCard, ProductRail } from "./ui";

export default function HomePage() {
  const { products, joinNewsletter } = useStore();
  const [contact, setContact] = useState("");
  const [wa, setWa] = useState(true);
  const photographed = products.filter((p) => p.shot);
  const withPhoto = (list: typeof products) => [...list.filter((p) => p.shot), ...list.filter((p) => !p.shot)];
  const newest = withPhoto(sortProducts(products.filter((p) => p.newArrival), "newest")).slice(0, 4);
  const trending = withPhoto(sortProducts(products.filter((p) => p.trending), "popular")).slice(0, 8);
  const best = withPhoto(sortProducts(products.filter((p) => p.bestSeller), "bestselling")).slice(0, 8);
  const under20 = products.filter((p) => p.price <= 20000 && p.inventory > 0).slice(0, 8);
  const heroPieces = useMemo(() => photographed.slice(0, 4), [photographed]);

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src={CAMPAIGN.hero} alt="Nigerian woman in a burgundy cowl midi, the STYLESORT first drop" />
          <span className="hero-caption">Adaeze Cowl Midi · Enugu</span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Enugu, Nigeria · Shipping nationwide</p>
          <h1>Find It.<br />Sort It.<br /><em>Wear It.</em></h1>
          <p className="lede">Fashion that fits your style, size and budget.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/women">Shop Women</Link>
            <Link className="btn btn-ink" href="/men">Shop Men</Link>
            <Link className="btn btn-line" href="/occasion">Shop by Occasion</Link>
            <Link className="btn btn-line" href="/budget/under-20k">Shop Under ₦20K</Link>
          </div>
          <p className="hero-note">Your style. Your size. Your budget. Your choice.</p>
        </div>
      </section>
      <PluginSlot name="home-after-hero" />

      <div className="wrap trust" aria-label="Why shoppers trust STYLESORT">
        <span><b>Verified</b> sellers</span>
        <span><b>7-day</b> returns</span>
        <span><b>36 states</b></span>
        <span><b>Transfer</b> or card</span>
        <span><b>WhatsApp</b> support</span>
      </div>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="kicker">01 — Shop the edit</p>
            <h2>Start where you are.</h2>
          </div>
        </div>
        <div className="rail">
          {[
            ["/women", "Women", CAMPAIGN.hero],
            ["/men", "Men", CAMPAIGN.men],
            ["/occasion/wedding-guest", "Wedding", CAMPAIGN.wedding],
            ["/occasion/church", "Church", CAMPAIGN.church],
            ["/category/native-wear", "Native", CAMPAIGN.native],
            ["/budget/under-20k", "Under ₦20K", CAMPAIGN.street],
            ["/category/shoes", "Shoes", CAMPAIGN.shoes],
            ["/category/bags", "Bags", CAMPAIGN.bags],
          ].map(([href, label, img]) => (
            <Link key={label} href={href} className="tile">
              <img src={img} alt="" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="kicker">02 — New arrivals</p>
            <h2>Just landed.</h2>
            <p>From Independence Layout ateliers and Lagos studios, sized through XXXL.</p>
          </div>
          <Link href="/new">Shop new</Link>
        </div>
        <div className="grid">
          {(newest.length ? newest : heroPieces).slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} eager={i < 2} />)}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="kicker">03 — Shop by budget</p>
            <h2>Name the number.</h2>
          </div>
          <Link href="/budget">All budgets</Link>
        </div>
        <div className="budget-row">
          {BUDGETS.map((b) => (
            <Link key={b.slug} href={`/budget/${b.slug}`} className="budget-card">
              <strong>{b.label}</strong>
              <span>{b.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="manifesto" aria-label="Brand promise">
        <p>Your style.</p>
        <p>Your size.</p>
        <p>Your budget.</p>
        <p>Your choice.</p>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="kicker">04 — Trending now</p>
            <h2>What Enugu is wearing.</h2>
          </div>
          <Link href="/shop?sort=popular">See all</Link>
        </div>
        <ProductRail items={trending} />
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="kicker">05 — Occasion</p>
            <h2>Dress for the day you actually have.</h2>
          </div>
          <Link href="/occasion">All occasions</Link>
        </div>
        <div className="mosaic">
          {OCCASION_PAGES.slice(0, 5).map((o) => (
            <Link key={o.slug} href={`/occasion/${o.slug}`}>
              <img src={o.image} alt="" />
              <span>{o.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="split">
          <img src={CAMPAIGN.date} alt="Date night in a black satin cami" />
          <div>
            <p className="kicker">Complete the look</p>
            <h2>Stop hunting piece by piece.</h2>
            <p className="lede">A shirt should come with the trousers, the shoe and the belt. Shop full outfits, or let Build My Outfit stay inside your budget.</p>
            <div className="hero-actions">
              <Link className="btn btn-ink" href="/looks">Shop complete looks</Link>
              <Link className="btn btn-line" href="/build">Build my outfit</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="kicker">06 — This week</p>
            <h2>Promotions, not noise.</h2>
          </div>
        </div>
        <div className="banner-grid">
          <Link href="/new" className="banner dark"><span>First Drop</span><strong>Enugu is open.</strong></Link>
          <Link href="/new" className="banner"><span>New arrivals</span><strong>Just in.</strong></Link>
          <Link href="/deals" className="banner wine"><span>Weekend deals</span><strong>Prices cut, quality not.</strong></Link>
          <Link href="/delivery" className="banner"><span>Delivery</span><strong>Free over ₦50,000.</strong></Link>
          <Link href="/budget/under-20k" className="banner"><span>Under ₦20K</span><strong>The weekly wardrobe.</strong></Link>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="kicker">07 — Best sellers</p>
            <h2>Loved by shoppers.</h2>
            <p>Verified purchases from people who had the piece delivered, not just admired.</p>
          </div>
          <Link href="/deals">Shop deals</Link>
        </div>
        <ProductRail items={best.length ? best : under20} />
      </section>

      <section className="section wrap">
        <div className="quote-grid">
          <article className="quote">
            <p>“I wore the wine aso-oke to an introduction in Onitsha. Three people asked for the link before the rice was served.”</p>
            <footer>Amaka O. · Onitsha · Verified purchase</footer>
          </article>
          <article className="quote">
            <p>“The pencil dress survived an 8am in VI and a 7pm in GRA. That is the whole brief.”</p>
            <footer>Chioma E. · Enugu · Verified purchase</footer>
          </article>
          <div className="ugc">
            <img src={CAMPAIGN.ugc} alt="Customer in a coral puff-sleeve dress on a balcony" />
            <img src={CAMPAIGN.street} alt="Shopper in a butter yellow dress on a residential street" />
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="split">
          <div>
            <p className="kicker">Men’s weekend</p>
            <h2>Polo, chino, done.</h2>
            <p className="lede">New Haven on Friday. A thanksgiving on Sunday. The same man, two honest outfits.</p>
            <Link className="btn btn-ink" href="/collections/mens-weekend">Shop men’s weekend</Link>
          </div>
          <img src={CAMPAIGN.men} alt="Man in an ivory embroidered native shirt" />
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="kicker">Journal</p>
            <h2>Wear it with a plan.</h2>
          </div>
          <Link href="/journal">All stories</Link>
        </div>
        <div className="journal">
          {articles.slice(0, 3).map((a) => (
            <Link key={a.slug} href={`/journal/${a.slug}`}>
              <img src={a.image} alt="" />
              <small>{a.category} · {a.read}</small>
              <h3>{a.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 28 }}>
        <div className="seller-cta">
          <div>
            <p className="kicker">STYLESORT Seller</p>
            <h2>Your boutique, in front of the right people.</h2>
            <p>Designers, thrift sellers, Aba shoemakers, bag makers, native houses. A storefront, discovery, and marketing that does not require you to live on Instagram stories.</p>
          </div>
          <Link className="btn btn-primary" href="/sell">Start selling</Link>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 28 }}>
        <div className="insider-band">
          <div>
            <p className="kicker">Insider</p>
            <h2>Early access. Birthday offers. Drops before the timeline.</h2>
          </div>
          <Link className="btn btn-ink" href="/insider">Join Insider</Link>
        </div>
      </section>

      <PluginSlot name="home-before-footer" />
      <section className="wrap" style={{ paddingBottom: 48 }}>
        <form
          className="newsletter"
          onSubmit={(e) => {
            e.preventDefault();
            if (!contact.trim()) return;
            joinNewsletter(contact.trim(), wa);
            setContact("");
          }}
        >
          <div>
            <p className="kicker">First access</p>
            <h2>Get first access to new drops, deals and trending styles.</h2>
          </div>
          <div className="form-grid">
            <input className="input" required placeholder="Email or WhatsApp number" value={contact} onChange={(e) => setContact(e.target.value)} aria-label="Email or WhatsApp number" />
            <label className="check"><input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} /> Send it on WhatsApp</label>
            <button className="btn btn-primary" type="submit">Join the list</button>
            <a className="muted" href={waLink("Hello STYLESORT, add me to new drops.")}>Or message us directly</a>
          </div>
        </form>
      </section>
    </>
  );
}
