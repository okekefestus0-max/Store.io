export const BRAND = {
  name: "STYLESORT",
  tagline: "Find It. Sort It. Wear It.",
  sub: "Fashion that fits your style, size and budget.",
  promise: "Your style. Your size. Your budget. Your choice.",
  city: "Enugu",
  phoneDisplay: "0806 255 9689",
  phoneE164: "2348062559689",
  email: "ictdreambooster@gmail.com",
  instagram: "@stylesort.ng",
  address: "14 Ogui Road, Independence Layout, Enugu",
  hours: "Monday to Saturday, 9am–6pm WAT",
  whatsapp: (text: string) =>
    `https://wa.me/2348062559689?text=${encodeURIComponent(text)}`,
};

export const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export const SOUTHEAST = ["Enugu", "Anambra", "Ebonyi", "Abia", "Imo"];

export const CATEGORIES = [
  "Dresses",
  "Tops",
  "T-shirts",
  "Shirts",
  "Jeans",
  "Trousers",
  "Two-Piece Sets",
  "Native Wear",
  "Shoes",
  "Bags",
  "Accessories",
] as const;

export const OCCASIONS = [
  "Wedding",
  "Birthday",
  "Date",
  "Church",
  "Office",
  "Interview",
  "Graduation",
  "Party",
  "Dinner",
  "Beach",
  "Travel",
  "Casual",
] as const;

export const OCCASION_PAGES = [
  { slug: "wedding-guest", title: "Wedding Guest", occasion: "Wedding", image: "/images/crops/wedding.jpg", blurb: "Owambe, introduction, white wedding. Looks that survive the reception." },
  { slug: "birthday", title: "Birthday", occasion: "Birthday", image: "/images/crops/coral.jpg", blurb: "The outfit your group chat will screenshot." },
  { slug: "date-night", title: "Date Night", occasion: "Date", image: "/images/crops/date.jpg", blurb: "Dinner in GRA, a lounge in Lagos, or somewhere in between." },
  { slug: "church", title: "Church", occasion: "Church", image: "/images/church-portrait.jpg", blurb: "Covered, considered, and still completely you." },
  { slug: "office", title: "Office", occasion: "Office", image: "/images/crops/office.jpg", blurb: "From the 8am stand-up to the 7pm dinner." },
  { slug: "interview", title: "Interview", occasion: "Interview", image: "/images/crops/office.jpg", blurb: "Clean lines. Quiet confidence. Nothing that needs adjusting." },
  { slug: "graduation", title: "Graduation", occasion: "Graduation", image: "/images/church-portrait.jpg", blurb: "For the ceremony, the photos, and the family lunch after." },
  { slug: "party", title: "Party", occasion: "Party", image: "/images/crops/coral.jpg", blurb: "Friday night energy, Saturday morning quality." },
  { slug: "dinner", title: "Dinner", occasion: "Dinner", image: "/images/crops/date.jpg", blurb: "Satin, tailoring, and shoes you can actually sit in." },
  { slug: "beach", title: "Beach", occasion: "Beach", image: "/images/crops/street.jpg", blurb: "Light fabrics for the road to the water." },
  { slug: "travel", title: "Travel", occasion: "Travel", image: "/images/crops/street.jpg", blurb: "Pieces that do not crease into a problem." },
  { slug: "casual-outing", title: "Casual Outing", occasion: "Casual", image: "/images/hero-man.jpg", blurb: "New Haven, Ikeja, Wuse. Everyday, edited." },
];

export const STYLES = [
  "Casual",
  "Corporate",
  "Streetwear",
  "Classic",
  "Luxury",
  "Native",
  "Party",
  "Romantic",
  "Sporty",
  "Trendy",
] as const;

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Plus Size"];

export const COLOR_FAMILIES: Record<string, string[]> = {
  Black: ["black", "charcoal"],
  White: ["white", "ivory"],
  Cream: ["cream", "champagne", "sand", "nude", "beige", "butter"],
  Red: ["red", "burgundy", "wine", "coral", "terracotta"],
  Blue: ["blue", "navy", "sky", "indigo", "royal", "light blue"],
  Green: ["green", "olive", "emerald", "forest", "sage"],
  Brown: ["brown", "camel", "tan", "chocolate"],
  Yellow: ["yellow", "butter"],
  Gold: ["gold"],
  Pink: ["pink", "blush", "lilac", "purple"],
  Grey: ["grey", "gray"],
  Multicolour: ["multicolour", "print"],
};

export const BUDGETS = [
  { slug: "under-10k", label: "Under ₦10,000", min: 0, max: 10000, blurb: "Tees, earrings, slides and the pieces that finish an outfit." },
  { slug: "10-20", label: "₦10,000 – ₦20,000", min: 10000, max: 20000, blurb: "Dresses, jeans, shirts and shoes for the week." },
  { slug: "20-50", label: "₦20,000 – ₦50,000", min: 20000, max: 50000, blurb: "Occasion dressing, native sets and better shoes." },
  { slug: "50-100", label: "₦50,000 – ₦100,000", min: 50000, max: 100000, blurb: "Agbada, aso-oke and reception pieces." },
  { slug: "100-plus", label: "₦100,000+", min: 100000, max: 10000000, blurb: "Bridal, premium agbada and made-to-be-seen." },
];

export const SUGGESTIONS = [
  "red dress under ₦20K",
  "men's wedding outfit",
  "church outfit size 12",
  "complete outfit under ₦50K",
  "ankara two-piece",
  "agbada in Enugu",
  "office dress",
  "white sneakers",
  "date night under ₦30K",
  "plus size party dress",
  "senator native shirt",
  "bag under ₦15K",
];

export function naira(value: number) {
  const n = Math.round(value);
  return `₦${n.toLocaleString("en-NG")}`;
}

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function stockLabel(inventory: number) {
  if (inventory <= 0) return "Sold out";
  if (inventory <= 4) return `Only ${inventory} left`;
  return "In stock";
}

export function waLink(text: string) {
  return BRAND.whatsapp(text);
}

export const CAMPAIGN = {
  hero: "/images/hero-portrait.jpg",
  men: "/images/hero-man.jpg",
  church: "/images/church-portrait.jpg",
  office: "/images/crops/office.jpg",
  date: "/images/crops/date.jpg",
  street: "/images/crops/street.jpg",
  native: "/images/crops/agbada.jpg",
  ugc: "/images/crops/coral.jpg",
  shoes: "/images/crops/heels.jpg",
  bags: "/images/crops/mini-bag.jpg",
  wedding: "/images/crops/wedding.jpg",
};
