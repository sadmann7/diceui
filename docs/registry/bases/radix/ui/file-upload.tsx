"use client";

import { ReactStore, useStore } from "@base-ui/utils/store";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useValueAsRef } from "@base-ui/utils/useValueAsRef";
import { cn } from "cn";
import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const ROOT_NAME = "FileUpload";
const DROPZONE_NAME = "FileUploadDropzone";
const TRIGGER_NAME = "FileUploadTrigger";
const LIST_NAME = "FileUploadList";
const ITEM_NAME = "FileUploadItem";
const ITEM_PREVIEW_NAME = "FileUploadItemPreview";
const ITEM_METADATA_NAME = "FileUploadItemMetadata";
const ITEM_PROGRESS_NAME = "FileUploadItemProgress";
const ITEM_DELETE_NAME = "FileUploadItemDelete";
const CLEAR_NAME = "FileUploadClear";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileIcon(file: File) {
  const type = file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (type.startsWith("video/")) {
    return (
      <IconPlaceholder
        lucide="FileVideoIcon"
        tabler="IconMovie"
        hugeicons="Video01Icon"
        phosphor="FileVideoIcon"
        remixicon="RiVideoLine"
      />
    );
  }

  if (type.startsWith("audio/")) {
    return (
      <IconPlaceholder
        lucide="FileAudioIcon"
        tabler="IconFileMusic"
        hugeicons="FileMusicIcon"
        phosphor="FileAudioIcon"
        remixicon="RiFileMusicLine"
      />
    );
  }

  if (
    type.startsWith("text/") ||
    ["txt", "md", "rtf", "pdf"].includes(extension)
  ) {
    return (
      <IconPlaceholder
        lucide="FileTextIcon"
        tabler="IconFileText"
        hugeicons="File02Icon"
        phosphor="FileTextIcon"
        remixicon="RiFileTextLine"
      />
    );
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
    return (
      <IconPlaceholder
        lucide="FileCodeIcon"
        tabler="IconFileCode"
        hugeicons="FileScriptIcon"
        phosphor="FileCodeIcon"
        remixicon="RiFileCodeLine"
      />
    );
  }

  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
    return (
      <IconPlaceholder
        lucide="FileArchiveIcon"
        tabler="IconFileZip"
        hugeicons="FileZipIcon"
        phosphor="FileZipIcon"
        remixicon="RiFileZipLine"
      />
    );
  }

  if (
    ["exe", "msi", "app", "apk", "deb", "rpm"].includes(extension) ||
    type.startsWith("application/")
  ) {
    return (
      <IconPlaceholder
        lucide="FileCogIcon"
        tabler="IconFileSettings"
        hugeicons="FileSettingIcon"
        phosphor="FileDashedIcon"
        remixicon="RiFileSettingsLine"
      />
    );
  }

  return (
    <IconPlaceholder
      lucide="FileIcon"
      tabler="IconFile"
      hugeicons="File01Icon"
      phosphor="FileIcon"
      remixicon="RiFileLine"
    />
  );
}

type Direction = "ltr" | "rtl";

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

interface StoreController {
  isValueControlled: boolean;
  onValueChange?: (files: File[]) => void;
}

const selectors = {
  dragOver: (state: StoreState) => state.dragOver,
  invalid: (state: StoreState) => state.invalid,
  fileCount: (state: StoreState) => state.files.size,
  fileState: (state: StoreState, file: File) => state.files.get(file),
  fileIndex: (state: StoreState, file: File) =>
    Array.from(state.files.keys()).indexOf(file) + 1,
};

type Store = ReactStore<StoreState, StoreController, typeof selectors>;

function getFileStates(
  files: File[],
  previousFiles: Map<File, FileState>,
  urlCache: WeakMap<File, string>,
) {
  const nextFiles = new Map<File, FileState>();
  for (const file of files) {
    nextFiles.set(
      file,
      previousFiles.get(file) ?? { file, progress: 0, status: "idle" },
    );
  }

  for (const file of previousFiles.keys()) {
    if (nextFiles.has(file)) continue;
    const cachedUrl = urlCache.get(file);
    if (cachedUrl) {
      URL.revokeObjectURL(cachedUrl);
      urlCache.delete(file);
    }
  }

  return nextFiles;
}

