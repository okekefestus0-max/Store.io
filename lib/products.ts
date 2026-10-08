import type { Category, Gender, Occasion, Product, Style } from "./types";

const CARE: Record<string, string> = {
  Dresses: "Cold gentle wash or hand wash. Hang dry. Iron on the reverse.",
  Tops: "Cold gentle wash. Do not tumble dry. Warm iron.",
  "T-shirts": "Wash inside out with similar colours. Hang dry to keep the shape.",
  Shirts: "Cool iron while slightly damp. Wash cold.",
  Jeans: "Wash inside out, cold, and hang dry. The wash is meant to soften, not fade out.",
  Trousers: "Steam or cool iron. Dry clean if the piece is lined.",
  "Two-Piece Sets": "Wash the pieces together so the colour stays matched.",
  "Native Wear": "Dry clean is safest. Steam to refresh. Store hanging, not folded on the embroidery.",
  Shoes: "Wipe with a dry cloth. Air dry away from direct sun. Stuff with paper if you are caught in rain.",
  Bags: "Keep the shape with tissue. Avoid perfume directly on the surface.",
  Accessories: "Store dry. Wipe metal after wear so humidity does not dull it.",
};

const UK: Record<string, string> = { XS: "6", S: "8", M: "10", L: "12", XL: "14", XXL: "16", XXXL: "18" };

const EXTRAS: Record<string, { name: string; hex: string }[]> = {
  ss001: [{ name: "Black", hex: "#161616" }],
  ss008: [{ name: "White", hex: "#f7f4ef" }],
  ss015: [{ name: "Navy", hex: "#1e2a44" }],
  ss061: [{ name: "White", hex: "#f7f4ef" }, { name: "Black", hex: "#161616" }],
  ss066: [{ name: "White", hex: "#f7f4ef" }, { name: "Burgundy", hex: "#8d2e3c" }],
  ss088: [{ name: "White", hex: "#f7f4ef" }],
};

