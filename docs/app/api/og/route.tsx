import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { loadFonts } from "@/lib/fonts";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") ?? siteConfig.name;

    const fonts = await loadFonts();

    return new ImageResponse(
      <div
        tw="flex flex-col w-full h-full items-center justify-center"
        style={{
          fontFamily: "Geist Sans",
          background: "linear-gradient(to bottom right, #111827, #000000)",
        }}
      >
        <div tw="flex flex-col w-[80%] h-full items-center justify-center">
          <h1
            tw="flex items-center font-bold text-6xl text-white justify-center"
            style={{
              textWrap: "balance",
            }}
          >
            {title}
          </h1>
          <p
            tw="text-2xl text-zinc-400 text-center"
            style={{
              textWrap: "balance",
            }}
          >
            {siteConfig.description}
          </p>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts,
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
