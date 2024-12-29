import type { Align, Side } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

interface MentionContentContext {
  side: Side;
  align: Align;
  onArrowChange: (arrow: HTMLElement | null) => void;
  arrowDisplaced: boolean;
  arrowStyles: React.CSSProperties;
  forceMount: boolean;
}

const MentionContentContext = React.createContext<MentionContentContext | null>(
  null,
);

export function useMentionContent() {
  const context = React.useContext(MentionContentContext);
  if (!context) {
    throw new Error(
      "useMentionContent must be used within a MentionContentProvider",
    );
  }
  return context;
}

interface MentionContentProviderProps extends MentionContentContext {
  children: React.ReactNode;
}

export function MentionContentProvider({
  children,
  ...context
}: MentionContentProviderProps) {
  return (
    <MentionContentContext.Provider value={context}>
      {children}
    </MentionContentContext.Provider>
  );
}

export interface MentionContentProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

export const MentionContent = React.forwardRef<
  HTMLDivElement,
  MentionContentProps
>((props, ref) => {
  return <Primitive.div ref={ref} {...props} />;
});

MentionContent.displayName = "MentionContent";