function setFiles(
  store: Store,
  files: File[],
  urlCache: WeakMap<File, string>,
) {
  store.set("files", getFileStates(files, store.state.files, urlCache));
}

function commitFiles(
  store: Store,
  files: File[],
  urlCache: WeakMap<File, string>,
) {
  store.context.onValueChange?.(files);
  if (!store.context.isValueControlled) setFiles(store, files, urlCache);
}

function updateFileState(
  store: Store,
  file: File,
  changes: Partial<FileState>,
) {
  const fileState = store.state.files.get(file);
  if (!fileState) return;

  const files = new Map(store.state.files);
  files.set(file, { ...fileState, ...changes });
  store.set("files", files);
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const selectionCache = new WeakMap<
  (state: StoreState) => unknown,
  WeakMap<StoreState, { value: unknown }>
>();

function selectCached<T>(
  state: StoreState,
  selector: (state: StoreState) => T,
) {
  let cache = selectionCache.get(selector);
  if (!cache) {
    cache = new WeakMap();
    selectionCache.set(selector, cache);
  }

  const cached = cache.get(state);
  if (cached) return cached.value as T;

  const value = selector(state);
  cache.set(state, { value });
  return value;
}

function useFileUpload<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useFileUpload");
  return useStore(store, selectCached<T>, selector);
}

interface FileUploadContextValue {
  inputId: string;
  dropzoneId: string;
  listId: string;
  labelId: string;
  disabled: boolean;
  dir: Direction;
  inputRef: React.RefObject<HTMLInputElement | null>;
  urlCache: WeakMap<File, string>;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(
  null,
);

function useFileUploadContext(consumerName: string) {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface FileUploadProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onAccept?: (files: File[]) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  onFileValidate?: (file: File) => string | null | undefined;
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => Promise<void> | void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  dir?: Direction;
  label?: string;
  name?: string;
  asChild?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  multiple?: boolean;
  required?: boolean;
}

function FileUpload(props: FileUploadProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onAccept,
    onFileAccept,
    onFileReject,
    onFileValidate,
    onUpload,
    accept,
    maxFiles,
    maxSize,
    dir: dirProp,
    label,
    name,
    asChild,
    disabled = false,
    invalid = false,
    multiple = false,
    required = false,
    children,
    className,
    ...rootProps
  } = props;

  const inputId = React.useId();
  const dropzoneId = React.useId();
  const listId = React.useId();
  const labelId = React.useId();

