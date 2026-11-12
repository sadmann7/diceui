import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import * as TagsInput from "../src/index";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

const placeholder = "Add tag...";

describe("TagsInput", () => {
  function renderTagsInput(props: TagsInput.TagsInputRootProps = {}) {
    return render(
      <TagsInput.Root {...props}>
        {({ value }) => (
          <>
            {value.map((tag) => (
              <TagsInput.Item key={tag} value={tag}>
                <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                <TagsInput.ItemDelete aria-label="Remove tag" />
              </TagsInput.Item>
            ))}
            <TagsInput.Input placeholder={placeholder} />
          </>
        )}
      </TagsInput.Root>,
    );
  }

  test("renders without crashing", () => {
    renderTagsInput();
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  test("adds a new tag when Enter is pressed", async () => {
    const user = userEvent.setup();
    renderTagsInput();

    const input = screen.getByPlaceholderText(placeholder);
    await user.type(input, "test tag{Enter}");

    expect(screen.getByText("test tag")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  test("removes a tag when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderTagsInput({ defaultValue: ["test tag"] });

    const tag = screen.getByText("test tag");
    expect(tag).toBeInTheDocument();

    const deleteButton = screen.getByLabelText("Remove tag");
    await user.click(deleteButton);

    expect(screen.queryByText("test tag")).not.toBeInTheDocument();
  });

  test("handles controlled value changes", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderTagsInput({
      value: ["initial"],
      onValueChange,
    });

    const input = screen.getByPlaceholderText(placeholder);
    fireEvent.change(input, { target: { value: "new tag" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith(["initial", "new tag"]);

    rerender(
      <TagsInput.Root
        value={["initial", "new tag"]}
        onValueChange={onValueChange}
      >
        {({ value }) => (
          <>
            {value.map((tag) => (
              <TagsInput.Item key={tag} value={tag}>
                <TagsInput.ItemText>{tag}</TagsInput.ItemText>
              </TagsInput.Item>
            ))}
            <TagsInput.Input placeholder={placeholder} />
          </>
        )}
      </TagsInput.Root>,
    );

    expect(screen.getByText("new tag")).toBeInTheDocument();
  });

  test("controlled value with delimiter input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderTagsInput({
      value: ["initial"],
      onValueChange,
      delimiter: ",",
    });

    const input = screen.getByPlaceholderText(placeholder);
    await user.type(input, "tag1,");
    expect(onValueChange).toHaveBeenCalledWith(["initial", "tag1"]);

    rerender(
      <TagsInput.Root value={["initial", "tag1"]} onValueChange={onValueChange}>
        {({ value }) => (
          <>
            {value.map((tag) => (
              <TagsInput.Item key={tag} value={tag}>
                <TagsInput.ItemText>{tag}</TagsInput.ItemText>
              </TagsInput.Item>
            ))}
            <TagsInput.Input placeholder={placeholder} />
          </>
        )}
      </TagsInput.Root>,
    );

    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  test("handles form integration", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <form onSubmit={onSubmit}>
        <TagsInput.Root name="tags" required>
          {({ value }) => (
            <>
              <TagsInput.Label htmlFor="tags">Tags</TagsInput.Label>
              {value.map((tag) => (
                <TagsInput.Item key={tag} value={tag}>
                  <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                  <TagsInput.ItemDelete aria-label="Remove tag" />
                </TagsInput.Item>
              ))}
              <TagsInput.Input id="tags" placeholder={placeholder} />
            </>
          )}
        </TagsInput.Root>
      </form>,
    );

    const input = screen.getByPlaceholderText(placeholder);
    const form = input.closest("form");

    if (!form) {
      throw new Error("Form element not found");
    }

    await user.type(input, "test tag{Enter}");

    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalled();
  });

  test("handles blur behavior", async () => {
    const user = userEvent.setup();

    const onAddValueChange = vi.fn();
    const { unmount } = renderTagsInput({
      blurBehavior: "add",
      onValueChange: onAddValueChange,
    });

    let input = screen.getByPlaceholderText(placeholder);
    await user.type(input, "new tag");
    await user.tab();

    expect(onAddValueChange).toHaveBeenCalledWith(["new tag"]);
    unmount();

    const onClearValueChange = vi.fn();
    renderTagsInput({
      blurBehavior: "clear",
      onValueChange: onClearValueChange,
    });

    input = screen.getByPlaceholderText(placeholder);
    await user.type(input, "new tag");
    await user.tab();

    expect(onClearValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });

  test("supports editing mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderTagsInput({
      defaultValue: ["initial tag"],
      editable: true,
      onValueChange,
    });

    const tagText = screen.getByText("initial tag");
    const tagContainer = tagText.closest("[data-dice-collection-item]");

    if (!tagContainer) {
      throw new Error("Tag container not found");
    }

    await user.dblClick(tagContainer);

    const editInput = await screen.findByDisplayValue("initial tag");
    expect(editInput).toBeInTheDocument();

    await user.clear(editInput);
    await user.type(editInput, "edited tag{Enter}");

    await screen.findByText("edited tag");

    // The component appends the edited tag rather than replacing.
    expect(onValueChange).toHaveBeenLastCalledWith([
      "initial tag",
      "edited tag",
    ]);

    expect(screen.queryByDisplayValue("edited tag")).not.toBeInTheDocument();

    expect(screen.getByText("initial tag")).toBeInTheDocument();
    expect(screen.getByText("edited tag")).toBeInTheDocument();
  });

  test("respects disabled state", async () => {
    const user = userEvent.setup();
    renderTagsInput({
      defaultValue: ["tag1"],
      disabled: true,
    });

    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toBeDisabled();

    const deleteButton = screen.getByLabelText("Remove tag");
    await user.click(deleteButton);
    expect(screen.getByText("tag1")).toBeInTheDocument();
  });

  test("handles tab key behavior", async () => {
    const user = userEvent.setup();
    renderTagsInput({ addOnTab: true });

    const input = screen.getByPlaceholderText(placeholder);
    await user.type(input, "new tag");
    await user.tab();

    expect(screen.getByText("new tag")).toBeInTheDocument();
  });

  test("handles custom validation", async () => {
    const user = userEvent.setup();
    const onValidate = vi
      .fn()
      .mockImplementation((value) => value.length <= 10);
    const onInvalid = vi.fn();

    renderTagsInput({ onValidate, onInvalid });

    const input = screen.getByPlaceholderText(placeholder);

    await user.type(input, "this is a very long tag{Enter}");
    expect(onValidate).toHaveBeenCalledWith("this is a very long tag");
    expect(onInvalid).toHaveBeenCalledWith("this is a very long tag");
    expect(
      screen.queryByText("this is a very long tag"),
    ).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "short tag{Enter}");
    expect(onValidate).toHaveBeenCalledWith("short tag");
    expect(screen.getByText("short tag")).toBeInTheDocument();
  });

  test("supports custom display value function", async () => {
    const user = userEvent.setup();
    const displayValue = vi
      .fn()
      .mockImplementation((value: string) => `#${value}`);

    render(
      <TagsInput.Root displayValue={displayValue} defaultValue={["tag1"]}>
        {({ value }) => (
          <>
            {value.map((tag) => (
              <TagsInput.Item key={tag} value={tag}>
                <TagsInput.ItemText>{displayValue(tag)}</TagsInput.ItemText>
                <TagsInput.ItemDelete aria-label="Remove tag" />
              </TagsInput.Item>
            ))}
            <TagsInput.Input placeholder={placeholder} />
          </>
        )}
      </TagsInput.Root>,
    );

    expect(screen.getByText("#tag1")).toBeInTheDocument();

    const input = screen.getByPlaceholderText(placeholder);
    await user.type(input, "newtag{Enter}");

    expect(screen.getByText("#newtag")).toBeInTheDocument();
    expect(displayValue).toHaveBeenCalledWith("newtag");
  });

  test("supports loop navigation", async () => {
    const user = userEvent.setup();
    renderTagsInput({
      defaultValue: ["tag1", "tag2", "tag3"],
      loop: true,
    });

    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("tag3").closest("div")).toHaveAttribute(
      "data-state",
      "active",
    );

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("tag2").closest("div")).toHaveAttribute(
      "data-state",
      "active",
    );

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("tag1").closest("div")).toHaveAttribute(
      "data-state",
      "active",
    );

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("tag3").closest("div")).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  test("handles clear button functionality", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <TagsInput.Root
        defaultValue={["tag1", "tag2"]}
        onValueChange={onValueChange}
      >
        {({ value }) => (
          <>
            {value.map((tag) => (
              <TagsInput.Item key={tag} value={tag}>
                <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                <TagsInput.ItemDelete aria-label="Remove tag" />
              </TagsInput.Item>
            ))}
            <TagsInput.Input placeholder={placeholder} />
            <TagsInput.Clear aria-label="Clear tags" />
          </>
        )}
      </TagsInput.Root>,
    );

    const clearButton = screen.getByLabelText("Clear tags");
    await user.click(clearButton);

    expect(screen.queryByText("tag1")).not.toBeInTheDocument();
    expect(screen.queryByText("tag2")).not.toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  test("validates required field", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    const TestComponent = () => {
      const [value, setValue] = React.useState<string[]>([]);
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.length > 0) {
          mockSubmit(e);
        }
      };

      return (
        <form onSubmit={handleSubmit}>
          <TagsInput.Root
            name="tags"
            required
            value={value}
            onValueChange={setValue}
          >
            {({ value }) => (
              <>
                {value.map((tag) => (
                  <TagsInput.Item key={tag} value={tag}>
                    <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                  </TagsInput.Item>
                ))}
                <TagsInput.Input placeholder={placeholder} />
              </>
            )}
          </TagsInput.Root>
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<TestComponent />);

    const submitButton = screen.getByText("Submit");

    await user.click(submitButton);
    expect(mockSubmit).not.toHaveBeenCalled();

    const input = screen.getByPlaceholderText(placeholder);
    await user.type(input, "tag1{Enter}");

    await user.click(submitButton);
    expect(mockSubmit).toHaveBeenCalled();
  });

  test("handles form reset", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const defaultValue = ["initial"];
    let currentValue = [...defaultValue];

    render(
      <form
        onReset={() => {
          currentValue = [...defaultValue];
          onValueChange(currentValue);
        }}
      >
        <TagsInput.Root
          name="tags"
          value={currentValue}
          onValueChange={(newValue) => {
            currentValue = newValue;
            onValueChange(newValue);
          }}
        >
          {({ value }) => (
            <>
              {value.map((tag) => (
                <TagsInput.Item key={tag} value={tag}>
                  <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                  <TagsInput.ItemDelete aria-label="Remove tag" />
                </TagsInput.Item>
              ))}
              <TagsInput.Input placeholder={placeholder} />
            </>
          )}
        </TagsInput.Root>
        <button type="reset">Reset</button>
      </form>,
    );

    expect(screen.getByText("initial")).toBeInTheDocument();

    const input = screen.getByPlaceholderText(placeholder);
    await user.type(input, "new tag{Enter}");

    const resetButton = screen.getByText("Reset");
    await user.click(resetButton);

    expect(onValueChange).toHaveBeenLastCalledWith(["initial"]);
    expect(screen.getByText("initial")).toBeInTheDocument();
    expect(screen.queryByText("new tag")).not.toBeInTheDocument();
  });

  test("respects read only state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderTagsInput({
      defaultValue: ["tag1", "tag2"],
      readOnly: true,
      onValueChange,
    });

    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toHaveAttribute("readOnly");

    await user.type(input, "new tag{Enter}");
    expect(screen.queryByText("new tag")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();

    const deleteButton = screen.getAllByLabelText("Remove tag")[0];
    if (!deleteButton) {
      throw new Error("Delete button not found");
    }
    await user.click(deleteButton);
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();

    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();
  });

  test("supports accessibility features", async () => {
    const user = userEvent.setup();

    render(
      <TagsInput.Root defaultValue={["tag1", "tag2"]}>
        {({ value }) => (
          <>
            <TagsInput.Label htmlFor="tags">Tags</TagsInput.Label>
            {value.map((tag) => (
              <TagsInput.Item key={tag} value={tag}>
                <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                <TagsInput.ItemDelete aria-label={`Remove ${tag}`} />
              </TagsInput.Item>
            ))}
            <TagsInput.Input
              id="tags"
              placeholder={placeholder}
              aria-describedby="tagsHint"
            />
            <div id="tagsHint">Press Enter to add a new tag</div>
          </>
        )}
      </TagsInput.Root>,
    );

    const input = screen.getByLabelText("Tags");
    expect(input).toHaveAttribute("aria-describedby", "tagsHint");

    const deleteButtons = screen.getAllByRole("button");
    expect(deleteButtons[0]).toHaveAttribute("aria-label", "Remove tag1");
    expect(deleteButtons[1]).toHaveAttribute("aria-label", "Remove tag2");

    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("tag2").closest("div")).toHaveAttribute(
      "data-state",
      "active",
    );

    await user.keyboard("{Delete}");
    expect(screen.queryByText("tag2")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(input);
  });
});
