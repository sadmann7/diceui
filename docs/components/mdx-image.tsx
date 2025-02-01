import { default as NextImage } from "next/image.js";

export function MdxImage(props: React.ComponentProps<typeof NextImage>) {
  return <NextImage {...props} />;
}
