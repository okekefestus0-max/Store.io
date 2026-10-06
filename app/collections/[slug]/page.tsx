import ShopExperience from "@/components/ShopExperience";
export function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: params.slug.replace(/-/g, " ") };
}
export default function Page({ params }: { params: { slug: string } }) {
  if (params.slug === "mens-weekend") {
    return <ShopExperience title="Men’s weekend style" eyebrow="Collection" intro="Polos, chinos, tees and the shoe that survives New Haven." image="/images/hero-man.jpg" preset={{ gender: "men", styles: ["Casual", "Streetwear"] }} />;
  }
  if (params.slug === "trending") return <ShopExperience title="Trending now" preset={{ flag: "trending", sort: "popular" }} />;
  return <ShopExperience title="Collection" />;
}
