"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import {
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileCogIcon,
  FileIcon,
  FileTextIcon,
  FileVideoIcon,
} from "lucide-react";
import * as React from "react";

const ROOT_NAME = "FileUpload";
const DROPZONE_NAME = "FileUploadDropzone";
const TRIGGER_NAME = "FileUploadTrigger";
const LIST_NAME = "FileUploadList";
const ITEM_NAME = "FileUploadItem";
const ITEM_PREVIEW_NAME = "FileUploadItemPreview";
const ITEM_PROGRESS_NAME = "FileUploadItemProgress";
const ITEM_DELETE_NAME = "FileUploadItemDelete";

const FILE_UPLOAD_ERRORS = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` must be used as root component`,
  [DROPZONE_NAME]: `\`${DROPZONE_NAME}\` must be within \`${ROOT_NAME}\``,
  [TRIGGER_NAME]: `\`${TRIGGER_NAME}\` must be within \`${ROOT_NAME}\``,
  [LIST_NAME]: `\`${LIST_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_PREVIEW_NAME]: `\`${ITEM_PREVIEW_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_PROGRESS_NAME]: `\`${ITEM_PROGRESS_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_DELETE_NAME]: `\`${ITEM_DELETE_NAME}\` must be within \`${ITEM_NAME}\``,
} as const;

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = fn();
  }
  return ref as React.RefObject<T>;
}

function useAsRef<T>(data: T) {
  const ref = React.useRef<T>(data);
  React.useLayoutEffect(() => {
    ref.current = data;
  });
  return ref;
}

interface FileState {
  file: File;
  progress: number;
  error?: string;
  status: "idle" | "uploading" | "error" | "success";
}

interface StoreState {
  files: Map<File, FileState>;
  dragOver: boolean;
  invalid: boolean;
}

type StoreAction =
  | { variant: "ADD_FILES"; files: File[] }
  | { variant: "SET_FILES"; files: File[] }
  | { variant: "SET_PROGRESS"; file: File; progress: number }
  | { variant: "SET_SUCCESS"; file: File }
  | { variant: "SET_ERROR"; file: File; error: string }
  | { variant: "REMOVE_FILE"; file: File }
  | { variant: "SET_DRAG_OVER"; dragOver: boolean }
  | { variant: "SET_INVALID"; invalid: boolean }
  | { variant: "CLEAR" };

function createStore(
  listeners: Set<() => void>,
  files: Map<File, FileState>,
  onFilesChange?: (files: File[]) => void,
  invalid?: boolean,
) {
  const initialState: StoreState = {
    files,
    dragOver: false,
    invalid: invalid ?? false,
  };

  let state = initialState;

  function reducer(state: StoreState, action: StoreAction): StoreState {
    switch (action.variant) {
      case "ADD_FILES": {
        for (const file of action.files) {
          files.set(file, {
            file,
            progress: 0,
            status: "idle",
          });
        }

        if (onFilesChange) {
          const fileList = Array.from(files.values()).map(
            (fileState) => fileState.file,
          );
          onFilesChange(fileList);
        }
        return { ...state, files };
      }

      case "SET_FILES": {
        for (const file of action.files) {
          const existingState = files.get(file);
          if (!existingState) {
            files.set(file, {
              file,
              progress: 0,
              status: "idle",
            });
          }
        }
        return { ...state, files };
      }

      case "SET_PROGRESS": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            progress: action.progress,
            status: "uploading",
          });
        }
        return { ...state, files };
      }

      case "SET_SUCCESS": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            progress: 100,
            status: "success",
          });
        }
        return { ...state, files };
      }

      case "SET_ERROR": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            error: action.error,
            status: "error",
          });
        }
        return { ...state, files };
      }

      case "REMOVE_FILE": {
        files.delete(action.file);

        if (onFilesChange) {
          const fileList = Array.from(files.values()).map(
            (fileState) => fileState.file,
          );
          onFilesChange(fileList);
        }
        return { ...state, files };
      }

      case "SET_DRAG_OVER": {
        return { ...state, dragOver: action.dragOver };
      }

      case "SET_INVALID": {
        return { ...state, invalid: action.invalid };
      }

      case "CLEAR": {
        files.clear();
        if (onFilesChange) {
          onFilesChange([]);
        }
        return { ...state, files, invalid: false };
      }

      default:
        return state;
    }
  }

  function getState() {
    return state;
  }

  function dispatch(action: StoreAction) {
    state = reducer(state, action);
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, dispatch, subscribe };
}

