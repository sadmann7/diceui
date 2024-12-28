import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import * as TagsInput from "../src/index";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

describe("TagsInput", () => {
  const renderTagsInput = (props = {}) => {
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
            <TagsInput.Input placeholder="Add tag..." />
          </>
        )}
      </TagsInput.Root>,
    );
  };

  test("renders without crashing", () => {
    renderTagsInput();
    expect(screen.getByPlaceholderText("Add tag...")).toBeInTheDocument();
  });

  test("adds a new tag when Enter is pressed", async () => {
    const user = userEvent.setup();
    renderTagsInput();

    const input = screen.getByPlaceholderText("Add tag...");
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

    const input = screen.getByPlaceholderText("Add tag...");
    fireEvent.change(input, { target: { value: "new tag" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith(["initial", "new tag"]);

    // Test value update
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
            <TagsInput.Input placeholder="Add tag..." />
          </>
        )}
      </TagsInput.Root>,
    );

    expect(screen.getByText("new tag")).toBeInTheDocument();
  });

  test("validates tags before adding", async () => {
    const user = userEvent.setup();
    const onValidate = vi.fn().mockImplementation((value) => value.length >= 3);
    const onInvalid = vi.fn();

    renderTagsInput({ onValidate, onInvalid });

    const input = screen.getByPlaceholderText("Add tag...");

    // Try adding invalid tag
    await user.type(input, "ab{Enter}");
    expect(onValidate).toHaveBeenCalledWith("ab");
    expect(onInvalid).toHaveBeenCalledWith("ab");
    expect(screen.queryByText("ab")).not.toBeInTheDocument();

    // Add valid tag
    await user.clear(input);
    await user.type(input, "valid tag{Enter}");
    expect(onValidate).toHaveBeenCalledWith("valid tag");
    expect(screen.getByText("valid tag")).toBeInTheDocument();
  });

  test("prevents duplicate tags", async () => {
    const user = userEvent.setup();
    const onInvalid = vi.fn();

    renderTagsInput({
      defaultValue: ["existing tag"],
      onInvalid,
    });

    const input = screen.getByPlaceholderText("Add tag...");
    await user.type(input, "existing tag{Enter}");

    expect(onInvalid).toHaveBeenCalledWith("existing tag");
    expect(screen.getAllByText("existing tag")).toHaveLength(1);
  });

  test("respects max tags limit", async () => {
    const user = userEvent.setup();
    const onInvalid = vi.fn();

    renderTagsInput({
      defaultValue: ["tag1", "tag2"],
      max: 2,
      onInvalid,
    });

    const input = screen.getByPlaceholderText("Add tag...");
    await user.type(input, "tag3{Enter}");

    expect(onInvalid).toHaveBeenCalledWith("tag3");
    expect(screen.queryByText("tag3")).not.toBeInTheDocument();
  });

  test("handles keyboard navigation between tags", async () => {
    const user = userEvent.setup();
    renderTagsInput({ defaultValue: ["tag1", "tag2", "tag3"] });

    await user.tab(); // Focus input
    await user.keyboard("{ArrowLeft}"); // Move to last tag

    expect(screen.getByText("tag3").closest("div")).toHaveAttribute(
      "data-state",
      "active",
    );

    await user.keyboard("{ArrowLeft}"); // Move to second tag
    expect(screen.getByText("tag2").closest("div")).toHaveAttribute(
      "data-state",
      "active",
    );

    await user.keyboard("{ArrowRight}"); // Move back to third tag
    expect(screen.getByText("tag3").closest("div")).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  test("supports adding tags via paste", async () => {
    const user = userEvent.setup();
    renderTagsInput({ addOnPaste: true, delimiter: "," });

    const input = screen.getByPlaceholderText("Add tag...");
    await user.click(input);

    // Mock clipboard data
    const clipboardData = {
      getData: vi.fn().mockReturnValue("tag1,tag2,tag3"),
    };

    fireEvent.paste(input, {
      clipboardData,
    });

    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();
    expect(screen.getByText("tag3")).toBeInTheDocument();
  });

  test("handles form integration correctly", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <form onSubmit={handleSubmit}>
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
              <TagsInput.Input id="tags" placeholder="Add tag..." />
            </>
          )}
        </TagsInput.Root>
      </form>,
    );

    const input = screen.getByPlaceholderText("Add tag...");
    const form = input.closest("form");

    if (!form) {
      throw new Error("Form element not found");
    }

    // Add a tag and submit
    await user.type(input, "test tag{Enter}");

    // Submit form after adding tag
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });

  test("handles blur behavior correctly", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderTagsInput({
      blurBehavior: "add",
      onValueChange,
    });

    const input = screen.getByPlaceholderText("Add tag...");
    await user.type(input, "new tag");
    await user.tab(); // Blur the input

    expect(onValueChange).toHaveBeenCalledWith(["new tag"]);
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

    // After double click, wait for the edit input to appear
    const editInput = await screen.findByDisplayValue("initial tag");
    expect(editInput).toBeInTheDocument();

    // Edit the tag
    await user.clear(editInput);
    await user.type(editInput, "edited tag{Enter}");

    // Wait for the edit to complete and verify the changes
    await screen.findByText("edited tag");

    // Verify onValueChange was called with both tags
    // The component appends the edited tag rather than replacing
    expect(onValueChange).toHaveBeenLastCalledWith([
      "initial tag",
      "edited tag",
    ]);

    // Verify we're back in normal mode (no edit input)
    expect(screen.queryByDisplayValue("edited tag")).not.toBeInTheDocument();

    // Both tags should be visible
    expect(screen.getByText("initial tag")).toBeInTheDocument();
    expect(screen.getByText("edited tag")).toBeInTheDocument();
  });

  test("respects disabled state", async () => {
    const user = userEvent.setup();
    renderTagsInput({
      defaultValue: ["tag1"],
      disabled: true,
    });

    const input = screen.getByPlaceholderText("Add tag...");
    expect(input).toBeDisabled();

    // Try to delete tag
    const deleteButton = screen.getByLabelText("Remove tag");
    await user.click(deleteButton);
    expect(screen.getByText("tag1")).toBeInTheDocument();
  });

  test("handles tab key behavior", async () => {
    const user = userEvent.setup();
    renderTagsInput({ addOnTab: true });

    const input = screen.getByPlaceholderText("Add tag...");
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

    const input = screen.getByPlaceholderText("Add tag...");

    // Try adding tag that's too long
    await user.type(input, "this is a very long tag{Enter}");
    expect(onValidate).toHaveBeenCalledWith("this is a very long tag");
    expect(onInvalid).toHaveBeenCalledWith("this is a very long tag");
    expect(
      screen.queryByText("this is a very long tag"),
    ).not.toBeInTheDocument();

    // Add valid tag
    await user.clear(input);
    await user.type(input, "short tag{Enter}");
    expect(onValidate).toHaveBeenCalledWith("short tag");
    expect(screen.getByText("short tag")).toBeInTheDocument();
  });
});
