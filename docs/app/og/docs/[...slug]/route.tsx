import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { loadFonts } from "@/lib/fonts";
import { OG_IMAGE_SIZE, OgImage } from "@/lib/og";
import { getPageImage, source } from "@/lib/source";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const fonts = await loadFonts();

  return new ImageResponse(
    <OgImage title={page.data.title} description={page.data.description} />,
    {
      ...OG_IMAGE_SIZE,
      fonts,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
