import { Catalog } from "@/components/lobby/catalog";
import { Hero } from "@/components/lobby/hero";
import { Source } from "@/components/lobby/source";

export default function IndexPage(_props: PageProps<"/">) {
  return (
    <>
      <Hero />
      <Catalog />
      <Source />
    </>
  );
}