  const dir = DirectionPrimitive.useDirection(dirProp);
  const [urlCache] = React.useState(() => new WeakMap<File, string>());
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, StoreController, typeof selectors>(
        {
          files: getFileStates(
            value ?? defaultValue ?? [],
            new Map(),
            urlCache,
          ),
          dragOver: false,
          invalid,
        },
        { isValueControlled: value !== undefined, onValueChange },
        selectors,
      ),
  );

  useIsoLayoutEffect(() => {
    Object.assign(store.context, {
      isValueControlled: value !== undefined,
      onValueChange,
    } satisfies StoreController);
  });

  useIsoLayoutEffect(() => {
    if (value !== undefined) setFiles(store, value, urlCache);
  }, [store, value, urlCache]);

  useIsoLayoutEffect(() => {
    store.set("invalid", invalid);
  }, [store, invalid]);

  const propsRef = useValueAsRef({
    onAccept,
    onFileAccept,
    onFileReject,
    onFileValidate,
    onUpload,
  });

  const acceptTypes = React.useMemo(
    () => accept?.split(",").map((t) => t.trim()) ?? null,
    [accept],
  );

  const [onProgress] = React.useState(() => {
    let frame = 0;
    return (file: File, progress: number) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateFileState(store, file, {
          progress: Math.min(Math.max(0, progress), 100),
          status: "uploading",
        });
      });
    };
  });

  React.useEffect(() => {
    return () => {
      for (const file of store.state.files.keys()) {
        const cachedUrl = urlCache.get(file);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
        }
      }
    };
  }, [store, urlCache]);

  const onFilesUpload = React.useCallback(
    async (files: File[]) => {
      try {
        for (const file of files) {
          updateFileState(store, file, { progress: 0, status: "uploading" });
        }

        if (propsRef.current.onUpload) {
          await propsRef.current.onUpload(files, {
            onProgress,
            onSuccess: (file) => {
              updateFileState(store, file, {
                progress: 100,
                status: "success",
              });
            },
            onError: (file, error) => {
              updateFileState(store, file, {
                error: error.message ?? "Upload failed",
                status: "error",
              });
            },
          });
        } else {
          for (const file of files) {
            updateFileState(store, file, { progress: 100, status: "success" });
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        for (const file of files) {
          updateFileState(store, file, {
            error: errorMessage,
            status: "error",
          });
        }
      }
    },
    [store, propsRef, onProgress],
  );

  const onFilesChange = React.useCallback(
    (originalFiles: File[]) => {
      if (disabled) return;

      let filesToProcess = [...originalFiles];
      let invalid = false;

      if (maxFiles) {
        const currentCount = store.state.files.size;
        const remainingSlotCount = Math.max(0, maxFiles - currentCount);

        if (remainingSlotCount < filesToProcess.length) {
          const rejectedFiles = filesToProcess.slice(remainingSlotCount);
          invalid = true;

          filesToProcess = filesToProcess.slice(0, remainingSlotCount);

          for (const file of rejectedFiles) {
            let rejectionMessage = `Maximum ${maxFiles} files allowed`;

            if (propsRef.current.onFileValidate) {
              const validationMessage = propsRef.current.onFileValidate(file);
              if (validationMessage) {
                rejectionMessage = validationMessage;
              }
            }

            propsRef.current.onFileReject?.(file, rejectionMessage);
          }
        }
      }

      const acceptedFiles: File[] = [];
      const rejectedFiles: { file: File; message: string }[] = [];

      for (const file of filesToProcess) {
        let rejected = false;
        let rejectionMessage = "";

        if (propsRef.current.onFileValidate) {
          const validationMessage = propsRef.current.onFileValidate(file);
          if (validationMessage) {
            rejectionMessage = validationMessage;
            propsRef.current.onFileReject?.(file, rejectionMessage);
            rejected = true;
            invalid = true;
            continue;
          }
        }

        if (acceptTypes) {
          const fileType = file.type;
          const fileExtension = `.${file.name.split(".").pop()}`;

          if (
            !acceptTypes.some(
              (type) =>
                type === fileType ||
                type === fileExtension ||
                (type.includes("/*") &&
                  fileType.startsWith(type.replace("/*", "/"))),
            )
          ) {
            rejectionMessage = "File type not accepted";
            propsRef.current.onFileReject?.(file, rejectionMessage);
            rejected = true;
            invalid = true;
          }
        }

        if (maxSize && file.size > maxSize) {
          rejectionMessage = "File too large";
          propsRef.current.onFileReject?.(file, rejectionMessage);
          rejected = true;
          invalid = true;
        }

        if (!rejected) {
          acceptedFiles.push(file);
        } else {
          rejectedFiles.push({ file, message: rejectionMessage });
        }
      }

      if (invalid) {
        store.set("invalid", invalid);
        setTimeout(() => {
          store.set("invalid", false);
        }, 2000);
      }

      if (acceptedFiles.length > 0) {
        commitFiles(
          store,
          [...store.state.files.keys(), ...acceptedFiles],
          urlCache,
        );

        if (propsRef.current.onAccept) {
          propsRef.current.onAccept(acceptedFiles);
        }

        for (const file of acceptedFiles) {
          propsRef.current.onFileAccept?.(file);
        }

        if (propsRef.current.onUpload) {
          requestAnimationFrame(() => {
            void onFilesUpload(acceptedFiles);
          });
        }
      }
    },
    [
      store,
      urlCache,
      propsRef,
      onFilesUpload,
      maxFiles,
      acceptTypes,
      maxSize,
      disabled,
    ],
  );

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      onFilesChange(files);
      event.target.value = "";
    },
    [onFilesChange],
  );

  const contextValue = React.useMemo<FileUploadContextValue>(
    () => ({
      dropzoneId,
      inputId,
      listId,
      labelId,
      dir,
      disabled,
      inputRef,
      urlCache,
    }),
    [dropzoneId, inputId, listId, labelId, dir, disabled, urlCache],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <FileUploadContext.Provider value={contextValue}>
        <RootPrimitive
          data-disabled={disabled ? "" : undefined}
          data-slot="file-upload"
          dir={dir}
          {...rootProps}
          className={cn("cn-file-upload", className)}
        >
          {children}
          <input
            type="file"
            id={inputId}
            aria-labelledby={labelId}
            aria-describedby={dropzoneId}
            ref={inputRef}
            tabIndex={-1}
            accept={accept}
            name={name}
            className="cn-file-upload-2"
            disabled={disabled}
            multiple={multiple}
            required={required}
            onChange={onInputChange}
          />
          <div id={labelId} className="cn-file-upload-3">
            {label ?? "File upload"}
          </div>
        </RootPrimitive>
      </FileUploadContext.Provider>
    </StoreContext.Provider>
  );
}

