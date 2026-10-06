import ShopExperience from "@/components/ShopExperience";
const MAP: Record<string, string> = {
  dresses: "Dresses", tops: "Tops", "t-shirts": "T-shirts", shirts: "Shirts", jeans: "Jeans",
  trousers: "Trousers", "two-piece-sets": "Two-Piece Sets", "native-wear": "Native Wear",
  shoes: "Shoes", bags: "Bags", accessories: "Accessories",
};
export function generateStaticParams() { return Object.keys(MAP).map((slug) => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: MAP[params.slug] || "Category" };
}
export default function Page({ params }: { params: { slug: string } }) {
  const cat = MAP[params.slug];
  return <ShopExperience title={cat || "Category"} eyebrow="Category" preset={cat ? { categories: [cat] } : {}} />;
}
