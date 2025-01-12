import { useCallbackRef } from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

interface MentionHighlighterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const MentionHighlighter = React.forwardRef<
  HTMLDivElement,
  MentionHighlighterProps
>((props, forwardedRef) => {
  const { style, ...highlighterProps } = props;
  const context = useMentionContext("MentionHighlighter");

  const [inputStyle, setInputStyle] = React.useState<CSSStyleDeclaration>();
  const onInputStyleChange = useCallbackRef(setInputStyle);

  React.useEffect(() => {
    if (!context.inputRef.current) return;

    const computedStyle = window.getComputedStyle(context.inputRef.current);
    onInputStyleChange(computedStyle);
  }, [context.inputRef, onInputStyleChange]);

  if (!inputStyle) return null;

  const highlighterStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: "transparent",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    pointerEvents: "none",
    userSelect: "none",
    font: inputStyle.font,
    letterSpacing: inputStyle.letterSpacing,
    textTransform:
      inputStyle.textTransform as React.CSSProperties["textTransform"],
    padding: inputStyle.padding,
    border: inputStyle.border,
    boxSizing: inputStyle.boxSizing as React.CSSProperties["boxSizing"],
    ...style,
  };

  function renderHighlights() {
    if (!context.inputRef.current) return null;

    const value = context.inputRef.current.value;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const mention of context.mentions) {
      // Add text before mention
      if (mention.start > lastIndex) {
        parts.push(
          <span key={`text-${mention.start}-${mention.end}`}>
            {value.slice(lastIndex, mention.start)}
          </span>,
        );
      }

      // Add highlighted mention
      parts.push(
        <span
          key={`mention-${mention.start}-${mention.end}`}
          data-mention-highlight
          style={{
            backgroundColor: "rgba(0, 132, 255, 0.15)",
            borderRadius: 3,
          }}
        >
          {value.slice(mention.start, mention.end)}
        </span>,
      );

      lastIndex = mention.end;
    }

    // Add remaining text
    if (lastIndex < value.length) {
      parts.push(
        <span key={`text-end-${value.length}`}>
          {value.slice(lastIndex, value.length)}
        </span>,
      );
    }

    return parts;
  }

  return (
    <div ref={forwardedRef} style={highlighterStyle} {...highlighterProps}>
      {renderHighlights()}
    </div>
  );
});

export { MentionHighlighter };