function slugify(name: string) {
  return name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sizesFor(name: string, gender: Gender, category: Category) {
  if (category === "Shoes") {
    if (gender === "kids") return ["28", "29", "30", "31", "32", "33", "34"];
    if (gender === "men") return ["41", "42", "43", "44", "45", "46"];
    return ["37", "38", "39", "40", "41", "42"];
  }
  if (/belt/i.test(name)) return ["80", "85", "90", "95", "100"];
  if (category === "Bags" || category === "Accessories") return ["One Size"];
  if (gender === "kids") return ["2–3Y", "4–5Y", "6–7Y", "8–9Y", "10–11Y"];
  if (gender === "men") return ["S", "M", "L", "XL", "XXL", "XXXL"];
  return ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
}

function p(
  id: string,
  name: string,
  sellerId: string,
  gender: Gender,
  category: Category,
  price: number,
  compareAt: number,
  color: string,
  hex: string,
  occasions: Occasion[],
  styles: Style[],
  material: string,
  description: string,
  rating: number,
  reviewCount: number,
  inventory: number,
  sales: number,
  popularity: number,
  createdAt: string,
  flags = "",
  tags = "",
  shot = ""
): Product {
  const sizes = sizesFor(name, gender, category);
  const apparel = !["Shoes", "Bags", "Accessories"].includes(category);
  const images = [`/images/products/${id}.jpg`];
  if (shot) images.push(shot);
  const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
  return {
    id,
    slug: slugify(name),
    name,
    sellerId,
    gender,
    category,
    price,
    compareAt: compareAt > price ? compareAt : undefined,
    images,
    shot: shot || undefined,
    colors: [{ name: color, hex }, ...(EXTRAS[id] || [])],
    sizes,
    ukSizes: gender === "women" && apparel ? sizes.map((s) => UK[s]).filter(Boolean) : undefined,
    occasions,
    styles,
    material,
    care: CARE[category] || CARE.Dresses,
    description,
    details: [
      material,
      `Styled for ${occasions.slice(0, 3).join(", ").toLowerCase()}.`,
      gender === "women" && apparel
        ? "UK 6–18. Size 12 is our L. Plus sizes are cut with more hip ease, not just stretched."
        : gender === "men" && apparel
        ? "S to XXXL. Size up if you want a traditional drape in native or kaftan."
        : "See the size guide before you order. Shoe sizes are EU.",
    ],
    note: tagList.includes("agbada")
      ? "Ships pressed from GRA, Enugu. Allow an extra day."
      : tagList.includes("thrift")
      ? "One-of-one thrift piece. Measured flat. Returns only if we missed a fault."
      : tagList.includes("bridal")
      ? "Message us on WhatsApp if you want this adjusted to your measurement."
      : undefined,
    rating,
    reviewCount,
    inventory,
    sales,
    popularity,
    createdAt,
    featured: flags.includes("f"),
    trending: flags.includes("t"),
    bestSeller: flags.includes("b"),
    newArrival: flags.includes("n"),
    deal: flags.includes("d") || compareAt > price,
    plusSize: sizes.includes("XXL") || sizes.includes("XXXL"),
    tags: tagList,
    returnable: !tagList.includes("thrift"),
  };
}

/** Seed catalogue. Add a product by appending a p() row. Photos: public/images/products/{id}.jpg */
export const products: Product[] = [
  p("ss001", "Adaeze Cowl Midi", "adaora", "women", "Dresses", 18500, 22000, "Burgundy", "#8d2e3c", ["Date", "Dinner", "Party"], ["Romantic", "Classic"], "Viscose crepe with a little stretch", "A cowl-neck midi in a wine that reads expensive in daylight, with enough ease for Enugu heat.", 4.8, 64, 18, 210, 96, "2026-09-18", "ftdn", "midi,cowl,date", "/images/hero-portrait.jpg"),
  p("ss002", "Nkechi Linen Shift", "adaora", "women", "Dresses", 14200, 0, "Cream", "#f3e6d4", ["Casual", "Travel", "Church"], ["Casual", "Classic"], "Washed linen", "An easy linen shift that does not cling by noon. The kind of dress you actually repeat.", 4.6, 41, 22, 120, 70, "2026-06-02", "t", "linen,shift"),
  p("ss003", "Zainab Pleated Day Dress", "nkem", "women", "Dresses", 16800, 0, "Sage", "#9caf98", ["Birthday", "Casual", "Church"], ["Romantic", "Trendy"], "Pleated cotton", "Soft pleats, a sage that works with gold jewellery, and a length that is polite without being plain.", 4.7, 38, 16, 98, 74, "2026-07-14", "n", "pleated,day"),
  p("ss004", "Ifunanya Slip Dress", "nkem", "women", "Dresses", 12900, 0, "Black", "#161616", ["Date", "Dinner", "Party"], ["Romantic", "Party"], "Satin-back crepe", "A black slip with a neckline that does the work. Pair it with a sandal or a heel and leave.", 4.7, 52, 20, 160, 82, "2026-05-20", "tb", "slip,black,date", "/images/products/ss004.jpg"),
  p("ss005", "Chioma Puff-Sleeve Midi", "adaora", "women", "Dresses", 15500, 19000, "Coral", "#e07a62", ["Birthday", "Party", "Date"], ["Trendy", "Romantic"], "Crinkle cotton", "Puff sleeves, a coral that photographs well, and a skirt you can sit in at a birthday in Independence Layout.", 4.8, 73, 14, 188, 91, "2026-09-28", "ftnd", "puff,midi,birthday", "/images/products/ss005.jpg"),
  p("ss006", "Amaka Tiered Cotton Dress", "grace", "women", "Dresses", 13400, 0, "Terracotta", "#c4654a", ["Church", "Casual", "Travel"], ["Casual", "Classic"], "Cotton poplin", "Tiers that move when you walk, in a terracotta that looks considered next to gold.", 4.5, 29, 18, 76, 60, "2026-04-11", "", "tiered,cotton"),
  p("ss007", "Halima Belted Shirt Dress", "marina", "women", "Dresses", 19800, 0, "Navy", "#1e2a44", ["Office", "Travel", "Interview"], ["Corporate", "Classic"], "Stretch cotton", "A shirt dress with a proper collar and a belt that actually holds. Office on Monday, travel on Friday.", 4.7, 44, 12, 132, 78, "2026-03-18", "b", "shirt-dress,navy,office"),
  p("ss008", "Onyinye T-Shirt Dress", "adaora", "women", "Dresses", 11200, 0, "Butter", "#f0d56a", ["Beach", "Casual", "Travel"], ["Casual", "Trendy"], "Cotton jersey", "A butter-yellow t-shirt dress for the walk through New Haven and the photos after. Simple, and that is the point.", 4.6, 58, 24, 201, 88, "2026-10-01", "ftn", "tshirt-dress,yellow,casual", "/images/products/ss008.jpg"),
  p("ss009", "Owambe Asymmetric Gown", "nkem", "women", "Dresses", 42000, 52000, "Wine", "#6e2433", ["Wedding", "Party"], ["Luxury", "Party"], "Crepe and lining", "An asymmetric gown for the reception. The wine holds up in flash photography, which matters more than people admit.", 4.9, 36, 3, 94, 93, "2026-09-12", "ftdb", "gown,owambe,wedding", "/images/products/ss009.jpg"),
  p("ss010", "Owerri Nights Mini", "nkem", "women", "Dresses", 28500, 0, "Black", "#111111", ["Party", "Date"], ["Party", "Trendy"], "Sequin mesh", "A short black dress for the night you will be asked for the link. It is between drops right now.", 4.8, 81, 0, 240, 97, "2026-08-02", "tb", "mini,party,sequin"),
  p("ss011", "VI Satin Cowl Slip", "nkem", "women", "Dresses", 34000, 0, "Champagne", "#e7d7c3", ["Dinner", "Date", "Party"], ["Luxury", "Romantic"], "Silk-touch satin", "Champagne satin with a cowl that sits quietly. For dinner on the Island or a dressed-up Friday in GRA.", 4.8, 27, 8, 70, 80, "2026-09-02", "n", "satin,slip,dinner"),
  p("ss012", "Blush Tulle Midi", "nkem", "women", "Dresses", 31500, 0, "Blush", "#f0cfcb", ["Birthday", "Graduation", "Party"], ["Romantic", "Party"], "Soft tulle", "Blush tulle with enough structure to last the photos and the family lunch after.", 4.7, 33, 9, 88, 77, "2026-06-20", "t", "tulle,blush,graduation"),
  p("ss013", "Emerald One-Shoulder", "nkem", "women", "Dresses", 27900, 0, "Emerald", "#0f6e56", ["Party", "Wedding"], ["Party", "Luxury"], "Crepe", "One shoulder, a clean emerald, no fussy beading. It looks expensive because the cut is doing the work.", 4.6, 22, 11, 64, 72, "2026-05-02", "", "one-shoulder,emerald"),
  p("ss014", "Red Cut-Out Party Dress", "nkem", "women", "Dresses", 22400, 28000, "Red", "#b43333", ["Party", "Date", "Birthday"], ["Party", "Trendy"], "Stretch crepe", "A red you can see across the room, with a cut-out that is confident rather than desperate.", 4.5, 48, 15, 156, 85, "2026-08-19", "td", "red,party,cutout", "/images/products/ss014.jpg"),
  p("ss015", "The Enugu Pencil Dress", "marina", "women", "Dresses", 18900, 0, "Black", "#161616", ["Office", "Interview", "Dinner"], ["Corporate", "Classic"], "Ponte roma", "The black pencil that Enugu offices keep reordering. Sleeveless, just below the knee, nothing that needs adjusting in a meeting.", 4.9, 112, 20, 340, 98, "2026-02-11", "ftb", "pencil,office,black", "/images/products/ss015.jpg"),
  p("ss016", "Structured Blazer Dress", "marina", "women", "Dresses", 32000, 0, "Charcoal", "#3a3836", ["Office", "Interview"], ["Corporate", "Luxury"], "Suiting crepe", "A blazer dress for the day you need to look like you already have the job.", 4.7, 19, 7, 54, 68, "2026-07-01", "n", "blazer,office"),
  p("ss017", "Camel Tailored Midi", "marina", "women", "Dresses", 24500, 0, "Camel", "#c4a574", ["Office", "Dinner", "Church"], ["Classic", "Corporate"], "Tailored crepe", "Camel is the quiet flex. Tailored through the waist, easy through the hip.", 4.8, 31, 10, 90, 76, "2026-04-22", "t", "camel,midi,office"),
  p("ss018", "Pinstripe Shirt Dress", "marina", "women", "Dresses", 21000, 0, "Navy", "#1e2a44", ["Office", "Interview"], ["Corporate", "Classic"], "Pinstripe cotton", "Pinstripe, but not a costume. A shirt dress that works with loafers or a court heel.", 4.6, 24, 13, 67, 64, "2026-03-09", "", "pinstripe,office"),
  p("ss019", "Forest Crepe Wrap", "adaora", "women", "Dresses", 19500, 0, "Forest", "#1e3d32", ["Office", "Church", "Date"], ["Corporate", "Romantic"], "Crepe", "A wrap in forest green that covers what you want covered and still looks like you chose it.", 4.7, 40, 16, 110, 73, "2026-05-28", "", "wrap,office,church"),
  p("ss020", "Grace Tie-Waist Midi", "grace", "women", "Dresses", 16800, 0, "Cream", "#f3e6d4", ["Church", "Graduation", "Casual"], ["Classic", "Romantic"], "Linen blend", "Covered shoulders, a tie waist, and a cream that stays kind under Sunday light. Built for a long service.", 4.9, 86, 15, 220, 94, "2026-09-08", "ftb", "church,tie-waist,modest", "/images/church-portrait.jpg"),
  p("ss021", "Udi Ankara Co-ord", "ifunanya", "women", "Two-Piece Sets", 26500, 0, "Multicolour", "#1f6b45", ["Wedding", "Party", "Church"], ["Native", "Party"], "Wax print cotton", "A contemporary ankara set cut like clothing, not a costume. Deep green and gold, ready for a weekend that has two events.", 4.8, 57, 12, 142, 90, "2026-09-20", "ftn", "ankara,coord,two-piece,native", "/images/products/ss021.jpg"),
  p("ss022", "Sand Linen Vest Set", "adaora", "women", "Two-Piece Sets", 22000, 0, "Sand", "#e6d3b8", ["Casual", "Travel", "Office"], ["Casual", "Classic"], "Linen", "Vest and trouser in sand linen. Wear together, or split the vest over jeans next week.", 4.7, 26, 11, 72, 71, "2026-08-30", "n", "linen,set,coord"),
  p("ss023", "Chocolate Ribbed Knit Set", "nkem", "women", "Two-Piece Sets", 16800, 0, "Chocolate", "#4a2e24", ["Casual", "Date", "Travel"], ["Casual", "Romantic"], "Ribbed knit", "A chocolate knit set that looks like effort and feels like rest. Good for a cool evening.", 4.6, 34, 18, 99, 75, "2026-07-19", "t", "knit,set,chocolate"),
  p("ss024", "Wine Satin Shirt Set", "nkem", "women", "Two-Piece Sets", 19900, 24000, "Wine", "#6e2433", ["Party", "Date", "Dinner"], ["Party", "Trendy"], "Satin", "Shirt and short in wine satin. Date night without a dress, if that is your mood.", 4.5, 21, 9, 58, 69, "2026-09-14", "nd", "satin,set,date"),
  p("ss025", "Olive Cargo Co-ord", "tobi", "women", "Two-Piece Sets", 18400, 0, "Olive", "#5d6840", ["Casual", "Travel", "Beach"], ["Streetwear", "Casual"], "Cotton twill", "Cargo co-ord in olive. Practical pockets, a cut that is still a look.", 4.4, 18, 14, 49, 62, "2026-08-08", "n", "cargo,coord,street"),
  p("ss026", "Cream Boucle Set", "marina", "women", "Two-Piece Sets", 29500, 0, "Cream", "#f3e6d4", ["Office", "Dinner", "Interview"], ["Luxury", "Corporate"], "Boucle", "A cream boucle set for the meeting that turns into dinner. It looks like more than it costs.", 4.8, 16, 6, 41, 78, "2026-09-25", "n", "boucle,set,office"),
  p("ss027", "Poplin Bow Blouse", "marina", "women", "Tops", 8900, 0, "White", "#f7f4ef", ["Office", "Interview", "Church"], ["Corporate", "Classic"], "Cotton poplin", "A white bow blouse that does not go sheer in office light. Tuck it in and go.", 4.7, 47, 28, 130, 66, "2026-03-02", "b", "blouse,white,office"),
  p("ss028", "Square-Neck Bodysuit", "nkem", "women", "Tops", 7500, 0, "Black", "#161616", ["Party", "Date", "Casual"], ["Party", "Trendy"], "Stretch jersey", "A square-neck bodysuit that stays put. The base of half the outfits in this edit.", 4.6, 63, 30, 175, 80, "2026-02-14", "tb", "bodysuit,black"),
  p("ss029", "Oversized Stripe Shirt", "zuri", "women", "Tops", 9200, 0, "Blue", "#8eb4d4", ["Casual", "Travel", "Office"], ["Casual", "Classic"], "Cotton", "An oversized stripe shirt from a careful thrift edit. One of one. Measured and steamed.", 4.5, 22, 1, 22, 55, "2026-09-30", "n", "stripe,thrift,shirt"),
  p("ss030", "Cream Crochet Crop", "zuri", "women", "Tops", 6800, 0, "Cream", "#f3e6d4", ["Beach", "Casual", "Date"], ["Casual", "Trendy"], "Cotton crochet", "A small crochet crop for heat and layering. Thrifted, cleaned, and the only one.", 4.4, 19, 1, 19, 48, "2026-08-16", "", "crochet,thrift,beach"),
  p("ss031", "VI Satin Cowl Cami", "nkem", "women", "Tops", 9800, 0, "Black", "#161616", ["Date", "Dinner", "Party"], ["Romantic", "Party"], "Silk-touch satin", "The black satin cami from the dinner-table photos. It layers under a blazer or stands alone.", 4.8, 54, 17, 148, 86, "2026-09-16", "ftn", "cami,satin,date", "/images/products/ss031.jpg"),
  p("ss032", "Lilac Puff Sleeve Blouse", "adaora", "women", "Tops", 9800, 0, "Lilac", "#c7b4d4", ["Birthday", "Church", "Date"], ["Romantic", "Trendy"], "Cotton", "A lilac puff sleeve that is sweet without being childish. Good with the black crepe trouser.", 4.6, 28, 15, 70, 64, "2026-06-12", "", "blouse,lilac,puff"),
  p("ss033", "High-Rise Straight Jeans", "zuri", "women", "Jeans", 14500, 0, "Indigo", "#2c3e73", ["Casual", "Travel", "Date"], ["Casual", "Classic"], "Denim", "High-rise, straight leg, a wash that is not trying too hard. Measured flat, as all Zuri pieces are.", 4.7, 39, 8, 88, 72, "2026-07-08", "t", "jeans,indigo,thrift"),
  p("ss034", "Wide-Leg Vintage Jeans", "zuri", "women", "Jeans", 16200, 0, "Light blue", "#b7c9dc", ["Casual", "Travel"], ["Casual", "Trendy"], "Vintage denim", "Wide-leg vintage jeans with the kind of fade you cannot rush. One of one.", 4.6, 27, 1, 27, 68, "2026-08-21", "n", "jeans,wide,thrift"),
  p("ss035", "Black Stretch Skinny", "nkem", "women", "Jeans", 12800, 0, "Black", "#161616", ["Casual", "Office", "Date"], ["Casual", "Classic"], "Stretch denim", "Black skinnies with stretch that recovers. The practical pair.", 4.4, 51, 20, 140, 60, "2026-01-20", "b", "jeans,black,skinny"),
  p("ss036", "Enugu Wash Mom Jeans", "zuri", "women", "Jeans", 13900, 0, "Blue", "#3e5f8a", ["Casual", "Travel"], ["Casual", "Trendy"], "Denim", "Mom jeans in a wash we started calling Enugu because that is where they keep selling.", 4.5, 33, 6, 74, 65, "2026-05-15", "", "jeans,mom"),
  p("ss037", "Black Crepe Trousers", "marina", "women", "Trousers", 15500, 0, "Black", "#161616", ["Office", "Interview", "Dinner"], ["Corporate", "Classic"], "Crepe", "Black crepe trousers with a clean front. They work with the bow blouse and the satin cami.", 4.8, 42, 14, 118, 77, "2026-03-28", "b", "trousers,office,black"),
  p("ss038", "Beige Pleated Trousers", "marina", "women", "Trousers", 17200, 0, "Beige", "#e6d3b8", ["Office", "Church", "Casual"], ["Classic", "Corporate"], "Pleated suiting", "Pleats that fall, not puff. Beige that is closer to sand than to uniform.", 4.7, 18, 9, 46, 63, "2026-06-30", "", "trousers,pleat,beige"),
  p("ss039", "Olive Linen Trousers", "adaora", "women", "Trousers", 11800, 0, "Olive", "#5d6840", ["Casual", "Travel", "Beach"], ["Casual"], "Linen", "Pull-on linen trousers for travel days and hot offices. They crease, then they look like linen.", 4.5, 24, 16, 60, 58, "2026-04-04", "", "linen,trousers,olive"),
  p("ss040", "Wine Aso-oke Set", "ifunanya", "women", "Native Wear", 48000, 0, "Wine", "#6e2433", ["Wedding", "Party"], ["Luxury", "Native"], "Aso-oke", "Wrapper and buba in wine aso-oke with gold in the weave. Gele is not included, and the listing says so plainly.", 4.9, 48, 4, 96, 95, "2026-09-04", "ftb", "asooke,aso-oke,owambe,native,wedding", "/images/products/ss040.jpg"),
  p("ss041", "Independence Ankara Fit and Flare", "ifunanya", "women", "Native Wear", 22500, 0, "Multicolour", "#b43333", ["Party", "Church", "Birthday"], ["Native", "Party"], "Ankara cotton", "A fit-and-flare ankara that moves on a dance floor and still looks right at thanksgiving.", 4.7, 36, 10, 84, 79, "2026-08-01", "t", "ankara,native,flare"),
  p("ss042", "Emerald Women's Kaftan", "ifunanya", "women", "Native Wear", 28000, 0, "Emerald", "#0f6e56", ["Wedding", "Casual", "Church"], ["Native", "Luxury"], "Polish cotton", "A women's kaftan in emerald with restrained embroidery. Easy to wear, hard to ignore.", 4.8, 21, 8, 52, 74, "2026-07-22", "", "kaftan,native,emerald"),
  p("ss043", "Royal Georges Beaded Set", "ifunanya", "women", "Native Wear", 65000, 0, "Royal", "#1d3f8b", ["Wedding"], ["Luxury", "Native"], "Georges and beads", "A beaded Georges set for the introduction or the traditional wedding. This is the piece you plan the day around.", 4.9, 14, 5, 30, 86, "2026-06-01", "b", "georges,native,wedding,luxury"),
  p("ss044", "Red Isiagu-Inspired Set", "ifunanya", "women", "Native Wear", 24000, 0, "Red", "#b43333", ["Wedding", "Party"], ["Native", "Party"], "Cotton and embroidery", "A red set with isiagu-inspired embroidery, cut for women who want the reference without the costume.", 4.6, 19, 9, 44, 70, "2026-05-11", "", "isiagu,native,red,wedding"),
  p("ss045", "Indigo Adire Plunge Dress", "ifunanya", "women", "Native Wear", 19500, 0, "Indigo", "#2c3e73", ["Date", "Party", "Casual"], ["Native", "Romantic"], "Adire cotton", "Adire in a plunge dress, not a souvenir. Indigo that looks like night.", 4.7, 25, 11, 61, 73, "2026-09-11", "n", "adire,native,indigo,dress"),
  p("ss046", "Nude Block Heel Sandal", "kelechi", "women", "Shoes", 14800, 0, "Nude", "#e4cbb8", ["Office", "Church", "Wedding"], ["Classic", "Corporate"], "Leather", "Aba-made block heel in nude. The height you can stand in from praise worship to the photo line.", 4.6, 77, 18, 190, 84, "2026-03-12", "b", "heel,nude,sandal,office", "/images/products/ss046.jpg"),
  p("ss047", "Black Strappy Mule", "kelechi", "women", "Shoes", 16200, 0, "Black", "#161616", ["Party", "Date", "Dinner"], ["Party", "Trendy"], "Leather", "A strappy mule with a heel that is serious but not cruel. Black, so it finishes almost anything.", 4.5, 40, 12, 102, 76, "2026-06-18", "t", "mule,heel,black,party"),
  p("ss048", "Tan Woven Flat", "kelechi", "women", "Shoes", 8500, 0, "Tan", "#c49a6c", ["Casual", "Travel", "Beach"], ["Casual"], "Woven leather", "A woven flat for the market run and the airport. Soft from the first wear.", 4.4, 55, 22, 160, 62, "2026-02-02", "b", "flat,sandal,tan"),
  p("ss049", "Burgundy Court Heel", "kelechi", "women", "Shoes", 18900, 0, "Burgundy", "#8d2e3c", ["Office", "Wedding", "Dinner"], ["Classic", "Luxury"], "Leather", "A burgundy court heel. It makes a black dress look chosen.", 4.7, 29, 10, 80, 78, "2026-08-12", "n", "court,heel,burgundy"),
  p("ss050", "Everyday White Sneaker", "kelechi", "women", "Shoes", 15500, 0, "White", "#f7f4ef", ["Casual", "Travel"], ["Sporty", "Casual"], "Leather", "A clean white sneaker with a sole that can meet real roads. Not a costume trainer.", 4.6, 48, 14, 130, 80, "2026-04-19", "t", "sneaker,white,women"),
  p("ss051", "Gold Embellished Slide", "kelechi", "women", "Shoes", 9800, 0, "Gold", "#c6a15b", ["Party", "Beach", "Casual"], ["Party", "Trendy"], "Embellished strap", "A gold slide for the party and the next morning. Easy, and it looks like you tried.", 4.3, 36, 20, 110, 58, "2026-05-05", "", "slide,gold,party"),
  p("ss052", "Structured Mini Bag", "amaka", "women", "Bags", 18500, 0, "Burgundy", "#8d2e3c", ["Office", "Date", "Dinner"], ["Classic", "Corporate"], "Leather", "A structured mini in burgundy. It holds a phone, a card, a key, and the lipstick you will actually use.", 4.8, 61, 13, 150, 89, "2026-09-09", "ftn", "bag,burgundy,mini,office", "/images/products/ss052.jpg"),
  p("ss053", "Aba Woven Tote", "amaka", "women", "Bags", 12400, 0, "Tan", "#c49a6c", ["Casual", "Travel", "Church"], ["Casual"], "Woven leather", "A woven tote that survives the week. Made with Aba hands and a Surulere edit.", 4.6, 44, 16, 98, 72, "2026-03-21", "b", "tote,woven,tan"),
  p("ss054", "Black Chain Shoulder Bag", "amaka", "women", "Bags", 16800, 0, "Black", "#161616", ["Party", "Dinner", "Date"], ["Party", "Classic"], "Leather", "A black shoulder bag with a chain that does not snag your dress. Evening, sorted.", 4.7, 32, 11, 86, 75, "2026-07-03", "t", "bag,chain,black,party"),
  p("ss055", "Camel Soft Hobo", "amaka", "women", "Bags", 21000, 0, "Camel", "#c4a574", ["Office", "Casual", "Travel"], ["Classic", "Corporate"], "Leather", "A soft hobo in camel that looks broken-in on day one, in a good way.", 4.8, 28, 9, 70, 77, "2026-06-08", "", "hobo,camel,bag"),
  p("ss056", "Gold Beaded Clutch", "amaka", "women", "Bags", 9500, 0, "Gold", "#c6a15b", ["Wedding", "Party", "Dinner"], ["Party", "Luxury"], "Beads and metal", "A beaded clutch for owambe and the birthday after. Small, bright, enough.", 4.5, 39, 18, 120, 70, "2026-04-28", "b", "clutch,gold,wedding"),
  p("ss057", "Gold Hoop Set", "lumi", "women", "Accessories", 4800, 0, "Gold", "#c6a15b", ["Party", "Casual", "Date"], ["Trendy", "Classic"], "Gold-tone metal", "Everyday hoops with a weight that feels real. The pair you stop taking off.", 4.6, 70, 40, 200, 66, "2026-01-15", "b", "hoops,gold,earrings"),
  p("ss058", "Pearl Drop Earrings", "lumi", "women", "Accessories", 6200, 0, "White", "#f7f4ef", ["Church", "Wedding", "Office"], ["Classic", "Romantic"], "Pearl and gold-tone", "Pearl drops for Sunday and for the office when you want one quiet shine.", 4.7, 33, 24, 90, 64, "2026-02-20", "", "pearl,earrings,church"),
  p("ss059", "Adire Motif Silk Scarf", "lumi", "women", "Accessories", 7500, 0, "Indigo", "#2c3e73", ["Casual", "Travel", "Office"], ["Native", "Classic"], "Silk-touch", "A scarf with an adire motif. Tie it on a bag, a neck, or a head and the outfit changes.", 4.5, 18, 20, 48, 55, "2026-08-05", "n", "scarf,adire,indigo"),
  p("ss060", "Slim Leather Belt", "lumi", "women", "Accessories", 5200, 0, "Black", "#161616", ["Office", "Casual"], ["Classic"], "Leather", "A slim black belt that disappears into the outfit and still holds the dress in.", 4.4, 26, 30, 80, 50, "2026-03-03", "", "belt,black"),
  p("ss061", "Charcoal Heavyweight Tee", "tobi", "men", "T-shirts", 6500, 0, "Charcoal", "#3a3836", ["Casual", "Travel"], ["Streetwear", "Casual"], "Heavyweight cotton", "A charcoal tee with weight. It does not twist after the second wash.", 4.6, 88, 32, 260, 84, "2026-08-18", "tb", "tee,charcoal,street", "/images/products/ss061.jpg"),
  p("ss062", "Enugu Block Tee", "tobi", "men", "T-shirts", 7200, 0, "Cream", "#f3e6d4", ["Casual"], ["Streetwear", "Trendy"], "Cotton", "A cream tee with a quiet block shape. No noisy slogan. Just a cut and a colour.", 4.5, 41, 18, 110, 70, "2026-09-21", "n", "tee,cream,enugu"),
  p("ss063", "Boxy White Tee", "tobi", "men", "T-shirts", 5800, 0, "White", "#f7f4ef", ["Casual"], ["Streetwear", "Casual"], "Cotton", "The boxy white tee. It sells through, then we cut it again. This drop is low.", 4.7, 96, 4, 300, 90, "2026-01-08", "b", "tee,white"),
  p("ss064", "Breton Stripe Tee", "obi", "men", "T-shirts", 6900, 0, "Navy", "#1e2a44", ["Casual"], ["Classic", "Casual"], "Cotton", "A navy stripe tee that works under a senator jacket or with chinos. Obi cuts it slightly long.", 4.6, 37, 20, 95, 66, "2026-04-12", "", "tee,stripe,navy"),
  p("ss065", "Oversized Black Tee", "tobi", "men", "T-shirts", 6200, 0, "Black", "#161616", ["Casual"], ["Streetwear", "Casual"], "Cotton", "Oversized, not sloppy. A black tee for the weekend uniform.", 4.5, 52, 24, 140, 72, "2026-05-19", "t", "tee,black,oversized"),
  p("ss066", "Navy Pique Polo", "obi", "men", "Shirts", 11500, 0, "Navy", "#1e2a44", ["Casual", "Office", "Church"], ["Casual", "Classic"], "Pique cotton", "The Friday polo. Navy, a collar that stays, and a fit that does not balloon.", 4.8, 64, 16, 170, 88, "2026-09-05", "ftn", "polo,navy,friday", "/images/products/ss066.jpg"),
  p("ss067", "Burgundy Tipped Polo", "obi", "men", "Shirts", 12800, 0, "Burgundy", "#8d2e3c", ["Casual", "Date", "Dinner"], ["Casual", "Trendy"], "Pique cotton", "Burgundy with a tipped collar. A date-night polo, if you are that man.", 4.7, 29, 12, 80, 76, "2026-08-14", "n", "polo,burgundy"),
  p("ss068", "Sand Linen Polo", "obi", "men", "Shirts", 13400, 0, "Sand", "#e6d3b8", ["Casual", "Travel", "Beach"], ["Casual"], "Linen", "A linen polo in sand. It creases. That is how you know it is linen.", 4.6, 22, 10, 55, 68, "2026-06-22", "", "polo,linen,sand"),
  p("ss069", "Classic White Polo", "obi", "men", "Shirts", 10900, 0, "White", "#f7f4ef", ["Church", "Casual", "Office"], ["Classic", "Casual"], "Pique cotton", "White polo, properly opaque, for Sunday and for the office that allows it.", 4.7, 48, 18, 130, 74, "2026-02-28", "b", "polo,white,church"),
  p("ss070", "Sky Oxford Shirt", "obi", "men", "Shirts", 9800, 0, "Sky", "#8eb4d4", ["Office", "Interview", "Church"], ["Corporate", "Classic"], "Oxford cotton", "A sky oxford that does not go limp by 2pm. The interview shirt, and the Tuesday shirt.", 4.8, 55, 20, 150, 82, "2026-09-19", "n", "oxford,shirt,office,sky", "/images/products/ss070.jpg"),
  p("ss071", "Olive Cuban Collar Shirt", "tobi", "men", "Shirts", 11200, 0, "Olive", "#5d6840", ["Casual", "Date", "Party"], ["Casual", "Trendy"], "Viscose", "A cuban collar in olive. Open one button, not three, and you are dressed.", 4.6, 31, 14, 78, 73, "2026-07-27", "t", "cuban,shirt,olive,date"),
  p("ss072", "White Stretch Dress Shirt", "marina", "men", "Shirts", 12500, 0, "White", "#f7f4ef", ["Office", "Interview", "Wedding"], ["Corporate", "Classic"], "Stretch cotton", "A white dress shirt with stretch, so the interview does not feel like a costume.", 4.7, 40, 15, 100, 75, "2026-03-16", "b", "shirt,white,interview,office"),
  p("ss073", "Print Camp Collar Shirt", "tobi", "men", "Shirts", 10400, 0, "Multicolour", "#c4654a", ["Party", "Casual", "Beach"], ["Party", "Trendy"], "Viscose", "A camp collar shirt with a small print. Party, not costume.", 4.4, 18, 12, 42, 60, "2026-08-09", "n", "camp,shirt,print,party"),
  p("ss074", "Indigo Denim Shirt", "obi", "men", "Shirts", 13800, 0, "Indigo", "#2c3e73", ["Casual"], ["Streetwear", "Classic"], "Denim", "A denim shirt you can wear open over a tee or closed to a casual Friday.", 4.5, 26, 11, 64, 66, "2026-05-23", "", "denim,shirt"),
  p("ss075", "Slim Indigo Jeans", "obi", "men", "Jeans", 15200, 0, "Indigo", "#2c3e73", ["Casual", "Date"], ["Casual", "Classic"], "Denim", "Slim indigo jeans with a rise that works under a polo or a native shirt.", 4.7, 46, 13, 120, 78, "2026-04-02", "tb", "jeans,indigo,men"),
  p("ss076", "Relaxed Black Jeans", "tobi", "men", "Jeans", 14600, 0, "Black", "#161616", ["Casual"], ["Streetwear", "Casual"], "Denim", "Relaxed black jeans. The other half of the weekend uniform.", 4.6, 38, 15, 98, 74, "2026-06-14", "t", "jeans,black,relaxed"),
  p("ss077", "Light Wash Straight Jeans", "zuri", "men", "Jeans", 16000, 0, "Light blue", "#b7c9dc", ["Casual"], ["Casual", "Trendy"], "Vintage denim", "Light-wash straight jeans from the thrift edit. One pair, measured, no stories.", 4.5, 17, 1, 17, 58, "2026-09-02", "n", "jeans,thrift,light"),
  p("ss078", "Cargo Denim", "tobi", "men", "Jeans", 17500, 0, "Indigo", "#2c3e73", ["Casual", "Travel"], ["Streetwear"], "Denim", "Cargo denim with pockets that are useful, not theatrical.", 4.4, 21, 9, 50, 63, "2026-08-25", "n", "cargo,denim,street"),
  p("ss079", "Stone Chino", "obi", "men", "Trousers", 12800, 0, "Stone", "#e6d3b8", ["Casual", "Office", "Church"], ["Casual", "Classic"], "Cotton twill", "Stone chinos. The trouser that makes a polo look finished.", 4.8, 52, 16, 140, 80, "2026-03-30", "b", "chino,stone,friday"),
  p("ss080", "Charcoal Pleated Trouser", "marina", "men", "Trousers", 16500, 0, "Charcoal", "#3a3836", ["Office", "Interview", "Dinner"], ["Corporate", "Classic"], "Suiting", "A pleated charcoal trouser for the office and the dinner after it.", 4.7, 19, 8, 48, 70, "2026-05-08", "", "trouser,pleat,office"),
  p("ss081", "Linen Drawstring Trouser", "obi", "men", "Trousers", 11900, 0, "Sand", "#e6d3b8", ["Casual", "Travel", "Beach"], ["Casual"], "Linen", "Drawstring linen trousers. Travel, beach road, a hot Saturday.", 4.5, 24, 14, 66, 62, "2026-06-16", "", "linen,trouser,sand"),
  p("ss082", "Navy Tailored Trouser", "marina", "men", "Trousers", 15400, 0, "Navy", "#1e2a44", ["Office", "Interview"], ["Corporate", "Classic"], "Wool-touch suiting", "Navy tailored trousers with a crease that stays. Interview ready.", 4.8, 33, 12, 90, 76, "2026-02-19", "b", "trouser,navy,interview"),
  p("ss083", "Cream Embroidered Kaftan", "chuka", "men", "Native Wear", 32000, 0, "Cream", "#f3e6d4", ["Wedding", "Casual", "Church"], ["Native", "Luxury"], "Polish cotton", "A cream kaftan with embroidery that is felt, not printed. Friday, or the wedding weekend.", 4.9, 28, 8, 72, 88, "2026-09-07", "ftn", "kaftan,cream,native,embroidery", "/images/products/ss083.jpg"),
  p("ss084", "Friday Kaftan Deep Green", "chuka", "men", "Native Wear", 24500, 0, "Green", "#1f6b45", ["Casual", "Church", "Travel"], ["Native", "Classic"], "Cotton", "The Friday kaftan. Deep green, easy embroidery, a cut you can drive in.", 4.7, 34, 11, 86, 79, "2026-07-11", "t", "kaftan,green,friday,native"),
  p("ss085", "Wine and Gold Kaftan", "chuka", "men", "Native Wear", 45000, 0, "Wine", "#6e2433", ["Wedding", "Party"], ["Luxury", "Native"], "Cotton and metallic thread", "Wine with gold thread for the evening you are in the family photos.", 4.8, 16, 6, 40, 84, "2026-08-28", "n", "kaftan,wine,wedding,luxury"),
  p("ss086", "Black Senator Shirt", "chuka", "men", "Native Wear", 22000, 0, "Black", "#161616", ["Wedding", "Office", "Dinner"], ["Native", "Corporate"], "Senator fabric", "A black senator with clean embroidery. Groomsmen wear it. So do men with a Tuesday meeting and a Thursday introduction.", 4.9, 62, 10, 150, 92, "2026-04-18", "ftb", "senator,black,native,wedding", "/images/products/ss086.jpg"),
  p("ss087", "Red Lion Isiagu", "chuka", "men", "Native Wear", 28500, 0, "Red", "#b43333", ["Wedding", "Party"], ["Native", "Party"], "Isiagu cotton", "Red isiagu with lion embroidery that is actually embroidered. For the traditional and the party after.", 4.8, 24, 7, 58, 83, "2026-06-06", "t", "isiagu,red,native,wedding"),
  p("ss088", "Ivory Embroidered Native", "chuka", "men", "Native Wear", 18900, 0, "Ivory", "#f3e6d4", ["Church", "Wedding", "Office"], ["Native", "Classic"], "Cotton", "An ivory native shirt with tonal embroidery. It dresses up for church and down with black trousers.", 4.9, 71, 13, 180, 94, "2026-09-22", "ftb", "senator,ivory,native,church", "/images/hero-man.jpg"),
  p("ss089", "Sky-Blue Senator", "chuka", "men", "Native Wear", 21500, 0, "Sky", "#8eb4d4", ["Wedding", "Casual"], ["Native", "Classic"], "Senator fabric", "Sky-blue senator for the guest who does not want black or white. Fresh, and it photographs clean.", 4.7, 20, 9, 48, 75, "2026-08-03", "n", "senator,sky,native"),
  p("ss090", "Classic Cream Agbada", "chuka", "men", "Native Wear", 78000, 0, "Cream", "#f3e6d4", ["Wedding"], ["Luxury", "Native"], "Swiss and embroidery", "A classic cream agbada with restrained gold embroidery and a matching fila. The courtyard portrait is this set.", 4.9, 22, 6, 40, 96, "2026-01-20", "ftb", "agbada,cream,wedding,luxury", "/images/products/ss090.jpg"),
  p("ss091", "Royal Blue Wedding Agbada", "chuka", "men", "Native Wear", 95000, 0, "Royal", "#1d3f8b", ["Wedding"], ["Luxury", "Native"], "Swiss and embroidery", "Royal blue agbada for the groom's side. Only two left in this drop.", 4.9, 11, 2, 18, 90, "2026-09-01", "n", "agbada,royal,wedding"),
  p("ss092", "Modern Burgundy Agbada", "chuka", "men", "Native Wear", 88000, 110000, "Burgundy", "#8d2e3c", ["Wedding"], ["Luxury", "Native"], "Swiss and embroidery", "A modern burgundy agbada. Less traditional volume, same presence. On offer this month.", 4.8, 9, 5, 15, 88, "2026-09-26", "nd", "agbada,burgundy,wedding"),
  p("ss093", "White Court Sneaker", "kelechi", "men", "Shoes", 22000, 0, "White", "#f7f4ef", ["Casual"], ["Sporty", "Classic"], "Leather", "A white court sneaker made to be worn, not kept in the box. Clean lines, a sole that grips.", 4.6, 40, 12, 100, 82, "2026-08-11", "tn", "sneaker,white,court", "/images/products/ss093.jpg"),
  p("ss094", "Black Gum Runner", "kelechi", "men", "Shoes", 24500, 0, "Black", "#161616", ["Casual", "Travel"], ["Sporty", "Streetwear"], "Mesh and leather", "A black runner with a gum sole. For Enugu roads and Lagos weekends.", 4.5, 28, 10, 72, 74, "2026-05-30", "t", "sneaker,runner,black"),
  p("ss095", "Tan Leather Sneaker", "kelechi", "men", "Shoes", 28000, 0, "Tan", "#c49a6c", ["Casual", "Date"], ["Classic", "Casual"], "Leather", "A tan leather sneaker that can sit next to a native shirt without looking confused.", 4.7, 18, 8, 44, 70, "2026-07-18", "n", "sneaker,tan,leather"),
  p("ss096", "Reversible Leather Belt", "lumi", "men", "Accessories", 6500, 0, "Black", "#161616", ["Office", "Casual"], ["Classic"], "Leather", "Black on one side, brown on the other. The belt that finishes the chino and the interview trouser.", 4.6, 35, 22, 90, 60, "2026-02-11", "b", "belt,reversible,leather"),
  p("ss097", "Woven Brown Belt", "lumi", "men", "Accessories", 5800, 0, "Brown", "#6b4a32", ["Casual"], ["Classic", "Casual"], "Leather", "A woven brown belt. Casual, and it looks like you thought about it.", 4.4, 16, 18, 40, 48, "2026-04-07", "", "belt,woven,brown"),
  p("ss098", "Minimal Gold Watch", "lumi", "men", "Accessories", 18500, 0, "Gold", "#c6a15b", ["Office", "Date", "Wedding"], ["Classic", "Luxury"], "Steel and gold-tone", "A minimal gold-tone watch. It finishes a senator or a white shirt without shouting.", 4.7, 27, 11, 66, 76, "2026-06-25", "t", "watch,gold"),
  p("ss099", "Steel Everyday Watch", "lumi", "men", "Accessories", 14200, 0, "Grey", "#8a8680", ["Casual", "Office"], ["Classic", "Sporty"], "Steel", "A steel everyday watch. The one you forget you are wearing, which is the point.", 4.6, 31, 14, 80, 68, "2026-03-19", "", "watch,steel"),
  p("ss100", "Tortoise Acetate Sunglasses", "lumi", "men", "Accessories", 7800, 0, "Brown", "#6b4a32", ["Casual", "Travel", "Beach"], ["Casual", "Trendy"], "Acetate", "Tortoise sunglasses with a shape that suits most faces. UV lenses, not a fashion toy.", 4.5, 22, 16, 55, 62, "2026-08-06", "n", "sunglasses,tortoise"),
  p("ss101", "Black Slim Sunglasses", "lumi", "men", "Accessories", 6400, 0, "Black", "#161616", ["Casual"], ["Streetwear", "Casual"], "Acetate", "Slim black sunglasses. The last piece of the weekend uniform.", 4.4, 29, 20, 70, 64, "2026-05-12", "t", "sunglasses,black"),
  p("ss102", "Yellow Smocked Dress", "nneka", "kids", "Dresses", 8500, 0, "Yellow", "#e6c85c", ["Church", "Birthday"], ["Casual", "Classic"], "Cotton", "A yellow smocked dress that is not itchy. Nneka tests that before anything else.", 4.9, 24, 12, 60, 70, "2026-08-20", "n", "kids,dress,church,yellow"),
  p("ss103", "Girls Ankara Dress", "nneka", "kids", "Dresses", 9200, 0, "Multicolour", "#b43333", ["Party", "Church", "Wedding"], ["Native", "Party"], "Ankara cotton", "A girls ankara dress for the family aso-ebi, cut so she can still run.", 4.8, 18, 10, 40, 66, "2026-07-02", "", "kids,ankara,native"),
  p("ss104", "Girls Party Tulle", "nneka", "kids", "Dresses", 12000, 0, "Pink", "#e7b7c2", ["Birthday", "Party"], ["Party", "Romantic"], "Tulle and cotton lining", "Party tulle with a cotton lining, so the itch does not start the tears.", 4.7, 15, 8, 32, 60, "2026-09-15", "n", "kids,tulle,birthday"),
  p("ss105", "Boys Oxford Shirt", "nneka", "kids", "Shirts", 6800, 0, "White", "#f7f4ef", ["Church"], ["Classic"], "Cotton", "A boys white oxford for Sunday. Collar stays, buttons stay on.", 4.8, 20, 14, 48, 58, "2026-03-08", "b", "kids,shirt,church"),
  p("ss106", "Boys Polo Set", "nneka", "kids", "Tops", 8900, 0, "Navy", "#1e2a44", ["Casual", "Church"], ["Casual"], "Pique cotton", "Polo and short set in navy. Church, visiting, the Tuesday that still needs a collar.", 4.7, 16, 11, 36, 55, "2026-06-11", "", "kids,polo,set"),
  p("ss107", "Kids Court Sneaker", "kelechi", "kids", "Shoes", 9500, 0, "White", "#f7f4ef", ["Casual"], ["Sporty", "Casual"], "Leather", "A small court sneaker in white. They will scuff it. It is built for that.", 4.6, 19, 10, 42, 57, "2026-08-17", "n", "kids,sneaker,white"),
  p("ss108", "Kids Comfort Sandal", "kelechi", "kids", "Shoes", 5500, 0, "Tan", "#c49a6c", ["Casual", "Church"], ["Casual"], "Leather", "A comfort sandal for long services and longer family visits.", 4.5, 21, 16, 50, 52, "2026-02-25", "", "kids,sandal"),
  p("ss109", "Kids Native Set", "ifunanya", "kids", "Native Wear", 14500, 0, "Red", "#b43333", ["Wedding", "Church"], ["Native"], "Cotton", "A children's native set in red, so the family photo matches without the adult price.", 4.8, 12, 7, 28, 64, "2026-09-03", "n", "kids,native,wedding,red"),
  p("ss110", "Bridal Aso-oke Ensemble", "ifunanya", "women", "Native Wear", 145000, 0, "Wine", "#6e2433", ["Wedding"], ["Luxury", "Native"], "Aso-oke and beads", "A bridal aso-oke ensemble with beadwork. For the woman the day is actually about.", 5.0, 8, 3, 8, 92, "2026-09-10", "n", "bridal,asooke,wedding,luxury"),
  p("ss111", "Premium Three-Piece Agbada", "chuka", "men", "Native Wear", 128000, 0, "Cream", "#f3e6d4", ["Wedding"], ["Luxury", "Native"], "Swiss, guinea and embroidery", "Agbada, inner shirt and trousers in a heavier Swiss. The premium cut from House of Chuka.", 4.9, 6, 4, 6, 90, "2026-08-29", "n", "agbada,premium,wedding,luxury"),
  p("ss112", "Beaded Reception Gown", "nkem", "women", "Dresses", 118000, 0, "Champagne", "#e7d7c3", ["Wedding", "Party"], ["Luxury", "Party"], "Crepe and beads", "A beaded reception gown in champagne. It is a lot of dress, and the price is honest about that.", 4.8, 5, 3, 5, 86, "2026-07-30", "", "gown,beaded,reception,wedding"),
  p("ss113", "Black Leather Loafer", "kelechi", "men", "Shoes", 16500, 0, "Black", "#161616", ["Office", "Wedding", "Interview"], ["Classic", "Corporate"], "Leather", "A black loafer that works with a senator and with the interview trouser. Aba-made, honestly finished.", 4.7, 30, 11, 78, 78, "2026-04-25", "b", "loafer,black,office,men"),
  p("ss114", "Brown Oxford Shoe", "kelechi", "men", "Shoes", 18900, 0, "Brown", "#6b4a32", ["Office", "Wedding", "Church"], ["Classic"], "Leather", "A brown oxford for the men who still like a lace. Polished, not shiny for the sake of it.", 4.6, 18, 9, 40, 68, "2026-05-17", "", "oxford,shoe,brown,office"),
];

export function getProduct(slugOrId: string) {
  return products.find((p) => p.slug === slugOrId || p.id === slugOrId);
}
