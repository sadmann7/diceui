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
const TRIGGER_NAME = "FileUploadTrigger";
const DROPZONE_NAME = "FileUploadDropzone";
const LIST_NAME = "FileUploadList";
const ITEM_NAME = "FileUploadItem";
const ITEM_DELETE_NAME = "FileUploadItemDelete";
const ITEM_PROGRESS_NAME = "FileUploadItemProgress";
const ITEM_PREVIEW_NAME = "FileUploadItemPreview";

const FILE_UPLOAD_ERRORS = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` is the root component`,
  [TRIGGER_NAME]: `\`${TRIGGER_NAME}\` must be within \`${ROOT_NAME}\``,
  [DROPZONE_NAME]: `\`${DROPZONE_NAME}\` must be within \`${ROOT_NAME}\``,
  [LIST_NAME]: `\`${LIST_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_DELETE_NAME]: `\`${ITEM_DELETE_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_PROGRESS_NAME]: `\`${ITEM_PROGRESS_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_PREVIEW_NAME]: `\`${ITEM_PREVIEW_NAME}\` must be within \`${ITEM_NAME}\``,
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
  id: string;
  file: File;
  progress: number;
  error?: string;
  status: "idle" | "uploading" | "error" | "success";
}

interface StoreState {
  files: Map<string, FileState>;
  dragOver: boolean;
  vibrant: boolean;
}

type StoreAction =
  | { variant: "ADD_FILES"; files: File[] }
  | { variant: "SET_FILES"; files: File[] }
  | { variant: "SET_PROGRESS"; id: string; progress: number }
  | { variant: "SET_SUCCESS"; id: string }
  | { variant: "SET_ERROR"; id: string; error: string }
  | { variant: "REMOVE_FILE"; id: string }
  | { variant: "SET_DRAG_OVER"; dragOver: boolean }
  | { variant: "CLEAR" };

