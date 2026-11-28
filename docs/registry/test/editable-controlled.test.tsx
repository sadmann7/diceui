import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseEditable from "@/registry/bases/base/ui/editable";
import * as RadixEditable from "@/registry/bases/radix/ui/editable";

describe.each([
  ["radix", RadixEditable],
  ["base", BaseEditable],
])(
  "Editable (%s) controlled",
  (_, { Editable, EditableArea, EditableInput, EditablePreview }) => {
    interface ControlledProps {
      value?: string;
      editing?: boolean;
      defaultEditing?: boolean;
    }

    function renderEditable(props: ControlledProps) {
      const onValueChange = vi.fn();
      const onEditingChange = vi.fn();
      function getEditable(nextProps: ControlledProps) {
        return (
          <Editable
            {...nextProps}
            onValueChange={onValueChange}
            onEditingChange={onEditingChange}
          >
            <EditableArea>
              <EditablePreview />
              <EditableInput />
            </EditableArea>
          </Editable>
        );
      }
      const result = render(getEditable(props));
      return {
        onValueChange,
        onEditingChange,
        rerender: (nextProps: ControlledProps) =>
          result.rerender(getEditable(nextProps)),
      };
    }

    test("keeps the controlled value when the parent rejects a change", () => {
      const { onValueChange } = renderEditable({
        value: "dice",
        defaultEditing: true,
      });

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "dice ui" },
      });

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("dice ui");
      expect(screen.getByRole("textbox")).toHaveValue("dice");
    });

    test("stays out of editing when the parent rejects it", () => {
      const { onEditingChange } = renderEditable({
        value: "dice",
        editing: false,
      });

      fireEvent.click(screen.getByText("dice"));

      expect(onEditingChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    test("doesn't call the change callbacks when the props change", () => {
      const { onValueChange, onEditingChange, rerender } = renderEditable({
        value: "dice",
        editing: false,
      });

      rerender({ value: "dice ui", editing: true });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(onEditingChange).not.toHaveBeenCalled();
      expect(screen.getByRole("textbox")).toHaveValue("dice ui");
    });
  },
);
