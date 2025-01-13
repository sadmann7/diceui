import { useCallbackRef, useComposedRefs } from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const HIGHLIGHTER_NAME = "MentionHighlighter";

type HighlighterElement = HTMLDivElement;

const defaultHighlighterStyle: React.CSSProperties = {
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
  overflow: "auto",
  width: "100%",
};

interface MentionHighlighterProps
  extends React.HTMLAttributes<HighlighterElement> {}

const MentionHighlighter = React.memo(
  React.forwardRef<HighlighterElement, MentionHighlighterProps>(
    (props, forwardedRef) => {
      const { style, ...highlighterProps } = props;
      const context = useMentionContext(HIGHLIGHTER_NAME);
      const highlighterRef = React.useRef<HighlighterElement>(null);
      const composedRef = useComposedRefs(forwardedRef, highlighterRef);
      const [inputStyle, setInputStyle] = React.useState<CSSStyleDeclaration>();
      const onInputStyleChange = useCallbackRef(setInputStyle);

      const syncStyles = React.useCallback(() => {
        const input = context.inputRef.current;
        if (!input) return;

        const computedStyle = window.getComputedStyle(input);
        onInputStyleChange(computedStyle);
      }, [context.inputRef, onInputStyleChange]);

      const onResize = React.useCallback(() => {
        const input = context.inputRef.current;
        const highlighter = highlighterRef.current;
        if (!input || !highlighter) return;

        syncStyles();

        requestAnimationFrame(() => {
          highlighter.scrollLeft = input.scrollLeft;
          highlighter.scrollTop = input.scrollTop;
          highlighter.style.height = `${input.offsetHeight}px`;
        });
      }, [context.inputRef, syncStyles]);

      const onScroll = React.useCallback(() => {
        requestAnimationFrame(onResize);
      }, [onResize]);

      React.useEffect(() => {
        const input = context.inputRef.current;
        if (!input) return;

        syncStyles();

        input.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });

        // Create a ResizeObserver to watch for size changes including font size
        const resizeObserver = new ResizeObserver(() => {
          syncStyles();
        });
        resizeObserver.observe(input);

        // Create a MutationObserver to watch for class changes
        const mutationObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "class"
            ) {
              syncStyles();
            }
          }
        });
        mutationObserver.observe(input, {
          attributes: true,
          attributeFilter: ["class"],
        });

        return () => {
          input.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onResize);
          resizeObserver.disconnect();
          mutationObserver.disconnect();
        };
      }, [context.inputRef, onResize, onScroll, syncStyles]);

      const highlighterStyle = React.useMemo<React.CSSProperties>(() => {
        if (!inputStyle) return defaultHighlighterStyle;

        return {
          ...defaultHighlighterStyle,
          fontSize: inputStyle.fontSize,
          fontFamily: inputStyle.fontFamily,
          fontWeight: inputStyle.fontWeight,
          fontStyle: inputStyle.fontStyle,
          fontVariant:
            inputStyle.fontVariant as React.CSSProperties["fontVariant"],
          lineHeight: inputStyle.lineHeight,
          letterSpacing: inputStyle.letterSpacing,
          textTransform:
            inputStyle.textTransform as React.CSSProperties["textTransform"],
          textAlign: inputStyle.textAlign as React.CSSProperties["textAlign"],
          textIndent: inputStyle.textIndent,
          padding: inputStyle.padding,
          border: inputStyle.border,
          borderRadius: inputStyle.borderRadius,
          boxSizing: inputStyle.boxSizing as React.CSSProperties["boxSizing"],
          wordBreak: inputStyle.wordBreak as React.CSSProperties["wordBreak"],
          overflowWrap:
            inputStyle.overflowWrap as React.CSSProperties["overflowWrap"],
          ...style,
        };
      }, [inputStyle, style]);

      const onSegmentsRender = React.useCallback(() => {
        if (!context.inputRef.current) return null;

        const value = context.inputRef.current.value;
        const segments: React.ReactNode[] = [];
        let lastIndex = 0;

        for (const mention of context.mentions) {
          // Add text before mention
          if (mention.start > lastIndex) {
            segments.push(
              <span key={`text-${mention.start}-${mention.end}`}>
                {value.slice(lastIndex, mention.start)}
              </span>,
            );
          }

          // Add highlighted mention
          segments.push(
            <span
              key={`mention-${mention.start}-${mention.end}`}
              data-mention-segment
            >
              {value.slice(mention.start, mention.end)}
            </span>,
          );

          lastIndex = mention.end;
        }

        // Add remaining text
        if (lastIndex < value.length) {
          segments.push(
            <span key={`text-end-${value.length}`}>
              {value.slice(lastIndex, value.length)}
            </span>,
          );
        }

        // Add a space to ensure correct height
        segments.push(<span key="space">&nbsp;</span>);

        return segments;
      }, [context.inputRef, context.mentions]);

      if (!inputStyle) return null;

      return (
        <div {...highlighterProps} ref={composedRef} style={highlighterStyle}>
          {onSegmentsRender()}
        </div>
      );
    },
  ),
  (prevProps, nextProps) => {
    // Only re-render if style or other props have changed
    return (
      prevProps.style === nextProps.style &&
      Object.keys(prevProps).every(
        (key) =>
          key === "style" ||
          prevProps[key as keyof typeof prevProps] ===
            nextProps[key as keyof typeof nextProps],
      )
    );
  },
);

MentionHighlighter.displayName = HIGHLIGHTER_NAME;

export { MentionHighlighter };
