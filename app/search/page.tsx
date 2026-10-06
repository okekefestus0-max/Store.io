import { Suspense } from "react";
import SearchClient from "./ui";
export const metadata = { title: "Search" };
export default function Page() {
  return <Suspense fallback={<div className="wrap page-hero"><h1>Searching…</h1></div>}><SearchClient /></Suspense>;
}
