import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The array of files currently being managed.
   * Use this prop to control the component.
   *
   * ```tsx
   * // Controlled usage
   * const [files, setFiles] = useState<File[]>([])
   *
   * <FileUpload
   *   value={files}
   *   onValueChange={setFiles}
   * />
   * ```
   */
  value?: File[];

  /**
   * The default array of files.
   * Use this prop for uncontrolled usage.
   *
   * ```tsx
   * // Uncontrolled usage
   * <FileUpload defaultValue={[]} />
   * ```
   */
  defaultValue?: File[];

  /**
   * Callback called when files are added, removed, or changed.
   *
   * ```ts
   * onValueChange={(files) => {
   *   // Retrieve the updated files
   *   console.log({ files })
   * }}
   * ```
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Callback called when files are accepted (after validation).
   * This is called after all validation checks pass.
   *
   * ```ts
   * onAccept={(files) => {
   *   // All files have passed validation
   *   startUpload(files)
   * }}
   * ```
   */
  onAccept?: (files: File[]) => void;

  /**
   * Callback called when a file is accepted.
   * ```ts
   * onFileAccept={(file) => {
   *   // All files have passed validation
   *   startUpload(files)
   * }}
   * ```
   */
  onFileAccept?: (file: File) => void;

  /**
   * Callback called when a file is rejected.
   *
   * ```ts
   * onFileReject={(file, message) => {
   *   toast(message, {
   *     description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
   *   });
   * }}
   * ```
   */
  onFileReject?: (file: File, message: string) => void;

  /**
   * Custom validation callback for individual files.
   *
   * Return a string with the error message or null or undefined if the file is valid.
   * This will override the default validation message from `onFileReject`.
   *
   * ```ts
   * onFileValidate={(file) => {
   *   if (file.size > 5 * 1024 * 1024) {
   *     return "File size must be less than 5MB"
   *   }
   *
   *   if (!file.type.startsWith("image/")) {
   *     return "Only image files are allowed"
   *   }
   *
   *   return null
   * }}
   * ```
   */
  onFileValidate?: (file: File) => string | null | undefined;

  /**
   * Callback for uploading files.
   * This can be used to upload files directly to a storage bucket.
   *
   * ```ts
   * onUpload={async (files, { onProgress, onSuccess, onError }) => {
   *   try {
   *     for (const file of files) {
   *       // Example upload to S3 or similar
   *       const formData = new FormData()
   *       formData.append("file", file)
   *
   *       const xhr = new XMLHttpRequest()
   *       xhr.upload.onprogress = (e) => {
   *         const progress = (e.loaded / e.total) * 100
   *         onProgress(file, progress)
   *       }
   *
   *       await fetch("/api/upload", {
   *         method: "POST",
   *         body: formData
   *       })
   *
   *       onSuccess(file)
   *     }
   *   } catch (error) {
   *     onError(file, error)
   *   }
   * }}
   * ```
   */
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => Promise<void> | void;

  /**
   * The accepted file types.
   * Can be MIME types or file extensions.
   *
   * ```ts
   * // Accept specific MIME types
   * accept="image/png,image/jpeg"
   *
   * // Accept file extensions
   * accept=".png,.jpg,.pdf"
   *
   * // Accept multiple types
   * accept="image/*,.pdf,.doc"
   * ```
   */
  accept?: string;

  /**
   * The maximum number of files allowed.
   *
   * ```ts
   * // Limit to 5 files
   * <FileUpload maxFiles={5} />
   * ```
   */
  maxFiles?: number;

  /**
   * The maximum file size in bytes.
   *
   * ```ts
   * // Limit to 5MB
   * <FileUpload maxSize={5 * 1024 * 1024} />
   * ```
   */
  maxSize?: number;

  /**
   * The text direction of the component.
   *
   * ```ts
   * // For RTL languages
   * <FileUpload dir="rtl" />
   * ```
   */
  dir?: "ltr" | "rtl";

  /**
   * The label for the file upload component.
   * Useful for labelling the hidden file input.
   *
   * ```ts
   * <FileUpload label="Upload files" />
   * ```
   *
   * @default "File upload"
   */
  label?: string;

  /**
   * The name attribute for the file input element.
   * Useful when using the component in a form.
   *
   * ```ts
   * <form>
   *   <FileUpload name="attachments" />
   * </form>
   * ```
   */
  name?: string;

  /**
   * Whether to render the component with a custom child.
   * Useful for custom trigger elements.
   *
   * ```ts
   * <FileUpload asChild>
   *   <button>Upload Files</button>
   * </FileUpload>
   * ```
   */
  asChild?: boolean;

  /**
   * Whether the file upload is disabled.
   *
   * ```ts
   * // Disable the upload when processing
   * <FileUpload disabled={isUploading} />
   * ```
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the file upload is in an invalid state.
   *
   * ```ts
   * // Show error state
   * <FileUpload invalid={hasError} />
   * ```
   *
   * @default false
   */
  invalid?: boolean;

  /**
   * Whether multiple files can be selected.
   *
   * ```ts
   * // Allow multiple file selection
   * <FileUpload multiple />
   * ```
   *
   * @default false
   */
  multiple?: boolean;

  /**
   * Whether the file input is required.
   *
   * ```ts
   * // Mark as required in a form
   * <FileUpload required />
   * ```
   *
   * @default false
   */
  required?: boolean;
}

