import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BasePhoneInput from "@/registry/bases/base/ui/phone-input";
import * as RadixPhoneInput from "@/registry/bases/radix/ui/phone-input";

describe.each([
  ["radix", RadixPhoneInput],
  ["base", BasePhoneInput],
])("PhoneInput (%s) controlled", (_, { PhoneInput, PhoneInputField }) => {
  function renderPhoneInput(
    props: { value?: string; country?: string },
    onValueChange = vi.fn(),
    onCountryChange = vi.fn(),
  ) {
    function getPhoneInput(nextProps: typeof props) {
      return (
        <PhoneInput
          {...nextProps}
          onValueChange={onValueChange}
          onCountryChange={onCountryChange}
        >
          <PhoneInputField />
        </PhoneInput>
      );
    }
    const result = render(getPhoneInput(props));
    return {
      onValueChange,
      onCountryChange,
      rerender: (nextProps: typeof props) =>
        result.rerender(getPhoneInput(nextProps)),
    };
  }

  test("keeps the controlled value when the parent rejects a change", () => {
    const { onValueChange } = renderPhoneInput({ value: "+123" });
    const input = screen.getByRole("textbox");
    const displayValue = (input as HTMLInputElement).value;

    fireEvent.change(input, { target: { value: "+1234" } });

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("+1234");
    expect(input).toHaveValue(displayValue);
  });

  test("doesn't call the change callbacks when the props change", () => {
    const { onValueChange, onCountryChange, rerender } = renderPhoneInput({
      value: "",
      country: "us",
    });

    rerender({ value: "+123", country: "ca" });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(onCountryChange).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).not.toHaveValue("");
  });
});
