import { ImageResponse } from "next/og";

import { loadFonts } from "@/lib/fonts";
import { OG_IMAGE_SIZE, OgImage } from "@/lib/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = SITE_NAME;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadFonts();

  return new ImageResponse(
    <OgImage title={SITE_TAGLINE} description={SITE_DESCRIPTION} />,
    {
      ...size,
      fonts,
    },
  );
}
