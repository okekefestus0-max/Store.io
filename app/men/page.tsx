import ShopExperience from "@/components/ShopExperience";
export const metadata = { title: "Shop Men" };
export default function Page() {
  return <ShopExperience title="Men" eyebrow="The edit" intro="Weekend, office, and the native you will actually wear again." image="/images/hero-man.jpg" preset={{ gender: "men" }} />;
}
