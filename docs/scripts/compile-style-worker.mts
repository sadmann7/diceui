import { parentPort } from "node:worker_threads";
import { transformStyle } from "shadcn/utils";

parentPort?.on(
  "message",
  async ({
    id,
    content,
    styleMap,
  }: {
    id: number;
    content: string;
    styleMap: Record<string, string>;
  }) => {
    parentPort?.postMessage({
      id,
      result: await transformStyle(content, { styleMap }),
    });
  },
);
