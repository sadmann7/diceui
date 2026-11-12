import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  applyCurrencyMask,
  applyMask,
  applyPercentageMask,
  fromUnmaskedIndex,
  getUnmaskedValue,
  MASK_PATTERNS,
  MaskInput,
  type MaskInputProps,
  type MaskPattern,
  toUnmaskedIndex,
} from "@/registry/bases/radix/ui/mask-input";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();

Element.prototype.scrollIntoView = vi.fn();

describe("MaskInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Basic Rendering", () => {
    test("renders without crashing", () => {
      render(<MaskInput />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    test("applies default className", () => {
      render(<MaskInput data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input");
      expect(input).toHaveClass("cn-mask-input");
    });

    test("merges custom className", () => {
      render(<MaskInput className="custom-class" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input");
      expect(input).toHaveClass("custom-class");
    });

    test("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<MaskInput ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    test("handles disabled state", () => {
      render(<MaskInput disabled data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input");
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute("data-disabled", "");
    });

    test("handles readOnly state", () => {
      render(<MaskInput readOnly data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input");
      expect(input).toHaveAttribute("readonly");
      expect(input).toHaveAttribute("data-readonly", "");
    });

    test("handles required state", () => {
      render(<MaskInput required data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input");
      expect(input).toBeRequired();
      expect(input).toHaveAttribute("data-required", "");
    });

    test("handles invalid state", () => {
      render(<MaskInput invalid data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("data-invalid", "");
    });
  });

  describe("Built-in Mask Patterns", () => {
    test("phone mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="phone"
          onValueChange={onValueChange}
          data-testid="phone-input"
        />,
      );

      const input = screen.getByTestId("phone-input");

      await user.type(input, "1234567890");

      expect(input).toHaveValue("(123) 456-7890");
      expect(onValueChange).toHaveBeenLastCalledWith(
        "(123) 456-7890",
        "1234567890",
      );
    });

    test("ssn mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="ssn"
          onValueChange={onValueChange}
          data-testid="ssn-input"
        />,
      );

      const input = screen.getByTestId("ssn-input");

      await user.type(input, "123456789");

      expect(input).toHaveValue("123-45-6789");
      expect(onValueChange).toHaveBeenLastCalledWith(
        "123-45-6789",
        "123456789",
      );
    });

    test("date mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="date"
          onValueChange={onValueChange}
          data-testid="date-input"
        />,
      );

      const input = screen.getByTestId("date-input");

      await user.type(input, "12252023");

      expect(input).toHaveValue("12/25/2023");
      expect(onValueChange).toHaveBeenLastCalledWith("12/25/2023", "12252023");
    });

    test("time mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="time"
          onValueChange={onValueChange}
          data-testid="time-input"
        />,
      );

      const input = screen.getByTestId("time-input");

      await user.type(input, "1430");

      expect(input).toHaveValue("14:30");
      expect(onValueChange).toHaveBeenLastCalledWith("14:30", "1430");
    });

    test("creditCard mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="creditCard"
          onValueChange={onValueChange}
          data-testid="credit-card-input"
        />,
      );

      const input = screen.getByTestId("credit-card-input");

      await user.type(input, "1234567890123456");

      expect(input).toHaveValue("1234 5678 9012 3456");
      expect(onValueChange).toHaveBeenLastCalledWith(
        "1234 5678 9012 3456",
        "1234567890123456",
      );
    });

    test("creditCardExpiry mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="creditCardExpiry"
          onValueChange={onValueChange}
          data-testid="credit-card-expiry-input"
        />,
      );

      const input = screen.getByTestId("credit-card-expiry-input");

      await user.type(input, "1225");

      expect(input).toHaveValue("12/25");
      expect(onValueChange).toHaveBeenLastCalledWith("12/25", "1225");
    });

    test("zipCode mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="zipCode"
          onValueChange={onValueChange}
          data-testid="zip-input"
        />,
      );

      const input = screen.getByTestId("zip-input");

      await user.type(input, "12345");

      expect(input).toHaveValue("12345");
      expect(onValueChange).toHaveBeenLastCalledWith("12345", "12345");
    });

    test("currency mask pattern (USD default)", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="currency"
          onValueChange={onValueChange}
          data-testid="currency-input"
        />,
      );

      const input = screen.getByTestId("currency-input");

      await user.type(input, "1234.56");

      expect(input).toHaveValue("$1,234.56");
      expect(onValueChange).toHaveBeenLastCalledWith("$1,234.56", "1234.56");
    });

    test("currency mask pattern with EUR", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="currency"
          currency="EUR"
          locale="de-DE"
          onValueChange={onValueChange}
          data-testid="currency-input"
        />,
      );

      const input = screen.getByTestId("currency-input");

      // de-DE uses a comma as the decimal separator.
      await user.type(input, "1234,56");

      const expectedEurFormat = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(1234.56);
      expect(input).toHaveValue(expectedEurFormat);
      expect(onValueChange).toHaveBeenLastCalledWith(
        expectedEurFormat,
        "1234.56",
      );
    });

    test("currency mask pattern with GBP", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="currency"
          currency="GBP"
          locale="en-GB"
          onValueChange={onValueChange}
          data-testid="currency-input"
        />,
      );

      const input = screen.getByTestId("currency-input");

      await user.type(input, "1234.56");

      expect(input).toHaveValue("£1,234.56");
      expect(onValueChange).toHaveBeenLastCalledWith("£1,234.56", "1234.56");
    });

    test("currency mask pattern with incremental input", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="currency"
          onValueChange={onValueChange}
          data-testid="currency-input"
        />,
      );

      const input = screen.getByTestId("currency-input");

      await user.type(input, "1");
      expect(input).toHaveValue("$1");

      await user.type(input, "2");
      expect(input).toHaveValue("$12");

      await user.type(input, "3");
      expect(input).toHaveValue("$123");

      await user.type(input, ".");
      expect(input).toHaveValue("$123.");

      await user.type(input, "45");
      expect(input).toHaveValue("$123.45");
    });

    test("percentage mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="percentage"
          onValueChange={onValueChange}
          data-testid="percentage-input"
        />,
      );

      const input = screen.getByTestId("percentage-input");

      await user.type(input, "25.5");

      expect(input).toHaveValue("25.5%");
      expect(onValueChange).toHaveBeenLastCalledWith("25.5%", "25.5");
    });

    test("licensePlate mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="licensePlate"
          onValueChange={onValueChange}
          data-testid="license-plate-input"
        />,
      );

      const input = screen.getByTestId("license-plate-input");

      await user.type(input, "abc123");

      expect(input).toHaveValue("ABC-123");
      expect(onValueChange).toHaveBeenLastCalledWith("ABC-123", "ABC123");
    });

    test("ipv4 mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="ipv4"
          onValueChange={onValueChange}
          data-testid="ipv4-input"
        />,
      );

      const input = screen.getByTestId("ipv4-input");

      await user.type(input, "192168111");

      expect(input).toHaveValue("192168111");
      expect(onValueChange).toHaveBeenLastCalledWith("192168111", "192168111");
    });
  });

  describe("Custom Mask Patterns", () => {
    test("accepts custom mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const customMask: MaskPattern = {
        pattern: "##-##-##",
        transform: (value) => value.replace(/[^A-Z0-9]/gi, "").toUpperCase(),
        validate: (value) => /^[A-Z0-9]{6}$/.test(value),
      };

      render(
        <MaskInput
          mask={customMask}
          onValueChange={onValueChange}
          data-testid="custom-input"
        />,
      );

      const input = screen.getByTestId("custom-input");

      await user.type(input, "ab12cd");

      expect(input).toHaveValue("AB-12-CD");
      expect(onValueChange).toHaveBeenLastCalledWith("AB-12-CD", "AB12CD");
    });

    test("handles custom validation", async () => {
      const user = userEvent.setup();
      const onValidate = vi.fn();
      const customMask: MaskPattern = {
        pattern: "###",
        validate: (value) => parseInt(value, 10) > 100,
      };

      render(
        <MaskInput
          mask={customMask}
          onValidate={onValidate}
          data-testid="validation-input"
        />,
      );

      const input = screen.getByTestId("validation-input");

      await user.type(input, "150");
      expect(onValidate).toHaveBeenLastCalledWith(true, "150");

      await user.clear(input);
      await user.type(input, "50");
      expect(onValidate).toHaveBeenLastCalledWith(false, "50");
    });
  });

  describe("Validation Modes", () => {
    const createValidationTest = (
      mode: NonNullable<MaskInputProps["validationMode"]>,
    ) => {
      return async () => {
        const user = userEvent.setup();
        const onValidate = vi.fn();

        render(
          <MaskInput
            mask="phone"
            validationMode={mode}
            onValidate={onValidate}
            data-testid="validation-input"
          />,
        );

        const input = screen.getByTestId("validation-input");

        await user.type(input, "123");

        if (mode === "onChange" || mode === "all") {
          expect(onValidate).toHaveBeenCalled();
        } else if (mode === "onBlur" || mode === "onTouched") {
          expect(onValidate).not.toHaveBeenCalled();
        }

        onValidate.mockClear();

        await user.tab();

        if (mode === "onBlur" || mode === "onTouched" || mode === "all") {
          expect(onValidate).toHaveBeenCalled();
        } else if (mode === "onSubmit") {
          expect(onValidate).not.toHaveBeenCalled();
        }
      };
    };

    test("onChange validation mode", createValidationTest("onChange"));
    test("onBlur validation mode", createValidationTest("onBlur"));
    test("onSubmit validation mode", createValidationTest("onSubmit"));
    test("onTouched validation mode", createValidationTest("onTouched"));
    test("all validation mode", createValidationTest("all"));

    test("onTouched mode validates on change after first blur", async () => {
      const user = userEvent.setup();
      const onValidate = vi.fn();

      render(
        <MaskInput
          mask="phone"
          validationMode="onTouched"
          onValidate={onValidate}
          data-testid="validation-input"
        />,
      );

      const input = screen.getByTestId("validation-input");

      await user.type(input, "123");
      await user.tab();
      expect(onValidate).toHaveBeenCalled();

      onValidate.mockClear();

      await user.click(input);
      await user.type(input, "4");
      expect(onValidate).toHaveBeenCalled();
    });
  });

  describe("User Interactions", () => {
    test("handles backspace correctly", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="phone"
          onValueChange={onValueChange}
          data-testid="phone-input"
        />,
      );

      const input = screen.getByTestId("phone-input");

      if (!(input instanceof HTMLInputElement)) {
        throw new Error("Input element not found");
      }

      await user.type(input, "1234567890");
      expect(input).toHaveValue("(123) 456-7890");

      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("(123) 456-789");

      input.setSelectionRange(9, 9);
      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("(123) 457-89");
    });

    test("handles composition events (IME)", async () => {
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="phone"
          onValueChange={onValueChange}
          data-testid="phone-input"
        />,
      );

      const input = screen.getByTestId("phone-input");

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: "あ" } });

      expect(onValueChange).not.toHaveBeenCalled();

      fireEvent.compositionEnd(input);
      fireEvent.change(input, { target: { value: "1" } });

      expect(input).toHaveValue("(1");
    });

    test("handles focus and blur events", async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      const onBlur = vi.fn();

      render(
        <MaskInput
          mask="phone"
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Enter phone"
          data-testid="phone-input"
        />,
      );

      const input = screen.getByTestId("phone-input");

      await user.click(input);
      expect(onFocus).toHaveBeenCalled();
      expect(input).toHaveAttribute("placeholder", "Enter phone");

      await user.tab();
      expect(onBlur).toHaveBeenCalled();
      expect(input).toHaveAttribute("placeholder", "Enter phone");
    });
  });

  describe("MaskPlaceholder Prop", () => {
    test("shows maskPlaceholder when focused and prop is provided", async () => {
      const user = userEvent.setup();

      render(
        <MaskInput
          mask="phone"
          placeholder="Enter phone"
          maskPlaceholder="(___) ___-____"
          data-testid="phone-input"
        />,
      );

      const input = screen.getByTestId("phone-input");

      expect(input).toHaveAttribute("placeholder", "Enter phone");

      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "(___) ___-____");

      await user.tab();
      expect(input).toHaveAttribute("placeholder", "Enter phone");
    });

    test("does not show mask placeholder when maskPlaceholder prop is not provided", async () => {
      const user = userEvent.setup();

      render(
        <MaskInput
          mask="phone"
          placeholder="Enter phone"
          data-testid="phone-input"
        />,
      );

      const input = screen.getByTestId("phone-input");

      expect(input).toHaveAttribute("placeholder", "Enter phone");

      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "Enter phone");

      await user.tab();
      expect(input).toHaveAttribute("placeholder", "Enter phone");
    });

    test("shows currency placeholder when focused with currency mask and maskPlaceholder", async () => {
      const user = userEvent.setup();

      render(
        <MaskInput
          mask="currency"
          placeholder="Enter amount"
          maskPlaceholder="$0.00"
          data-testid="currency-input"
        />,
      );

      const input = screen.getByTestId("currency-input");

      expect(input).toHaveAttribute("placeholder", "Enter amount");

      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "$0.00");

      await user.tab();
      expect(input).toHaveAttribute("placeholder", "Enter amount");
    });

    test("shows percentage placeholder when focused with percentage mask and maskPlaceholder", async () => {
      const user = userEvent.setup();

      render(
        <MaskInput
          mask="percentage"
          placeholder="Enter percentage"
          maskPlaceholder="0.00%"
          data-testid="percentage-input"
        />,
      );

      const input = screen.getByTestId("percentage-input");

      expect(input).toHaveAttribute("placeholder", "Enter percentage");

      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "0.00%");

      await user.tab();
      expect(input).toHaveAttribute("placeholder", "Enter percentage");
    });

    test("shows custom maskPlaceholder with custom mask pattern", async () => {
      const user = userEvent.setup();
      const customMask: MaskPattern = {
        pattern: "###-###",
        transform: (value) => value.replace(/[^A-Z0-9]/gi, "").toUpperCase(),
        validate: (value) => /^[A-Z0-9]{6}$/.test(value),
      };

      render(
        <MaskInput
          mask={customMask}
          placeholder="Enter code"
          maskPlaceholder="ABC-123"
          data-testid="custom-input"
        />,
      );

      const input = screen.getByTestId("custom-input");

      expect(input).toHaveAttribute("placeholder", "Enter code");

      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "ABC-123");

      await user.tab();
      expect(input).toHaveAttribute("placeholder", "Enter code");
    });

    test("handles maskPlaceholder without regular placeholder", async () => {
      const user = userEvent.setup();

      render(
        <MaskInput
          mask="phone"
          maskPlaceholder="(___) ___-____"
          data-testid="phone-input"
        />,
      );

      const input = screen.getByTestId("phone-input");

      expect(input).not.toHaveAttribute("placeholder");

      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "(___) ___-____");

      await user.tab();
      expect(input).not.toHaveAttribute("placeholder");
    });
  });

  describe("Edge Cases", () => {
    test("withoutMask prop disables masking", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <MaskInput
          mask="phone"
          withoutMask
          onValueChange={onValueChange}
          data-testid="no-mask-input"
        />,
      );

      const input = screen.getByTestId("no-mask-input");

      await user.type(input, "1234567890");

      expect(input).toHaveValue("1234567890");
      expect(onValueChange).toHaveBeenLastCalledWith(
        "1234567890",
        "1234567890",
      );
    });

    test("controlled vs uncontrolled behavior", async () => {
      const { rerender } = render(
        <MaskInput mask="phone" defaultValue="123" data-testid="phone-input" />,
      );

      let input = screen.getByTestId("phone-input");
      expect(input).toHaveValue("(123");

      rerender(
        <MaskInput mask="phone" value="456" data-testid="phone-input" />,
      );

      input = screen.getByTestId("phone-input");
      expect(input).toHaveValue("(456");
    });

    test("handles maxLength for fixed patterns", () => {
      render(<MaskInput mask="zipCode" data-testid="zip-input" />);

      const input = screen.getByTestId("zip-input");
      expect(input).toHaveAttribute("maxLength", "5");
    });

    test("sets appropriate inputMode for numeric patterns", () => {
      render(<MaskInput mask="phone" data-testid="phone-input" />);

      const input = screen.getByTestId("phone-input");
      expect(input).toHaveAttribute("inputMode", "numeric");
    });

    test("handles asChild prop with Slot", () => {
      const CustomInput = ({
        children,
        ...props
      }: React.ComponentProps<"input"> & { children?: React.ReactNode }) => (
        <div data-testid="custom-wrapper">
          <input {...props} data-testid="custom-input" />
          {children}
        </div>
      );

      render(
        <MaskInput asChild mask="phone">
          <CustomInput />
        </MaskInput>,
      );

      expect(screen.getByTestId("custom-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("custom-input")).toBeInTheDocument();
    });
  });

  describe("Utility Functions", () => {
    describe("applyMask", () => {
      test("applies basic pattern mask", () => {
        const result = applyMask({
          value: "1234567890",
          pattern: "(###) ###-####",
        });
        expect(result).toBe("(123) 456-7890");
      });

      test("handles partial input", () => {
        const result = applyMask({
          value: "123",
          pattern: "(###) ###-####",
        });
        expect(result).toBe("(123");
      });

      test("applies transform function", () => {
        const transform = (value: string) => value.replace(/\D/g, "");
        const unmasked = transform("1a2b3c");
        const result = applyMask({
          value: unmasked,
          pattern: "###-###",
        });
        expect(result).toBe("123");
      });

      test("applies currency mask with USD", () => {
        const result = applyMask({
          value: "1234.56",
          pattern: "$###,###.##",
          currency: "USD",
          locale: "en-US",
          mask: "currency",
        });
        expect(result).toBe("$1,234.56");
      });

      test("applies currency mask with EUR", () => {
        const result = applyMask({
          value: "1234.56",
          pattern: "€###,###.##",
          currency: "EUR",
          locale: "de-DE",
          mask: "currency",
        });
        // de-DE puts a non-breaking space before €.
        expect(result).toMatch(/1\.234,56\s+€/);
      });

      test("applies percentage mask", () => {
        const result = applyMask({
          value: "25.5",
          pattern: "##.##%",
        });
        expect(result).toBe("25.5%");
      });
    });

    describe("applyCurrencyMask", () => {
      test("formats USD currency by default", () => {
        const result = applyCurrencyMask({ value: "1234.56" });
        expect(result).toBe("$1,234.56");
      });

      test("formats EUR currency", () => {
        const result = applyCurrencyMask({
          value: "1234.56",
          currency: "EUR",
          locale: "de-DE",
        });
        // de-DE puts a non-breaking space before €.
        expect(result).toMatch(/1\.234,56\s+€/);
      });

      test("formats GBP currency", () => {
        const result = applyCurrencyMask({
          value: "1234.56",
          currency: "GBP",
          locale: "en-GB",
        });
        expect(result).toBe("£1,234.56");
      });

      test("formats JPY currency (no decimals)", () => {
        const result = applyCurrencyMask({
          value: "1234",
          currency: "JPY",
          locale: "ja-JP",
        });
        expect(result).toMatch(/[¥￥]1,234/);
      });

      test("handles empty value", () => {
        const result = applyCurrencyMask({ value: "" });
        expect(result).toBe("");
      });

      test("handles invalid numeric values", () => {
        const result = applyCurrencyMask({ value: "abc" });
        expect(result).toBe("");
      });

      test("adds commas for large numbers", () => {
        const result = applyCurrencyMask({ value: "1234567.89" });
        expect(result).toBe("$1,234,567.89");
      });

      test("handles partial decimal input", () => {
        const result = applyCurrencyMask({ value: "123.4" });
        expect(result).toBe("$123.4");
      });

      test("handles integer input", () => {
        const result = applyCurrencyMask({ value: "123" });
        expect(result).toBe("$123");
      });

      test("handles incremental input correctly", () => {
        expect(applyCurrencyMask({ value: "1" })).toBe("$1");
        expect(applyCurrencyMask({ value: "12" })).toBe("$12");
        expect(applyCurrencyMask({ value: "123" })).toBe("$123");
        expect(applyCurrencyMask({ value: "123." })).toBe("$123.");
        expect(applyCurrencyMask({ value: "123.4" })).toBe("$123.4");
        expect(applyCurrencyMask({ value: "123.45" })).toBe("$123.45");
      });

      test("fallbacks to USD on invalid currency", () => {
        const result = applyCurrencyMask({
          value: "123.45",
          currency: "INVALID",
          locale: "invalid-locale",
        });
        expect(result).toBe("$123.45");
      });
    });

    describe("applyPercentageMask", () => {
      test("formats percentage", () => {
        const result = applyPercentageMask("25.5");
        expect(result).toBe("25.5%");
      });

      test("handles empty value", () => {
        const result = applyPercentageMask("");
        expect(result).toBe("");
      });

      test("limits decimal places", () => {
        const result = applyPercentageMask("25.555");
        expect(result).toBe("25.55%");
      });
    });

    describe("getUnmaskedValue", () => {
      test("removes non-digits by default", () => {
        const result = getUnmaskedValue({ value: "(123) 456-7890" });
        expect(result).toBe("1234567890");
      });

      test("applies custom transform", () => {
        const transform = (value: string) =>
          value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        const result = getUnmaskedValue({
          value: "abc-123",
          transform,
        });
        expect(result).toBe("ABC123");
      });
    });

    describe("toUnmaskedIndex and fromUnmaskedIndex", () => {
      test("converts masked position to unmasked position", () => {
        const masked = "(123) 456-7890";
        const pattern = "(###) ###-####";
        const result = toUnmaskedIndex({ masked, pattern, caret: 9 });
        expect(result).toBe(6);
      });

      test("converts unmasked position to masked position", () => {
        const masked = "(123) 456-7890";
        const pattern = "(###) ###-####";
        const result = fromUnmaskedIndex({ masked, pattern, unmaskedIndex: 6 });
        expect(result).toBe(9);
      });
    });
  });

  describe("MASK_PATTERNS validation", () => {
    test("phone pattern validation", () => {
      const { validate } = MASK_PATTERNS.phone;
      expect(validate?.("1234567890")).toBe(true);
      expect(validate?.("123456789")).toBe(false);
      expect(validate?.("12345678901")).toBe(false);
    });

    test("date pattern validation", () => {
      const { validate } = MASK_PATTERNS.date;
      expect(validate?.("12252023")).toBe(true);
      expect(validate?.("13252023")).toBe(false);
      expect(validate?.("12322023")).toBe(false);
      expect(validate?.("02292023")).toBe(false); // 2023 isn't a leap year.
      expect(validate?.("02292024")).toBe(true);
    });

    test("time pattern validation", () => {
      const { validate } = MASK_PATTERNS.time;
      expect(validate?.("1430")).toBe(true);
      expect(validate?.("2430")).toBe(false);
      expect(validate?.("1460")).toBe(false);
    });

    test("creditCard pattern validation", () => {
      const { validate } = MASK_PATTERNS.creditCard;

      // These pass the Luhn check.
      expect(validate?.("4242424242424242")).toBe(true);
      expect(validate?.("4000000000000002")).toBe(true);
      expect(validate?.("5555555555554444")).toBe(true);
      expect(validate?.("378282246310005")).toBe(true);
      expect(validate?.("6011111111111117")).toBe(true);

      // These fail the Luhn check.
      expect(validate?.("1231231231231231")).toBe(false);
      expect(validate?.("4242424242424243")).toBe(false);
      expect(validate?.("1234567890123456")).toBe(false);
      expect(validate?.("1111111111111111")).toBe(false);

      // "0000000000000000" passes Luhn (sum=0) without being a real card.
      expect(validate?.("0000000000000000")).toBe(true);

      expect(validate?.("123456789012")).toBe(false);
      expect(validate?.("12345678901234567890")).toBe(false);
      expect(validate?.("123")).toBe(false);
      expect(validate?.("")).toBe(false);

      expect(validate?.("abcd")).toBe(false);
    });

    test("creditCardExpiry pattern validation", () => {
      const { validate } = MASK_PATTERNS.creditCardExpiry;

      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 11, 15));

      expect(validate?.("1226")).toBe(true);
      expect(validate?.("0126")).toBe(true);
      expect(validate?.("1225")).toBe(true);
      expect(validate?.("1239")).toBe(true);

      expect(validate?.("1125")).toBe(false);
      expect(validate?.("1224")).toBe(false);

      expect(validate?.("0025")).toBe(false);
      expect(validate?.("1325")).toBe(false);

      expect(validate?.("125")).toBe(false);
      expect(validate?.("12255")).toBe(false);
      expect(validate?.("")).toBe(false);

      expect(validate?.("ab25")).toBe(false);

      // Two-digit years up to 75 read as 20xx and later ones as 19xx.
      expect(validate?.("1240")).toBe(true);
      expect(validate?.("1250")).toBe(true);
      expect(validate?.("1299")).toBe(false);
      expect(validate?.("1200")).toBe(false);
      expect(validate?.("1230")).toBe(true);
      expect(validate?.("1249")).toBe(true);
      expect(validate?.("1275")).toBe(true);
      expect(validate?.("1276")).toBe(false);

      vi.useRealTimers();
    });

    test("ipv4 pattern validation", () => {
      const { validate } = MASK_PATTERNS.ipv4;
      expect(validate?.("192168001001")).toBe(true);
      expect(validate?.("256168001001")).toBe(false);
      expect(validate?.("192168001")).toBe(true);
      expect(validate?.("192168111")).toBe(true);
      expect(validate?.("1921680010011")).toBe(false);
    });

    test("currency pattern validation", () => {
      const { validate } = MASK_PATTERNS.currency;
      expect(validate?.("123.45")).toBe(true);
      expect(validate?.("123")).toBe(true);
      expect(validate?.("123.456")).toBe(false);
      expect(validate?.("abc")).toBe(false);
    });

    test("percentage pattern validation", () => {
      const { validate } = MASK_PATTERNS.percentage;
      expect(validate?.("25.5")).toBe(true);
      expect(validate?.("100")).toBe(true);
      expect(validate?.("101")).toBe(false);
      expect(validate?.("-5")).toBe(false);
    });
  });

  describe("Cursor Positioning", () => {
    test("maintains cursor position when inserting character in the middle of credit card", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "4242424242424242");
      expect(input).toHaveValue("4242 4242 4242 4242");

      input.setSelectionRange(13, 13);
      expect(input.selectionStart).toBe(13);

      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("4242 4242 4224 242");
      expect(input.selectionStart).toBe(12);

      await user.keyboard("4");
      expect(input).toHaveValue("4242 4242 4242 4242");
      expect(input.selectionStart).toBe(13);
    });

    test("maintains cursor position when inserting character at the beginning", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "424242");
      expect(input).toHaveValue("4242 42");

      input.setSelectionRange(0, 0);

      await user.keyboard("1");
      expect(input).toHaveValue("1424 242");
      expect(input.selectionStart).toBe(1);
    });

    test("maintains cursor position when inserting character before space separator", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "4242");
      expect(input).toHaveValue("4242");

      input.setSelectionRange(4, 4);

      await user.keyboard("5");
      expect(input).toHaveValue("4242 5");
      expect(input.selectionStart).toBe(6);
    });

    test("maintains cursor position when deleting character in phone mask", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="phone" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "5551234567");
      expect(input).toHaveValue("(555) 123-4567");

      input.setSelectionRange(10, 10);

      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("(555) 124-567");
      expect(input.selectionStart).toBe(8);

      await user.keyboard("3");
      expect(input).toHaveValue("(555) 123-4567");
      expect(input.selectionStart).toBe(9);
    });

    test("maintains cursor position when editing date mask", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="date" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "12252025");
      expect(input).toHaveValue("12/25/2025");

      input.setSelectionRange(3, 3);

      await user.keyboard("{Delete}");
      expect(input).toHaveValue("12/52/025");

      input.setSelectionRange(3, 3);

      await user.keyboard("2");
      expect(input).toHaveValue("12/25/2025");
      expect(input.selectionStart).toBe(4);
    });

    test("cursor stays at end when typing at the end", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "4242");
      expect(input).toHaveValue("4242");
      expect(input.selectionStart).toBe(4);

      await user.keyboard("4");
      expect(input).toHaveValue("4242 4");
      expect(input.selectionStart).toBe(6);
    });

    test("maintains cursor position when inserting in the middle of SSN", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="ssn" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "123456789");
      expect(input).toHaveValue("123-45-6789");

      input.setSelectionRange(7, 7);

      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("123-46-789");
      expect(input.selectionStart).toBe(5);

      await user.keyboard("5");
      expect(input).toHaveValue("123-45-6789");
      expect(input.selectionStart).toBe(6);
    });

    test("handles rapid typing in the middle without cursor jumping", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "42424242");
      expect(input).toHaveValue("4242 4242");

      input.setSelectionRange(5, 5);

      await user.keyboard("111");
      expect(input).toHaveValue("4242 1114 242");
      expect(input.selectionStart).toBe(8);
    });

    test("maintains cursor when backspace removes character before literal", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="phone" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "5551");
      expect(input).toHaveValue("(555) 1");

      input.setSelectionRange(6, 6);

      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("(551");
      expect(input.selectionStart).toBe(3);
    });

    test("cursor positioning works with controlled component", async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState("");
        return (
          <MaskInput
            mask="creditCard"
            value={value}
            onValueChange={(masked) => setValue(masked)}
            data-testid="mask-input"
          />
        );
      };

      render(<TestComponent />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "4242");
      expect(input).toHaveValue("4242");

      input.setSelectionRange(2, 2);

      await user.keyboard("1");
      expect(input).toHaveValue("4214 2");
      expect(input.selectionStart).toBe(3);
    });

    test("maintains cursor position when editing EUR currency in the middle", async () => {
      const user = userEvent.setup();
      render(
        <MaskInput
          mask="currency"
          currency="EUR"
          locale="de-DE"
          data-testid="mask-input"
        />,
      );
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "123456");
      expect(input.value).toContain("1");
      expect(input.value).toContain("234");
      expect(input.value).toContain("56");

      const endPosition = input.selectionStart ?? 0;

      const middlePosition = input.value.indexOf("234");
      input.setSelectionRange(middlePosition, middlePosition);

      await user.keyboard("{Backspace}");

      const newPosition = input.selectionStart ?? 0;
      expect(newPosition).toBeLessThan(endPosition - 2);
      expect(newPosition).toBeGreaterThan(0);
    });

    test("maintains cursor position when editing USD currency in the middle", async () => {
      const user = userEvent.setup();
      render(
        <MaskInput
          mask="currency"
          currency="USD"
          locale="en-US"
          data-testid="mask-input"
        />,
      );
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      await user.type(input, "123456");
      expect(input.value).toBe("$123,456");

      input.setSelectionRange(1, 1);

      await user.keyboard("9");
      expect(input.value).toBe("$9,123,456");

      expect(input.selectionStart).toBe(2);
    });
  });
});