function createStore(
  listeners: Set<() => void>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  onFilesChange?: (files: File[]) => void,
  vibrant = false,
) {
  const initialState: StoreState = {
    files: new Map(),
    dragOver: false,
    vibrant,
  };

  let state = initialState;

  function reducer(state: StoreState, action: StoreAction): StoreState {
    switch (action.variant) {
      case "ADD_FILES": {
        const newFiles = new Map(state.files);
        for (const file of action.files) {
          const id = `${file.name}-${file.size}`;
          newFiles.set(id, {
            id,
            file,
            progress: 0,
            status: "idle",
          });
        }
        if (onFilesChange) {
          const fileList = Array.from(newFiles.values()).map(
            (fileState) => fileState.file,
          );
          onFilesChange(fileList);
        }
        return { ...state, files: newFiles };
      }
      case "SET_FILES": {
        const newFiles = new Map();
        for (const file of action.files) {
          const existingEntry = Array.from(state.files.entries()).find(
            ([_, fileState]) =>
              fileState.file.name === file.name &&
              fileState.file.size === file.size &&
              fileState.file.type === file.type,
          );

          if (existingEntry) {
            newFiles.set(existingEntry[0], existingEntry[1]);
          } else {
            const id = crypto.randomUUID();
            newFiles.set(id, {
              id,
              file,
              progress: 0,
              status: "idle",
            });
          }
        }
        return { ...state, files: newFiles };
      }
      case "SET_PROGRESS": {
        const newFiles = new Map(state.files);
        const file = newFiles.get(action.id);
        if (file) {
          newFiles.set(action.id, {
            ...file,
            progress: action.progress,
            status: "uploading",
          });
        }
        return { ...state, files: newFiles };
      }
      case "SET_SUCCESS": {
        const newFiles = new Map(state.files);
        const file = newFiles.get(action.id);
        if (file) {
          newFiles.set(action.id, {
            ...file,
            progress: 100,
            status: "success",
          });
        }
        return { ...state, files: newFiles };
      }
      case "SET_ERROR": {
        const newFiles = new Map(state.files);
        const file = newFiles.get(action.id);
        if (file) {
          newFiles.set(action.id, {
            ...file,
            error: action.error,
            status: "error",
          });
        }
        return { ...state, files: newFiles };
      }
      case "REMOVE_FILE": {
        const newFiles = new Map(state.files);
        newFiles.delete(action.id);
        if (onFilesChange) {
          const fileList = Array.from(newFiles.values()).map(
            (fileState) => fileState.file,
          );
          onFilesChange(fileList);
        }
        return { ...state, files: newFiles };
      }
      case "SET_DRAG_OVER": {
        return { ...state, dragOver: action.dragOver };
      }
      case "CLEAR": {
        if (onFilesChange) {
          onFilesChange([]);
        }
        return { ...state, files: new Map() };
      }
      default:
        return state;
    }
  }

  const getState = () => state;
  const getInputRef = () => inputRef;

  const dispatch = (action: StoreAction) => {
    state = reducer(state, action);
    for (const listener of listeners) {
      listener();
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, getInputRef, dispatch, subscribe };
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

interface FileUploadRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    "defaultValue" | "onChange"
  > {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onFilesAccepted?: (files: File[]) => void;
  onFileRejected?: (file: File, reason: string) => void;
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
  asChild?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  vibrant?: boolean;
}

const FileUploadRoot = React.forwardRef<HTMLDivElement, FileUploadRootProps>(
  (props, forwardedRef) => {
    const {
      value,
      defaultValue,
      onValueChange,
      onFilesAccepted,
      onFileRejected,
      onUpload,
      accept,
      maxFiles,
      maxSize,
      asChild,
      disabled,
      multiple = false,
      vibrant = false,
      className,
      children,
      ...rootProps
    } = props;

    const listeners = useLazyRef(() => new Set<() => void>()).current;
    const inputRef = React.useRef<HTMLInputElement>(null);

    const store = React.useMemo(
      () => createStore(listeners, inputRef, onValueChange, vibrant),
      [listeners, onValueChange, vibrant],
    );
    const id = React.useId();
    const propsRef = useAsRef(props);
    const isControlled = value !== undefined;

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

        if (propsRef.current.maxFiles) {
          const currentFiles = store.getState().files.size;
          if (
            currentFiles + filesToProcess.length >
            propsRef.current.maxFiles
          ) {
            const allowed = Math.max(
              0,
              propsRef.current.maxFiles - currentFiles,
            );
            filesToProcess = filesToProcess.slice(0, allowed);
          }
        }

        const acceptedFiles: File[] = [];

        for (const file of filesToProcess) {
          let rejected = false;

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
              propsRef.current.onFileRejected?.(file, "File type not accepted");
              rejected = true;
            }
          }

          if (
            propsRef.current.maxSize &&
            file.size > propsRef.current.maxSize
          ) {
            propsRef.current.onFileRejected?.(file, "File too large");
            rejected = true;
          }

          if (!rejected) {
            acceptedFiles.push(file);
          }
        }

        if (acceptedFiles.length > 0) {
          store.dispatch({ variant: "ADD_FILES", files: acceptedFiles });

          if (isControlled && propsRef.current.onValueChange) {
            const currentFiles = Array.from(
              store.getState().files.values(),
            ).map((f) => f.file);
            propsRef.current.onValueChange([...currentFiles]);
          }

          propsRef.current.onFilesAccepted?.(acceptedFiles);

          if (propsRef.current.onUpload) {
            requestAnimationFrame(() => {
              for (const file of acceptedFiles) {
                const id = `${file.name}-${file.size}`;

                if (id) {
                  onUploadFile(file, id);
                }
              }
            });
          }
        }
      },
      [store, isControlled, propsRef],
    );

    const onUploadFile = React.useCallback(
      async (file: File, id: string) => {
        try {
          store.dispatch({ variant: "SET_PROGRESS", id, progress: 0 });

          if (propsRef.current.onUpload) {
            await propsRef.current.onUpload(file, {
              onProgress: (progress) => {
                store.dispatch({
                  variant: "SET_PROGRESS",
                  id,
                  progress: Math.min(Math.max(0, progress), 100),
                });
              },
              onSuccess: () => {
                store.dispatch({ variant: "SET_SUCCESS", id });
              },
              onError: (error) => {
                store.dispatch({
                  variant: "SET_ERROR",
                  id,
                  error: error.message || "Upload failed",
                });
              },
            });
          } else {
            store.dispatch({ variant: "SET_SUCCESS", id });
          }
        } catch (error) {
          store.dispatch({
            variant: "SET_ERROR",
            id,
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
            ref={inputRef}
            accept={accept}
            disabled={disabled}
            multiple={multiple}
            className="sr-only"
            onChange={onInputChange}
          />
        </RootPrimitive>
      </StoreContext.Provider>
    );
  },
);
FileUploadRoot.displayName = ROOT_NAME;

interface FileUploadTriggerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const FileUploadTrigger = React.forwardRef<
  HTMLButtonElement,
  FileUploadTriggerProps
>((props, forwardedRef) => {
  const { asChild, ...triggerProps } = props;
  const store = useStoreContext(TRIGGER_NAME);
  const inputRef = store.getInputRef();
  const propsRef = useAsRef(triggerProps);

  const TriggerPrimitive = asChild ? Slot : "button";

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current?.onClick?.(event);

      if (!event.defaultPrevented) {
        inputRef.current?.click();
      }
    },
    [inputRef, propsRef.current],
  );

  return (
    <TriggerPrimitive
      type="button"
      data-slot="file-upload-trigger"
      {...triggerProps}
      ref={forwardedRef}
      onClick={onClick}
    />
  );
});
FileUploadTrigger.displayName = TRIGGER_NAME;

