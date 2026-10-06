import { OCCASION_PAGES } from "@/lib/brand";
import ShopExperience from "@/components/ShopExperience";
import type { Metadata } from "next";
export function generateStaticParams() { return OCCASION_PAGES.map((o) => ({ slug: o.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const o = OCCASION_PAGES.find((x) => x.slug === params.slug);
  return { title: o?.title || "Occasion" };
}
export default function Page({ params }: { params: { slug: string } }) {
  const o = OCCASION_PAGES.find((x) => x.slug === params.slug);
  if (!o) return <ShopExperience title="Occasion" />;
  return <ShopExperience title={o.title} eyebrow="Occasion" intro={o.blurb} image={o.image} preset={{ occasions: [o.occasion] }} />;
}