function setInputFiles(input: HTMLInputElement, files: File[]) {
  const dataTransfer = new DataTransfer();
  for (const file of files) {
    dataTransfer.items.add(file);
  }

  input.files = dataTransfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

interface FileUploadDropzoneProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function FileUploadDropzone(props: FileUploadDropzoneProps) {
  const {
    asChild,
    className,
    onClick: onClickProp,
    onDragOver: onDragOverProp,
    onDragEnter: onDragEnterProp,
    onDragLeave: onDragLeaveProp,
    onDrop: onDropProp,
    onPaste: onPasteProp,
    onKeyDown: onKeyDownProp,
    ...dropzoneProps
  } = props;

  const context = useFileUploadContext(DROPZONE_NAME);
  const store = useStoreContext(DROPZONE_NAME);
  const dragOver = useStore(store, selectors.dragOver);
  const invalid = useStore(store, selectors.invalid);

  const propsRef = useValueAsRef({
    onClick: onClickProp,
    onDragOver: onDragOverProp,
    onDragEnter: onDragEnterProp,
    onDragLeave: onDragLeaveProp,
    onDrop: onDropProp,
    onPaste: onPasteProp,
    onKeyDown: onKeyDownProp,
  });

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      propsRef.current.onClick?.(event);

      if (event.defaultPrevented) return;

      const target = event.target;

      const isFromTrigger =
        target instanceof HTMLElement &&
        target.closest('[data-slot="file-upload-trigger"]');

      if (!isFromTrigger) {
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, propsRef],
  );

  const onDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragOver?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.set("dragOver", true);
    },
    [store, propsRef],
  );

  const onDragEnter = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragEnter?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.set("dragOver", true);
    },
    [store, propsRef],
  );

  const onDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragLeave?.(event);

      if (event.defaultPrevented) return;

      const relatedTarget = event.relatedTarget;
      if (
        relatedTarget &&
        relatedTarget instanceof Node &&
        event.currentTarget.contains(relatedTarget)
      ) {
        return;
      }

      event.preventDefault();
      store.set("dragOver", false);
    },
    [store, propsRef],
  );

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current.onDrop?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.set("dragOver", false);

      const files = Array.from(event.dataTransfer.files);
      const inputElement = context.inputRef.current;
      if (!inputElement) return;

      setInputFiles(inputElement, files);
    },
    [store, context.inputRef, propsRef],
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      propsRef.current.onPaste?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.set("dragOver", false);

      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length === 0) return;

      const inputElement = context.inputRef.current;
      if (!inputElement) return;

      setInputFiles(inputElement, files);
    },
    [store, context.inputRef, propsRef],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      propsRef.current.onKeyDown?.(event);

      if (
        !event.defaultPrevented &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, propsRef],
  );

  const DropzonePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <DropzonePrimitive
      role="region"
      id={context.dropzoneId}
      aria-controls={`${context.inputId} ${context.listId}`}
      aria-disabled={context.disabled}
      aria-invalid={invalid}
      data-disabled={context.disabled ? "" : undefined}
      data-dragging={dragOver ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-slot="file-upload-dropzone"
      dir={context.dir}
      tabIndex={context.disabled ? undefined : 0}
      {...dropzoneProps}
      className={cn("cn-file-upload-dropzone", className)}
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    />
  );
}

