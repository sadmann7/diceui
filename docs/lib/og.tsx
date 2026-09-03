export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

function LogoMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <path d="M16 8h.01" />
      <path d="M8 8h.01" />
      <path d="M8 16h.01" />
      <path d="M16 16h.01" />
    </svg>
  );
}

interface OgImageProps {
  title: string;
  description?: string;
}

export function OgImage({ title, description }: OgImageProps) {
  return (
    <div
      tw="flex h-full w-full flex-col p-16 text-white"
      style={{
        fontFamily: "Geist",
        background: "linear-gradient(to bottom right, #111827, #000000)",
      }}
    >
      <p tw="m-0 text-[82px] font-semibold">{title}</p>
      <p tw="m-0 mt-4 text-[44px] text-[rgba(240,240,240,0.8)]">
        {description}
      </p>
      <div tw="mt-auto flex justify-end">
        <LogoMark />
      </div>
    </div>
  );
}
