import ShopExperience from "@/components/ShopExperience";
export const metadata = { title: "New Arrivals" };
export default function Page() {
  return <ShopExperience title="New arrivals" eyebrow="Just in" intro="The latest from Enugu ateliers and Lagos studios." image="/images/edit-street.jpg" preset={{ flag: "newArrival", sort: "newest" }} />;
}
