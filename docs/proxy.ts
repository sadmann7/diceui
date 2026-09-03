import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { NextRequest, NextResponse } from "next/server";

import { DOCS_CONTENT_ROUTE, DOCS_ROUTE } from "@/lib/constants";

const docsPathRewriter = rewritePath(
  `${DOCS_ROUTE}{/*path}`,
  `${DOCS_CONTENT_ROUTE}{/*path}/content.md`,
);
const suffixPathRewriter = rewritePath(
  `${DOCS_ROUTE}{/*path}.md`,
  `${DOCS_CONTENT_ROUTE}{/*path}/content.md`,
);

export default function proxy(request: NextRequest) {
  const suffixPath = suffixPathRewriter.rewrite(request.nextUrl.pathname);
  if (suffixPath) {
    return NextResponse.rewrite(new URL(suffixPath, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const docsPath = docsPathRewriter.rewrite(request.nextUrl.pathname);

    if (docsPath) {
      return NextResponse.rewrite(new URL(docsPath, request.nextUrl));
    }
  }

  return NextResponse.next();
}
