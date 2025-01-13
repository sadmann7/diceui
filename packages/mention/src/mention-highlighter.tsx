import { useCallbackRef } from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const HIGHLIGHTER_NAME = "MentionHighlighter";

const baseHighlighterStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "transparent",
  color: "transparent",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  pointerEvents: "none",
  userSelect: "none",
};

interface MentionHighlighterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const MentionHighlighter = React.memo(
  React.forwardRef<HTMLDivElement, MentionHighlighterProps>(
    (props, forwardedRef) => {
      const { style, ...highlighterProps } = props;
      const context = useMentionContext(HIGHLIGHTER_NAME);

      const [inputStyle, setInputStyle] = React.useState<CSSStyleDeclaration>();
      const onInputStyleChange = useCallbackRef(setInputStyle);

      React.useEffect(() => {
        if (!context.inputRef.current) return;

        const computedStyle = window.getComputedStyle(context.inputRef.current);
        onInputStyleChange(computedStyle);
      }, [context.inputRef, onInputStyleChange]);

      const highlighterStyle = React.useMemo(
        () =>
          inputStyle
            ? {
                ...baseHighlighterStyle,
                font: inputStyle.font,
                letterSpacing: inputStyle.letterSpacing,
                textTransform:
                  inputStyle.textTransform as React.CSSProperties["textTransform"],
                padding: inputStyle.padding,
                border: inputStyle.border,
                borderRadius: inputStyle.borderRadius,
                boxSizing:
                  inputStyle.boxSizing as React.CSSProperties["boxSizing"],
                ...style,
              }
            : baseHighlighterStyle,
        [inputStyle, style],
      );

      const onHighlightsRender = React.useCallback(() => {
        if (!context.inputRef.current) return null;

        const value = context.inputRef.current.value;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        for (const mention of context.mentions) {
          if (mention.start > lastIndex) {
            parts.push(
              <span key={`text-${mention.start}-${mention.end}`}>
                {value.slice(lastIndex, mention.start)}
              </span>,
            );
          }

          parts.push(
            <span
              key={`mention-${mention.start}-${mention.end}`}
              data-mention-highlight
            >
              {value.slice(mention.start, mention.end)}
            </span>,
          );

          lastIndex = mention.end;
        }

        if (lastIndex < value.length) {
          parts.push(
            <span key={`text-end-${value.length}`}>
              {value.slice(lastIndex)}
            </span>,
          );
        }

        return parts;
      }, [context.inputRef, context.mentions]);

      if (!inputStyle) return null;

      return (
        <div {...highlighterProps} ref={forwardedRef} style={highlighterStyle}>
          {onHighlightsRender()}
        </div>
      );
    },
  ),
);

MentionHighlighter.displayName = HIGHLIGHTER_NAME;

export { MentionHighlighter };
