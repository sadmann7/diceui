"use client";

import * as React from "react";

interface PresenceProps {
  children:
    | React.ReactElement
    | ((props: { present: boolean }) => React.ReactElement);
  present: boolean;
}

function Presence({ children, present }: PresenceProps) {
  const [mounted, setMounted] = React.useState(present);
  const prevPresentRef = React.useRef(present);

  React.useEffect(() => {
    const wasMounted = prevPresentRef.current;
    const hasMounted = present;

    if (hasMounted) {
      setMounted(true);
    } else if (wasMounted && !hasMounted) {
      setMounted(false);
    }

    prevPresentRef.current = present;
  }, [present]);

  if (!mounted) return null;

  return typeof children === "function"
    ? children({ present: mounted && present })
    : children;
}

export { Presence };
