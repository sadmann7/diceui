import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseFileUpload from "@/registry/bases/base/ui/file-upload";
import * as RadixFileUpload from "@/registry/bases/radix/ui/file-upload";

const file = new File(["hello"], "hello.txt", { type: "text/plain" });

describe.each([
  ["radix", RadixFileUpload],
  ["base", BaseFileUpload],
])(
  "FileUpload (%s) controlled",
  (_, { FileUpload, FileUploadItem, FileUploadItemDelete, FileUploadList }) => {
    function renderFileUpload(value: File[], onValueChange = vi.fn()) {
      function getFileUpload(nextValue: File[]) {
        return (
          <FileUpload value={nextValue} onValueChange={onValueChange}>
            <FileUploadList>
              {nextValue.map((item) => (
                <FileUploadItem key={item.name} value={item}>
                  <FileUploadItemDelete>Delete</FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
        );
      }

      const result = render(getFileUpload(value));
      return {
        onValueChange,
        rerender: (nextValue: File[]) =>
          result.rerender(getFileUpload(nextValue)),
      };
    }

    function addFile() {
      const input = document.querySelector("input[type='file']");
      if (!input) throw new Error("File input not rendered");
      fireEvent.change(input, { target: { files: [file] } });
    }

    test("keeps the controlled files when the parent rejects an added file", () => {
      const { onValueChange } = renderFileUpload([]);

      addFile();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith([file]);
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    test("keeps the controlled files when the parent rejects a removal", () => {
      const { onValueChange } = renderFileUpload([file]);

      fireEvent.click(screen.getByRole("button", { name: "Delete" }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith([]);
      expect(screen.getByRole("listitem")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" }),
      ).toBeInTheDocument();
    });

    test("doesn't call onValueChange when the value prop changes", () => {
      const { onValueChange, rerender } = renderFileUpload([]);

      rerender([file]);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("listitem")).toBeInTheDocument();
    });

    test("adds and removes files when uncontrolled", () => {
      const onValueChange = vi.fn();
      const other = new File(["bye"], "bye.txt", { type: "text/plain" });
      render(
        <FileUpload defaultValue={[other]} onValueChange={onValueChange}>
          <FileUploadList>
            {[other, file].map((item) => (
              <FileUploadItem key={item.name} value={item}>
                <FileUploadItemDelete>{`Delete ${item.name}`}</FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>,
      );

      expect(screen.getAllByRole("button")).toHaveLength(1);

      addFile();

      expect(onValueChange).toHaveBeenLastCalledWith([other, file]);
      expect(screen.getAllByRole("button")).toHaveLength(2);

      fireEvent.click(screen.getByRole("button", { name: "Delete bye.txt" }));

      expect(onValueChange).toHaveBeenLastCalledWith([file]);
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  },
);
