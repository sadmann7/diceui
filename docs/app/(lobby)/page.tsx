import { Catalog } from "@/components/lobby/catalog";
import { Hero } from "@/components/lobby/hero";
import { Source } from "@/components/lobby/source";
import { Sponsors } from "@/components/lobby/sponsors";

export default function IndexPage(_props: PageProps<"/">) {
  return (
    <>
      <Hero />
      <Catalog />
      <Source />
      <Sponsors />
    </>
  );
}
