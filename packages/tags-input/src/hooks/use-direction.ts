import * as React from "react";

type Direction = "ltr" | "rtl";

export function useDirection(dirProp?: Direction): Direction {
  const [dir, setDir] = React.useState<"ltr" | "rtl">(dirProp || "ltr");

  React.useEffect(() => {
    if (dirProp) {
      setDir(dirProp);
    } else {
      const htmlDir = document.documentElement.dir;
      setDir((htmlDir as Direction) || "ltr");
    }
  }, [dirProp]);

  return dir;
}
