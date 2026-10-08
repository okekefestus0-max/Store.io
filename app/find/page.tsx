import { Suspense } from "react";
import { FindPage } from "@/components/MorePages";
export const metadata = { title: "Find something like this" };
export default function Page() { return <Suspense><FindPage /></Suspense>; }
