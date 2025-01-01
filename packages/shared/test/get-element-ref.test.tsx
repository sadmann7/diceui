import * as React from "react";
import { describe, expect, it } from "vitest";
import { getElementRef } from "../src/lib/get-element-ref";

describe("getElementRef", () => {
  it("returns undefined for non-React elements", () => {
    expect(getElementRef({} as React.ReactElement)).toBeUndefined();
    expect(
      getElementRef(null as unknown as React.ReactElement),
    ).toBeUndefined();
  });

  it("gets ref from element props", () => {
    const ref = React.createRef<HTMLDivElement>();
    const element = <div ref={ref} />;
    expect(getElementRef(element)).toBe(ref);
  });

  it("gets ref from function components", () => {
    const ref = React.createRef<HTMLDivElement>();
    const CustomComponent = React.forwardRef<HTMLDivElement>((props, ref) => (
      <div ref={ref} {...props} />
    ));
    const element = <CustomComponent ref={ref} />;
    expect(getElementRef(element)).toBe(ref);
  });

  it("handles callback refs", () => {
    const callbackRef = (_instance: HTMLDivElement) => {};
    const element = <div ref={callbackRef} />;
    expect(getElementRef(element)).toBe(callbackRef);
  });

  it("returns null when no ref is present", () => {
    const element = <div />;
    expect(getElementRef(element)).toBeNull();
  });
});
