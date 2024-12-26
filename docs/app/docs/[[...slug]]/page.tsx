import { useMDXComponents } from "@/components/mdx-components";
import { buttonVariants } from "@/components/ui/button";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface DocPageParams {
  params: Promise<{ slug?: string[] }>;
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

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <div className="flex flex-col gap-2">
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription className="mb-2.5">
          {page.data.description}
        </DocsDescription>
        <div className="flex items-center gap-2">
          {page.data.links?.doc ? (
            <Link
              href={page.data.links.doc}
              target="_blank"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "h-6 rounded-sm px-2 py-0.5 [&_svg]:size-3.5",
                }),
              )}
            >
              Docs
              <ExternalLink aria-hidden="true" />
            </Link>
          ) : null}
          {page.data.links?.api ? (
            <Link
              href={page.data.links.api}
              target="_blank"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "h-6 rounded-sm px-2 py-0.5 [&_svg]:size-3.5",
                }),
              )}
            >
              API
              <ExternalLink aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
      <DocsBody>
        <MDX components={useMDXComponents({})} />
      </DocsBody>
    </DocsPage>
  );
}
