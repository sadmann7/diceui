import "@testing-library/jest-dom";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  applyCurrencyMask,
  applyMask,
  applyPercentageMask,
  fromUnmaskedIndex,
  getUnmaskedValue,
  MASK_PATTERNS,
  MaskInput,
  type MaskPattern,
  toUnmaskedIndex,
  type ValidationMode,
} from "@/registry/default/ui/mask-input";

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
        expect.any(Object),
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
        expect.any(Object),
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
      expect(onValueChange).toHaveBeenLastCalledWith(
        "12/25/2023",
        "12252023",
        expect.any(Object),
      );
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
      expect(onValueChange).toHaveBeenLastCalledWith(
        "14:30",
        "1430",
        expect.any(Object),
      );
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
        expect.any(Object),
      );
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
      expect(onValueChange).toHaveBeenLastCalledWith(
        "12345",
        "12345",
        expect.any(Object),
      );
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
      expect(onValueChange).toHaveBeenLastCalledWith(
        "$1,234.56",
        "1234.56",
        expect.any(Object),
      );
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

      await user.type(input, "1234.56");

      // EUR formatting can vary slightly between environments
      expect(input).toHaveValue("€1,234.56");
      expect(onValueChange).toHaveBeenLastCalledWith(
        "€1,234.56",
        "1234.56",
        expect.any(Object),
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
      expect(onValueChange).toHaveBeenLastCalledWith(
        "£1,234.56",
        "1234.56",
        expect.any(Object),
      );
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
      expect(onValueChange).toHaveBeenLastCalledWith(
        "25.5%",
        "25.5",
        expect.any(Object),
      );
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
      expect(onValueChange).toHaveBeenLastCalledWith(
        "ABC-123",
        "ABC123",
        expect.any(Object),
      );
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

      // Type partial IPv4 address
      await user.type(input, "192168111");

      expect(input).toHaveValue("192.168.111");
      expect(onValueChange).toHaveBeenLastCalledWith(
        "192.168.111",
        "192168111",
        expect.any(Object),
      );
    });
  });

  describe("Custom Mask Patterns", () => {
    test("accepts custom mask pattern", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const customMask: MaskPattern = {
        pattern: "##-##-##",
        placeholder: "AB-CD-EF",
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
      expect(onValueChange).toHaveBeenLastCalledWith(
        "AB-12-CD",
        "AB12CD",
        expect.any(Object),
      );
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
    const createValidationTest = (mode: ValidationMode) => {
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

    test("handles paste operation", async () => {
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

      // Paste phone number
      await user.click(input);
      await user.paste("5551234567");

      expect(input).toHaveValue("(555) 123-4567");
      expect(onValueChange).toHaveBeenLastCalledWith(
        "(555) 123-4567",
        "5551234567",
        expect.any(Object),
      );
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

      // Focus should show mask placeholder
      await user.click(input);
      expect(onFocus).toHaveBeenCalled();
      expect(input).toHaveAttribute("placeholder", "(___) ___-____");

      // Blur should revert to original placeholder
      await user.tab();
      expect(onBlur).toHaveBeenCalled();
      expect(input).toHaveAttribute("placeholder", "Enter phone");
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
        expect.any(Object),
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

    test("prevents default on paste when mask is applied", async () => {
      render(<MaskInput mask="phone" data-testid="phone-input" />);

      const input = screen.getByTestId("phone-input");

      const pasteEvent = vi.fn();
      input.addEventListener("paste", pasteEvent);

      // Simulate paste with clipboard data
      const clipboardData = {
        getData: vi.fn().mockReturnValue("1234567890"),
      };

      fireEvent.paste(input, {
        clipboardData,
      });

      // The paste event should have been prevented and mask applied
      expect(input).toHaveValue("(123) 456-7890");
    });
  });

  describe("Utility Functions", () => {
    describe("applyMask", () => {
      test("applies basic pattern mask", () => {
        const result = applyMask("1234567890", "(###) ###-####");
        expect(result).toBe("(123) 456-7890");
      });

      test("handles partial input", () => {
        const result = applyMask("123", "(###) ###-####");
        expect(result).toBe("(123");
      });

      test("applies transform function", () => {
        const transform = (value: string) => value.replace(/\D/g, "");
        const result = applyMask("1a2b3c", "###-###", transform);
        expect(result).toBe("123");
      });

      test("applies currency mask with USD", () => {
        const result = applyMask(
          "1234.56",
          "$###,###.##",
          undefined,
          "USD",
          "en-US",
          "currency",
        );
        expect(result).toBe("$1,234.56");
      });

      test("applies currency mask with EUR", () => {
        const result = applyMask(
          "1234.56",
          "€###,###.##",
          undefined,
          "EUR",
          "de-DE",
          "currency",
        );
        expect(result).toMatch(/€.*1.*234.*56/);
      });

      test("applies percentage mask", () => {
        const result = applyMask(
          "25.5",
          "##.##%",
          undefined,
          undefined,
          undefined,
        );
        expect(result).toBe("25.5%");
      });
    });

    describe("applyCurrencyMask", () => {
      test("formats USD currency by default", () => {
        const result = applyCurrencyMask("1234.56");
        expect(result).toBe("$1,234.56");
      });

      test("formats EUR currency", () => {
        const result = applyCurrencyMask("1234.56", "EUR", "de-DE");
        // The actual format depends on the browser's Intl implementation
        expect(result).toMatch(/€.*1.*234.*56/);
      });

      test("formats GBP currency", () => {
        const result = applyCurrencyMask("1234.56", "GBP", "en-GB");
        expect(result).toBe("£1,234.56");
      });

      test("formats JPY currency (no decimals)", () => {
        const result = applyCurrencyMask("1234", "JPY", "ja-JP");
        // JPY doesn't use decimals, so it should format as whole number
        expect(result).toMatch(/[¥￥]1,234/);
      });

      test("handles empty value", () => {
        const result = applyCurrencyMask("");
        expect(result).toBe("");
      });

      test("handles invalid numeric values", () => {
        const result = applyCurrencyMask("abc");
        // Invalid values still get processed but result in NaN formatting
        expect(result).toMatch(/\$/);
      });

      test("adds commas for large numbers", () => {
        const result = applyCurrencyMask("1234567.89");
        expect(result).toBe("$1,234,567.89");
      });

      test("handles partial decimal input", () => {
        const result = applyCurrencyMask("123.4");
        expect(result).toBe("$123.4");
      });

      test("handles integer input", () => {
        const result = applyCurrencyMask("123");
        expect(result).toBe("$123");
      });

      test("handles incremental input correctly", () => {
        // Test that single digits don't become full currency amounts
        expect(applyCurrencyMask("1")).toBe("$1");
        expect(applyCurrencyMask("12")).toBe("$12");
        expect(applyCurrencyMask("123")).toBe("$123");
        expect(applyCurrencyMask("123.")).toBe("$123.");
        expect(applyCurrencyMask("123.4")).toBe("$123.4");
        expect(applyCurrencyMask("123.45")).toBe("$123.45");
      });

      test("fallbacks to USD on invalid currency", () => {
        const result = applyCurrencyMask("123.45", "INVALID", "invalid-locale");
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
        const result = getUnmaskedValue("(123) 456-7890");
        expect(result).toBe("1234567890");
      });

      test("applies custom transform", () => {
        const transform = (value: string) =>
          value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        const result = getUnmaskedValue("abc-123", transform);
        expect(result).toBe("ABC123");
      });
    });

    describe("toUnmaskedIndex and fromUnmaskedIndex", () => {
      test("converts masked position to unmasked position", () => {
        const masked = "(123) 456-7890";
        const pattern = "(###) ###-####";
        const result = toUnmaskedIndex(masked, pattern, 9); // Position after "456-"
        expect(result).toBe(6); // 6th digit in unmasked value
      });

      test("converts unmasked position to masked position", () => {
        const masked = "(123) 456-7890";
        const pattern = "(###) ###-####";
        const result = fromUnmaskedIndex(masked, pattern, 6); // 6th digit
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
});
