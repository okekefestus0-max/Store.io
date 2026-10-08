import { articles } from "@/lib/content";
import { ArticlePage } from "@/components/MorePages";
export function generateStaticParams() { return articles.map((a) => ({ slug: a.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const a = articles.find((x) => x.slug === params.slug);
  return { title: a?.title || "Journal", description: a?.excerpt };
}
export default function Page({ params }: { params: { slug: string } }) {
  return <ArticlePage slug={params.slug} />;
}
