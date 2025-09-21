import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyMarkdownButton, ViewOptions } from "@/components/doc-actions";
import { DynamicLink } from "@/components/dynamic-link";
import { Mdx } from "@/components/mdx-components";
import { Separator } from "@/components/ui/separator";
import { source } from "@/lib/source";

interface DocPageParams {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export async function generateMetadata(
  props: DocPageParams,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function DocPage(props: DocPageParams) {
  const params = await props.params;
  const page = source.getPage(params.slug);

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
          {(page.data.links?.doc || page.data.links?.api) && (
            <Separator orientation="vertical" />
          )}
          <CopyMarkdownButton markdownUrl={`${page.url}.mdx`} />
          <ViewOptions
            markdownUrl={`${page.url}.mdx`}
            githubUrl={`https://github.com/sadmann7/diceui/blob/main/docs/content/docs/${page.file.path}`}
          />
        </div>
      </div>
      <DocsBody>
        <Mdx page={page} />
      </DocsBody>
    </DocsPage>
  );
}
