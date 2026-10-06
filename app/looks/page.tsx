import { Suspense } from "react";
import { LooksPage } from "@/components/MorePages";
export const metadata = { title: "Shop Complete Looks" };
export default function Page() {
  return <Suspense><LooksPage /></Suspense>;
}
