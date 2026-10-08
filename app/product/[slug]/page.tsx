import { products } from "@/lib/products";
import ProductView from "@/components/ProductView";
import type { Metadata } from "next";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = products.find((x) => x.slug === params.slug);
  return { title: p?.name || "Piece", description: p?.description };
}
export default function Page({ params }: { params: { slug: string } }) {
  return <ProductView slug={params.slug} />;
}
