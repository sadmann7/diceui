import * as React from "react";

interface UseNearViewportOptions {
  enabled?: boolean;
  rootMargin?: string;
}

export function useNearViewport(
  ref: React.RefObject<HTMLElement | null>,
  { enabled = true, rootMargin = "400px 0px" }: UseNearViewportOptions = {},
) {
  const [isNearViewport, setIsNearViewport] = React.useState(!enabled);

  React.useEffect(() => {
    const element = ref.current;
    if (isNearViewport || !element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, isNearViewport, rootMargin]);

  return isNearViewport;
}
