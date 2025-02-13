"use client";

import { Shell } from "@/components/shell";
import { ClientOnly } from "@/registry/default/components/client-only";
import * as Masonry from "@/registry/default/ui/masonry";
import * as React from "react";

export default function MasonryPage() {
  const items = React.useMemo(() => {
    return Array.from({ length: 1000 }, (_, index) => ({
      id: index,
      height: Math.random() * 100 + 100,
    }));
  }, []);

  return (
    <Shell>
      <ClientOnly fallback={<div>Loading...</div>}>
        <Masonry.Root
          columnCount={{ initial: 1, sm: 2, md: 3, lg: 4 }}
          gap={10}
          overscan={6}
        >
          {items.map((item) => (
            <Masonry.Item key={item.id} asChild>
              <div className="bg-accent" style={{ height: item.height }}>
                {item.id}
              </div>
            </Masonry.Item>
          ))}
        </Masonry.Root>
      </ClientOnly>
    </Shell>
  );
}
