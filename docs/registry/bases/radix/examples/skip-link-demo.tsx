import { SkipLink } from "@/registry/bases/radix/components/skip-link";

export default function SkipLinkDemo() {
  return (
    <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-lg border">
      <p className="border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
        Click this text, then press Tab to reveal the skip link.
      </p>
      <SkipLink
        href="#skip-link-demo-content"
        className="focus:absolute focus:top-2 focus:left-2"
      />
      <header className="flex items-center gap-4 border-b px-4 py-3 text-sm">
        <span className="font-medium">Acme</span>
        <nav className="flex gap-3 text-muted-foreground">
          <a href="#skip-link-demo-content" className="hover:text-foreground">
            Products
          </a>
          <a href="#skip-link-demo-content" className="hover:text-foreground">
            Pricing
          </a>
          <a href="#skip-link-demo-content" className="hover:text-foreground">
            Blog
          </a>
        </nav>
      </header>
      <main
        id="skip-link-demo-content"
        className="flex flex-col gap-1 px-4 py-6 outline-none focus-visible:bg-muted/50"
      >
        <h3 className="font-medium">Main content</h3>
        <p className="text-sm text-muted-foreground">
          Activating the skip link moves focus here, past the navigation.
        </p>
      </main>
    </div>
  );
}
