import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  Editable,
  EditableArea,
  EditableCancel,
  EditableInput,
  EditableLabel,
  EditablePreview,
  EditableSubmit,
  EditableToolbar,
  EditableTrigger,
} from "@/registry/bases/radix/ui/editable";

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

describe("Editable", () => {
  function renderEditable(
    props: Partial<React.ComponentProps<typeof Editable>> = {},
  ) {
    return render(
      <Editable {...props}>
        <EditableLabel>Title</EditableLabel>
        <EditableArea>
          <EditablePreview />
          <EditableInput />
          <EditableToolbar>
            <EditableCancel data-testid="cancel">Cancel</EditableCancel>
            <EditableSubmit data-testid="submit">Save</EditableSubmit>
          </EditableToolbar>
        </EditableArea>
      </Editable>,
    );
  }

  test("renders without crashing", () => {
    renderEditable();
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  test("handles controlled state", async () => {
    const onValueChange = vi.fn();
    const onEditingChange = vi.fn();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const onEdit = vi.fn();

    renderEditable({
      defaultValue: "Initial Value",
      onValueChange,
      onEditingChange,
      onSubmit,
      onCancel,
      onEdit,
    });

    const preview = screen.getByRole("button");
    expect(preview).toHaveTextContent("Initial Value");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    await waitFor(() => {
      fireEvent.click(preview);
    });

    expect(onEdit).toHaveBeenCalled();
    expect(onEditingChange).toHaveBeenCalledWith(true);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Initial Value");
    expect(preview).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "New Value" } });
    expect(onValueChange).toHaveBeenCalledWith("New Value");

    const submitButton = screen.getByTestId("submit");
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith("New Value");
    expect(onEditingChange).toHaveBeenCalledWith(false);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  test("handles cancellation", async () => {
    const onValueChange = vi.fn();
    const onCancel = vi.fn();

    renderEditable({
      defaultValue: "Initial Value",
      onValueChange,
      onCancel,
    });

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "Changed Value" } });
    expect(onValueChange).toHaveBeenCalledWith("Changed Value");

    const cancelButton = screen.getByTestId("cancel");
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();

    await waitFor(() => {
      const previewAfterCancel = screen.getByRole("button");
      expect(previewAfterCancel).toBeInTheDocument();
      expect(previewAfterCancel).toHaveTextContent("Initial Value");
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  test("handles keyboard navigation", async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    renderEditable({
      defaultValue: "Initial Value",
      onSubmit,
      onCancel,
    });

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    const input = screen.getByRole("textbox");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("Initial Value");

    await waitFor(() => {
      const previewAfterSubmit = screen.getByRole("button");
      fireEvent.click(previewAfterSubmit);
    });

    const inputAfterReenter = screen.getByRole("textbox");

    fireEvent.keyDown(inputAfterReenter, { key: "Escape" });
    expect(onCancel).toHaveBeenCalled();
  });

  test("handles disabled state", async () => {
    const onEdit = vi.fn();

    renderEditable({
      defaultValue: "Disabled Value",
      disabled: true,
      onEdit,
    });

    const preview = screen.getByRole("button");
    expect(preview).toHaveAttribute("data-disabled", "");

    fireEvent.click(preview);

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  test("handles read-only state", async () => {
    const onValueChange = vi.fn();

    renderEditable({
      defaultValue: "Read Only Value",
      readOnly: true,
      onValueChange,
    });

    expect(
      screen.queryByRole("button", { name: /Read Only Value/i }),
    ).not.toBeInTheDocument();

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("readonly");

    fireEvent.change(input, { target: { value: "New Value" } });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles placeholder", async () => {
    renderEditable({
      placeholder: "Enter a title",
    });

    const preview = screen.getByRole("button");
    expect(preview).toHaveTextContent("Enter a title");
    expect(preview).toHaveAttribute("data-empty", "");
  });

  test("handles maxLength", async () => {
    renderEditable({
      maxLength: 10,
    });

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    // JSDOM doesn't apply maxLength, so only the render is checked.
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  test("handles autosize", async () => {
    renderEditable({
      defaultValue: "Autosize Text",
      autosize: true,
    });

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, {
      target: { value: "Longer text to trigger autosize" },
    });

    expect(input).toHaveClass("w-auto");
  });

  test("handles different trigger modes", async () => {
    const onEdit = vi.fn();

    renderEditable({
      triggerMode: "dblclick",
      onEdit,
    });

    const preview = screen.getByRole("button");

    fireEvent.click(preview);
    expect(onEdit).not.toHaveBeenCalled();

    fireEvent.doubleClick(preview);
    expect(onEdit).toHaveBeenCalled();

    cleanup();
    onEdit.mockReset();

    renderEditable({
      triggerMode: "focus",
      onEdit,
    });

    const focusPreview = screen.getByRole("button");

    fireEvent.focus(focusPreview);
    expect(onEdit).toHaveBeenCalled();
  });

  test("handles external trigger", async () => {
    const onEdit = vi.fn();

    render(
      <Editable onEdit={onEdit}>
        <EditableLabel>Title</EditableLabel>
        <EditableArea>
          <EditablePreview />
          <EditableInput />
        </EditableArea>
        <EditableTrigger data-testid="external-trigger">Edit</EditableTrigger>
      </Editable>,
    );

    const externalTrigger = screen.getByTestId("external-trigger");
    fireEvent.click(externalTrigger);

    expect(onEdit).toHaveBeenCalled();
  });

  test("supports RTL direction", async () => {
    renderEditable({
      dir: "rtl",
    });

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    const area = screen.getByRole("group");
    const input = screen.getByRole("textbox");

    expect(area).toHaveAttribute("dir", "rtl");
    expect(input).toHaveAttribute("dir", "rtl");
  });

  test("handles form integration", async () => {
    const onSubmit = vi.fn();

    render(
      <form
        data-testid="test-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        <Editable name="title" defaultValue="Form Value">
          <EditableLabel>Form Title</EditableLabel>
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
        </Editable>
        <button type="submit" data-testid="form-submit">
          Submit Form
        </button>
      </form>,
    );

    const formSubmitButton = screen.getByTestId("form-submit");
    fireEvent.click(formSubmitButton);

    expect(onSubmit).toHaveBeenCalled();

    // The hidden input value isn't readable here, so only the submission is checked.
  });

  test("handles invalid state", async () => {
    renderEditable({
      invalid: true,
    });

    const label = screen.getByText("Title");
    expect(label).toHaveAttribute("data-invalid", "");

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  test("handles required state", async () => {
    renderEditable({
      required: true,
    });

    const label = screen.getByText("Title");
    expect(label).toHaveAttribute("data-required", "");

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("required");
  });

  test("handles blur submission", async () => {
    const onSubmit = vi.fn();

    renderEditable({
      defaultValue: "Initial Value",
      onSubmit,
    });

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "New Value" } });

    fireEvent.blur(input);

    expect(onSubmit).toHaveBeenCalledWith("New Value");
  });

  test("handles escape key down callback", async () => {
    const onEscapeKeyDown = vi.fn();
    const onCancel = vi.fn();

    renderEditable({
      onEscapeKeyDown,
      onCancel,
    });

    const preview = screen.getByRole("button");
    fireEvent.click(preview);

    const input = screen.getByRole("textbox");

    fireEvent.keyDown(input, { key: "Escape" });

    expect(onEscapeKeyDown).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});
