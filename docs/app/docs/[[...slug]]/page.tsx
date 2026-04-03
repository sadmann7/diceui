import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BaseSwitcher } from "@/components/base-switcher";
import { DocActions } from "@/components/doc-actions";
import { DynamicLink } from "@/components/dynamic-link";
import { Mdx } from "@/components/mdx-components";
import { getHasBothBases } from "@/lib/base";
import { getChangelogToc } from "@/lib/changelog";
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
  const base = page.data.base;

  const showBaseSwitcher = getHasBothBases({ url: page.url, base });

  const toc =
    page.url === "/docs/changelog" ? getChangelogToc() : page.data.toc;

  return (
    <DocsPage
      toc={toc}
      tableOfContent={{ style: "clerk" }}
      full={page.data.full}
      breadcrumb={{ enabled: false }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription className="mb-2.5">
            {page.data.description}
          </DocsDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1.5">
          {docLink ? <DynamicLink href={docLink}>Docs</DynamicLink> : null}
          {apiLink ? <DynamicLink href={apiLink}>API</DynamicLink> : null}
          <DocActions url={page.url} path={page.path} />
        </div>
      </div>
      {showBaseSwitcher && base ? (
        <BaseSwitcher base={base} pathname={page.url} />
      ) : null}
      <DocsBody className="pt-2">
        <Mdx page={page} />
      </DocsBody>
    </DocsPage>
  );
}
