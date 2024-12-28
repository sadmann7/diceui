import * as React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { TagsInputInput } from "./tags-input-input";
import { TagsInputItem } from "./tags-input-item";
import { TagsInputItemDelete } from "./tags-input-item-delete";
import { TagsInputItemText } from "./tags-input-item-text";
import { TagsInputRoot } from "./tags-input-root";

describe("TagsInput", () => {
  const renderTagsInput = (props = {}) => {
    return render(
      <TagsInputRoot {...props}>
        {({ value }) => (
          <>
            {value.map((tag) => (
              <TagsInputItem key={tag} value={tag}>
                <TagsInputItemText>{tag}</TagsInputItemText>
                <TagsInputItemDelete aria-label="Remove tag" />
              </TagsInputItem>
            ))}
            <TagsInputInput placeholder="Add tag..." />
          </>
        )}
      </TagsInputRoot>,
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
      <TagsInputRoot
        value={["initial", "new tag"]}
        onValueChange={onValueChange}
      >
        {({ value }) => (
          <>
            {value.map((tag) => (
              <TagsInputItem key={tag} value={tag}>
                <TagsInputItemText>{tag}</TagsInputItemText>
              </TagsInputItem>
            ))}
            <TagsInputInput placeholder="Add tag..." />
          </>
        )}
      </TagsInputRoot>,
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
});
