"use client";

import { Index } from "@/__registry__";
import { useConfig } from "@/hooks/use-config";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import * as React from "react";

interface ComponentTabsProps {
  name: string;
  children: React.ReactNode;
}

export function ComponentTabs({ name, children }: ComponentTabsProps) {
  const [config] = useConfig();

  const Preview = React.useMemo(() => {
    const Component = Index[config.style][name]?.component;

    if (!Component) {
      return (
        <p className="text-muted-foreground text-sm">
          Component{" "}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {name}
          </code>{" "}
          not found in registry.
        </p>
      );
    }

    return <Component />;
  }, [name, config.style]);

  return (
    <Tabs items={["Preview", "Code"]} className="rounded-md">
      <Tab value="Preview">
        <div className="flex h-[368px] w-full items-center justify-center p-10">
          {Preview}
        </div>
      </Tab>
      <Tab value="Code">{children}</Tab>
    </Tabs>
  );
}