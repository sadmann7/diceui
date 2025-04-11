import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The array of files currently being managed.
   * Use this prop to control the component.
   *
   * ```ts
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
   * ```ts
   * // Uncontrolled usage
   * <FileUpload defaultValue={[]} />
   * ```
   */
  defaultValue?: File[];

  /**
   * Callback called when files are added, removed, or changed.
   *
   * ```ts
   * const onValueChange = (files: File[]) => {
   *   console.log({ files })
   *   // Handle the updated files
   * }
   * ```
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Callback called when files are accepted (after validation).
   * This is called after all validation checks pass.
   *
   * ```ts
   * const onAccept = (files: File[]) => {
   *   // All files have passed validation
   *   startUpload(files)
   * }
   * ```
   */
  onAccept?: (files: File[]) => void;

  /** Callback called when a file is accepted. */
  onFileAccept?: (file: File) => void;

  /**
   * Callback called when a file is rejected.
   *
   * ```ts
   * const onFileReject = (file: File, message: string) => {
   *   toast(message, {
   *     description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
   *   });
   * }
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
   * const onFileValidate = (file: File) => {
   *   if (file.size > 5 * 1024 * 1024) {
   *     return "File size must be less than 5MB"
   *   }
   *
   *   if (!file.type.startsWith("image/")) {
   *     return "Only image files are allowed"
   *   }
   *
   *   return null
   * }
   * ```
   */
  onFileValidate?: (file: File) => string | null | undefined;

  /**
   * Callback for uploading files.
   * This can be used to upload files directly to a storage bucket.
   *
   * ```ts
   * const onUpload = async (
   *   files: File[],
   *   { onProgress, onSuccess, onError }
   * ) => {
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
   * }
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
   * <List orientation="horizontal">
   *   {files.map((file) => (
   *     <Item key={file.name} value={file} />
   *   ))}
   * </List>
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
   * <List forceMount>
   *   {files.length === 0 ? (
   *     <p>No files uploaded</p>
   *   ) : (
   *     files.map((file) => (
   *       <Item key={file.name} value={file} />
   *     ))
   *   )}
   * </List>
   * ```
   */
  forceMount?: boolean;
}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The file to display in the item.
   *
   * ```tsx
   * <Item value={file}>
   *   <ItemPreview />
   *   <ItemMetadata />
   *   <ItemDelete />
   * </Item>
   * ```
   */
  value: File;
}

export interface ItemPreviewProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The render function for the preview.
   * Override the default preview.
   *
   * ```tsx
   * <ItemPreview
   *   render={(file) => {
   *     if (file.type.startsWith("image/")) {
   *       return <img src={URL.createObjectURL(file)} alt={file.name} />
   *     }
   *     return <FileIcon type={file.type} />
   *   }}
   * />
   * ```
   */
  render: (file: File) => React.ReactNode;
}

export interface ItemMetadataProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface ItemProgressProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether to display the progress in a circular format.
   *
   * ```tsx
   * // Linear progress
   * <ItemProgress />
   *
   * // Circular progress
   * <ItemProgress circular size={40} />
   * ```
   *
   * @default false
   */
  circular?: boolean;

  /**
   * The size of the circular progress indicator.
   * Only applies when circular is true.
   *
   * ```tsx
   * <ItemProgress circular size={60} />
   * ```
   *
   * @default 40
   */
  size?: number;
}

export interface ItemDeleteProps
  extends EmptyProps<"button">,
    CompositionProps {}
