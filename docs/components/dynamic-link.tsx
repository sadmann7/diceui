import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn, getIsExternalLink } from "@/lib/utils";

interface DynamicLinkProps
  extends Pick<React.ComponentProps<typeof Button>, "variant" | "size">,
    React.ComponentProps<typeof Link> {}

export function DynamicLink({
  href,
  children,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: DynamicLinkProps) {
  const isExternal = getIsExternalLink(href.toString());

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("h-7 rounded-md [&_svg]:size-3", className)}
      asChild
    >
      <Link href={href} target={isExternal ? "_blank" : "_self"} {...props}>
        {children}
        {isExternal ? <ExternalLink /> : <ArrowRight />}
      </Link>
    </Button>
  );
}
