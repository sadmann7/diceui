import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseKeyValue from "@/registry/bases/base/ui/key-value";
import * as RadixKeyValue from "@/registry/bases/radix/ui/key-value";

const VALUE = [{ id: "1", key: "name", value: "dice" }];

describe.each([
  ["radix", RadixKeyValue],
  ["base", BaseKeyValue],
])(
  "KeyValue (%s) controlled",
  (
    _,
    {
      KeyValue,
      KeyValueAdd,
      KeyValueItem,
      KeyValueKeyInput,
      KeyValueList,
      KeyValueValueInput,
    },
  ) => {
    function renderKeyValue(value: typeof VALUE, onValueChange = vi.fn()) {
      function getKeyValue(nextValue: typeof VALUE) {
        return (
          <KeyValue value={nextValue} onValueChange={onValueChange}>
            <KeyValueList>
              <KeyValueItem>
                <KeyValueKeyInput aria-label="Key" />
                <KeyValueValueInput aria-label="Value" />
              </KeyValueItem>
            </KeyValueList>
            <KeyValueAdd />
          </KeyValue>
        );
      }
      const result = render(getKeyValue(value));
      return {
        onValueChange,
        rerender: (nextValue: typeof VALUE) =>
          result.rerender(getKeyValue(nextValue)),
      };
    }

    test("keeps the controlled value when the parent rejects a change", () => {
      const { onValueChange } = renderKeyValue(VALUE);

      fireEvent.change(screen.getByLabelText("Key"), {
        target: { value: "title" },
      });

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith([
        { id: "1", key: "title", value: "dice" },
      ]);
      expect(screen.getByLabelText("Key")).toHaveValue("name");

      fireEvent.click(screen.getByRole("button", { name: /add/i }));

      expect(onValueChange).toHaveBeenCalledTimes(2);
      expect(screen.getAllByLabelText("Key")).toHaveLength(1);
    });

    test("doesn't call onValueChange when the value prop changes", () => {
      const { onValueChange, rerender } = renderKeyValue(VALUE);

      rerender([{ id: "1", key: "title", value: "dice" }]);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByLabelText("Key")).toHaveValue("title");
    });
  },
);
