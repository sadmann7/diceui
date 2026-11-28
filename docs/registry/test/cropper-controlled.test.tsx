import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseCropper from "@/registry/bases/base/ui/cropper";
import * as RadixCropper from "@/registry/bases/radix/ui/cropper";

function rotate(rotation: number) {
  const cropper = document.querySelector("[data-slot='cropper']");
  if (!cropper) throw new Error("Cropper not rendered");

  fireEvent(cropper, new Event("gesturestart", { cancelable: true }));
  fireEvent(
    document,
    Object.assign(new Event("gesturechange", { cancelable: true }), {
      clientX: 0,
      clientY: 0,
      scale: 1,
      rotation,
    }),
  );
}

describe.each([
  ["radix", RadixCropper],
  ["base", BaseCropper],
])("Cropper (%s) controlled", (_, { Cropper, CropperImage }) => {
  interface TransformProps {
    crop?: { x: number; y: number };
    rotation?: number;
  }

  function renderCropper(props: TransformProps) {
    const onCropChange = vi.fn();
    const onRotationChange = vi.fn();

    function getCropper(nextProps: TransformProps) {
      return (
        <Cropper
          {...nextProps}
          onCropChange={onCropChange}
          onRotationChange={onRotationChange}
        >
          <CropperImage src="/image.png" alt="Media" />
        </Cropper>
      );
    }

    const result = render(getCropper(props));
    return {
      onCropChange,
      onRotationChange,
      rerender: (nextProps: TransformProps) =>
        result.rerender(getCropper(nextProps)),
    };
  }

  function getTransform() {
    return screen.getByAltText("Media").style.transform;
  }

  test("keeps the controlled rotation when the parent rejects a change", () => {
    const { onRotationChange } = renderCropper({ rotation: 0 });

    rotate(30);

    expect(onRotationChange).toHaveBeenCalledExactlyOnceWith(30);
    expect(getTransform()).toContain("rotate(0deg)");
  });

  test("doesn't call change callbacks when the props change", () => {
    const { onCropChange, onRotationChange, rerender } = renderCropper({
      crop: { x: 0, y: 0 },
      rotation: 0,
    });

    rerender({ crop: { x: 10, y: 20 }, rotation: 45 });

    expect(onCropChange).not.toHaveBeenCalled();
    expect(onRotationChange).not.toHaveBeenCalled();
    expect(getTransform()).toContain("translate(10px, 20px) rotate(45deg)");
  });

  test("keeps an uncontrolled rotation when the parent rerenders", () => {
    const { onCropChange, rerender } = renderCropper({});

    rotate(30);
    rerender({});

    expect(onCropChange).not.toHaveBeenCalled();
    expect(getTransform()).toContain("rotate(30deg)");
  });
});
