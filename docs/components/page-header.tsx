/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/www/components/page-header.tsx
 */

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  withPadding?: boolean;
  centered?: boolean;
}

function PageHeader({
  className,
  children,
  as: Comp = "section",
  withPadding,
  centered,
  ...props
}: PageHeaderProps) {
  return (
    <Comp
      className={cn(
        "flex flex-col gap-1",
        {
          "py-8 md:py-12 md:pb-8 lg:py-12 lg:pb-10": withPadding,
          "mx-auto items-center": centered,
        },
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

const headingVariants = cva(
  "font-bold leading-tight tracking-tighter lg:leading-[1.1]",
  {
    variants: {
      size: {
        default: "text-3xl md:text-4xl",
        sm: "text-xl md:text-2xl",
        lg: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface PageHeaderHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

function PageHeaderHeading({
  className,
  size,
  as: Comp = "h1",
  ...props
}: PageHeaderHeadingProps) {
  return (
    <Comp className={cn(headingVariants({ size, className }))} {...props} />
  );
}

const descriptionVariants = cva("max-w-2xl text-balance", {
  variants: {
    size: {
      default: "text-base sm:text-lg",
      sm: "text-sm sm:text-base",
      lg: "text-lg sm:text-xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface PageHeaderDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof descriptionVariants> {}

function PageHeaderDescription({
  className,
  size,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p className={cn(descriptionVariants({ size, className }))} {...props} />
  );
}

function PageActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-start gap-2 py-2",
        className,
      )}
      {...props}
    />
  );
}

export { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading };
