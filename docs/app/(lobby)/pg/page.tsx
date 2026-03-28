import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/bases/base/examples/color-picker-demo";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/bases/radix/ui/tabs";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab-2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab-3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab-1">Content 1</TabsContent>
          <TabsContent value="tab-2">Content 2</TabsContent>
          <TabsContent value="tab-3">Content 3</TabsContent>
        </Tabs>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
