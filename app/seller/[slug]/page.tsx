import { sellers } from "@/lib/sellers";
import { SellerPage } from "@/components/MorePages";
export function generateStaticParams() { return sellers.map((s) => ({ slug: s.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: sellers.find((s) => s.slug === params.slug)?.name || "Seller" };
}
export default function Page({ params }: { params: { slug: string } }) {
  return <SellerPage slug={params.slug} />;
}
