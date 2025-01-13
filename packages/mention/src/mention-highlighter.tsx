import { useCallbackRef, useComposedRefs } from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const HIGHLIGHTER_NAME = "MentionHighlighter";

type HighlighterElement = HTMLDivElement;

interface MentionHighlighterProps
  extends React.HTMLAttributes<HighlighterElement> {}

const MentionHighlighter = React.forwardRef<
  HighlighterElement,
  MentionHighlighterProps
>((props, forwardedRef) => {
  const { style, ...highlighterProps } = props;
  const context = useMentionContext(HIGHLIGHTER_NAME);
  const highlighterRef = React.useRef<HighlighterElement>(null);
  const composedRef = useComposedRefs(forwardedRef, highlighterRef);
  const [inputStyle, setInputStyle] = React.useState<CSSStyleDeclaration>();
  const onInputStyleChange = useCallbackRef(setInputStyle);

  // Update highlighter scroll position
  const onResize = React.useCallback(() => {
    const input = context.inputRef.current;
    const highlighter = highlighterRef.current;
    if (!input || !highlighter) return;

    // Sync scroll position
    highlighter.scrollLeft = input.scrollLeft;
    highlighter.scrollTop = input.scrollTop;

    // Sync height
    highlighter.style.height = `${input.offsetHeight}px`;
  }, [context.inputRef]);

  React.useEffect(() => {
    if (!context.inputRef.current) return;

    const computedStyle = window.getComputedStyle(context.inputRef.current);
    onInputStyleChange(computedStyle);

    // Add scroll event listener
    const input = context.inputRef.current;

    // Initial sync
    onResize();

    // Handle scroll events
    function onScroll() {
      window.requestAnimationFrame(onResize);
    }

    input.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      input.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [context.inputRef, onInputStyleChange, onResize]);

  if (!inputStyle) return null;

  const highlighterStyle: React.CSSProperties = {
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
    font: inputStyle.font,
    letterSpacing: inputStyle.letterSpacing,
    textTransform:
      inputStyle.textTransform as React.CSSProperties["textTransform"],
    padding: inputStyle.padding,
    border: inputStyle.border,
    borderRadius: inputStyle.borderRadius,
    boxSizing: inputStyle.boxSizing as React.CSSProperties["boxSizing"],
    overflow: "auto",
    width: "100%",
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
          data-mention-segment
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

    // Add a space to ensure correct height
    parts.push(<span key="space">&nbsp;</span>);

    return parts;
  }

  return (
    <div {...highlighterProps} ref={composedRef} style={highlighterStyle}>
      {renderHighlights()}
    </div>
  );
});

MentionHighlighter.displayName = HIGHLIGHTER_NAME;

export { MentionHighlighter };
