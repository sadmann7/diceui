"use client";

import { Tab, Tabs } from "fumadocs-ui/components/tabs";

interface ComponentTabsProps {
  preview: React.ReactNode;
  children: React.ReactNode;
}

export function ComponentTabs({ preview, children }: ComponentTabsProps) {
  return (
    <Tabs items={["Preview", "Code"]} className="rounded-sm">
      <Tab value="Preview">
        <div className="flex h-[368px] w-full items-center justify-center p-10">
          {preview}
        </div>
      </Tab>
      <Tab value="Code">{children}</Tab>
    </Tabs>
  );
}
