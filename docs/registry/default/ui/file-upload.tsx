"use client";

import { composeEventHandlers } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
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
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${LIST_NAME}\``,
  [ITEM_DELETE_NAME]: `\`${ITEM_DELETE_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_PROGRESS_NAME]: `\`${ITEM_PROGRESS_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_PREVIEW_NAME]: `\`${ITEM_PREVIEW_NAME}\` must be within \`${ITEM_NAME}\``,
} as const;

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
  inputRef: React.RefObject<HTMLInputElement | null>;
}

type StoreAction =
  | { type: "ADD_FILES"; files: File[] }
  | { type: "SET_PROGRESS"; id: string; progress: number }
  | { type: "SET_SUCCESS"; id: string }
  | { type: "SET_ERROR"; id: string; error: string }
  | { type: "REMOVE_FILE"; id: string }
  | { type: "SET_DRAG_OVER"; dragOver: boolean }
  | { type: "CLEAR" };

function createStore() {
  const initialState: StoreState = {
    files: new Map(),
    dragOver: false,
    inputRef: React.createRef(),
  };

  let state = initialState;
  const listeners = new Set<() => void>();

  function reducer(state: StoreState, action: StoreAction): StoreState {
    switch (action.type) {
      case "ADD_FILES": {
        const newFiles = new Map(state.files);
        for (const file of action.files) {
          const id = crypto.randomUUID();
          newFiles.set(id, {
            id,
            file,
            progress: 0,
            status: "idle",
          });
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
        return { ...state, files: newFiles };
      }
      case "SET_DRAG_OVER": {
        return { ...state, dragOver: action.dragOver };
      }
      case "CLEAR": {
        return { ...state, files: new Map() };
      }
      default:
        return state;
    }
  }

  const getState = () => state;

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
  return React.useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

interface FileUploadRootProps extends React.ComponentPropsWithoutRef<"div"> {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  onFilesAccepted?: (files: File[]) => void;
  onFileRejected?: (file: File, reason: string) => void;
  onUpload?: (file: File) => Promise<void>;
  asChild?: boolean;
}

const FileUploadRoot = React.forwardRef<HTMLDivElement, FileUploadRootProps>(
  (props, forwardedRef) => {
    const {
      multiple = false,
      accept,
      maxSize,
      maxFiles,
      disabled,
      onFilesAccepted,
      onFileRejected,
      onUpload,
      asChild,
      className,
      children,
      ...rootProps
    } = props;

    const store = React.useMemo(() => createStore(), []);
    const inputRef = React.useRef<HTMLInputElement>(null);
    store.getState().inputRef = inputRef;
    const id = React.useId();

    const onFilesChange = React.useCallback(
      (originalFiles: File[]) => {
        if (disabled) return;

        let filesToProcess = [...originalFiles];

        if (maxFiles) {
          const currentFiles = store.getState().files.size;
          if (currentFiles + filesToProcess.length > maxFiles) {
            const allowed = Math.max(0, maxFiles - currentFiles);
            filesToProcess = filesToProcess.slice(0, allowed);
          }
        }

        const acceptedFiles: File[] = [];

        for (const file of filesToProcess) {
          let rejected = false;

          if (accept) {
            const acceptTypes = accept.split(",").map((t) => t.trim());
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
              onFileRejected?.(file, "File type not accepted");
              rejected = true;
            }
          }

          if (maxSize && file.size > maxSize) {
            onFileRejected?.(file, "File too large");
            rejected = true;
          }

          if (!rejected) {
            acceptedFiles.push(file);
          }
        }

        if (acceptedFiles.length > 0) {
          store.dispatch({ type: "ADD_FILES", files: acceptedFiles });
          onFilesAccepted?.(acceptedFiles);

          if (onUpload) {
            for (const file of acceptedFiles) {
              const id = Array.from(store.getState().files.entries()).find(
                ([_, f]) => f.file === file,
              )?.[0];

              if (id) {
                onUploadFile(file, id);
              }
            }
          }
        }
      },
      [
        disabled,
        maxFiles,
        accept,
        maxSize,
        onFilesAccepted,
        onFileRejected,
        onUpload,
        store,
      ],
    );

    const onUploadFile = React.useCallback(
      async (file: File, id: string) => {
        try {
          store.dispatch({ type: "SET_PROGRESS", id, progress: 0 });

          const progressInterval = setInterval(() => {
            const fileState = store.getState().files.get(id);
            if (fileState && fileState.progress < 95) {
              store.dispatch({
                type: "SET_PROGRESS",
                id,
                progress: fileState.progress + 5,
              });
            } else {
              clearInterval(progressInterval);
            }
          }, 200);

          if (onUpload) {
            await onUpload(file);
          }

          clearInterval(progressInterval);
          store.dispatch({ type: "SET_SUCCESS", id });
        } catch (error) {
          store.dispatch({
            type: "SET_ERROR",
            id,
            error: error instanceof Error ? error.message : "Upload failed",
          });
        }
      },
      [onUpload, store],
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
            aria-hidden="true"
            accept={accept}
            disabled={disabled}
            multiple={multiple}
            tabIndex={-1}
            ref={inputRef}
            style={{
              border: 0,
              clip: "rect(0 0 0 0)",
              clipPath: "inset(50%)",
              height: "1px",
              margin: "-1px",
              overflow: "hidden",
              padding: 0,
              position: "absolute",
              whiteSpace: "nowrap",
              width: "1px",
            }}
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
  const inputRef = useStore((state) => state.inputRef);

  const TriggerPrimitive = asChild ? Slot : "button";

  return (
    <TriggerPrimitive
      type="button"
      data-slot="file-upload-trigger"
      {...triggerProps}
      ref={forwardedRef}
      onClick={composeEventHandlers(triggerProps.onClick, () => {
        inputRef.current?.click();
      })}
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

  const DropzonePrimitive = asChild ? Slot : "div";

  return (
    <DropzonePrimitive
      data-drag-active={dragOver ? "" : undefined}
      data-slot="file-upload-dropzone"
      {...dropzoneProps}
      ref={forwardedRef}
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-colors hover:bg-muted/50 data-drag-active:border-primary data-drag-active:bg-muted/50",
        className,
      )}
      onDragOver={(event) => {
        event.preventDefault();
        store.dispatch({ type: "SET_DRAG_OVER", dragOver: true });
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        store.dispatch({ type: "SET_DRAG_OVER", dragOver: true });
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        store.dispatch({ type: "SET_DRAG_OVER", dragOver: false });
      }}
      onDrop={(event) => {
        event.preventDefault();
        store.dispatch({ type: "SET_DRAG_OVER", dragOver: false });

        const files = Array.from(event.dataTransfer.files);
        const inputElement = store.getState().inputRef.current;
        if (!inputElement) return;

        const dataTransfer = new DataTransfer();
        for (const file of files) {
          dataTransfer.items.add(file);
        }

        inputElement.files = dataTransfer.files;
        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
      }}
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
    useStoreContext(LIST_NAME);

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

interface FileUploadItemProps extends React.ComponentPropsWithoutRef<"div"> {
  id: string;
  asChild?: boolean;
}

const FileUploadItemContext = React.createContext<string | null>(null);

const FileUploadItem = React.forwardRef<HTMLDivElement, FileUploadItemProps>(
  (props, forwardedRef) => {
    const { id, asChild, className, ...itemProps } = props;
    useStoreContext(ITEM_NAME);

    const fileState = useStore((state) => state.files.get(id));

    if (!fileState) return null;

    const ItemPrimitive = asChild ? Slot : "div";

    return (
      <FileUploadItemContext.Provider value={id}>
        <ItemPrimitive
          id={id}
          role="listitem"
          data-slot="file-upload-item"
          data-status={fileState.status}
          {...itemProps}
          ref={forwardedRef}
          className={cn(
            "flex items-center justify-between rounded-md border p-3",
            {
              "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50":
                fileState.status === "uploading",
              "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50":
                fileState.status === "success",
              "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50":
                fileState.status === "error",
            },
            className,
          )}
        />
      </FileUploadItemContext.Provider>
    );
  },
);
FileUploadItem.displayName = ITEM_NAME;

function useFileUploadItemContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
  const context = React.useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(FILE_UPLOAD_ERRORS[name]);
  }
  return context;
}

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

  const ItemDeletePrimitive = asChild ? Slot : "button";

  return (
    <ItemDeletePrimitive
      type="button"
      aria-controls={id}
      data-slot="file-upload-item-delete"
      {...deleteProps}
      ref={forwardedRef}
      onClick={composeEventHandlers(deleteProps.onClick, () => {
        store.dispatch({ type: "REMOVE_FILE", id });
      })}
    />
  );
});
FileUploadItemDelete.displayName = ITEM_DELETE_NAME;

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

  if (!fileState) return null;

  const ItemProgressPrimitive = asChild ? Slot : "div";

  return (
    <ItemProgressPrimitive
      data-slot="file-upload-progress"
      data-value={fileState.progress}
      data-max="100"
      {...progressProps}
      ref={forwardedRef}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 flex w-full max-w-full items-center justify-center transition-all",
          {
            "bg-orange-500 dark:bg-orange-600":
              fileState.status === "uploading",
            "bg-green-500 dark:bg-green-600": fileState.status === "success",
            "bg-red-500 dark:bg-red-600": fileState.status === "error",
          },
        )}
        style={{ width: `${fileState.progress}%` }}
      />
    </ItemProgressPrimitive>
  );
});
FileUploadItemProgress.displayName = ITEM_PROGRESS_NAME;

