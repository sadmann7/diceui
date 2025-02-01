import { default as NextImage } from "next/image";

export function MdxImage(props: React.ComponentProps<typeof NextImage>) {
  return <NextImage {...props} />;
}