const StoreContext = React.createContext<ReturnType<typeof createStore> | null>(
  null,
);
StoreContext.displayName = ROOT_NAME;

function useStoreContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(FILE_UPLOAD_ERRORS[name]);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext(ROOT_NAME);

  const lastValueRef = useLazyRef<{ value: T; state: StoreState } | null>(
    () => null,
  );

  const getSnapshot = React.useCallback(() => {
    const state = store.getState();
    const prevValue = lastValueRef.current;

    if (prevValue && prevValue.state === state) {
      return prevValue.value;
    }

    const nextValue = selector(state);
    lastValueRef.current = { value: nextValue, state };
    return nextValue;
  }, [store, selector, lastValueRef]);

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface FileUploadContextValue {
  vibrant: boolean;
  inputId: string;
  dropzoneId: string;
  listId: string;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(
  null,
);

function useFileUploadContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error(FILE_UPLOAD_ERRORS[name]);
  }
  return context;
}

interface FileUploadRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    "defaultValue" | "onChange"
  > {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onAccept?: (files: File[]) => void;
  onReject?: (files: File[]) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  onUpload?: (
    file: File,
    options: {
      onProgress: (progress: number) => void;
      onSuccess: () => void;
      onError: (error: Error) => void;
    },
  ) => Promise<void> | void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  name?: string;
  asChild?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  multiple?: boolean;
  vibrant?: boolean;
  required?: boolean;
}

