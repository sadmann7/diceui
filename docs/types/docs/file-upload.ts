import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The array of files currently being managed.
   * Use this prop to control the component.
   */
  value?: File[];

  /**
   * The default array of files.
   * Use this prop for uncontrolled usage.
   */
  defaultValue?: File[];

  /**
   * Callback called when files are added, removed, or changed.
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Callback called when files are accepted (after validation).
   */
  onAccept?: (files: File[]) => void;

  /**
   * Callback called when a single file is accepted.
   */
  onFileAccept?: (file: File) => void;

  /**
   * Callback called when a single file is rejected.
   */
  onFileReject?: (file: File, message: string) => void;

  /**
   * Custom validation callback for individual files.
   * Return a string with the error message or undefined if the file is valid.
   */
  onFileValidate?: (file: File) => string | undefined;

  /**
   * Callback for handling file uploads.
   * This is called for each file individually.
   */
  onUpload?: (
    file: File,
    options: {
      onProgress: (progress: number) => void;
      onSuccess: () => void;
      onError: (error: Error) => void;
    },
  ) => Promise<void> | void;

  /**
   * The accepted file types.
   * Example: "image/png,image/jpeg" or ".png,.jpg"
   */
  accept?: string;

  /**
   * The maximum number of files allowed.
   */
  maxFiles?: number;

  /**
   * The maximum file size in bytes.
   */
  maxSize?: number;

  /**
   * The text direction of the component.
   */
  dir?: "ltr" | "rtl";

  /**
   * The name attribute for the file input element.
   */
  name?: string;

  /**
   * Whether to render the component with a custom child.
   */
  asChild?: boolean;

  /**
   * Whether the file upload is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the file upload is in an invalid state.
   * @default false
   */
  invalid?: boolean;

  /**
   * Whether multiple files can be selected.
   * @default false
   */
  multiple?: boolean;

  /**
   * Whether the file input is required.
   * @default false
   */
  required?: boolean;
}

export interface DropzoneProps extends EmptyProps<"div">, CompositionProps {}

export interface TriggerProps extends EmptyProps<"button">, CompositionProps {}

export interface ListProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The orientation of the file list.
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Whether to force mount the list even if there are no files.
   * @default false
   */
  forceMount?: boolean;
}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The file to display in this item.
   */
  value: File;
}

export interface ItemPreviewProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The render function for the preview.
   * This can be used to override the default preview.
   */
  render: (file: File) => React.ReactNode;
}

export interface ItemMetadataProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface ItemProgressProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether to display the progress in a circular format.
   * @default false
   */
  circular?: boolean;

  /**
   * The size of the circular progress indicator.
   * @default 40
   */
  size?: number;
}

export interface ItemDeleteProps
  extends EmptyProps<"button">,
    CompositionProps {}
