"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BRAND, STATES, naira, waLink } from "@/lib/brand";
import { deliveryQuote, priceCoupon } from "@/lib/catalog";
import type { Address, CartLine } from "@/lib/types";
import { PluginSlot } from "./Plugins";
import { useStore } from "@/lib/store";

const STEPS = ["Contact", "Address", "Delivery", "Payment", "Review"];

export default function CheckoutFlow({ buyNow = false }: { buyNow?: boolean }) {
  const router = useRouter();
  const store = useStore();
  const [storedNow, setStoredNow] = useState<CartLine[] | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (!buyNow) return;
    try {
      setStoredNow(JSON.parse(sessionStorage.getItem("stylesort.buynow") || "null"));
    } catch {
      setStoredNow(null);
    }
  }, [buyNow]);
  const lines: CartLine[] = buyNow ? store.buyNow || storedNow || [] : store.cart;
  const detailed = lines.map((line) => ({ line, product: store.products.find((p) => p.id === line.productId) })).filter((x) => x.product);
  const subtotal = detailed.reduce((s, x) => s + x.product!.price * x.line.qty, 0);
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ name: store.user?.name || "", email: store.user?.email || "", phone: store.user?.phone || "", create: false, password: "" });
  const [address, setAddress] = useState<Address>(store.user?.addresses[0] || { id: "addr", label: "Home", name: "", phone: "", line1: "", city: "Enugu", state: "Enugu", area: "", landmark: "" });
  const [method, setMethod] = useState<"standard" | "express" | "pickup">("standard");
  const [pay, setPay] = useState("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [code, setCode] = useState(store.coupon || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [useCredit, setUseCredit] = useState(false);

  const quote = deliveryQuote(address.state, subtotal, method);
  const deliveryFee = quote.fee ?? 0;
  const firstOrder = store.orders.length === 0;
  const applied = priceCoupon(code, { subtotal, state: address.state, firstOrder, insider: !!store.user?.insider, deliveryFee });
  const credit = useCredit ? Math.min(store.user?.referralCredits || 0, subtotal) : 0;
  const discount = (applied.ok ? applied.discount : 0) + credit;
  const deliveryOff = applied.ok ? applied.deliveryOff : 0;
  const doorFee = pay === "pod" ? 500 : 0;
  const total = Math.max(0, subtotal - discount + Math.max(0, deliveryFee - deliveryOff) + doorFee);

  const summary = useMemo(() => (
    <aside className="panel">
      <strong>Order</strong>
      {detailed.map(({ line, product }) => (
        <div className="between" key={line.lineId}>
          <span>{product!.name} · {line.size} · ×{line.qty}</span>
          <span>{naira(product!.price * line.qty)}</span>
        </div>
      ))}
      <div className="between"><span>Subtotal</span><span>{naira(subtotal)}</span></div>
      <div className="between"><span>Delivery</span><span>{deliveryFee - deliveryOff <= 0 ? "Free" : naira(deliveryFee - deliveryOff)}</span></div>
      {doorFee > 0 && <div className="between"><span>Pay on delivery</span><span>{naira(doorFee)}</span></div>}
      {discount > 0 && <div className="between"><span>Discount</span><span>-{naira(discount)}</span></div>}
      <div className="between"><strong>Total</strong><strong>{naira(total)}</strong></div>
      <p className="muted">{quote.label} · {quote.estimate}</p>
    </aside>
  ), [detailed, subtotal, deliveryFee, deliveryOff, discount, total, quote]);

  if (!store.ready || (buyNow && !mounted)) return <div className="wrap page-hero"><p>Loading checkout…</p></div>;
  if (!detailed.length) {
    return <div className="wrap page-hero"><h1>Your bag is empty.</h1><Link className="btn btn-ink" href="/women">Shop women</Link></div>;
  }

  function next() {
    setError("");
    if (step === 0) {
      if (contact.name.trim().length < 2) return setError("Add the name for the order.");
      if (!/^\S+@\S+\.\S+$/.test(contact.email)) return setError("Add a real email so we can send the receipt.");
      if (!/^(?:\+234|234|0)[789][01]\d{8}$/.test(contact.phone.replace(/\s/g, ""))) return setError("Use a Nigerian phone number, like 0806 255 9689.");
    }
    if (step === 1) {
      if (address.line1.trim().length < 4 || !address.city.trim()) return setError("Add a street and city so the rider can find you.");
    }
    if (step === 2 && quote.fee === null) return setError("Studio pickup is only in Enugu. Choose delivery, or switch the state.");
    if (step === 3 && pay === "card") {
      const num = card.number.replace(/\s/g, "");
      if (num.length < 16 || card.cvv.length < 3 || !card.expiry.includes("/")) return setError("Check the card number, expiry and CVV.");
    }
    setStep((s) => Math.min(4, s + 1));
  }

  async function payNow() {
    setBusy(true);
    setError("");
    if (contact.create && contact.password.length >= 6 && !store.user) {
      store.register({ name: contact.name, email: contact.email, phone: contact.phone, password: contact.password });
    }
    await new Promise((r) => setTimeout(r, pay === "card" ? 900 : 400));
    const status = pay === "transfer" || pay === "pod" || pay === "ussd" ? "pending" : "paid";
    const order = store.placeOrder({
      items: detailed.map(({ line, product }) => ({
        productId: product!.id, name: product!.name, image: product!.shot || product!.images[0], sellerId: product!.sellerId,
        size: line.size, color: line.color, qty: line.qty, price: product!.price,
      })),
      contact: { name: contact.name, email: contact.email, phone: contact.phone },
      address: { ...address, name: address.name || contact.name, phone: address.phone || contact.phone },
      delivery: { method: quote.label, fee: Math.max(0, deliveryFee - deliveryOff) + doorFee, estimate: quote.estimate },
      payment: { method: pay, status, last4: pay === "card" ? card.number.replace(/\s/g, "").slice(-4) : undefined },
      subtotal, discount, coupon: applied.ok ? code.toUpperCase() : undefined, total,
    }, lines);
    if (useCredit && store.user) store.updateUser({ referralCredits: Math.max(0, store.user.referralCredits - credit) });
    router.push(`/order/${order.id}`);
  }

  return (
    <div className="wrap">
      <header className="page-hero">
        <p className="kicker">Checkout</p>
        <h1>Almost yours.</h1>
      </header>
      <div className="steps" aria-label="Checkout steps">
        {STEPS.map((s, i) => <span key={s} className={i === step ? "on" : ""}>{i + 1}. {s}</span>)}
      </div>
      <div className="checkout">
        <div className="panel">
          {step === 0 && (
            <div className="form-grid">
              <h2>Contact</h2>
              <label className="lbl"><span>Full name</span><input className="input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></label>
              <label className="lbl"><span>Email</span><input className="input" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label>
              <label className="lbl"><span>Phone</span><input className="input" inputMode="tel" placeholder="080…" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></label>
              {!store.user && <label className="check"><input type="checkbox" checked={contact.create} onChange={(e) => setContact({ ...contact, create: e.target.checked })} /> Create an account with this order</label>}
              {contact.create && <input className="input" type="password" placeholder="Password, 6 characters or more" value={contact.password} onChange={(e) => setContact({ ...contact, password: e.target.value })} />}
            </div>
          )}
          {step === 1 && (
            <div className="form-grid">
              <h2>Delivery address</h2>
              <label className="lbl"><span>Street</span><input className="input" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} placeholder="14 Ogui Road" /></label>
              <div className="form-grid two">
                <label className="lbl"><span>Area</span><input className="input" value={address.area || ""} onChange={(e) => setAddress({ ...address, area: e.target.value })} placeholder="Independence Layout" /></label>
                <label className="lbl"><span>City</span><input className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></label>
              </div>
              <label className="lbl"><span>State</span>
                <select className="input" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="lbl"><span>Landmark</span><input className="input" value={address.landmark || ""} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} placeholder="Opposite the filling station" /></label>
            </div>
          )}
          {step === 2 && (
            <div className="form-grid">
              <h2>Delivery method</h2>
              {(["standard", "express", "pickup"] as const).map((id) => {
                const q = deliveryQuote(address.state, subtotal, id);
                const disabled = q.fee === null;
                return (
                  <button key={id} className={`pay-option ${method === id ? "on" : ""}`} disabled={disabled} onClick={() => setMethod(id)}>
                    <strong>{q.label}</strong>
                    <span>{q.estimate}</span>
                    <span>{q.fee === null ? q.note : q.fee === 0 ? "Free" : naira(q.fee)}</span>
                  </button>
                );
              })}
              {quote.note && <p className="muted">{quote.note}</p>}
            </div>
          )}
          {step === 3 && (
            <div className="form-grid">
              <h2>Payment</h2>
              <p className="muted">{quote.label} · {quote.estimate} · {deliveryFee - deliveryOff <= 0 ? "Free delivery" : naira(deliveryFee - deliveryOff)}. This is the fee before you pay.</p>
              {[
                ["card", "Debit card", "Visa, Mastercard, Verve"],
                ["transfer", "Bank transfer", "Access Bank · Stylesort Retail Ltd · 1452087633"],
                ["opay", "OPay", "Pay from your OPay wallet"],
                ["palmpay", "PalmPay", "Pay from your PalmPay wallet"],
                ["ussd", "USSD", "Dial from any bank"],
                ["pod", "Pay on delivery", address.state === "Enugu" ? "Enugu only · +₦500 on the door" : "Available in Enugu only"],
              ].map(([id, label, hint]) => (
                <button key={id} className={`pay-option ${pay === id ? "on" : ""}`} onClick={() => setPay(id)} disabled={id === "pod" && address.state !== "Enugu"}>
                  <strong>{label}</strong><span className="muted">{hint}</span>
                </button>
              ))}
              {pay === "card" && (
                <div className="form-grid">
                  <input className="input" inputMode="numeric" placeholder="Card number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} aria-label="Card number" />
                  <div className="form-grid two">
                    <input className="input" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} aria-label="Expiry" />
                    <input className="input" placeholder="CVV" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} aria-label="CVV" />
                  </div>
                  <input className="input" placeholder="Name on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} aria-label="Name on card" />
                  <p className="muted">Card details are used to confirm this order and are not stored in full.</p>
                </div>
              )}
              {pay === "transfer" && (
                <div>
                  <p>Transfer {naira(total)} to Access Bank, Stylesort Retail Ltd, 1452087633. Use your phone number as narration. We start the order when you confirm.</p>
                </div>
              )}
              {pay === "ussd" && <p>Dial your bank USSD and pay {naira(total)} to Stylesort Retail Ltd. Then confirm below.</p>}
              {(pay === "opay" || pay === "palmpay") && <p>We will send a payment request to {contact.phone || "your number"} after you confirm.</p>}
            </div>
          )}
          {step === 4 && (
            <div className="form-grid">
              <h2>Review</h2>
              <p>{contact.name} · {contact.phone} · {contact.email}</p>
              <p>{address.line1}, {address.area} {address.city}, {address.state}. {address.landmark}</p>
              <p>{quote.label} · {quote.estimate} · {deliveryFee - deliveryOff <= 0 ? "Free delivery" : naira(deliveryFee - deliveryOff)}</p>
              <p>Payment: {pay} · {pay === "transfer" || pay === "pod" || pay === "ussd" ? "Pending confirmation" : "Pay now"}</p>
              <div className="row">
                <input className="input" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Discount code" />
                <button className="btn btn-line" type="button" onClick={() => { store.setCoupon(code); store.toast(applied.ok ? applied.message : applied.message); }}>Apply</button>
              </div>
              {code && <p className={applied.ok ? "ok" : "error"}>{applied.message}</p>}
              {!!store.user?.referralCredits && (
                <label className="check"><input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} /> Use {naira(store.user.referralCredits)} referral credit</label>
              )}
              <p className="muted">You will see the delivery fee before you pay. That is this screen.</p>
            </div>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          <div className="row">
            {step > 0 && <button className="btn btn-line" onClick={() => setStep((s) => s - 1)}>Back</button>}
            {step < 4 && <button className="btn btn-primary" onClick={next}>Continue</button>}
            {step === 4 && <button className="btn btn-primary" disabled={busy} onClick={payNow}>{busy ? "Confirming…" : `Pay ${naira(total)}`}</button>}
          </div>
          <p className="muted">Questions? <a href={waLink("Hello STYLESORT, I need help checking out.")}>WhatsApp {BRAND.phoneDisplay}</a></p>
        </div>
        <div>
          <PluginSlot name="checkout-aside" />
          {summary}
        </div>
      </div>
    </div>
  );
}

