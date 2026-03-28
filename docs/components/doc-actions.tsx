"use client";

import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, ChevronDown, Copy, MessageCircleIcon } from "lucide-react";
import * as React from "react";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { Button } from "@/registry/bases/radix/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/bases/radix/ui/button-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/radix/ui/popover";

const markdownCache = new Map<string, string>();

interface CopyPageButtonProps {
  markdownUrl: string;
}

function CopyPageButton({ markdownUrl }: CopyPageButtonProps) {
  const [isLoading, setLoading] = React.useState(false);

  const onContentPrefetch = React.useCallback(async () => {
    if (markdownCache.has(markdownUrl)) return;

    try {
      const response = await fetch(markdownUrl);
      const content = await response.text();
      markdownCache.set(markdownUrl, content);
    } catch {
      // Silently fail prefetch, will retry on actual copy
    }
  }, [markdownUrl]);

  const [checked, onClick] = useCopyButton(async () => {
    const cached = markdownCache.get(markdownUrl);
    if (cached) {
      return navigator.clipboard.writeText(cached);
    }

    setLoading(true);
    try {
      const response = await fetch(markdownUrl);
      const content = await response.text();
      markdownCache.set(markdownUrl, content);

      return navigator.clipboard.writeText(content);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Button
      variant="secondary"
      size="sm"
      className="h-7 text-xs [&_svg:not([class*='size-'])]:size-3"
      onClick={onClick}
      onFocus={onContentPrefetch}
      onMouseEnter={onContentPrefetch}
      onTouchStart={onContentPrefetch}
      disabled={isLoading}
    >
      {checked ? <Check /> : <Copy />}
      Copy Page
    </Button>
  );
}

interface PageMenuProps {
  markdownUrl: string;
  githubUrl: string;
}

function PageMenu({ markdownUrl, githubUrl }: PageMenuProps) {
  const items = React.useMemo(() => {
    const fullMarkdownUrl =
      typeof window !== "undefined"
        ? new URL(markdownUrl, window.location.origin)
        : "loading";
    const q = `Read ${fullMarkdownUrl}, I want to ask questions about it.`;

    return [
      {
        title: "Open in GitHub",
        href: githubUrl,
        icon: <Icons.gitHub className="size-4" />,
      },

      {
        title: "Open in T3 Chat",
        href: `https://t3.chat/new?${new URLSearchParams({
          q,
        })}`,
        icon: <MessageCircleIcon />,
      },
      {
        title: "Open in ChatGPT",
        href: `https://chatgpt.com/?${new URLSearchParams({
          hints: "search",
          q,
        })}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z"
              fill="currentColor"
            />
          </svg>
        ),
      },
      {
        title: "Open in Claude",
        href: `https://claude.ai/new?${new URLSearchParams({
          q,
        })}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="m4.714 15.956 4.718-2.648.079-.23-.08-.128h-.23l-.79-.048-2.695-.073-2.337-.097-2.265-.122-.57-.121-.535-.704.055-.353.48-.321.685.06 1.518.104 2.277.157 1.651.098 2.447.255h.389l.054-.158-.133-.097-.103-.098-2.356-1.596-2.55-1.688-1.336-.972-.722-.491L2 6.223l-.158-1.008.655-.722.88.06.225.061.893.686 1.906 1.476 2.49 1.833.364.304.146-.104.018-.072-.164-.274-1.354-2.446-1.445-2.49-.644-1.032-.17-.619a2.972 2.972 0 0 1-.103-.729L6.287.133 6.7 0l.995.134.42.364.619 1.415L9.735 4.14l1.555 3.03.455.898.243.832.09.255h.159V9.01l.127-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.583.28.48.685-.067.444-.286 1.851-.558 2.903-.365 1.942h.213l.243-.242.983-1.306 1.652-2.064.728-.82.85-.904.547-.431h1.032l.759 1.129-.34 1.166-1.063 1.347-.88 1.142-1.263 1.7-.79 1.36.074.11.188-.02 2.853-.606 1.542-.28 1.84-.315.832.388.09.395-.327.807-1.967.486-2.307.462-3.436.813-.043.03.049.061 1.548.146.662.036h1.62l3.018.225.79.522.473.638-.08.485-1.213.62-1.64-.389-3.825-.91-1.31-.329h-.183v.11l1.093 1.068 2.003 1.81 2.508 2.33.127.578-.321.455-.34-.049-2.204-1.657-.85-.747-1.925-1.62h-.127v.17l.443.649 2.343 3.521.122 1.08-.17.353-.607.213-.668-.122-1.372-1.924-1.415-2.168-1.141-1.943-.14.08-.674 7.254-.316.37-.728.28-.607-.461-.322-.747.322-1.476.388-1.924.316-1.53.285-1.9.17-.632-.012-.042-.14.018-1.432 1.967-2.18 2.945-1.724 1.845-.413.164-.716-.37.066-.662.401-.589 2.386-3.036 1.439-1.882.929-1.086-.006-.158h-.055L4.138 18.56l-1.13.146-.485-.456.06-.746.231-.243 1.907-1.312Z"
              fill="currentColor"
            />
          </svg>
        ),
      },
      {
        title: "Open in Scira",
        href: `https://scira.ai/?${new URLSearchParams({
          q,
        })}`,
        icon: (
          <svg
            width="910"
            height="934"
            viewBox="0 0 910 934"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M647.664 197.775C569.13 189.049 525.5 145.419 516.774 66.8849C508.048 145.419 464.418 189.049 385.884 197.775C464.418 206.501 508.048 250.131 516.774 328.665C525.5 250.131 569.13 206.501 647.664 197.775Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <path
              d="M516.774 304.217C510.299 275.491 498.208 252.087 480.335 234.214C462.462 216.341 439.058 204.251 410.333 197.775C439.059 191.3 462.462 179.209 480.335 161.336C498.208 143.463 510.299 120.06 516.774 91.334C523.25 120.059 535.34 143.463 553.213 161.336C571.086 179.209 594.49 191.3 623.216 197.775C594.49 204.251 571.086 216.341 553.213 234.214C535.34 252.087 523.25 275.491 516.774 304.217Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <path
              d="M857.5 508.116C763.259 497.644 710.903 445.288 700.432 351.047C689.961 445.288 637.605 497.644 543.364 508.116C637.605 518.587 689.961 570.943 700.432 665.184C710.903 570.943 763.259 518.587 857.5 508.116Z"
              stroke="currentColor"
              strokeWidth="20"
              strokeLinejoin="round"
            />
            <path
              d="M700.432 615.957C691.848 589.05 678.575 566.357 660.383 548.165C642.191 529.973 619.499 516.7 592.593 508.116C619.499 499.533 642.191 486.258 660.383 468.066C678.575 449.874 691.848 427.181 700.432 400.274C709.015 427.181 722.289 449.874 740.481 468.066C758.673 486.258 781.365 499.533 808.271 508.116C781.365 516.7 758.673 529.973 740.481 548.165C722.289 566.357 709.015 589.05 700.432 615.957Z"
              stroke="currentColor"
              strokeWidth="20"
              strokeLinejoin="round"
            />
            <path
              d="M889.949 121.237C831.049 114.692 798.326 81.9698 791.782 23.0692C785.237 81.9698 752.515 114.692 693.614 121.237C752.515 127.781 785.237 160.504 791.782 219.404C798.326 160.504 831.049 127.781 889.949 121.237Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <path
              d="M791.782 196.795C786.697 176.937 777.869 160.567 765.16 147.858C752.452 135.15 736.082 126.322 716.226 121.237C736.082 116.152 752.452 107.324 765.16 94.6152C777.869 81.9065 786.697 65.5368 791.782 45.6797C796.867 65.5367 805.695 81.9066 818.403 94.6152C831.112 107.324 847.481 116.152 867.338 121.237C847.481 126.322 831.112 135.15 818.403 147.858C805.694 160.567 796.867 176.937 791.782 196.795Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <path
              d="M760.632 764.337C720.719 814.616 669.835 855.1 611.872 882.692C553.91 910.285 490.404 924.255 426.213 923.533C362.022 922.812 298.846 907.419 241.518 878.531C184.19 849.643 134.228 808.026 95.4548 756.863C56.6815 705.7 30.1238 646.346 17.8129 583.343C5.50207 520.339 7.76433 455.354 24.4266 393.359C41.089 331.364 71.7099 274.001 113.947 225.658C156.184 177.315 208.919 139.273 268.117 114.442"
              stroke="currentColor"
              strokeWidth="30"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
    ];
  }, [githubUrl, markdownUrl]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon-sm"
          className="h-7 w-7 [&_svg:not([class*='size-'])]:size-3"
        >
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-48 flex-col p-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            className="inline-flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground [&_svg]:size-4"
          >
            {item.icon}
            {item.title}
          </a>
        ))}
      </PopoverContent>
    </Popover>
  );
}

interface DocActionsProps {
  url: string;
  path: string;
}

export function DocActions({ url, path }: DocActionsProps) {
  return (
    <ButtonGroup>
      <CopyPageButton markdownUrl={`${url}.mdx`} />
      <ButtonGroupSeparator />
      <PageMenu
        markdownUrl={`${url}.mdx`}
        githubUrl={`${siteConfig.links.github}/blob/main/docs/content/docs/${path}`}
      />
    </ButtonGroup>
  );
}
