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

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

// Mock pointer capture methods
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();

// Mock scrollIntoView
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
      expect(input).toHaveClass("flex", "h-9", "w-full");
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

      // Type in de-DE format: comma as decimal separator
      await user.type(input, "1234,56");

      // EUR formatting in de-DE locale: 1.234,56 € (with non-breaking space)
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

      // Type digits incrementally
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

      // Type partial IPv4 address (natural typing - no auto-dots)
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

      // Valid value
      await user.type(input, "150");
      expect(onValidate).toHaveBeenLastCalledWith(true, "150");

      // Clear and type invalid value
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

        // Type incomplete phone number
        await user.type(input, "123");

        if (mode === "onChange" || mode === "all") {
          expect(onValidate).toHaveBeenCalled();
        } else if (mode === "onBlur" || mode === "onTouched") {
          expect(onValidate).not.toHaveBeenCalled();
        }

        onValidate.mockClear();

        // Blur the input
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

      // Type and blur first (marks as touched)
      await user.type(input, "123");
      await user.tab();
      expect(onValidate).toHaveBeenCalled();

      onValidate.mockClear();

      // Focus back and type more - should validate on change now
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

      // Type full phone number
      await user.type(input, "1234567890");
      expect(input).toHaveValue("(123) 456-7890");

      // Backspace should remove the last digit
      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("(123) 456-789");

      // Test backspace at specific position - should remove the digit before cursor
      input.setSelectionRange(9, 9); // Position after "456-"
      await user.keyboard("{Backspace}");
      // Should remove the '6' digit, resulting in "(123) 457-89"
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

      // Simulate IME composition
      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: "あ" } });

      // During composition, the component may not update the display value immediately
      // Let's test the composition behavior more accurately
      expect(onValueChange).not.toHaveBeenCalled();

      fireEvent.compositionEnd(input);
      fireEvent.change(input, { target: { value: "1" } });

      // After composition ends, masking should apply
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

      // Focus without maskPlaceholder should keep original placeholder
      await user.click(input);
      expect(onFocus).toHaveBeenCalled();
      expect(input).toHaveAttribute("placeholder", "Enter phone");

      // Blur should keep original placeholder
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

      // Initially should show regular placeholder
      expect(input).toHaveAttribute("placeholder", "Enter phone");

      // Focus should show mask placeholder
      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "(___) ___-____");

      // Blur should revert to original placeholder
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

      // Initially should show regular placeholder
      expect(input).toHaveAttribute("placeholder", "Enter phone");

      // Focus should keep regular placeholder
      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "Enter phone");

      // Blur should keep regular placeholder
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

      // Initially should show regular placeholder
      expect(input).toHaveAttribute("placeholder", "Enter amount");

      // Focus should show formatted currency placeholder
      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "$0.00");

      // Blur should revert to original placeholder
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

      // Initially should show regular placeholder
      expect(input).toHaveAttribute("placeholder", "Enter percentage");

      // Focus should show percentage placeholder
      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "0.00%");

      // Blur should revert to original placeholder
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

      // Initially should show regular placeholder
      expect(input).toHaveAttribute("placeholder", "Enter code");

      // Focus should show custom mask placeholder
      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "ABC-123");

      // Blur should revert to original placeholder
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

      // Initially should have no placeholder
      expect(input).not.toHaveAttribute("placeholder");

      // Focus should show mask placeholder
      await user.click(input);
      expect(input).toHaveAttribute("placeholder", "(___) ___-____");

      // Blur should remove placeholder
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
      // Uncontrolled
      const { rerender } = render(
        <MaskInput mask="phone" defaultValue="123" data-testid="phone-input" />,
      );

      let input = screen.getByTestId("phone-input");
      expect(input).toHaveValue("(123");

      // Controlled
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

      // Should render the custom component structure
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
        // EUR in de-DE: 1.234,56 €  (note: uses non-breaking space)
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
        // EUR in de-DE: 1.234,56 €  (note: uses non-breaking space)
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
        // JPY doesn't use decimals, so it should format as whole number
        expect(result).toMatch(/[¥￥]1,234/);
      });

      test("handles empty value", () => {
        const result = applyCurrencyMask({ value: "" });
        expect(result).toBe("");
      });

      test("handles invalid numeric values", () => {
        const result = applyCurrencyMask({ value: "abc" });
        // Invalid values with no digits return empty string
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
        // Test that single digits don't become full currency amounts
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
        const result = toUnmaskedIndex({ masked, pattern, caret: 9 }); // Position after "456-"
        expect(result).toBe(6); // 6th digit in unmasked value
      });

      test("converts unmasked position to masked position", () => {
        const masked = "(123) 456-7890";
        const pattern = "(###) ###-####";
        const result = fromUnmaskedIndex({ masked, pattern, unmaskedIndex: 6 }); // 6th digit
        expect(result).toBe(9); // Position after "456-" in masked value (0-indexed)
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
      expect(validate?.("12252023")).toBe(true); // Valid date
      expect(validate?.("13252023")).toBe(false); // Invalid month
      expect(validate?.("12322023")).toBe(false); // Invalid day
      expect(validate?.("02292023")).toBe(false); // Invalid leap year day
      expect(validate?.("02292024")).toBe(true); // Valid leap year day
    });

    test("time pattern validation", () => {
      const { validate } = MASK_PATTERNS.time;
      expect(validate?.("1430")).toBe(true); // Valid time
      expect(validate?.("2430")).toBe(false); // Invalid hour
      expect(validate?.("1460")).toBe(false); // Invalid minute
    });

    test("creditCard pattern validation", () => {
      const { validate } = MASK_PATTERNS.creditCard;

      // Valid credit card numbers (pass Luhn algorithm via validateCardNumber)
      expect(validate?.("4242424242424242")).toBe(true); // Stripe test card
      expect(validate?.("4000000000000002")).toBe(true); // Another valid card
      expect(validate?.("5555555555554444")).toBe(true); // Mastercard test card
      expect(validate?.("378282246310005")).toBe(true); // American Express (15 digits)
      expect(validate?.("6011111111111117")).toBe(true); // Discover test card

      // Invalid credit card numbers (fail Luhn algorithm)
      expect(validate?.("1231231231231231")).toBe(false); // User's example - invalid
      expect(validate?.("4242424242424243")).toBe(false); // One digit changed
      expect(validate?.("1234567890123456")).toBe(false); // Sequential numbers
      expect(validate?.("1111111111111111")).toBe(false); // All ones

      // Note: "0000000000000000" technically passes Luhn (sum=0, 0%10=0) but is not a real card
      expect(validate?.("0000000000000000")).toBe(true); // All zeros - passes Luhn but not realistic

      // Invalid length
      expect(validate?.("123456789012")).toBe(false); // Too short (12 digits)
      expect(validate?.("12345678901234567890")).toBe(false); // Too long (20 digits)
      expect(validate?.("123")).toBe(false); // Way too short
      expect(validate?.("")).toBe(false); // Empty

      // Invalid characters (should be filtered by transform first)
      expect(validate?.("abcd")).toBe(false);
    });

    test("creditCardExpiry pattern validation", () => {
      const { validate } = MASK_PATTERNS.creditCardExpiry;

      // Mock current date to December 2025 for consistent testing using Vitest fake timers
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 11, 15)); // December 15, 2025

      // Valid future dates
      expect(validate?.("1226")).toBe(true); // December 2026
      expect(validate?.("0126")).toBe(true); // January 2026
      expect(validate?.("1225")).toBe(true); // December 2025 (current month)
      expect(validate?.("1239")).toBe(true); // December 2039 (within 50 years)

      // Invalid past dates
      expect(validate?.("1125")).toBe(false); // November 2025 (past month)
      expect(validate?.("1224")).toBe(false); // December 2024 (past year)

      // Invalid months
      expect(validate?.("0025")).toBe(false); // Month 00
      expect(validate?.("1325")).toBe(false); // Month 13

      // Invalid format (wrong length)
      expect(validate?.("125")).toBe(false); // Too short
      expect(validate?.("12255")).toBe(false); // Too long
      expect(validate?.("")).toBe(false); // Empty

      // Invalid characters (should be filtered by transform)
      expect(validate?.("ab25")).toBe(false);

      // Edge cases for year validation
      expect(validate?.("1240")).toBe(true); // Year 40 (2040) is valid (within 50 years from 2025)
      expect(validate?.("1250")).toBe(true); // Year 50 (2050) is valid (within 50 years from 2025)
      expect(validate?.("1299")).toBe(false); // Year 99 (1999) is in the past
      expect(validate?.("1200")).toBe(false); // Year 00 (2000) is in the past
      expect(validate?.("1230")).toBe(true); // Year 30 (2030) is valid
      expect(validate?.("1249")).toBe(true); // Year 49 (2049) is valid (within 50 years from 2025)
      expect(validate?.("1275")).toBe(true); // Year 75 (2075) is valid (exactly 50 years from 2025)
      expect(validate?.("1276")).toBe(false); // Year 76 (1976) is in the past

      // Restore real timers
      vi.useRealTimers();
    });

    test("ipv4 pattern validation", () => {
      const { validate } = MASK_PATTERNS.ipv4;
      expect(validate?.("192168001001")).toBe(true); // Valid unmasked IPv4 (192.168.001.001 -> chunks: 192, 168, 001, 001)
      expect(validate?.("256168001001")).toBe(false); // Invalid octet (256 > 255)
      expect(validate?.("192168001")).toBe(true); // Incomplete but valid partial (192.168.001)
      expect(validate?.("192168111")).toBe(true); // Valid partial (192.168.111)
      expect(validate?.("1921680010011")).toBe(false); // Too long (> 12 digits)
    });

    test("currency pattern validation", () => {
      const { validate } = MASK_PATTERNS.currency;
      expect(validate?.("123.45")).toBe(true);
      expect(validate?.("123")).toBe(true);
      expect(validate?.("123.456")).toBe(false); // Too many decimal places
      expect(validate?.("abc")).toBe(false); // Non-numeric
    });

    test("percentage pattern validation", () => {
      const { validate } = MASK_PATTERNS.percentage;
      expect(validate?.("25.5")).toBe(true);
      expect(validate?.("100")).toBe(true);
      expect(validate?.("101")).toBe(false); // Over 100%
      expect(validate?.("-5")).toBe(false); // Negative
    });
  });

  describe("Cursor Positioning", () => {
    test("maintains cursor position when inserting character in the middle of credit card", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      // Type full credit card number
      await user.type(input, "4242424242424242");
      expect(input).toHaveValue("4242 4242 4242 4242");

      // Move cursor to position 13 (middle of third group)
      input.setSelectionRange(13, 13);
      expect(input.selectionStart).toBe(13);

      // Delete character at position 13
      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("4242 4242 4224 242");
      expect(input.selectionStart).toBe(12);

      // Type a character at position 12
      await user.keyboard("4");
      expect(input).toHaveValue("4242 4242 4242 4242");
      // Cursor should be at position 13 (right after the inserted character)
      expect(input.selectionStart).toBe(13);
    });

    test("maintains cursor position when inserting character at the beginning", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      // Type partial number
      await user.type(input, "424242");
      expect(input).toHaveValue("4242 42");

      // Move cursor to beginning
      input.setSelectionRange(0, 0);

      // Type at beginning
      await user.keyboard("1");
      expect(input).toHaveValue("1424 242");
      // Cursor should be at position 1
      expect(input.selectionStart).toBe(1);
    });

    test("maintains cursor position when inserting character before space separator", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      // Type to create first group
      await user.type(input, "4242");
      expect(input).toHaveValue("4242");

      // Move cursor to position 4 (end of first group, before space)
      input.setSelectionRange(4, 4);

      // Type another digit - should insert and handle the space correctly
      await user.keyboard("5");
      expect(input).toHaveValue("4242 5");
      // Cursor should be at position 6 (after space and new digit)
      expect(input.selectionStart).toBe(6);
    });

    test("maintains cursor position when deleting character in phone mask", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="phone" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      // Type full phone number
      await user.type(input, "5551234567");
      expect(input).toHaveValue("(555) 123-4567");

      // Move cursor to position 10 (after "123-")
      input.setSelectionRange(10, 10);

      // Delete character
      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("(555) 124-567");
      expect(input.selectionStart).toBe(8);

      // Type character back
      await user.keyboard("3");
      expect(input).toHaveValue("(555) 123-4567");
      // Cursor should be at position 9
      expect(input.selectionStart).toBe(9);
    });

    test("maintains cursor position when editing date mask", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="date" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      // Type full date
      await user.type(input, "12252025");
      expect(input).toHaveValue("12/25/2025");

      // Move cursor to position 3 (after month, before day)
      input.setSelectionRange(3, 3);

      // Delete the day's first digit
      await user.keyboard("{Delete}");
      expect(input).toHaveValue("12/52/025");

      // Move back to position 3
      input.setSelectionRange(3, 3);

      // Type the correct digit
      await user.keyboard("2");
      expect(input).toHaveValue("12/25/2025");
      // Cursor should be at position 4
      expect(input.selectionStart).toBe(4);
    });

    test("cursor stays at end when typing at the end", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="creditCard" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      // Type incrementally at the end
      await user.type(input, "4242");
      expect(input).toHaveValue("4242");
      expect(input.selectionStart).toBe(4);

      // After 4 digits, space is added
      await user.keyboard("4");
      expect(input).toHaveValue("4242 4");
      expect(input.selectionStart).toBe(6); // After space
    });

    test("maintains cursor position when inserting in the middle of SSN", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="ssn" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      // Type full SSN
      await user.type(input, "123456789");
      expect(input).toHaveValue("123-45-6789");

      // Move cursor to position 7 (middle of last group)
      input.setSelectionRange(7, 7);

      // Delete and retype
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

      // Type first 8 digits
      await user.type(input, "42424242");
      expect(input).toHaveValue("4242 4242");

      // Move cursor to position 5 (start of second group)
      input.setSelectionRange(5, 5);

      // Type multiple characters rapidly
      await user.keyboard("111");
      expect(input).toHaveValue("4242 1114 242");
      // Cursor should be after the inserted characters
      expect(input.selectionStart).toBe(8);
    });

    test("maintains cursor when backspace removes character before literal", async () => {
      const user = userEvent.setup();
      render(<MaskInput mask="phone" data-testid="mask-input" />);
      const input = screen.getByTestId("mask-input") as HTMLInputElement;

      // Type enough to create "(555) 1"
      await user.type(input, "5551");
      expect(input).toHaveValue("(555) 1");

      // Move cursor to position 6 (right after space, before "1")
      input.setSelectionRange(6, 6);

      // Backspace should remove the last "5"
      await user.keyboard("{Backspace}");
      expect(input).toHaveValue("(551");
      // Cursor should be at position 3
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

      // Type some digits
      await user.type(input, "4242");
      expect(input).toHaveValue("4242");

      // Move cursor to position 2
      input.setSelectionRange(2, 2);

      // Type a digit in the middle
      await user.keyboard("1");
      expect(input).toHaveValue("4214 2");
      // Cursor should be at position 3
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

      // Type EUR amount (German format uses comma as decimal separator)
      await user.type(input, "123456");
      // Should format as "1.234,56 €" in German locale
      expect(input.value).toContain("1");
      expect(input.value).toContain("234");
      expect(input.value).toContain("56");

      // Get current cursor position (at end)
      const endPosition = input.selectionStart ?? 0;

      // Move cursor to middle (after first digit group)
      const middlePosition = input.value.indexOf("234");
      input.setSelectionRange(middlePosition, middlePosition);

      // Delete a character
      await user.keyboard("{Backspace}");

      // Cursor should stay near the middle, not jump to end
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

      // Type USD amount
      await user.type(input, "123456");
      expect(input.value).toBe("$123,456");

      // Move cursor after the dollar sign (position 1)
      input.setSelectionRange(1, 1);

      // Type a digit
      await user.keyboard("9");
      expect(input.value).toBe("$9,123,456");

      // Cursor should be at position 2 (after the 9)
      expect(input.selectionStart).toBe(2);
    });
  });
});
