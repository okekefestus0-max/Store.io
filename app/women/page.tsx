import ShopExperience from "@/components/ShopExperience";
export const metadata = { title: "Shop Women" };
export default function Page() {
  return <ShopExperience title="Women" eyebrow="The edit" intro="Dresses, sets, native and everyday pieces, sized from XS to XXXL." image="/images/hero-portrait.jpg" preset={{ gender: "women" }} />;
}