interface FileUploadDropzoneProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const FileUploadDropzone = React.forwardRef<
  HTMLDivElement,
  FileUploadDropzoneProps
>((props, forwardedRef) => {
  const { asChild, className, ...dropzoneProps } = props;
  const store = useStoreContext(DROPZONE_NAME);
  const dragOver = useStore((state) => state.dragOver);
  const inputRef = store.getInputRef();
  const propsRef = useAsRef(dropzoneProps);

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
        const inputElement = inputRef.current;
        if (!inputElement) return;

        const dataTransfer = new DataTransfer();
        for (const file of files) {
          dataTransfer.items.add(file);
        }

        inputElement.files = dataTransfer.files;
        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    [store, inputRef, propsRef.current.onDrop],
  );

  const DropzonePrimitive = asChild ? Slot : "div";

  return (
    <DropzonePrimitive
      data-dragging={dragOver ? "" : undefined}
      data-slot="file-upload-dropzone"
      {...dropzoneProps}
      ref={forwardedRef}
      className={cn(
        "relative select-none rounded-lg border-2 border-dashed not-has-[>[data-slot=file-upload-trigger]]:p-6 transition-colors hover:bg-muted/50 data-[dragging]:border-primary data-[dragging]:bg-muted/50",
        className,
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    />
  );
});
FileUploadDropzone.displayName = DROPZONE_NAME;

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

    const shouldRender =
      forceMount || useStore((state) => state.files.size > 0);

    if (!shouldRender) return null;

    const ListPrimitive = asChild ? Slot : "div";

    return (
      <ListPrimitive
        role="list"
        aria-orientation={orientation}
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

const FileUploadItemContext = React.createContext<string | null>(null);

function useFileUploadItemContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
  const context = React.useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(FILE_UPLOAD_ERRORS[name]);
  }
  return context;
}

interface FileUploadItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  asChild?: boolean;
}