const FileUploadRoot = React.forwardRef<HTMLDivElement, FileUploadRootProps>(
  (props, forwardedRef) => {
    const {
      value,
      defaultValue,
      onValueChange,
      onAccept,
      onReject,
      onFileAccept,
      onFileReject,
      onUpload,
      accept,
      maxFiles,
      maxSize,
      name,
      asChild,
      disabled = false,
      invalid = false,
      multiple = false,
      vibrant = false,
      required = false,
      children,
      className,
      ...rootProps
    } = props;

    const id = React.useId();
    const inputId = React.useId();
    const dropzoneId = React.useId();
    const listId = React.useId();

    const propsRef = useAsRef(props);
    const listeners = useLazyRef(() => new Set<() => void>()).current;
    const files = useLazyRef<Map<File, FileState>>(() => new Map()).current;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const isControlled = value !== undefined;

    const store = React.useMemo(
      () => createStore(listeners, files, onValueChange, invalid),
      [listeners, files, onValueChange, invalid],
    );

    const contextValue = React.useMemo<FileUploadContextValue>(
      () => ({ vibrant, inputId, dropzoneId, listId, disabled, inputRef }),
      [vibrant, inputId, dropzoneId, listId, disabled],
    );

    React.useEffect(() => {
      if (isControlled) {
        store.dispatch({ variant: "SET_FILES", files: value });
      } else if (
        defaultValue &&
        defaultValue.length > 0 &&
        !store.getState().files.size
      ) {
        store.dispatch({ variant: "SET_FILES", files: defaultValue });
      }
    }, [value, defaultValue, isControlled, store]);

    const onFilesChange = React.useCallback(
      (originalFiles: File[]) => {
        if (propsRef.current.disabled) return;

        let filesToProcess = [...originalFiles];
        let hasRejectedFiles = false;

        if (propsRef.current.maxFiles) {
          const currentCount = store.getState().files.size;
          const remainingSlotCount = Math.max(
            0,
            propsRef.current.maxFiles - currentCount,
          );

          if (remainingSlotCount < filesToProcess.length) {
            const rejectedFiles = filesToProcess.slice(remainingSlotCount);
            hasRejectedFiles = true;

            if (propsRef.current.onReject) {
              propsRef.current.onReject(rejectedFiles);
            }

            filesToProcess = filesToProcess.slice(0, remainingSlotCount);

            for (const file of rejectedFiles) {
              propsRef.current.onFileReject?.(
                file,
                `Only ${propsRef.current.maxFiles} files allowed`,
              );
            }
          }
        }

        const acceptedFiles: File[] = [];
        const rejectedFiles: { file: File; reason: string }[] = [];

        for (const file of filesToProcess) {
          let rejected = false;
          let rejectReason = "";

          if (propsRef.current.accept) {
            const acceptTypes = propsRef.current.accept
              .split(",")
              .map((t) => t.trim());
            const fileType = file.type;
            const fileExt = `.${file.name.split(".").pop()}`;

            if (
              !acceptTypes.some(
                (type) =>
                  type === fileType ||
                  type === fileExt ||
                  (type.includes("/*") &&
                    fileType.startsWith(type.replace("/*", "/"))),
              )
            ) {
              rejectReason = "File type not accepted";
              propsRef.current.onFileReject?.(file, rejectReason);
              rejected = true;
              hasRejectedFiles = true;
            }
          }

          if (
            propsRef.current.maxSize &&
            file.size > propsRef.current.maxSize
          ) {
            rejectReason = "File too large";
            propsRef.current.onFileReject?.(file, rejectReason);
            rejected = true;
            hasRejectedFiles = true;
          }

          if (!rejected) {
            acceptedFiles.push(file);
          } else {
            rejectedFiles.push({ file, reason: rejectReason });
          }
        }

        if (hasRejectedFiles) {
          store.dispatch({ variant: "SET_INVALID", invalid: true });
          setTimeout(() => {
            store.dispatch({ variant: "SET_INVALID", invalid: false });
          }, 2000);
        }

        if (acceptedFiles.length > 0) {
          store.dispatch({ variant: "ADD_FILES", files: acceptedFiles });

          if (isControlled && propsRef.current.onValueChange) {
            const currentFiles = Array.from(
              store.getState().files.values(),
            ).map((f) => f.file);
            propsRef.current.onValueChange([...currentFiles]);
          }

          if (propsRef.current.onAccept) {
            propsRef.current.onAccept(acceptedFiles);
          }

          for (const file of acceptedFiles) {
            propsRef.current.onFileAccept?.(file);
          }

          if (propsRef.current.onUpload) {
            requestAnimationFrame(() => {
              for (const file of acceptedFiles) {
                onUploadFile(file);
              }
            });
          }
        }
      },
      [store, isControlled, propsRef],
    );

    const onUploadFile = React.useCallback(
      async (file: File) => {
        try {
          store.dispatch({ variant: "SET_PROGRESS", file, progress: 0 });

          if (propsRef.current.onUpload) {
            await propsRef.current.onUpload(file, {
              onProgress: (progress) => {
                store.dispatch({
                  variant: "SET_PROGRESS",
                  file,
                  progress: Math.min(Math.max(0, progress), 100),
                });
              },
              onSuccess: () => {
                store.dispatch({ variant: "SET_SUCCESS", file });
              },
              onError: (error) => {
                store.dispatch({
                  variant: "SET_ERROR",
                  file,
                  error: error.message || "Upload failed",
                });
              },
            });
          } else {
            store.dispatch({ variant: "SET_SUCCESS", file });
          }
        } catch (error) {
          store.dispatch({
            variant: "SET_ERROR",
            file,
            error: error instanceof Error ? error.message : "Upload failed",
          });
        }
      },
      [store, propsRef.current.onUpload],
    );

    const onInputChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        onFilesChange(files);
        event.target.value = "";
      },
      [onFilesChange],
    );

    const RootPrimitive = asChild ? Slot : "div";

    return (
      <StoreContext.Provider value={store}>
        <FileUploadContext.Provider value={contextValue}>
          <RootPrimitive
            data-disabled={disabled ? "" : undefined}
            data-slot="file-upload"
            {...rootProps}
            id={id}
            ref={forwardedRef}
            className={cn("relative flex flex-col gap-2", className)}
          >
            {children}
            <input
              type="file"
              id={inputId}
              ref={inputRef}
              tabIndex={-1}
              accept={accept}
              disabled={disabled}
              multiple={multiple}
              name={name}
              required={required}
              className="sr-only"
              onChange={onInputChange}
            />
          </RootPrimitive>
        </FileUploadContext.Provider>
      </StoreContext.Provider>
    );
  },
);
FileUploadRoot.displayName = ROOT_NAME;

interface FileUploadDropzoneProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const FileUploadDropzone = React.forwardRef<
  HTMLDivElement,
  FileUploadDropzoneProps
