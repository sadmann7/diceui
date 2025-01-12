import * as React from "react";
import { useMentionContext } from "./mention-root";

interface MentionHighlighterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const MentionHighlighter = React.forwardRef<
  HTMLDivElement,
  MentionHighlighterProps
>((props, forwardedRef) => {
  const { style } = props;
  const context = useMentionContext("MentionHighlighter");
  const { mentions, inputRef } = context;

  const [inputStyle, setInputStyle] = React.useState<CSSStyleDeclaration>();

  React.useEffect(() => {
    if (inputRef.current) {
      const computedStyle = window.getComputedStyle(inputRef.current);
      setInputStyle(computedStyle);
    }
  }, [inputRef]);

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

  const renderHighlights = () => {
    if (!inputRef.current) return null;

    const value = inputRef.current.value;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const mention of mentions) {
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
          data-mention
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
  };

  return (
    <div ref={forwardedRef} style={highlighterStyle}>
      {renderHighlights()}
    </div>
  );
});