const FileUploadItem = React.forwardRef<HTMLDivElement, FileUploadItemProps>(
  (props, forwardedRef) => {
    const { value, asChild, className, ...itemProps } = props;

    const fileState = useStore((state) => {
      const entries = Array.from(state.files.entries());
      const entry = entries.find(
        ([_, f]) => `${f.file.name}-${f.file.size}` === value,
      );
      return entry ? entry[1] : null;
    });

    const vibrant = useStore((state) => state.vibrant);

    if (!fileState) return null;

    const ItemPrimitive = asChild ? Slot : "div";

    return (
      <FileUploadItemContext.Provider value={fileState.id}>
        <ItemPrimitive
          id={fileState.id}
          role="listitem"
          data-slot="file-upload-item"
          data-status={fileState.status}
          {...itemProps}
          ref={forwardedRef}
          className={cn(
            "flex items-center gap-2 rounded-md border p-3 has-[_[data-slot=file-upload-preview]]:flex-col has-[_[data-slot=file-upload-progress]]:items-start",
            vibrant
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
        />
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
  const id = useFileUploadItemContext(ITEM_PREVIEW_NAME);

  const fileState = useStore((state) => state.files.get(id));

  if (!fileState) return null;

  const ItemPreviewPrimitive = asChild ? Slot : "div";

  const onPreviewRender = React.useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      return (
        <div className="relative flex size-10 shrink-0 items-center justify-center">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="rounded object-cover"
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

  return (
    <ItemPreviewPrimitive
      data-slot="file-upload-preview"
      {...previewProps}
      ref={forwardedRef}
      className={cn("flex flex-1 items-center gap-2", className)}
    >
      {children ?? (
        <>
          {onPreviewRender(fileState.file)}
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-sm">
              {fileState.file.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatBytes(fileState.file.size)}
            </span>
            {fileState.error && (
              <span className="text-destructive text-xs">
                {fileState.error}
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
  useStoreContext(ITEM_PROGRESS_NAME);
  const id = useFileUploadItemContext(ITEM_PROGRESS_NAME);

  const fileState = useStore((state) => state.files.get(id));
  const vibrant = useStore((state) => state.vibrant);

  if (!fileState) return null;

  const ItemProgressPrimitive = asChild ? Slot : "div";

  return (
    <ItemProgressPrimitive
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={fileState.progress}
      aria-valuetext={`${fileState.progress}%`}
      data-state={fileState.status}
      data-value={fileState.progress}
      data-max="100"
      data-slot="file-upload-progress"
      {...progressProps}
      ref={forwardedRef}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
    >
      <div
        data-state={fileState.status}
        data-value={fileState.progress}
        data-max="100"
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          vibrant
            ? {
                "bg-orange-500/50 dark:bg-orange-600/50":
                  fileState.status === "uploading",
                "bg-green-500/50 dark:bg-green-600/50":
                  fileState.status === "success",
                "bg-red-500/50 dark:bg-red-600/50":
                  fileState.status === "error",
                "bg-orange-500 dark:bg-orange-600":
                  fileState.status === "uploading",
                "bg-green-500 dark:bg-green-600":
                  fileState.status === "success",
                "bg-red-500 dark:bg-red-600": fileState.status === "error",
              }
            : "bg-primary",
        )}
        style={{ transform: `translateX(-${100 - fileState.progress}%)` }}
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
  const id = useFileUploadItemContext(ITEM_DELETE_NAME);
  const propsRef = useAsRef(deleteProps);

  const fileState = useStore((state) => state.files.get(id));

  if (!fileState) return null;

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current?.onClick?.(event);

      if (!event.defaultPrevented) {
        store.dispatch({ variant: "REMOVE_FILE", id });
      }
    },
    [store, id, propsRef.current.onClick],
  );
  const ItemDeletePrimitive = asChild ? Slot : "button";

  return (
    <ItemDeletePrimitive
      type="button"
      aria-controls={id}
      data-slot="file-upload-item-delete"
      {...deleteProps}
      ref={forwardedRef}
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
