import * as React from "react";

interface UseNearViewportOptions {
  enabled?: boolean;
  rootMargin?: string;
}

export function useNearViewport(
  ref: React.RefObject<HTMLElement | null>,
  { enabled = true, rootMargin = "400px 0px" }: UseNearViewportOptions = {},
) {
  const [isNear, setIsNear] = React.useState(!enabled);

  React.useEffect(() => {
    const element = ref.current;
    if (isNear || !element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNear(true);
        observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, isNear, rootMargin]);

  return isNear;
}
