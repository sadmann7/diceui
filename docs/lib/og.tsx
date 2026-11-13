import { SITE_NAME, SITE_URL } from "@/lib/site";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

const colors = {
  background: "#060607",
  foreground: "#f5f5f6",
  muted: "#a2a2aa",
  subtle: "#8a8a93",
  border: "#1c1c20",
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
  const titleSize = titleAccent ? 80 : title.length > 24 ? 72 : 96;

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "72px 80px",
        overflow: "hidden",
        fontFamily: "Geist",
        color: colors.foreground,
        background: colors.background,
      }}
    >
      <div
        style={{ display: "flex", position: "absolute", left: 880, top: 380 }}
      >
        <LogoMark size={520} color={colors.border} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoMark size={36} color={colors.foreground} />
          <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.8 }}>
            {SITE_NAME}
          </span>
        </div>
        <span
          style={{
            fontFamily: "Geist Mono",
            fontSize: 22,
            color: colors.subtle,
          }}
        >
          {`${new URL(SITE_URL).host}${path}`}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: titleAccent ? 24 : 20,
        }}
      >
        {eyebrow ? (
          <span
            style={{
              fontFamily: "Geist Mono",
              fontSize: 20,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: colors.subtle,
            }}
          >
            {eyebrow}
          </span>
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: titleSize,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: titleAccent ? -3 : -3.5,
          }}
        >
          <span style={{ display: "block", lineClamp: 2 }}>{title}</span>
          {titleAccent ? (
            <span style={{ color: colors.subtle }}>{titleAccent}</span>
          ) : null}
        </div>
        {description ? (
          <p
            style={{
              display: "block",
              width: 680,
              margin: 0,
              lineClamp: 3,
              fontSize: titleAccent ? 26 : 28,
              lineHeight: 1.45,
              color: colors.muted,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