interface FileUploadItemPreviewProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  render?: (file: File) => React.ReactNode;
}

const FileUploadItemPreview = React.forwardRef<
  HTMLDivElement,
  FileUploadItemPreviewProps
>((props, forwardedRef) => {
  const { asChild, render, className, ...previewProps } = props;
  useStoreContext(ITEM_PREVIEW_NAME);
  const id = useFileUploadItemContext(ITEM_PREVIEW_NAME);

  const fileState = useStore((state) => state.files.get(id));

  if (!fileState) return null;

  const ItemPreviewPrimitive = asChild ? Slot : "div";

  return (
    <ItemPreviewPrimitive
      data-slot="file-upload-preview"
      {...previewProps}
      ref={forwardedRef}
      className={cn("flex items-center gap-2", className)}
    >
      {render ? (
        render(fileState.file)
      ) : (
        <>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-sm">
              {fileState.file.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {(fileState.file.size / 1024).toFixed(1)} KB
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

const FileUpload = FileUploadRoot;
const Root = FileUploadRoot;
const Trigger = FileUploadTrigger;
const Dropzone = FileUploadDropzone;
const List = FileUploadList;
const Item = FileUploadItem;
const ItemDelete = FileUploadItemDelete;
const ItemProgress = FileUploadItemProgress;
const ItemPreview = FileUploadItemPreview;

export {
  FileUpload,
  FileUploadTrigger,
  FileUploadDropzone,
  FileUploadList,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemProgress,
  FileUploadItemPreview,
  //
  Root,
  Trigger,
  Dropzone,
  List,
  Item,
  ItemDelete,
  ItemProgress,
  ItemPreview,
};
