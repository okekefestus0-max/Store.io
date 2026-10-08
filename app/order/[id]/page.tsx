"use client";
import { useParams } from "next/navigation";
import { OrderConfirm } from "@/components/CheckoutFlow";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <OrderConfirm id={id} />;
}
