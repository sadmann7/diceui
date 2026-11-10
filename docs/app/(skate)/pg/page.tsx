import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import EditorCharacterCountBaseDemo from "@/registry/bases/base/examples/editor-character-count-demo";
import EditorBaseDemo from "@/registry/bases/base/examples/editor-demo";
import EditorMarkdownBaseDemo from "@/registry/bases/base/examples/editor-markdown-demo";
import EditorMinimalBaseDemo from "@/registry/bases/base/examples/editor-minimal-demo";
import EditorCharacterCountRadixDemo from "@/registry/bases/radix/examples/editor-character-count-demo";
import EditorRadixDemo from "@/registry/bases/radix/examples/editor-demo";
import EditorMarkdownRadixDemo from "@/registry/bases/radix/examples/editor-markdown-demo";
import EditorMinimalRadixDemo from "@/registry/bases/radix/examples/editor-minimal-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <EditorBaseDemo />
          <EditorMinimalBaseDemo />
          <EditorMarkdownBaseDemo />
          <EditorCharacterCountBaseDemo />
        </DemoItemGroup>
        <DemoItemGroup>
          <EditorRadixDemo />
          <EditorMinimalRadixDemo />
          <EditorMarkdownRadixDemo />
          <EditorCharacterCountRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