>((props, forwardedRef) => {
  const { asChild, className, ...dropzoneProps } = props;

  const context = useFileUploadContext(DROPZONE_NAME);
  const store = useStoreContext(DROPZONE_NAME);
  const dragOver = useStore((state) => state.dragOver);
  const invalid = useStore((state) => state.invalid);
  const propsRef = useAsRef(dropzoneProps);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      propsRef.current?.onClick?.(event);

      if (!event.defaultPrevented) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const isFromTrigger = target.closest(
          '[data-slot="file-upload-trigger"]',
        );

        if (!isFromTrigger) {
          context.inputRef.current?.click();
        }
      }
    },
    [context.inputRef, propsRef],
  );

  const onDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current?.onDragOver?.(event);

      if (!event.defaultPrevented) {
        event.preventDefault();
        store.dispatch({ variant: "SET_DRAG_OVER", dragOver: true });
      }
    },
    [store, propsRef.current.onDragOver],
  );

  const onDragEnter = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current?.onDragEnter?.(event);

      if (!event.defaultPrevented) {
        event.preventDefault();
        store.dispatch({ variant: "SET_DRAG_OVER", dragOver: true });
      }
    },
    [store, propsRef.current.onDragEnter],
  );

  const onDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current?.onDragLeave?.(event);

      if (!event.defaultPrevented) {
        event.preventDefault();
        store.dispatch({ variant: "SET_DRAG_OVER", dragOver: false });
      }
    },
    [store, propsRef.current.onDragLeave],
  );

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current?.onDrop?.(event);

      if (!event.defaultPrevented) {
        event.preventDefault();
        store.dispatch({ variant: "SET_DRAG_OVER", dragOver: false });

        const files = Array.from(event.dataTransfer.files);
        const inputElement = context.inputRef.current;
        if (!inputElement) return;

        const dataTransfer = new DataTransfer();
        for (const file of files) {
          dataTransfer.items.add(file);
        }

        inputElement.files = dataTransfer.files;
        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    [store, context.inputRef, propsRef.current.onDrop],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      propsRef.current?.onKeyDown?.(event);

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, propsRef.current.onKeyDown],
  );

  const DropzonePrimitive = asChild ? Slot : "div";

  return (
    <DropzonePrimitive
      role="button"
      id={context.dropzoneId}
      aria-controls={context.inputId}
      aria-disabled={context.disabled}
      aria-invalid={invalid}
      aria-owns={context.listId}
      data-disabled={context.disabled ? "" : undefined}
      data-dragging={dragOver ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-slot="file-upload-dropzone"
      {...dropzoneProps}
      ref={forwardedRef}
      tabIndex={context.disabled ? undefined : 0}
      className={cn(
        "relative flex select-none flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 outline-none transition-all transition-all transition-colors hover:bg-muted/50 focus-visible:border-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[disabled]:pointer-events-none data-[dragging]:border-primary data-[invalid]:border-destructive data-[invalid]:border-destructive data-[dragging]:bg-muted/50 data-[invalid]:bg-destructive/5 data-[disabled]:opacity-50",
        className,
      )}
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
    />
  );
});
FileUploadDropzone.displayName = DROPZONE_NAME;

interface FileUploadTriggerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const FileUploadTrigger = React.forwardRef<
  HTMLButtonElement,
  FileUploadTriggerProps
>((props, forwardedRef) => {
  const { asChild, ...triggerProps } = props;
  const context = useFileUploadContext(TRIGGER_NAME);
  const propsRef = useAsRef(triggerProps);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current?.onClick?.(event);

      if (!event.defaultPrevented) {
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, propsRef.current],
  );

  const TriggerPrimitive = asChild ? Slot : "button";

  return (
    <TriggerPrimitive
      type="button"
      aria-controls={context.inputId}
      data-disabled={context.disabled ? "" : undefined}
      data-slot="file-upload-trigger"
      {...triggerProps}
      ref={forwardedRef}
      disabled={context.disabled}
      onClick={onClick}
    />
  );
});
FileUploadTrigger.displayName = TRIGGER_NAME;

interface FileUploadListProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical";
  asChild?: boolean;
  forceMount?: boolean;
}

const FileUploadList = React.forwardRef<HTMLDivElement, FileUploadListProps>(
  (props, forwardedRef) => {
    const {
      className,
      orientation = "vertical",
      asChild,
      forceMount,
      ...listProps
    } = props;

    const context = useFileUploadContext(LIST_NAME);

    const shouldRender =
      forceMount || useStore((state) => state.files.size > 0);

    if (!shouldRender) return null;

    const ListPrimitive = asChild ? Slot : "div";

    return (
      <ListPrimitive
        role="list"
        id={context.listId}
        aria-labelledby={context.dropzoneId}
        aria-orientation={orientation}
        data-orientation={orientation}
        data-slot="file-upload-list"
        {...listProps}
        ref={forwardedRef}
        className={cn(
          "flex flex-col gap-2",
          orientation === "horizontal" && "flex-row",
          className,
        )}
      />
    );
  },
);
FileUploadList.displayName = LIST_NAME;