export interface DropzoneProps extends EmptyProps<"div">, CompositionProps {}

export interface TriggerProps extends EmptyProps<"button">, CompositionProps {}

export interface ListProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The orientation of the file list.
   *
   * ```tsx
   * // Horizontal list
   * <FileUploadList orientation="horizontal">
   *   {files.map((file) => (
   *     <FileUploadItem key={file.name} value={file} />
   *   ))}
   * </FileUploadList>
   * ```
   *
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Whether to force mount the list even if there are no files.
   * Useful for animating the list with animation libraries.
   *
   * ```tsx
   * <FileUploadList forceMount>
   *   {files.length === 0 ? (
   *     <p>No files uploaded</p>
   *   ) : (
   *     files.map((file) => (
   *       <FileUploadItem key={file.name} value={file} />
   *     ))
   *   )}
   * </FileUploadList>
   * ```
   */
  forceMount?: boolean;
}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The file to display in the item.
   *
   * ```tsx
   * <FileUploadItem value={file}>
   *   <FileUploadItemPreview />
   *   <FileUploadItemMetadata />
   *   <FileUploadItemDelete />
   * </FileUploadItem>
   * ```
   */
  value: File;
}

export interface ItemPreviewProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The render function for the preview.
   * Override the default preview with access to fallback behavior.
   *
   * The second parameter is a fallback function that renders the default preview
   * (image preview for image files, appropriate icons for other file types).
   *
   * ```tsx
   * <FileUploadItemPreview
   *   render={(file, fallback) => {
   *     // Custom preview for specific file types
   *     if (file.type.startsWith("image/") && shouldUseCustomPreview) {
   *       return <CustomImagePreview file={file} />
   *     }
   *
   *     // Use default behavior for everything else
   *     return fallback()
   *   }}
   * />
   * ```
   *
   * ```tsx
   * // Example: Show cropped image or fallback to default
   * <FileUploadItemPreview
   *   render={(file, fallback) => {
   *     if (croppedVersion && file.type.startsWith("image/")) {
   *       return <img src={croppedVersion} alt={file.name} />
   *     }
   *     return fallback()
   *   }}
   * />
   * ```
   */
  render?: (file: File, fallback: () => React.ReactNode) => React.ReactNode;
}

export interface ItemMetadataProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The visual density of the displayed file metadata (name and size).
   *
   * - `default`: Standard text size and line height.
   * - `sm`: Smaller text size and line height for a more compact look.
   *
   * @default "default"
   */
  size?: "default" | "sm";
}

export interface ItemProgressProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The visual style of the progress indicator.
   *
   * - `linear`: A standard horizontal progress bar.
   * - `circular`: A circular progress indicator using stroke animation.
   * - `fill`: A progress indicator that fills the container vertically based on progress.
   *
   * ```tsx
   * // Linear progress
   * <FileUploadItemProgress variant="linear" />
   *
   * // Circular stroke progress
   * <FileUploadItemProgress variant="circular" size={40} />
   *
   * // Fill progress
   * <FileUploadItemProgress variant="fill" />
   * ```
   *
   * @default "linear"
   */
  variant?: "linear" | "circular" | "fill";

  /**
   * The size of the circular progress indicator (in pixels).
   * Only applies when variant is `circular`.
   *
   * ```tsx
   * <FileUploadItemProgress variant="circular" size={60} />
   * ```
   *
   * @default 40
   */
  size?: number;

  /**
   * Whether to force mount the progress indicator even if the file is not uploading.
   * Useful for animating the progress indicator with animation libraries.
   *
   * ```tsx
   * <FileUploadItemProgress forceMount />
   * ```
   *
   * @default false
   */
  forceMount?: boolean;
}

export interface ItemDeleteProps
  extends EmptyProps<"button">,
    CompositionProps {}

export interface ClearProps extends EmptyProps<"button">, CompositionProps {
  /**
   * Whether to force mount the clear button even if there are no files.
   * Useful for animating the clear button with animation libraries.
   *
   * ```tsx
   * <FileUploadClear forceMount />
   * ```
   *
   * @default false
   */
  forceMount?: boolean;
}
