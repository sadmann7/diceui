import { SITE_NAME } from "@/lib/site";

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-[1248px] items-center justify-between gap-4 px-6 py-7 font-mono text-xs text-muted-foreground">
        <p>
          © {year} {SITE_NAME}.
        </p>
        <p>
          Built by{" "}
          <a
            href="https://x.com/sadmann17"
            rel="noreferrer noopener"
            target="_blank"
            className="text-foreground/70 underline underline-offset-4 transition-colors hover:text-foreground"
          >
            sadman
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
