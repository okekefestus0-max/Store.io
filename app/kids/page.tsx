import ShopExperience from "@/components/ShopExperience";
export const metadata = { title: "Shop Kids" };
export default function Page() {
  return <ShopExperience title="Kids" eyebrow="Little" intro="Church, parties and Tuesdays. Nothing itchy on purpose." preset={{ gender: "kids" }} />;
}
