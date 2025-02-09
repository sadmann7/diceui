import { DynamicLink } from "@/components/dynamic-link";
import { Mdx } from "@/components/mdx-components";
import { source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface UtilityPageParams {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  return source
    .getPages()
    .filter((page) => page.slugs[0] === "utilities")
    .map((page) => ({
      slug: page.slugs.slice(1),
    }));
}

export async function generateMetadata(
  props: UtilityPageParams,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(["utilities", ...(params.slug ?? [])]);

  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function UtilityPage(props: UtilityPageParams) {
  const params = await props.params;
  const page = source.getPage(["utilities", ...(params.slug ?? [])]);

  if (!page) notFound();

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <div className="flex flex-col gap-2">
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription className="mb-2.5">
          {page.data.description}
        </DocsDescription>
        <div className="flex items-center gap-2">
          {page.data.links?.doc ? (
            <DynamicLink href={page.data.links.doc}>Docs</DynamicLink>
          ) : null}
          {page.data.links?.api ? (
            <DynamicLink href={page.data.links.api}>API</DynamicLink>
          ) : null}
        </div>
      </div>
      <DocsBody>
        <Mdx page={page} />
      </DocsBody>
    </DocsPage>
  );
}