interface FileUploadTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function FileUploadTrigger(props: FileUploadTriggerProps) {
  const { asChild, onClick: onClickProp, ...triggerProps } = props;

  const context = useFileUploadContext(TRIGGER_NAME);

  const propsRef = useValueAsRef({
    onClick: onClickProp,
  });

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);

      if (event.defaultPrevented) return;

      context.inputRef.current?.click();
    },
    [context.inputRef, propsRef],
  );

  const TriggerPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <TriggerPrimitive
      type="button"
      aria-controls={context.inputId}
      data-disabled={context.disabled ? "" : undefined}
      data-slot="file-upload-trigger"
      {...triggerProps}
      disabled={context.disabled}
      onClick={onClick}
    />
  );
}

interface FileUploadListProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
  asChild?: boolean;
  forceMount?: boolean;
}

function FileUploadList(props: FileUploadListProps) {
  const {
    className,
    orientation = "vertical",
    asChild,
    forceMount,
    ...listProps
  } = props;

  const context = useFileUploadContext(LIST_NAME);
  const store = useStoreContext(LIST_NAME);
  const fileCount = useStore(store, selectors.fileCount);
  const shouldRender = forceMount || fileCount > 0;

  if (!shouldRender) return null;

  const ListPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ListPrimitive
      role="list"
      id={context.listId}
      aria-orientation={orientation}
      data-orientation={orientation}
      data-slot="file-upload-list"
      data-state={shouldRender ? "active" : "inactive"}
      dir={context.dir}
      {...listProps}
      className={cn(
        "cn-file-upload-list",
        orientation === "horizontal" && "flex-row overflow-x-auto p-1.5",
        className,
      )}
    />
  );
}

interface FileUploadItemContextValue {
  id: string;
  fileState: FileState | undefined;
  nameId: string;
  sizeId: string;
  statusId: string;
  messageId: string;
}

const FileUploadItemContext =
  React.createContext<FileUploadItemContextValue | null>(null);

function useFileUploadItemContext(consumerName: string) {
  const context = React.useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

interface FileUploadItemProps extends React.ComponentProps<"div"> {
  value: File;
  asChild?: boolean;
}

function FileUploadItem(props: FileUploadItemProps) {
  const { value, asChild, className, ...itemProps } = props;

  const id = React.useId();
  const statusId = `${id}-status`;
  const nameId = `${id}-name`;
  const sizeId = `${id}-size`;
  const messageId = `${id}-message`;

  const context = useFileUploadContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);
  const fileState = useStore(store, selectors.fileState, value);
  const fileCount = useStore(store, selectors.fileCount);
  const fileIndex = useStore(store, selectors.fileIndex, value);

  const itemContext = React.useMemo(
    () => ({
      id,
      fileState,
      nameId,
      sizeId,
      statusId,
      messageId,
    }),
    [id, fileState, statusId, nameId, sizeId, messageId],
  );

  if (!fileState) return null;

  const statusText = fileState.error
    ? `Error: ${fileState.error}`
    : fileState.status === "uploading"
      ? `Uploading: ${fileState.progress}% complete`
      : fileState.status === "success"
        ? "Upload complete"
        : "Ready to upload";

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <FileUploadItemContext.Provider value={itemContext}>
      <ItemPrimitive
        role="listitem"
        id={id}
        aria-setsize={fileCount}
        aria-posinset={fileIndex}
        aria-describedby={`${nameId} ${sizeId} ${statusId} ${
          fileState.error ? messageId : ""
        }`}
        aria-labelledby={nameId}
        data-slot="file-upload-item"
        dir={context.dir}
        {...itemProps}
        className={cn("cn-file-upload-item", className)}
      >
        {props.children}
        <span id={statusId} className="cn-file-upload-item-2">
          {statusText}
        </span>
      </ItemPrimitive>
    </FileUploadItemContext.Provider>
  );
}

