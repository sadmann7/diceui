import { Catalog } from "@/components/landing/catalog";
import { Hero } from "@/components/landing/hero";
import { Source } from "@/components/landing/source";

export default function IndexPage(_props: PageProps<"/">) {
  return (
    <>
      <Hero />
      <Catalog />
      <Source />
    </>
  );
}
