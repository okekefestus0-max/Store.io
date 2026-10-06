import ShopExperience from "@/components/ShopExperience";
export const metadata = { title: "Deals" };
export default function Page() {
  return <ShopExperience title="Deals" eyebrow="This week" intro="Prices cut. The cloth is not. Weekend code WEEKEND runs Friday to Sunday." image="/images/edit-date.jpg" preset={{ flag: "deal" }} />;
}