interface FileUploadItemPreviewProps extends React.ComponentProps<"div"> {
  render?: (file: File, fallback: () => React.ReactNode) => React.ReactNode;
  asChild?: boolean;
}

function FileUploadItemPreview(props: FileUploadItemPreviewProps) {
  const { render, asChild, children, className, ...previewProps } = props;

  const itemContext = useFileUploadItemContext(ITEM_PREVIEW_NAME);
  const context = useFileUploadContext(ITEM_PREVIEW_NAME);

  const getDefaultRender = React.useCallback(
    (file: File) => {
      if (itemContext.fileState?.file.type.startsWith("image/")) {
        let url = context.urlCache.get(file);
        if (!url) {
          url = URL.createObjectURL(file);
          context.urlCache.set(file, url);
        }

        return (
          <img
            src={url}
            alt={file.name}
            className="cn-file-upload-item-preview"
          />
        );
      }

      return getFileIcon(file);
    },
    [itemContext.fileState?.file.type, context.urlCache],
  );

  const onPreviewRender = React.useCallback(
    (file: File) => {
      if (render) {
        return render(file, () => getDefaultRender(file));
      }

      return getDefaultRender(file);
    },
    [render, getDefaultRender],
  );

  if (!itemContext.fileState) return null;

  const ItemPreviewPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemPreviewPrimitive
      aria-labelledby={itemContext.nameId}
      data-slot="file-upload-preview"
      {...previewProps}
      className={cn("cn-file-upload-preview", className)}
    >
      {onPreviewRender(itemContext.fileState.file)}
      {children}
    </ItemPreviewPrimitive>
  );
}

interface FileUploadItemMetadataProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  size?: "default" | "sm";
}

function FileUploadItemMetadata(props: FileUploadItemMetadataProps) {
  const {
    asChild,
    size = "default",
    children,
    className,
    ...metadataProps
  } = props;

  const context = useFileUploadContext(ITEM_METADATA_NAME);
  const itemContext = useFileUploadItemContext(ITEM_METADATA_NAME);

  if (!itemContext.fileState) return null;

  const ItemMetadataPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemMetadataPrimitive
      data-slot="file-upload-metadata"
      dir={context.dir}
      {...metadataProps}
      className={cn("cn-file-upload-metadata", className)}
    >
      {children ?? (
        <>
          <span
            id={itemContext.nameId}
            className={cn(
              "cn-file-upload-item-metadata-radix",
              size === "sm" && "text-[13px] leading-snug font-normal",
            )}
          >
            {itemContext.fileState.file.name}
          </span>
          <span
            id={itemContext.sizeId}
            className={cn(
              "cn-file-upload-item-metadata-2-radix",
              size === "sm" && "text-[11px] leading-snug",
            )}
          >
            {formatBytes(itemContext.fileState.file.size)}
          </span>
          {itemContext.fileState.error && (
            <span
              id={itemContext.messageId}
              className="cn-file-upload-item-metadata-3-radix"
            >
              {itemContext.fileState.error}
            </span>
          )}
        </>
      )}
    </ItemMetadataPrimitive>
  );
}
interface FileUploadItemProgressProps extends React.ComponentProps<"div"> {
  variant?: "linear" | "circular" | "fill";
  size?: number;
  asChild?: boolean;
  forceMount?: boolean;
}

