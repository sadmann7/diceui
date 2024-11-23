import { source } from "@/lib/source";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageParams {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page(props: PageParams) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (page == null) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export async function generateMetadata(props: PageParams): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (page == null) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
