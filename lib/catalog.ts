import { BUDGETS, COLOR_FAMILIES, SOUTHEAST, naira } from "./brand";
import type { Category, Filters, Gender, Look, Occasion, Product, Seller, SortKey, Style } from "./types";

export function emptyFilters(partial: Partial<Filters> = {}): Filters {
  return {
    gender: "all",
    categories: [],
    sizes: [],
    colors: [],
    occasions: [],
    styles: [],
    locations: [],
    availability: "all",
    q: "",
    sort: "featured",
    ...partial,
  };
}

export function colorFamily(name: string) {
  const n = name.toLowerCase();
  for (const [family, names] of Object.entries(COLOR_FAMILIES)) {
    if (names.some((x) => n === x || n.includes(x))) return family;
  }
  return "Cream";
}

export function applyFilters(list: Product[], sellers: Seller[], f: Filters, text = "") {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  return list.filter((p) => {
    if (p.hidden) return false;
    if (f.gender !== "all" && p.gender !== f.gender) return false;
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.priceMin != null && p.price < f.priceMin) return false;
    if (f.priceMax != null && p.price > f.priceMax) return false;
    if (f.sizes.length) {
      const hit = f.sizes.some(
        (s) => p.sizes.includes(s) || p.ukSizes?.includes(s) || (s === "Plus Size" && p.plusSize)
      );
      if (!hit) return false;
    }
    if (f.colors.length) {
      const families = p.colors.map((c) => colorFamily(c.name));
      if (!f.colors.some((c) => families.includes(c))) return false;
    }
    if (f.occasions.length && !f.occasions.some((o) => p.occasions.includes(o as Occasion))) return false;
    if (f.styles.length && !f.styles.some((s) => p.styles.includes(s as Style))) return false;
    if (f.locations.length) {
      const seller = sellers.find((s) => s.id === p.sellerId);
      const blob = `${seller?.city || ""} ${seller?.state || ""}`.toLowerCase();
      if (!f.locations.some((l) => blob.includes(l.toLowerCase()) || (l === "Abuja" && blob.includes("fct")))) return false;
    }
    if (f.availability === "in" && p.inventory <= 0) return false;
    if (f.availability === "low" && !(p.inventory > 0 && p.inventory <= 4)) return false;
    if (f.flag && !p[f.flag]) return false;
    if (words.length) {
      const blob = `${p.name} ${p.tags.join(" ")} ${p.description} ${p.category}`.toLowerCase();
      if (!words.every((w) => blob.includes(w))) return false;
    }
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey) {
  const arr = [...list];
  arr.sort((a, b) => {
    const stock = (a.inventory <= 0 ? 1 : 0) - (b.inventory <= 0 ? 1 : 0);
    if (stock) return stock;
    switch (sort) {
      case "newest":
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      case "bestselling":
        return b.sales - a.sales;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case "popular":
        return b.popularity - a.popularity;
      default:
        return Number(!!b.shot) - Number(!!a.shot) || Number(b.featured) - Number(a.featured) || b.popularity - a.popularity;
    }
  });
  return arr;
}

const KEEP = ["agbada", "senator", "ankara", "polo", "sneaker", "sneakers", "kaftan", "isiagu", "adire", "gele", "loafer", "clutch", "tote", "hoop", "watch", "asooke", "aso-oke", "thrift"];

export interface ParsedQuery {
  filters: Filters;
  intent: "shop" | "look" | "build";
  budget?: number;
  understood: string[];
  text: string;
}

export function parseQuery(raw: string): ParsedQuery {
  const original = raw.trim();
  const q = original.toLowerCase().replace(/₦/g, " ").replace(/,/g, "").replace(/\s+/g, " ");
  const understood: string[] = [];
  const filters = emptyFilters({ q: original });

  const between = q.match(/\b(\d+)\s*k\s*(?:to|-|–)\s*(\d+)\s*k\b/);
  const underK = q.match(/\b(?:under|below|less than|upto|up to)\s*(\d+(?:\.\d+)?)\s*k\b/);
  const underN = q.match(/\b(?:under|below|less than)\s*(\d{4,7})\b/);
  const overK = q.match(/\b(?:over|above|more than)\s*(\d+(?:\.\d+)?)\s*k\b/);
  if (between) {
    filters.priceMin = Number(between[1]) * 1000;
    filters.priceMax = Number(between[2]) * 1000;
    understood.push(`${naira(filters.priceMin)} – ${naira(filters.priceMax)}`);
  } else if (underK) {
    filters.priceMax = Number(underK[1]) * 1000;
    understood.push(`Under ${naira(filters.priceMax)}`);
  } else if (underN) {
    filters.priceMax = Number(underN[1]);
    understood.push(`Under ${naira(filters.priceMax)}`);
  } else if (overK) {
    filters.priceMin = Number(overK[1]) * 1000;
    understood.push(`Over ${naira(filters.priceMin)}`);
  }

  if (/\b(men's|mens|men|male)\b/.test(q) && !/\bwomen/.test(q)) {
    filters.gender = "men";
    understood.push("Men");
  } else if (/\b(women's|womens|women|woman|ladies|lady)\b/.test(q)) {
    filters.gender = "women";
    understood.push("Women");
  } else if (/\b(kids|children|child|girls|boys)\b/.test(q)) {
    filters.gender = "kids";
    understood.push("Kids");
  }

  const sizeNum = q.match(/\b(?:size|uk)\s*(\d{1,2})\b/);
  if (sizeNum) {
    const uk = sizeNum[1];
    const map: Record<string, string> = { "6": "XS", "8": "S", "10": "M", "12": "L", "14": "XL", "16": "XXL", "18": "XXXL", "20": "XXXL" };
    if (map[uk] && Number(uk) <= 20 && Number(uk) >= 6 && !["37", "38", "39", "40", "41", "42", "43", "44", "45", "46"].includes(uk)) {
      filters.sizes = [map[uk]];
      if (Number(uk) >= 16) filters.sizes.push("Plus Size");
      understood.push(`UK ${uk} / ${map[uk]}`);
      if (filters.gender === "all") {
        filters.gender = "women";
        understood.push("Women");
      }
    } else {
      filters.sizes = [uk];
      understood.push(`Size ${uk}`);
    }
  } else if (/\bplus size\b/.test(q)) {
    filters.sizes = ["Plus Size", "XXL", "XXXL"];
    understood.push("Plus Size");
  } else {
    const word = q.match(/\b(?:size\s*)?(xxxl|xxl|xl|xs)\b/) || q.match(/\bsize\s*([sml])\b/);
    if (word) {
      filters.sizes = [word[1].toUpperCase()];
      understood.push(word[1].toUpperCase());
    }
  }

  const colorWords: Record<string, string> = {
    red: "Red", burgundy: "Red", wine: "Red", coral: "Red",
    black: "Black", white: "White", ivory: "White", cream: "Cream", nude: "Cream",
    blue: "Blue", navy: "Blue", indigo: "Blue", green: "Green", olive: "Green",
    brown: "Brown", camel: "Brown", tan: "Brown", yellow: "Yellow", butter: "Yellow",
    gold: "Gold", pink: "Pink", purple: "Pink", grey: "Grey", gray: "Grey",
    ankara: "Multicolour",
  };
  for (const [word, family] of Object.entries(colorWords)) {
    if (new RegExp(`\\b${word}\\b`).test(q) && !filters.colors.includes(family)) {
      filters.colors.push(family);
      understood.push(family);
    }
  }

  const occ: [RegExp, Occasion][] = [
    [/\b(wedding|owambe|introduction|aso-ebi|aso ebi)\b/, "Wedding"],
    [/\bbirthday\b/, "Birthday"],
    [/\b(date night|date)\b/, "Date"],
    [/\b(church|thanksgiving)\b/, "Church"],
    [/\b(office|workwear)\b/, "Office"],
    [/\binterview\b/, "Interview"],
    [/\b(graduation|convocation)\b/, "Graduation"],
    [/\bparty\b/, "Party"],
    [/\bdinner\b/, "Dinner"],
    [/\bbeach\b/, "Beach"],
    [/\btravel\b/, "Travel"],
    [/\bcasual\b/, "Casual"],
  ];
  for (const [re, name] of occ) {
    if (re.test(q)) {
      filters.occasions.push(name);
      understood.push(name);
    }
  }

  const cats: [RegExp, Category][] = [
    [/\b(two[-\s]?piece|co-?ord|coord|matching set)\b/, "Two-Piece Sets"],
    [/\b(dresses|dress|gown)\b/, "Dresses"],
    [/\b(t-?shirts|tees|tee)\b/, "T-shirts"],
    [/\b(polo)\b/, "Shirts"],
    [/\b(shirts|shirt)\b/, "Shirts"],
    [/\bjeans\b/, "Jeans"],
    [/\b(trousers|trouser|chinos|chino|pants)\b/, "Trousers"],
    [/\b(native|ankara|agbada|senator|isiagu|aso-?oke|adire|kaftan)\b/, "Native Wear"],
    [/\b(sneakers|sneaker|sandals|sandal|heels|heel|loafers|loafer|shoes|shoe)\b/, "Shoes"],
    [/\b(handbags|handbag|tote|clutch|bags|bag)\b/, "Bags"],
    [/\b(earrings|earring|watch|watches|sunglasses|belts|belt|scarf|accessories)\b/, "Accessories"],
    [/\b(tops|blouse|cami|bodysuit)\b/, "Tops"],
  ];
  for (const [re, name] of cats) {
    if (re.test(q) && !filters.categories.includes(name)) {
      filters.categories.push(name);
      understood.push(name);
    }
  }

  const locs: [RegExp, string][] = [
    [/\benugu\b/, "Enugu"],
    [/\blagos\b/, "Lagos"],
    [/\b(abuja|fct)\b/, "Abuja"],
    [/\bonitsha\b/, "Onitsha"],
    [/\baba\b/, "Aba"],
    [/\b(port harcourt|\bph\b)\b/, "Port Harcourt"],
  ];
  for (const [re, name] of locs) {
    if (re.test(q)) {
      filters.locations.push(name);
      understood.push(name);
    }
  }

  const keep = KEEP.filter((w) => q.includes(w));
  const text = keep.join(" ");

  const garment = filters.categories.length > 0;
  let intent: ParsedQuery["intent"] = "shop";
  if (/build my outfit/.test(q)) intent = "build";
  else if (/complete (outfit|look)|entire outfit|full outfit/.test(q) || (/\boutfit\b/.test(q) && !garment)) intent = "look";

  return {
    filters,
    intent,
    budget: filters.priceMax,
    understood: Array.from(new Set(understood)),
    text,
  };
}

export function deliveryQuote(state: string, subtotal: number, method: "standard" | "express" | "pickup") {
  if (method === "pickup") {
    return {
      fee: state === "Enugu" ? 0 : null,
      estimate: "Ready today, 14 Ogui Road, Independence Layout",
      label: "Studio pickup, Enugu",
      method,
      note: state === "Enugu" ? "Bring your order number." : "Pickup is only available in Enugu.",
    };
  }
  let fee = 4500;
  let estimate = "4–7 working days";
  let label = "Nationwide courier";
  if (state === "Enugu") {
    fee = 1500;
    estimate = "1–2 working days";
    label = "Enugu rider";
  } else if (SOUTHEAST.includes(state)) {
    fee = 2500;
    estimate = "2–4 working days";
    label = "Southeast courier";
  } else if (["Lagos", "FCT", "Rivers"].includes(state)) {
    fee = 3500;
    estimate = "3–5 working days";
    label = "City courier";
  }
  let note = "";
  if (subtotal >= 50000) {
    fee = 0;
    note = "Free delivery on orders over ₦50,000";
  } else if (subtotal >= 30000) {
    fee = Math.round(fee * 0.5);
    note = "Half-price delivery over ₦30,000";
  }
  if (method === "express") {
    if (!["Enugu", "Lagos", "FCT"].includes(state)) {
      return { fee, estimate, label, method: "standard" as const, note: note || "Express is available in Enugu, Lagos and Abuja." };
    }
    fee = fee === 0 ? 1500 : Math.round(fee * 1.6);
    estimate = state === "Enugu" ? "Same day if you order before 1pm" : "1–2 working days";
    label = "Express";
  }
  return { fee, estimate, label, method, note };
}

export function priceCoupon(code: string, ctx: { subtotal: number; state?: string; firstOrder: boolean; insider: boolean; deliveryFee: number }) {
  const c = code.trim().toUpperCase();
  if (!c) return { ok: false, message: "Enter a code.", discount: 0, deliveryOff: 0 };
  if (c === "WELCOME10") {
    if (!ctx.firstOrder) return { ok: false, message: "WELCOME10 is for a first order.", discount: 0, deliveryOff: 0 };
    const discount = Math.round(ctx.subtotal * 0.1);
    return { ok: true, message: "10% welcome offer applied.", discount, deliveryOff: 0 };
  }
  if (c === "ENUGU2K") {
    if (ctx.state && ctx.state !== "Enugu") return { ok: false, message: "ENUGU2K is for Enugu delivery.", discount: 0, deliveryOff: 0 };
    return { ok: true, message: "₦2,000 off Enugu delivery.", discount: 0, deliveryOff: Math.min(2000, ctx.deliveryFee || 2000) };
  }
  if (c === "SORT5") {
    if (ctx.subtotal < 40000) return { ok: false, message: "SORT5 needs ₦40,000 or more.", discount: 0, deliveryOff: 0 };
    return { ok: true, message: "₦5,000 off applied.", discount: 5000, deliveryOff: 0 };
  }
  if (c === "INSIDER15") {
    if (!ctx.insider) return { ok: false, message: "Join STYLESORT Insider to use INSIDER15.", discount: 0, deliveryOff: 0 };
    return { ok: true, message: "15% Insider reward applied.", discount: Math.round(ctx.subtotal * 0.15), deliveryOff: 0 };
  }
  if (c === "WEEKEND") {
    const day = new Date().getDay();
    if (![0, 5, 6].includes(day)) return { ok: false, message: "WEEKEND is live Friday to Sunday.", discount: 0, deliveryOff: 0 };
    return { ok: true, message: "Weekend 10% applied.", discount: Math.round(ctx.subtotal * 0.1), deliveryOff: 0 };
  }
  return { ok: false, message: "That code is not recognised.", discount: 0, deliveryOff: 0 };
}

const COMPLEMENTS: Record<string, Category[]> = {
  Dresses: ["Shoes", "Bags", "Accessories"],
  Tops: ["Trousers", "Jeans", "Shoes", "Accessories"],
  "T-shirts": ["Jeans", "Shoes", "Accessories"],
  Shirts: ["Trousers", "Shoes", "Accessories"],
  Jeans: ["Tops", "T-shirts", "Shirts", "Shoes"],
  Trousers: ["Shirts", "Tops", "Shoes", "Accessories"],
  "Two-Piece Sets": ["Shoes", "Bags", "Accessories"],
  "Native Wear": ["Shoes", "Accessories", "Bags"],
  Shoes: ["Bags", "Accessories"],
  Bags: ["Shoes", "Accessories"],
  Accessories: ["Bags", "Shoes"],
};

function neutrals(name: string) {
  return ["Black", "White", "Cream", "Brown", "Grey", "Gold"].includes(colorFamily(name));
}

export function completeTheLook(product: Product, all: Product[]) {
  const slots = COMPLEMENTS[product.category] || [];
  const picked: Product[] = [];
  for (const cat of slots) {
    const options = all.filter(
      (p) =>
        p.id !== product.id &&
        p.category === cat &&
        p.gender === product.gender &&
        p.inventory > 0 &&
        !picked.some((x) => x.id === p.id)
    );
    const ranked = options
      .map((p) => {
        let score = p.rating * 10 + Math.min(p.popularity, 40) / 10;
        if (p.occasions.some((o) => product.occasions.includes(o))) score += 8;
        if (colorFamily(p.colors[0].name) === colorFamily(product.colors[0].name) || neutrals(p.colors[0].name)) score += 6;
        if (p.price > product.price * 1.4 && cat !== "Shoes") score -= 4;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);
    if (ranked[0]) picked.push(ranked[0].p);
  }
  const items = [product, ...picked];
  return { items, total: items.reduce((s, p) => s + p.price, 0) };
}

export function findSimilar(product: Product, all: Product[], limit = 8) {
  return all
    .filter((p) => p.id !== product.id && p.inventory > 0)
    .map((p) => {
      let score = 0;
      if (p.category === product.category) score += 6;
      if (p.gender === product.gender) score += 4;
      score += p.occasions.filter((o) => product.occasions.includes(o)).length * 2;
      score += p.styles.filter((s) => product.styles.includes(s)).length;
      if (colorFamily(p.colors[0].name) === colorFamily(product.colors[0].name)) score += 3;
      const ratio = p.price / product.price;
      if (ratio > 0.6 && ratio < 1.5) score += 2;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export function relatedProducts(product: Product, all: Product[]) {
  const sameSeller = all.filter((p) => p.sellerId === product.sellerId && p.id !== product.id && p.inventory > 0);
  const similar = findSimilar(product, all, 8);
  const merged = [...sameSeller.slice(0, 2), ...similar];
  const seen = new Set<string>();
  return merged.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, 8);
}

export interface OutfitInput {
  gender: Gender;
  occasion: Occasion;
  colour?: string;
  budget: number;
  size?: string;
}

export function buildOutfit(input: OutfitInput, all: Product[]) {
  const plan = slotsFor(input.gender, input.occasion);
  const chosen: Product[] = [];
  let spent = 0;
  const notes: string[] = [];
  for (const slot of plan) {
    const share = Math.round(input.budget * slot.share);
    const room = input.budget - spent;
    const cap = Math.min(share * 1.25, room);
    const options = all.filter((p) => {
      if (p.gender !== input.gender || p.inventory <= 0) return false;
      if (!slot.categories.includes(p.category)) return false;
      if (chosen.some((c) => c.id === p.id)) return false;
      if (p.price > cap) return false;
      if (input.size && !["Shoes", "Bags", "Accessories"].includes(p.category)) {
        if (!p.sizes.includes(input.size) && !(input.size === "Plus Size" && p.plusSize)) return false;
      }
      return true;
    });
    const ranked = options
      .map((p) => {
        let score = 0;
        if (p.occasions.includes(input.occasion)) score += 8;
        if (input.colour && colorFamily(p.colors[0].name) === input.colour) score += 6;
        if (!input.colour || neutrals(p.colors[0].name)) score += 2;
        score += p.rating;
        if (p.price <= share) score += 2;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);
    if (ranked[0] && spent + ranked[0].p.price <= input.budget) {
      chosen.push(ranked[0].p);
      spent += ranked[0].p.price;
    } else if (slot.required) {
      notes.push(`No ${slot.label.toLowerCase()} fitted the remaining budget.`);
    }
  }
  const total = chosen.reduce((s, p) => s + p.price, 0);
  if (!chosen.length) notes.push("Widen the budget or drop the colour and we can try again.");
  else notes.unshift(`Built for ${input.occasion.toLowerCase()} inside ${naira(input.budget)}.`);
  return { items: chosen, total, notes };
}

function slotsFor(gender: Gender, occasion: Occasion) {
  if (gender === "kids") {
    return [
      { label: "Piece", categories: ["Dresses", "Tops", "Shirts", "Native Wear"] as Category[], share: 0.7, required: true },
      { label: "Shoes", categories: ["Shoes"] as Category[], share: 0.3, required: false },
    ];
  }
  if (gender === "men" && occasion === "Wedding") {
    return [
      { label: "Native", categories: ["Native Wear"] as Category[], share: 0.7, required: true },
      { label: "Shoes", categories: ["Shoes"] as Category[], share: 0.2, required: false },
      { label: "Watch", categories: ["Accessories"] as Category[], share: 0.1, required: false },
    ];
  }
  if (gender === "men" && (occasion === "Office" || occasion === "Interview")) {
    return [
      { label: "Shirt", categories: ["Shirts"] as Category[], share: 0.28, required: true },
      { label: "Trousers", categories: ["Trousers"] as Category[], share: 0.32, required: true },
      { label: "Shoes", categories: ["Shoes"] as Category[], share: 0.28, required: false },
      { label: "Belt", categories: ["Accessories"] as Category[], share: 0.12, required: false },
    ];
  }
  if (gender === "men") {
    return [
      { label: "Top", categories: ["T-shirts", "Shirts"] as Category[], share: 0.24, required: true },
      { label: "Bottom", categories: ["Jeans", "Trousers"] as Category[], share: 0.32, required: true },
      { label: "Shoes", categories: ["Shoes"] as Category[], share: 0.32, required: false },
      { label: "Finish", categories: ["Accessories"] as Category[], share: 0.12, required: false },
    ];
  }
  if (["Office", "Interview"].includes(occasion)) {
    return [
      { label: "Dress", categories: ["Dresses", "Two-Piece Sets"] as Category[], share: 0.55, required: true },
      { label: "Shoes", categories: ["Shoes"] as Category[], share: 0.25, required: false },
      { label: "Bag", categories: ["Bags"] as Category[], share: 0.15, required: false },
      { label: "Finish", categories: ["Accessories"] as Category[], share: 0.05, required: false },
    ];
  }
  if (["Casual", "Beach", "Travel"].includes(occasion)) {
    return [
      { label: "Piece", categories: ["Dresses", "Two-Piece Sets", "Tops"] as Category[], share: 0.5, required: true },
      { label: "Shoes", categories: ["Shoes"] as Category[], share: 0.28, required: false },
      { label: "Bag", categories: ["Bags"] as Category[], share: 0.16, required: false },
      { label: "Finish", categories: ["Accessories"] as Category[], share: 0.06, required: false },
    ];
  }
  return [
    { label: "Dress", categories: ["Dresses", "Two-Piece Sets", "Native Wear"] as Category[], share: 0.58, required: true },
    { label: "Shoes", categories: ["Shoes"] as Category[], share: 0.22, required: false },
    { label: "Bag", categories: ["Bags"] as Category[], share: 0.14, required: false },
    { label: "Finish", categories: ["Accessories"] as Category[], share: 0.06, required: false },
  ];
}

export function lookTotal(look: Look, all: Product[]) {
  const items = look.productIds.map((id) => all.find((p) => p.id === id)).filter(Boolean) as Product[];
  return { items, total: items.reduce((s, p) => s + p.price, 0) };
}

export function filterLooks(list: Look[], all: Product[], q: { gender?: string; occasion?: string; colour?: string; budget?: number }) {
  return list.filter((look) => {
    if (q.gender && q.gender !== "all" && look.gender !== q.gender) return false;
    if (q.occasion && look.occasion !== q.occasion) return false;
    if (q.colour && !look.colours.some((c) => colorFamily(c) === q.colour || c === q.colour)) return false;
    if (q.budget) {
      const { total } = lookTotal(look, all);
      if (total > q.budget) return false;
    }
    return true;
  });
}

export function budgetBySlug(slug: string) {
  if (slug === "under-20k") return { slug, label: "Under ₦20,000", min: 0, max: 20000, blurb: "The weekly wardrobe, priced like a weekly wardrobe." };
  return BUDGETS.find((b) => b.slug === slug);
}

export function dominantHex(data: Uint8ClampedArray) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 16) {
    const R = data[i], G = data[i + 1], B = data[i + 2], A = data[i + 3];
    if (A < 200) continue;
    const max = Math.max(R, G, B), min = Math.min(R, G, B);
    if (max > 245 && min > 235) continue;
    if (max < 18) continue;
    r += R; g += G; b += B; n++;
  }
  if (!n) return "#8d2e3c";
  return `#${[r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, "0")).join("")}`;
}

export function nearestFamily(hex: string) {
  const n = hex.replace("#", "");
  const R = parseInt(n.slice(0, 2), 16);
  const G = parseInt(n.slice(2, 4), 16);
  const B = parseInt(n.slice(4, 6), 16);
  const samples: Record<string, [number, number, number]> = {
    Black: [22, 22, 22],
    White: [244, 241, 236],
    Cream: [243, 230, 212],
    Red: [143, 45, 60],
    Blue: [30, 42, 68],
    Green: [31, 107, 69],
    Brown: [107, 74, 50],
    Yellow: [230, 200, 92],
    Gold: [198, 161, 91],
    Pink: [231, 183, 194],
    Grey: [138, 134, 128],
  };
  let best = "Red";
  let dist = Infinity;
  for (const [name, rgb] of Object.entries(samples)) {
    const d = (R - rgb[0]) ** 2 + (G - rgb[1]) ** 2 + (B - rgb[2]) ** 2;
    if (d < dist) {
      dist = d;
      best = name;
    }
  }
  return best;
}
