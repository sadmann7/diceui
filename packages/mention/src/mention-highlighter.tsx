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
  color: "transparent",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  pointerEvents: "none",
  userSelect: "none",
  overflow: "hidden",
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
      const [isInputElement, setIsInputElement] = React.useState<boolean>(false);
      const onInputStyleChangeCallback = useCallbackRef(setInputStyle);

      const onInputStyleChange = React.useCallback(() => {
        const inputElement = context.inputRef.current;
        if (!inputElement) return;

        const computedStyle = window.getComputedStyle(inputElement);
        const isInput = inputElement.tagName === "INPUT";
        setIsInputElement(isInput);
        onInputStyleChangeCallback(computedStyle);
      }, [context.inputRef, onInputStyleChangeCallback]);

      const onSyncScrollAndResize = React.useCallback(() => {
        const inputElement = context.inputRef.current;
        const highlighterElement = highlighterRef.current;

        if (!inputElement || !highlighterElement) return;

        requestAnimationFrame(() => {
          highlighterElement.scrollTop = inputElement.scrollTop;
          highlighterElement.scrollLeft = inputElement.scrollLeft;
          highlighterElement.style.height = `${inputElement.offsetHeight}px`;
        });
      }, [context.inputRef]);

      React.useEffect(() => {
        const inputElement = context.inputRef.current;
        if (!inputElement) return;

        onInputStyleChange();

        function onResize() {
          onInputStyleChange();
          onSyncScrollAndResize();
        }

        // Create a ResizeObserver to listen for the input's size changes
        const resizeObserver = new ResizeObserver(onResize);

        // Create a MutationObserver to listen for the input's class changes
        const mutationObserver = new MutationObserver((mutations) => {
          if (
            mutations.some(
              (m) => m.type === "attributes" && m.attributeName === "class",
            )
          ) {
            onResize();
          }
        });

        inputElement.addEventListener("scroll", onSyncScrollAndResize, {
          passive: true,
        });
        window.addEventListener("resize", onSyncScrollAndResize, {
          passive: true,
        });
        resizeObserver.observe(inputElement);
        mutationObserver.observe(inputElement, {
          attributes: true,
          attributeFilter: ["class"],
        });

        return () => {
          inputElement.removeEventListener("scroll", onSyncScrollAndResize);
          window.removeEventListener("resize", onSyncScrollAndResize);
          resizeObserver.disconnect();
          mutationObserver.disconnect();
        };
      }, [context.inputRef, onInputStyleChange, onSyncScrollAndResize]);

      const highlighterStyle = React.useMemo<React.CSSProperties>(() => {
        if (!inputStyle) return defaultHighlighterStyle;

        const baseStyle = {
          ...defaultHighlighterStyle,
          fontStyle: inputStyle.fontStyle,
          fontVariant: inputStyle.fontVariant,
          fontWeight: inputStyle.fontWeight,
          fontSize: inputStyle.fontSize,
          lineHeight: inputStyle.lineHeight,
          fontFamily: inputStyle.fontFamily,
          letterSpacing: inputStyle.letterSpacing,
          textTransform:
            inputStyle.textTransform as React.CSSProperties["textTransform"],
          textIndent: inputStyle.textIndent,
          padding: inputStyle.padding,
          borderWidth: inputStyle.borderWidth,
          borderStyle: inputStyle.borderStyle,
          borderColor: "currentColor",
          borderRadius: inputStyle.borderRadius,
          boxSizing: inputStyle.boxSizing as React.CSSProperties["boxSizing"],
          wordBreak: inputStyle.wordBreak as React.CSSProperties["wordBreak"],
          overflowWrap:
            inputStyle.overflowWrap as React.CSSProperties["overflowWrap"],
          direction: context.dir,
          ...style,
        };

        if (isInputElement) {
          return {
            ...baseStyle,
            whiteSpace: "nowrap",
            overflowX: "auto",
            overflowY: "hidden",
            wordWrap: "normal",
          };
        }

        return baseStyle;
      }, [inputStyle, style, context.dir, isInputElement]);

      const onSegmentsRender = React.useCallback(() => {
        const inputElement = context.inputRef.current;
        if (!inputElement) return null;

        const { value } = inputElement;
        const segments: React.ReactNode[] = [];
        let lastIndex = 0;

        for (const { start, end } of context.mentions) {
          // Add text before mention
          if (start > lastIndex) {
            segments.push(
              <span key={`text-${lastIndex}`}>
                {value.slice(lastIndex, start)}
              </span>,
            );
          }

          // Add highlighted mention
          segments.push(
            <span key={`mention-${start}`} data-tag="">
              {value.slice(start, end)}
            </span>,
          );

          lastIndex = end;
        }

        // Add text after mention
        if (lastIndex < value.length) {
          segments.push(
            <span key={`text-end-${value.length}`}>
              {value.slice(lastIndex)}
            </span>,
          );
        }

        // Add space after text
        segments.push(<span key="space">&nbsp;</span>);

        return segments;
      }, [context.inputRef, context.mentions]);

      if (!inputStyle) return null;

      return (
        <div
          {...highlighterProps}
          ref={composedRef}
          dir={context.dir}
          style={highlighterStyle}
        >
          {onSegmentsRender()}
        </div>
      );
    },
  ),
  (prevProps, nextProps) =>
    prevProps.style === nextProps.style &&
    Object.keys(prevProps).every(
      (key) =>
        prevProps[key as keyof typeof prevProps] ===
        nextProps[key as keyof typeof nextProps],
    ),
);

MentionHighlighter.displayName = HIGHLIGHTER_NAME;

export { MentionHighlighter };