function FileUploadItemProgress(props: FileUploadItemProgressProps) {
  const {
    variant = "linear",
    size = 40,
    asChild,
    forceMount,
    className,
    ...progressProps
  } = props;

  const itemContext = useFileUploadItemContext(ITEM_PROGRESS_NAME);

  if (!itemContext.fileState) return null;

  const shouldRender = forceMount || itemContext.fileState.progress !== 100;

  if (!shouldRender) return null;

  const ItemProgressPrimitive = asChild ? SlotPrimitive.Slot : "div";

  switch (variant) {
    case "circular": {
      const circumference = 2 * Math.PI * ((size - 4) / 2);
      const strokeDashoffset =
        circumference - (itemContext.fileState.progress / 100) * circumference;

      return (
        <ItemProgressPrimitive
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={itemContext.fileState.progress}
          aria-valuetext={`${itemContext.fileState.progress}%`}
          aria-labelledby={itemContext.nameId}
          data-slot="file-upload-progress"
          {...progressProps}
          className={cn("cn-file-upload-progress", className)}
        >
          <svg
            className="cn-file-upload-item-progress-radix"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            stroke="currentColor"
          >
            <circle
              className="cn-file-upload-item-progress-2-radix"
              strokeWidth="2"
              cx={size / 2}
              cy={size / 2}
              r={(size - 4) / 2}
            />
            <circle
              className="cn-file-upload-item-progress-3-radix"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              cx={size / 2}
              cy={size / 2}
              r={(size - 4) / 2}
            />
          </svg>
        </ItemProgressPrimitive>
      );
    }

    case "fill": {
      const progressPercentage = itemContext.fileState.progress;
      const topInset = 100 - progressPercentage;

      return (
        <ItemProgressPrimitive
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercentage}
          aria-valuetext={`${progressPercentage}%`}
          aria-labelledby={itemContext.nameId}
          data-slot="file-upload-progress"
          {...progressProps}
          className={cn("cn-file-upload-progress-2", className)}
          style={{
            clipPath: `inset(${topInset}% 0% 0% 0%)`,
          }}
        />
      );
    }

    default:
      return (
        <ItemProgressPrimitive
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={itemContext.fileState.progress}
          aria-valuetext={`${itemContext.fileState.progress}%`}
          aria-labelledby={itemContext.nameId}
          data-slot="file-upload-progress"
          {...progressProps}
          className={cn("cn-file-upload-progress-3", className)}
        >
          <div
            className="cn-file-upload-item-progress-4-radix"
            style={{
              transform: `translateX(-${100 - itemContext.fileState.progress}%)`,
            }}
          />
        </ItemProgressPrimitive>
      );
  }
}

interface FileUploadItemDeleteProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function FileUploadItemDelete(props: FileUploadItemDeleteProps) {
  const { asChild, onClick: onClickProp, ...deleteProps } = props;

  const context = useFileUploadContext(ITEM_DELETE_NAME);
  const store = useStoreContext(ITEM_DELETE_NAME);
  const itemContext = useFileUploadItemContext(ITEM_DELETE_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);

      if (!itemContext.fileState || event.defaultPrevented) return;

      const removedFile = itemContext.fileState.file;
      commitFiles(
        store,
        [...store.state.files.keys()].filter((file) => file !== removedFile),
        context.urlCache,
      );
    },
    [store, context.urlCache, itemContext.fileState, onClickProp],
  );

  if (!itemContext.fileState) return null;

  const ItemDeletePrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ItemDeletePrimitive
      type="button"
      aria-controls={itemContext.id}
      aria-describedby={itemContext.nameId}
      data-slot="file-upload-item-delete"
      {...deleteProps}
      onClick={onClick}
    />
  );
}

interface FileUploadClearProps extends React.ComponentProps<"button"> {
  forceMount?: boolean;
  asChild?: boolean;
}

function FileUploadClear(props: FileUploadClearProps) {
  const {
    asChild,
    forceMount,
    disabled,
    onClick: onClickProp,
    ...clearProps
  } = props;

  const context = useFileUploadContext(CLEAR_NAME);
  const store = useStoreContext(CLEAR_NAME);
  const fileCount = useStore(store, selectors.fileCount);

  const isDisabled = disabled || context.disabled;

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);

      if (event.defaultPrevented) return;

      commitFiles(store, [], context.urlCache);
      store.set("invalid", false);
    },
    [store, context.urlCache, onClickProp],
  );

  const shouldRender = forceMount || fileCount > 0;

  if (!shouldRender) return null;

  const ClearPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ClearPrimitive
      type="button"
      aria-controls={context.listId}
      data-slot="file-upload-clear"
      data-disabled={isDisabled ? "" : undefined}
      {...clearProps}
      disabled={isDisabled}
      onClick={onClick}
    />
  );
}

export {
  FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadProps,
  FileUploadTrigger,
  useFileUpload,
};
