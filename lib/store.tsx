"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as seedProducts } from "./products";
import { sellers } from "./sellers";
import { reviewsFor } from "./reviews";
import type { Address, AnalyticsEvent, CartLine, Order, Product, ProductOverride, Review, SellerApplication, User } from "./types";

const KEY = "stylesort.v1";

interface Bag {
  cart: CartLine[];
  cartAt: number;
  wish: string[];
  users: User[];
  session: string | null;
  orders: Order[];
  recent: string[];
  reviews: Review[];
  events: AnalyticsEvent[];
  coupon: string;
  ref: string;
  overrides: Record<string, ProductOverride>;
  added: Product[];
  apps: SellerApplication[];
  newsletter: { contact: string; whatsapp: boolean }[];
  seenDrop: boolean;
  helpful: Record<string, number>;
}

const empty = (): Bag => ({
  cart: [],
  cartAt: 0,
  wish: [],
  users: [],
  session: null,
  orders: [],
  recent: [],
  reviews: [],
  events: [],
  coupon: "",
  ref: "",
  overrides: {},
  added: [],
  apps: [],
  newsletter: [],
  seenDrop: false,
  helpful: {},
});

function load(): Bag {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save(b: Bag) {
  localStorage.setItem(KEY, JSON.stringify(b));
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

interface StoreValue {
  ready: boolean;
  products: Product[];
  sellers: typeof sellers;
  cart: CartLine[];
  cartAt: number;
  wish: string[];
  user: User | null;
  orders: Order[];
  recent: Product[];
  coupon: string;
  refCode: string;
  apps: SellerApplication[];
  events: AnalyticsEvent[];
  seenDrop: boolean;
  cartOpen: boolean;
  searchOpen: boolean;
  toasts: { id: string; message: string }[];
  buyNow: CartLine[] | null;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  toast: (message: string) => void;
  dismissDrop: () => void;
  addToCart: (productId: string, opts: { size: string; color: string; qty?: number }) => boolean;
  buyNowItem: (productId: string, opts: { size: string; color: string; qty?: number }) => void;
  clearBuyNow: () => void;
  updateQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  toggleWish: (productId: string) => void;
  wished: (productId: string) => boolean;
  viewProduct: (productId: string) => void;
  setCoupon: (code: string) => void;
  register: (data: { name: string; email: string; phone: string; password: string }) => { ok: boolean; message: string };
  login: (email: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  saveAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  joinInsider: () => void;
  joinNewsletter: (contact: string, whatsapp: boolean) => void;
  submitApp: (app: Omit<SellerApplication, "id" | "createdAt">) => void;
  addReview: (review: Omit<Review, "id" | "date" | "verified">) => void;
  reviewsForProduct: (productId: string) => Review[];
  markHelpful: (id: string) => void;
  placeOrder: (input: Omit<Order, "id" | "number" | "createdAt" | "userId">, lines: CartLine[]) => Order;
  track: (name: string, props?: Record<string, unknown>) => void;
  updateProduct: (id: string, patch: ProductOverride) => void;
  addProduct: (product: Product) => void;
  refreshCatalog: () => Promise<void>;
  captureRef: (code: string) => void;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [bag, setBag] = useState<Bag>(empty);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const [buyNow, setBuyNow] = useState<CartLine[] | null>(null);
  const [remote, setRemote] = useState<Product[] | null>(null);

  useEffect(() => {
    const b = load();
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) b.ref = ref.toUpperCase();
    setBag(b);
    setReady(true);
    if (ref) {
      const event = { id: uid("ev"), name: "referral_visit", props: { code: ref }, at: new Date().toISOString() };
      b.events = [...b.events, event].slice(-800);
      save(b);
    }
  }, []);

  useEffect(() => {
    if (ready) save(bag);
  }, [bag, ready]);

  const localProducts = useMemo(() => {
    const merged = [...seedProducts, ...bag.added].map((p) => {
      const o = bag.overrides[p.id];
      if (!o) return p;
      const next: Product = { ...p, ...o, compareAt: o.compareAt === null ? undefined : o.compareAt ?? p.compareAt };
      return next;
    });
    return merged.filter((p) => !p.hidden);
  }, [bag.added, bag.overrides]);
  const products = remote ?? localProducts;

  async function refreshCatalog() {
    const res = await fetch("/api/catalog", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.products)) setRemote(data.products);
  }

  useEffect(() => {
    refreshCatalog().catch(() => undefined);
  }, []);

  const user = bag.users.find((u) => u.id === bag.session) || null;

  function patch(fn: (b: Bag) => Bag) {
    setBag((b) => fn(b));
  }

  function toast(message: string) {
    const id = uid("t");
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }

  function track(name: string, props: Record<string, unknown> = {}) {
    const event: AnalyticsEvent = { id: uid("ev"), name, props, at: new Date().toISOString() };
    patch((b) => ({ ...b, events: [...b.events, event].slice(-800) }));
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch(() => undefined);
  }

  function productOf(id: string) {
    return products.find((p) => p.id === id);
  }

  function addToCart(productId: string, opts: { size: string; color: string; qty?: number }) {
    const product = productOf(productId);
    if (!product || product.inventory <= 0) {
      toast("That piece is sold out.");
      return false;
    }
    const qty = opts.qty || 1;
    const lineId = `${productId}__${opts.size}__${opts.color}`;
    let ok = true;
    patch((b) => {
      const existing = b.cart.find((l) => l.lineId === lineId);
      const nextQty = (existing?.qty || 0) + qty;
      if (nextQty > product.inventory) {
        ok = false;
        return b;
      }
      const cart = existing
        ? b.cart.map((l) => (l.lineId === lineId ? { ...l, qty: nextQty } : l))
        : [...b.cart, { lineId, productId, size: opts.size, color: opts.color, qty }];
      return { ...b, cart, cartAt: Date.now() };
    });
    if (!ok) {
      toast("That is all we have in this size.");
      return false;
    }
    track("add_to_cart", { productId, name: product.name, price: product.price, size: opts.size, color: opts.color, qty, sellerId: product.sellerId });
    toast("Added to bag");
    setCartOpen(true);
    return true;
  }

  function buyNowItem(productId: string, opts: { size: string; color: string; qty?: number }) {
    const product = productOf(productId);
    if (!product || product.inventory <= 0) {
      toast("That piece is sold out.");
      return;
    }
    const line = { lineId: `${productId}__${opts.size}__${opts.color}`, productId, size: opts.size, color: opts.color, qty: opts.qty || 1 };
    setBuyNow([line]);
    if (typeof window !== "undefined") sessionStorage.setItem("stylesort.buynow", JSON.stringify([line]));
    track("checkout_started", { mode: "buy_now", productId, value: product.price * line.qty });
    window.location.href = "/checkout?now=1";
  }

  const value: StoreValue = {
    ready,
    products,
    sellers,
    cart: bag.cart,
    cartAt: bag.cartAt,
    wish: bag.wish,
    user,
    orders: bag.orders.filter((o) => !user || o.userId === user.id || o.contact.email === user.email),
    recent: bag.recent.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
    coupon: bag.coupon,
    refCode: bag.ref,
    apps: bag.apps,
    events: bag.events,
    seenDrop: bag.seenDrop,
    cartOpen,
    searchOpen,
    toasts,
    buyNow,
    setCartOpen,
    setSearchOpen,
    toast,
    dismissDrop: () => patch((b) => ({ ...b, seenDrop: true })),
    addToCart,
    buyNowItem,
    clearBuyNow: () => setBuyNow(null),
    updateQty: (lineId, qty) => {
      patch((b) => ({
        ...b,
        cartAt: Date.now(),
        cart: qty <= 0 ? b.cart.filter((l) => l.lineId !== lineId) : b.cart.map((l) => (l.lineId === lineId ? { ...l, qty } : l)),
      }));
    },
    removeLine: (lineId) => patch((b) => ({ ...b, cart: b.cart.filter((l) => l.lineId !== lineId), cartAt: Date.now() })),
    toggleWish: (productId) => {
      const product = productOf(productId);
      let added = false;
      patch((b) => {
        added = !b.wish.includes(productId);
        return { ...b, wish: added ? [productId, ...b.wish] : b.wish.filter((id) => id !== productId) };
      });
      track("wishlist", { productId, action: added ? "add" : "remove", name: product?.name });
      toast(added ? "Saved to wishlist" : "Removed from wishlist");
    },
    wished: (productId) => bag.wish.includes(productId),
    viewProduct: (productId) => {
      patch((b) => ({ ...b, recent: [productId, ...b.recent.filter((id) => id !== productId)].slice(0, 16) }));
      const product = productOf(productId);
      if (product) track("product_view", { productId, name: product.name, price: product.price, sellerId: product.sellerId, category: product.category });
    },
    setCoupon: (code) => patch((b) => ({ ...b, coupon: code.toUpperCase() })),
    register: (data) => {
      if (bag.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false, message: "An account with that email already exists. Log in instead." };
      }
      const userNew: User = {
        id: uid("usr"),
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
        addresses: [],
        sizes: {},
        stylePreferences: [],
        insider: false,
        referralCode: `SS-${data.name.split(" ")[0].replace(/[^a-z]/gi, "").slice(0, 8).toUpperCase() || "STYLE"}${Math.floor(10 + Math.random() * 89)}`,
        referralCredits: 0,
        referredBy: bag.ref || undefined,
        joinedAt: new Date().toISOString(),
      };
      patch((b) => ({ ...b, users: [...b.users, userNew], session: userNew.id }));
      toast("Welcome to STYLESORT");
      return { ok: true, message: "Account created." };
    },
    login: (email, password) => {
      const found = bag.users.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
      if (!found) return { ok: false, message: "Email or password is not right." };
      patch((b) => ({ ...b, session: found.id }));
      toast(`Welcome back, ${found.name.split(" ")[0]}`);
      return { ok: true, message: "Logged in." };
    },
    logout: () => patch((b) => ({ ...b, session: null })),
    updateUser: (partial) => {
      if (!user) return;
      patch((b) => ({ ...b, users: b.users.map((u) => (u.id === user.id ? { ...u, ...partial } : u)) }));
    },
    saveAddress: (address) => {
      if (!user) return;
      patch((b) => ({
        ...b,
        users: b.users.map((u) => {
          if (u.id !== user.id) return u;
          const exists = u.addresses.some((a) => a.id === address.id);
          return { ...u, addresses: exists ? u.addresses.map((a) => (a.id === address.id ? address : a)) : [...u.addresses, address] };
        }),
      }));
    },
    removeAddress: (id) => {
      if (!user) return;
      patch((b) => ({
        ...b,
        users: b.users.map((u) => (u.id === user.id ? { ...u, addresses: u.addresses.filter((a) => a.id !== id) } : u)),
      }));
    },
    joinInsider: () => {
      if (!user) return;
      patch((b) => ({
        ...b,
        users: b.users.map((u) => (u.id === user.id ? { ...u, insider: true, insiderSince: u.insiderSince || new Date().toISOString() } : u)),
      }));
      toast("You are in. Welcome to Insider.");
    },
    joinNewsletter: (contact, whatsapp) => {
      patch((b) => ({ ...b, newsletter: [...b.newsletter, { contact, whatsapp }] }));
      track("newsletter_signup", { contact, whatsapp });
      toast(whatsapp ? "You are on the WhatsApp list." : "You are on the list.");
    },
    submitApp: (app) => {
      const full: SellerApplication = { ...app, id: uid("app"), createdAt: new Date().toISOString() };
      patch((b) => ({ ...b, apps: [full, ...b.apps] }));
      fetch("/api/sellers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(full) }).catch(() => undefined);
      toast("Application received");
    },
    addReview: (review) => {
      const full: Review = { ...review, id: uid("rev"), date: new Date().toISOString().slice(0, 10), verified: true };
      patch((b) => ({ ...b, reviews: [full, ...b.reviews] }));
      toast("Review published");
    },
    reviewsForProduct: (productId) => {
      const product = productOf(productId);
      const seed = product ? reviewsFor(product) : [];
      const extra = bag.reviews.filter((r) => r.productId === productId);
      return [...extra, ...seed].map((r) => ({ ...r, helpful: (r.helpful || 0) + (bag.helpful[r.id] || 0) }));
    },
    markHelpful: (id) => patch((b) => ({ ...b, helpful: { ...b.helpful, [id]: (b.helpful[id] || 0) + 1 } })),
    placeOrder: (input, lines) => {
      const order: Order = {
        ...input,
        id: uid("ord"),
        number: `SS-ENU-${Math.floor(10000 + Math.random() * 89999)}`,
        createdAt: new Date().toISOString(),
        userId: user?.id,
        referral: bag.ref || undefined,
      };
      const overrides = { ...bag.overrides };
      lines.forEach((line) => {
        const product = productOf(line.productId);
        if (!product) return;
        const current = overrides[line.productId]?.inventory ?? product.inventory;
        overrides[line.productId] = { ...overrides[line.productId], inventory: Math.max(0, current - line.qty) };
      });
      let users = bag.users;
      if (bag.ref && user && !bag.orders.some((o) => o.userId === user.id)) {
        users = users.map((u) => (u.referralCode === bag.ref && u.id !== user.id ? { ...u, referralCredits: u.referralCredits + 2000 } : u));
        if (user.referredBy) {
          users = users.map((u) => (u.id === user.id ? { ...u, referralCredits: u.referralCredits + 1000 } : u));
        }
        track("referral_conversion", { code: bag.ref, order: order.number, value: order.total });
      }
      if (order.coupon) track("coupon_use", { code: order.coupon, order: order.number, discount: order.discount });
      track(order.payment.status === "paid" ? "payment_completed" : "payment_pending", {
        order: order.number,
        method: order.payment.method,
        total: order.total,
        status: order.payment.status,
      });
      lines.forEach((line) => {
        const product = productOf(line.productId);
        if (!product) return;
        track("product_purchase", { productId: product.id, name: product.name, qty: line.qty, price: product.price, sellerId: product.sellerId, order: order.number });
        track("seller_conversion", { sellerId: product.sellerId, productId: product.id, value: product.price * line.qty, order: order.number });
      });
      const purchased = new Set(lines.map((l) => l.lineId));
      patch((b) => ({
        ...b,
        orders: [order, ...b.orders],
        overrides,
        users,
        coupon: "",
        cart: b.cart.filter((l) => !purchased.has(l.lineId)),
      }));
      setBuyNow(null);
      fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) })
        .then(() => refreshCatalog())
        .catch(() => undefined);
      return order;
    },
    track,
    updateProduct: (id, patchOv) => patch((b) => ({ ...b, overrides: { ...b.overrides, [id]: { ...b.overrides[id], ...patchOv } } })),
    addProduct: (product) => patch((b) => ({ ...b, added: [product, ...b.added] })),
    refreshCatalog,
    captureRef: (code) => patch((b) => ({ ...b, ref: code.toUpperCase() })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