export function OrderConfirm({ id }: { id: string }) {
  const store = useStore();
  const order = store.orders.find((o) => o.id === id);
  if (!store.ready) return <div className="wrap page-hero"><p>Loading your order…</p></div>;
  if (!order) return <div className="wrap page-hero"><h1>We cannot find that order on this device.</h1><Link href="/track">Track with your order number</Link></div>;
  return (
    <div className="wrap confirm">
      <header className="page-hero">
        <p className="kicker">Order confirmed</p>
        <h1>{order.number}</h1>
        <p>{order.payment.status === "paid" ? "Payment received. We are preparing your order." : "Payment pending. We will start as soon as it clears."}</p>
      </header>
      <div className="panel">
        {order.items.map((item: { productId: string; name: string; qty: number; size: string; color: string; price: number }) => (
          <div className="between" key={item.productId + item.size}><span>{item.name} · {item.color} · {item.size} · ×{item.qty}</span><span>{naira(item.price * item.qty)}</span></div>
        ))}
        <div className="between"><strong>Total</strong><strong>{naira(order.total)}</strong></div>
        <p>Deliver to {order.address.line1}, {order.address.city}, {order.address.state}</p>
        <p>{order.delivery.method} · {order.delivery.estimate} · {order.delivery.fee ? naira(order.delivery.fee) : "Free delivery"}</p>
        <p>Payment: {order.payment.method} · {order.payment.status}{order.payment.last4 ? ` · card ending ${order.payment.last4}` : ""}</p>
      </div>
      <div className="row">
        <a className="btn btn-primary" href={waLink(`Hello STYLESORT, my order number is ${order.number}.`)}>WhatsApp support</a>
        <Link className="btn btn-line" href="/shop">Keep shopping</Link>
        <button className="btn btn-line" onClick={() => window.print()}>Print receipt</button>
      </div>
    </div>
  );
}