interface FileUploadItemContextValue {
  id: string;
  fileState: FileState | undefined;
}

const FileUploadItemContext =
  React.createContext<FileUploadItemContextValue | null>(null);

function useFileUploadItemContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
  const context = React.useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(FILE_UPLOAD_ERRORS[name]);
  }
  return context;
}

interface FileUploadItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: File;
  asChild?: boolean;
}

const FileUploadItem = React.forwardRef<HTMLDivElement, FileUploadItemProps>(
  (props, forwardedRef) => {
    const { value, asChild, className, ...itemProps } = props;

    const id = React.useId();
    const statusId = React.useId();

    const context = useFileUploadContext(ITEM_NAME);
    const fileState = useStore((state) => state.files.get(value));
    const fileCount = useStore((state) => state.files.size);
    const fileIndex = useStore((state) => {
      const files = Array.from(state.files.keys());
      return files.indexOf(value) + 1;
    });

    const contextValue = React.useMemo(
      () => ({
        id,
        fileState,
      }),
      [id, fileState],
    );

    if (!fileState) return null;

    const statusText = fileState.error
      ? `Error: ${fileState.error}`
      : fileState.status === "uploading"
        ? `Uploading: ${fileState.progress}% complete`
        : fileState.status === "success"
          ? "Upload complete"
          : "Ready to upload";

    const ItemPrimitive = asChild ? Slot : "div";

    return (
      <FileUploadItemContext.Provider value={contextValue}>
        <ItemPrimitive
          id={id}
          role="listitem"
          aria-setsize={fileCount}
          aria-posinset={fileIndex}
          aria-describedby={statusId}
          data-slot="file-upload-item"
          data-status={fileState.status}
          {...itemProps}
          ref={forwardedRef}
          className={cn(
            "flex items-center gap-2 rounded-md border p-3 has-[_[data-slot=file-upload-preview]]:flex-col has-[_[data-slot=file-upload-progress]]:items-start",
            context.vibrant
              ? {
                  "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50":
                    fileState.status === "uploading",
                  "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50":
                    fileState.status === "success",
                  "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50":
                    fileState.status === "error",
                  "border-orange-500 bg-orange-100 dark:border-orange-500 dark:bg-orange-950/50":
                    fileState.status === "uploading",
                  "border-green-500 bg-green-100 dark:border-green-500 dark:bg-green-950/50":
                    fileState.status === "success",
                  "border-red-500 bg-red-100 dark:border-red-500 dark:bg-red-950/50":
                    fileState.status === "error",
                }
              : "",
            className,
          )}
        >
          <span id={statusId} className="sr-only">
            {statusText}
          </span>
          {props.children}
        </ItemPrimitive>
      </FileUploadItemContext.Provider>
    );
  },
);
FileUploadItem.displayName = ITEM_NAME;

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileIcon(file: File) {
  const type = file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (type.startsWith("video/")) {
    return <FileVideoIcon />;
  }

  if (type.startsWith("audio/")) {
    return <FileAudioIcon />;
  }

  if (
    type.startsWith("text/") ||
    ["txt", "md", "rtf", "pdf"].includes(extension)
  ) {
    return <FileTextIcon />;
  }

  if (
    [
      "html",
      "css",
      "js",
      "jsx",
      "ts",
      "tsx",
      "json",
      "xml",
      "php",
      "py",
      "rb",
      "java",
      "c",
      "cpp",
      "cs",
    ].includes(extension)
  ) {
    return <FileCodeIcon />;
  }

  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
    return <FileArchiveIcon />;
  }

  if (
    ["exe", "msi", "app", "apk", "deb", "rpm"].includes(extension) ||
    type.startsWith("application/")
  ) {
    return <FileCogIcon />;
  }

  return <FileIcon />;
}

