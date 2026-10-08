import { budgetBySlug } from "@/lib/catalog";
import ShopExperience from "@/components/ShopExperience";
export function generateStaticParams() {
  return ["under-10k", "10-20", "20-50", "50-100", "100-plus", "under-20k"].map((slug) => ({ slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: budgetBySlug(params.slug)?.label || "Budget" };
}
export default function Page({ params }: { params: { slug: string } }) {
  const b = budgetBySlug(params.slug);
  if (!b) return <ShopExperience title="Budget" />;
  return <ShopExperience title={b.label} eyebrow="Budget" intro={b.blurb} preset={{ priceMin: b.min, priceMax: b.max }} />;
}
