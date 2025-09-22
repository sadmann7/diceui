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

  const docLink = page.data.links?.doc;
  const apiLink = page.data.links?.api;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <div className="flex flex-col gap-2">
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription className="mb-2.5">
          {page.data.description}
        </DocsDescription>
        <div className="flex items-center gap-2">
          {docLink ? <DynamicLink href={docLink}>Docs</DynamicLink> : null}
          {apiLink ? <DynamicLink href={apiLink}>API</DynamicLink> : null}
          {(docLink || apiLink) && (
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-6"
            />
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
