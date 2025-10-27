import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx/runtime/next";
import { docs, meta } from "@/.source";

export const source = loader(createMDXSource(docs, meta), {
  baseUrl: "/docs",
});
