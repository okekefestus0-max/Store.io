import type { Product, Review } from "./types";

const NAMES = [
  "Chioma Eze", "Tunde Bakare", "Amaka Obi", "Ibrahim Sule", "Ngozi Okonkwo",
  "Femi Adeyemi", "Blessing Nwosu", "Chinedu Okafor", "Fatima Bello", "Kelechi Umeh",
  "Adaeze Nnaji", "Yusuf Abdullahi", "Ifeoma Eze", "Segun Adeola", "Miriam Okoro",
  "Chuka Nnamani", "Halima Musa", "Obinna Igwe", "Zainab Lawal", "Tochi Edeh",
  "Precious Obi", "Emeka Ude", "Aisha Mohammed", "Uche Nwankwo", "Linda Chukwu",
  "Bola Adeniyi", "Nneka Obi", "Samuel Okeke", "Grace Eze", "Tobi Adebayo",
];

const CITIES = ["Enugu", "Awka", "Nsukka", "Onitsha", "Lagos", "Abuja", "Owerri", "Abakaliki", "Port Harcourt", "Umuahia", "Aba", "Benin", "Ibadan"];

const TEMPLATES: { rating: number; title: string; body: string }[] = [
  { rating: 5, title: "Exactly the colour", body: "I ordered this on a Thursday and it got to me in Enugu before Sunday. The colour is honest. I did not need to adjust it all day." },
  { rating: 5, title: "Better than the price", body: "Quality is better than the price suggested. Stitching is clean. I am a UK 12 and the L sat properly through the hip." },
  { rating: 5, title: "My sister wants the link", body: "Delivery to Awka was three days. Packaging was neat, no funny smell. My sister has already asked for the link." },
  { rating: 5, title: "Photos are honest", body: "I was worried about ordering this online. It is exactly what the photos show. Seller replied on WhatsApp the same afternoon." },
  { rating: 5, title: "They asked where it was from", body: "Wore it to a birthday in Independence Layout. Three people asked where it was from. That is the review." },
  { rating: 5, title: "True to the size guide", body: "True to the size guide. I am 5'5 and the length was right. Fabric does not look cheap in sunlight." },
  { rating: 4, title: "Runs slightly roomy", body: "Good, but it runs slightly roomy. I liked that. My friend might want to size down. Quality is solid for the money." },
  { rating: 4, title: "Seller sorted the zipper", body: "The zipper was a little stiff on day one. Seller sent a short voice note on how to ease it. It is fine now. Honest people." },
  { rating: 5, title: "Second order, no stress", body: "This is my second order from this seller. No stress, no stories. I will be back for another colour." },
  { rating: 5, title: "Deeper than my screen, better", body: "Came well packed. Colour is a touch deeper than my phone screen and honestly better. Happy." },
  { rating: 5, title: "Two aunties asked", body: "I carried this to church and two aunties asked for the page. Delivery to Nsukka was smooth." },
  { rating: 5, title: "Fair price", body: "For the price, I am impressed. I have seen similar in the mall for more, and this fabric is nicer." },
  { rating: 5, title: "Plus size that is actually cut", body: "Plus size that is actually cut for a body, not just graded up. XXL was comfortable and still looked sharp." },
  { rating: 5, title: "Survived the reception", body: "Wore it to an introduction in Onitsha. The colour photographed well and it survived the whole reception." },
  { rating: 5, title: "No fade after two washes", body: "Fast to Abuja. Washed it twice, no fade, no twist. That is what I wanted." },
  { rating: 4, title: "Courier was the only delay", body: "Seller's response was quick. The item matches the description. Only delay was the courier, not the boutique." },
  { rating: 5, title: "He actually wore it", body: "I ordered for my husband. He does not usually like clothes I pick online. He wore this the same weekend." },
  { rating: 5, title: "My tailor nodded", body: "Neat finishing on the embroidery. My tailor in GRA looked at it and nodded, which is high praise." },
  { rating: 5, title: "Comfortable for a long Sunday", body: "Comfortable for a long Sunday. I stood, sat, and did not feel like I was fighting the outfit." },
  { rating: 5, title: "Enugu roads approved", body: "Comfortable from the car park to the hall and back. That is the test that matters here." },
  { rating: 5, title: "Looks more expensive", body: "Looks more expensive than what I paid. Structure stayed after I filled it with the usual: phone, keys, a novel, sanitizer." },
  { rating: 4, title: "Thrift, measured properly", body: "One-of-one piece, measured properly, no surprises. Smelled clean. I would buy from them again." },
  { rating: 5, title: "Interview outfit", body: "Used it for an interview in Lagos. Looked serious without looking like a uniform. I stood up straighter." },
  { rating: 3, title: "Order early for PH", body: "Beautiful piece. Delivery to Port Harcourt took six days, so order early if you have a date. The item itself is lovely." },
  { rating: 5, title: "Do not guess the size", body: "Size guide is accurate. Do not guess. I followed it and it fit. Rare." },
  { rating: 5, title: "Pressed and packed", body: "The native set was pressed and packed like they care. I did not have to iron for an hour before the event." },
  { rating: 5, title: "Not itchy", body: "My daughter wore the kids piece to church and it was not itchy. That alone is worth it." },
  { rating: 5, title: "Weekend sorted", body: "Weekend outfit sorted. I styled it with sandals I already had and it looked considered. Packaging was simple and clean." },
];

const PHOTOS: Record<string, string[]> = {
  ss005: ["/images/ugc-1.jpg"],
  ss008: ["/images/edit-street.jpg"],
  ss015: ["/images/edit-office.jpg"],
  ss020: ["/images/church-portrait.jpg"],
  ss040: ["/images/edit-wedding.jpg"],
  ss088: ["/images/hero-man.jpg"],
  ss090: ["/images/edit-native.jpg"],
  ss031: ["/images/edit-date.jpg"],
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function reviewsFor(product: Product): Review[] {
  const h = hash(product.id);
  const count = 3 + (h % 2);
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const t = TEMPLATES[(h + i * 7) % TEMPLATES.length];
    const name = NAMES[(h + i * 3) % NAMES.length];
    const city = CITIES[(h + i * 5) % CITIES.length];
    const month = 1 + ((h + i) % 9);
    const day = 1 + ((h + i * 2) % 27);
    out.push({
      id: `${product.id}-r${i}`,
      productId: product.id,
      name,
      city,
      rating: t.rating,
      title: t.title,
      body: t.body,
      date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      verified: i !== count - 1 || t.rating >= 4,
      size: product.sizes[h % product.sizes.length],
      photos: i === 0 ? PHOTOS[product.id] : undefined,
      helpful: 2 + ((h + i) % 18),
    });
  }
  return out;
}
