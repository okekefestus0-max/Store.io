import CheckoutFlow from "@/components/CheckoutFlow";
export const metadata = { title: "Checkout" };
export default function Page({ searchParams }: { searchParams: { now?: string } }) {
  return <CheckoutFlow buyNow={searchParams.now === "1"} />;
}