interface FileUploadItemPreviewProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const FileUploadItemPreview = React.forwardRef<
  HTMLDivElement,
  FileUploadItemPreviewProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...previewProps } = props;
  useStoreContext(ITEM_PREVIEW_NAME);
  const itemContext = useFileUploadItemContext(ITEM_PREVIEW_NAME);

  const onPreviewRender = React.useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      return (
        <div className="relative flex size-10 shrink-0 items-center justify-center">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="size-full rounded object-cover"
            onLoad={(event) => {
              if (!(event.target instanceof HTMLImageElement)) return;
              URL.revokeObjectURL(event.target.src);
            }}
          />
        </div>
      );
    }

    return (
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-md bg-accent [&>svg]:size-8">
        {getFileIcon(file)}
      </div>
    );
  }, []);

  if (!itemContext.fileState) return null;

  const ItemPreviewPrimitive = asChild ? Slot : "div";

  return (
    <ItemPreviewPrimitive
      data-slot="file-upload-preview"
      {...previewProps}
      ref={forwardedRef}
      className={cn("flex min-w-0 flex-1 items-center gap-2", className)}
    >
      {children ?? (
        <>
          {onPreviewRender(itemContext.fileState.file)}
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-sm">
              {itemContext.fileState.file.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatBytes(itemContext.fileState.file.size)}
            </span>
            {itemContext.fileState.error && (
              <span className="text-destructive text-xs">
                {itemContext.fileState.error}
              </span>
            )}
          </div>
        </>
      )}
    </ItemPreviewPrimitive>
  );
});
FileUploadItemPreview.displayName = ITEM_PREVIEW_NAME;

interface FileUploadItemProgressProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const FileUploadItemProgress = React.forwardRef<
  HTMLDivElement,
  FileUploadItemProgressProps
>((props, forwardedRef) => {
  const { asChild, className, ...progressProps } = props;

  const context = useFileUploadContext(ITEM_PROGRESS_NAME);
  const itemContext = useFileUploadItemContext(ITEM_PROGRESS_NAME);

  if (!itemContext.fileState) return null;

  const ItemProgressPrimitive = asChild ? Slot : "div";

  return (
    <ItemProgressPrimitive
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={itemContext.fileState.progress}
      aria-valuetext={`${itemContext.fileState.progress}%`}
      data-slot="file-upload-progress"
      {...progressProps}
      ref={forwardedRef}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          context.vibrant
            ? {
                "bg-orange-500/50 dark:bg-orange-600/50":
                  itemContext.fileState.status === "uploading",
                "bg-green-500/50 dark:bg-green-600/50":
                  itemContext.fileState.status === "success",
                "bg-red-500/50 dark:bg-red-600/50":
                  itemContext.fileState.status === "error",
                "bg-orange-500 dark:bg-orange-600":
                  itemContext.fileState.status === "uploading",
                "bg-green-500 dark:bg-green-600":
                  itemContext.fileState.status === "success",
                "bg-red-500 dark:bg-red-600":
                  itemContext.fileState.status === "error",
              }
            : "bg-primary",
        )}
        style={{
          transform: `translateX(-${100 - itemContext.fileState.progress}%)`,
        }}
      />
    </ItemProgressPrimitive>
  );
});
FileUploadItemProgress.displayName = ITEM_PROGRESS_NAME;

interface FileUploadItemDeleteProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const FileUploadItemDelete = React.forwardRef<
  HTMLButtonElement,
  FileUploadItemDeleteProps
>((props, forwardedRef) => {
  const { asChild, ...deleteProps } = props;

  const store = useStoreContext(ITEM_DELETE_NAME);
  const itemContext = useFileUploadItemContext(ITEM_DELETE_NAME);
  const propsRef = useAsRef(deleteProps);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current?.onClick?.(event);

      if (!itemContext.fileState) return;

      if (!event.defaultPrevented) {
        store.dispatch({
          variant: "REMOVE_FILE",
          file: itemContext.fileState.file,
        });
      }
    },
    [store, itemContext.fileState, propsRef.current?.onClick],
  );

  if (!itemContext.fileState) return null;

  const ItemDeletePrimitive = asChild ? Slot : "button";

  return (
    <ItemDeletePrimitive
      type="button"
      aria-controls={itemContext.id}
      data-slot="file-upload-item-delete"
      {...deleteProps}
      ref={forwardedRef}
      disabled={itemContext.fileState.status === "uploading"}
      onClick={onClick}
    />
  );
});
FileUploadItemDelete.displayName = ITEM_DELETE_NAME;

const FileUpload = FileUploadRoot;
const Root = FileUploadRoot;
const Trigger = FileUploadTrigger;
const Dropzone = FileUploadDropzone;
const List = FileUploadList;
const Item = FileUploadItem;
const ItemPreview = FileUploadItemPreview;
const ItemProgress = FileUploadItemProgress;
const ItemDelete = FileUploadItemDelete;

export {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemPreview,
  FileUploadItemProgress,
  //
  Root,
  Dropzone,
  Trigger,
  List,
  Item,
  ItemDelete,
  ItemPreview,
  ItemProgress,
};
