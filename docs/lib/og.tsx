import { SITE_NAME, SITE_URL } from "@/lib/site";

export const OG_IMAGE_SIZE = {
  width: 2400,
  height: 1260,
};

interface LogoMarkProps {
  size: number;
  color: string;
}

function LogoMark({ size, color }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
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
  titleAccent?: string;
  description?: string;
  eyebrow?: string;
  path?: string;
}

export function OgImage({
  title,
  titleAccent,
  description,
  eyebrow,
  path = "",
}: OgImageProps) {
  return (
    <div
      tw="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#060607] px-40 py-[144px] text-[#f5f5f6]"
      style={{ fontFamily: "Geist" }}
    >
      <div tw="absolute top-[760px] left-[1760px] flex">
        <LogoMark size={1040} color="#1c1c20" />
      </div>
      <div tw="flex items-center justify-between">
        <div tw="flex items-center">
          <LogoMark size={72} color="#f5f5f6" />
          <span tw="ml-6 text-[64px] font-semibold tracking-[-1.6px]">
            {SITE_NAME}
          </span>
        </div>
        <span
          tw="text-[44px] text-[#8a8a93]"
          style={{ fontFamily: "Geist Mono" }}
        >
          {`${new URL(SITE_URL).host}${path}`}
        </span>
      </div>
      <div tw="flex flex-col">
        {eyebrow ? (
          <span
            tw="mb-10 text-[40px] tracking-[4px] text-[#8a8a93] uppercase"
            style={{ fontFamily: "Geist Mono" }}
          >
            {eyebrow}
          </span>
        ) : null}
        <div
          tw={
            titleAccent
              ? "flex flex-col text-[160px] leading-[1.05] font-semibold tracking-[-6px]"
              : title.length > 24
                ? "flex flex-col text-[144px] leading-[1.05] font-semibold tracking-[-7px]"
                : "flex flex-col text-[192px] leading-[1.05] font-semibold tracking-[-7px]"
          }
        >
          <span tw="block" style={{ display: "block", lineClamp: 2 }}>
            {title}
          </span>
          {titleAccent ? <span tw="text-[#8a8a93]">{titleAccent}</span> : null}
        </div>
        {description ? (
          <p
            tw={
              titleAccent
                ? "m-0 mt-12 block w-[1360px] text-[52px] leading-[1.45] text-[#a2a2aa]"
                : "m-0 mt-10 block w-[1360px] text-[56px] leading-[1.45] text-[#a2a2aa]"
            }
            style={{ display: "block", lineClamp: 3 }}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
