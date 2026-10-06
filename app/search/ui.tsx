"use client";
import { useSearchParams } from "next/navigation";
import ShopExperience from "@/components/ShopExperience";
export default function SearchClient() {
  const q = useSearchParams().get("q") || "";
  return <ShopExperience title={q ? `Results for “${q}”` : "Search"} eyebrow="Search" query={q} intro="Try red dress under ₦20K, men’s wedding outfit, church outfit size 12, or a complete outfit under ₦50K." />;
}
