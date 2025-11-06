import {
  ScrollSpy,
  ScrollSpyContent,
  ScrollSpyContentGroup,
  ScrollSpyItem,
  ScrollSpyItemGroup,
} from "@/registry/default/ui/scroll-spy";

export default function ScrollSpyDemo() {
  return (
    <ScrollSpy offset={75}>
      <ScrollSpyItemGroup className="sticky top-20 h-fit">
        <ScrollSpyItem value="introduction">Introduction</ScrollSpyItem>
        <ScrollSpyItem value="getting-started">Getting Started</ScrollSpyItem>
        <ScrollSpyItem value="usage">Usage</ScrollSpyItem>
        <ScrollSpyItem value="api-reference">API Reference</ScrollSpyItem>
      </ScrollSpyItemGroup>
      <ScrollSpyContentGroup>
        <ScrollSpyContent value="introduction">
          <h2 className="font-bold text-2xl">Introduction</h2>
          <p className="mt-2 text-muted-foreground">
            ScrollSpy automatically updates navigation links based on scroll
            position.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>
        <ScrollSpyContent value="getting-started">
          <h2 className="font-bold text-2xl">Getting Started</h2>
          <p className="mt-2 text-muted-foreground">
            Install the component using the CLI or copy the source code.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>
        <ScrollSpyContent value="usage">
          <h2 className="font-bold text-2xl">Usage</h2>
          <p className="mt-2 text-muted-foreground">
            Use the Provider, Root, Item, and Content components to create your
            scroll spy navigation.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>
        <ScrollSpyContent value="api-reference">
          <h2 className="font-bold text-2xl">API Reference</h2>
          <p className="mt-2 text-muted-foreground">
            Complete API documentation for all ScrollSpy components.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>
      </ScrollSpyContentGroup>
    </ScrollSpy>
  );
}
