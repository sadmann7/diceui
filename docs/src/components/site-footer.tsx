import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-fd-card py-6 text-fd-secondary-foreground">
      <div className="container flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-semibold text-sm">{siteConfig.name}</p>
          <p className="text-xs">
            Built with ❤️ by{" "}
            <a
              href={siteConfig.links.github}
              rel="noreferrer noopener"
              target="_blank"
              className="font-medium"
            >
              sadman
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
