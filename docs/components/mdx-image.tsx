"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

interface MdxImageProps extends React.ComponentProps<typeof Image> {}

export function MdxImage({ className, ...props }: MdxImageProps) {
  return <Image {...props} className={cn(className)} />;
}
