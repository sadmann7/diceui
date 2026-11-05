import type {
  EditOperation,
  EditResult,
  PresentationStore,
} from "@diceui/pptx";

import type { EmptyProps, RenderProps } from "@/types";

type PreviewInput = ArrayBuffer | Uint8Array | Blob | File;

type PresentationStatus = "idle" | "loading" | "ready" | "error";

type SlideChangeReason = "navigate" | "load" | "edit" | "reset";

type ZoomChangeReason = "zoom" | "fit" | "load" | "reset";

type EditSource = "edit" | "undo" | "redo";

interface SidePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type AutoFitPadding = number | Partial<SidePadding>;

interface SlideChangeEvent {
  slideId: string | null;
  index: number;
  previousSlideId: string | null;
  reason: SlideChangeReason;
}

interface StatusChangeEvent {
  status: PresentationStatus;
  previousStatus: PresentationStatus;
}

interface ZoomChangeEvent {
  zoom: number;
  previousZoom: number;
  reason: ZoomChangeReason;
}

interface HistoryChangeEvent {
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
}

interface EditEvent {
  operation: EditOperation;
  result: EditResult;
  source: EditSource;
}

type SelectionMode =
  | "idle"
  | "selected"
  | "move"
  | "resize"
  | "rotate"
  | "text"
  | "marquee"
  | "draw";

type ResizeDirection = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type ParagraphAlign = "left" | "center" | "right" | "justify";

type NodeOrder = "front" | "back" | "forward" | "backward";

type DrawTool = { type: "textBox" } | { type: "shape"; geometry: string };

interface SelectionChangeEvent {
  nodeIds: string[];
  nodes: unknown[];
}

interface SelectionBoxState {
  node: unknown;
  mode: SelectionMode;
  dragging: boolean;
  rotating: boolean;
  rotation: number;
}

interface ResizeHandleState {
  direction: ResizeDirection;
}

interface RotateHandleState {
  rotation: number;
  rotating: boolean;
}

interface SnapGuideState {
  axis: "x" | "y";
  position: number;
}

interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string | null;
  fontFamily?: string | null;
  fontSize?: number | null;
}

interface ActiveTextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string | null;
  fontFamily: string | null;
  fontSize: number | null;
  align: ParagraphAlign | null;
}

interface SelectionAnchor {
  getBoundingClientRect: () => DOMRect;
  contextElement?: Element;
}

interface InsertOptions {
  size?: { w: number; h: number };
  position?: { x: number; y: number };
}

interface ThumbnailSelectEvent {
  slideId: string;
  preventDefault: () => void;
}

interface ThumbnailListRenderState {
  slides: { id: string }[];
  activeSlideId: string | null;
  activeIndex: number;
  goTo: (slideId: string) => void;
  goToIndex: (index: number) => void;
}

export interface PresentationProviderProps {
  /**
   * The store to make available to descendants.
   *
   * Create it with `useCreatePresentationStore` when a toolbar or other
   * UI has to sit outside `Presentation`.
   *
   * ```tsx
   * const store = useCreatePresentationStore();
   *
   * <PresentationProvider store={store}>
   *   <Toolbar />
   *   <Presentation />
   * </PresentationProvider>
   * ```
   */
  store: PresentationStore;

  /**
   * Content that can call `usePresentation`, `useSlide`, `useZoom`,
   * `useHistory`, and `useSelection`.
   */
  children?: React.ReactNode;
}

export interface PresentationProps extends EmptyProps<"div">, RenderProps {
  /**
   * The file to parse and display. Accepts `File`, `Blob`, `ArrayBuffer`,
   * or `Uint8Array`.
   *
   * - Set to `null` to explicitly reset the viewer.
   * - Omit (`undefined`) to leave the store untouched, e.g. when the store
   *   is owned elsewhere and loaded with `store.load(file)`.
   *
   * ```tsx
   * <Presentation file={file} />
   * ```
   */
  file?: PreviewInput | null;

  /**
   * 0-based index of the slide to navigate to after a successful parse.
   * Also accepts a resolver called with the parsed slides.
   *
   * @default 0
   *
   * ```tsx
   * <Presentation file={file} defaultSlideIndex={2} />
   * <Presentation file={file} defaultSlideIndex={(slides) => slides.length - 1} />
   * ```
   */
  defaultSlideIndex?: number | ((slides: { id: string }[]) => number);

  /**
   * Zoom level to open at, where `1` equals 100%.
   *
   * Only meaningful without auto-fitting: a `PresentationViewport` with
   * `autoFit` fits on mount and overrides it.
   *
   * ```tsx
   * <Presentation file={file} defaultZoom={0.5} />
   * ```
   */
  defaultZoom?: number;

  /**
   * When `false`, the source package is retained so the presentation can be
   * edited via `store.edit()` and saved back to a `.pptx` via `store.save()`.
   *
   * @default true
   */
  readOnly?: boolean;

  /**
   * Event handler called once the presentation has been parsed successfully.
   */
  onLoad?: (store: PresentationStore) => void;

  /**
   * Event handler called when parsing fails.
   */
  onError?: (error: Error) => void;

  /**
   * Event handler called whenever the active slide changes. Inspect `reason`
   * to tell navigation, load, edit, and reset apart.
   */
  onSlideChange?: (event: SlideChangeEvent) => void;

  /**
   * Event handler called whenever the load status changes.
   */
  onStatusChange?: (event: StatusChangeEvent) => void;

  /**
   * Event handler called after an edit is applied, undone, or redone.
   */
  onEdit?: (event: EditEvent) => void;

  /**
   * Event handler called when undo/redo availability or the unsaved-changes
   * flag moves.
   */
  onHistoryChange?: (event: HistoryChangeEvent) => void;
}

export interface PresentationContentProps extends EmptyProps<"div"> {}

export interface PresentationViewportProps
  extends EmptyProps<"div">, RenderProps {
  /**
   * When `true`, automatically scales the slide to fill the viewport whenever
   * the container resizes.
   *
   * This is the starting mode, not a latch: `setZoom` turns fitting off, and
   * `setAutoFit(true)` turns it back on.
   *
   * @default true
   */
  autoFit?: boolean;

  /**
   * Padding in pixels reserved around the slide when fitting.
   * Only used when `autoFit` is `true`.
   *
   * A number applies the same padding on all sides. An object sets per-side
   * values (missing sides default to `0`).
   *
   * @default 10
   */
  autoFitPadding?: AutoFitPadding;

  /**
   * When `true`, the mouse wheel navigates between slides like PowerPoint.
   * Off by default because it captures wheel events.
   *
   * @default false
   */
  scrollNavigation?: boolean;

  /**
   * When `true`, Ctrl/Cmd+wheel and trackpad pinch zoom the deck instead of
   * the page. Off by default so an embedded viewer does not steal page zoom.
   *
   * @default false
   */
  scrollZoom?: boolean;

  /**
   * Event handler called whenever the zoom level changes, including automatic
   * fits performed while `autoFit` is on.
   */
  onZoomChange?: (event: ZoomChangeEvent) => void;
}

export interface PresentationSlideProps extends EmptyProps<"div">, RenderProps {
  /**
   * Event handler called when an individual shape fails to render. The rest
   * of the slide still renders.
   *
   * Providing a handler replaces the default `console.warn`.
   */
  onNodeError?: (nodeId: string, error: unknown) => void;
}

export interface PresentationSelectionProps
  extends EmptyProps<"div">, RenderProps {
  /**
   * The overlay parts. Defaults to `PresentationSelectionBox` (with
   * `PresentationResizeHandle` and `PresentationRotateHandle`),
   * `PresentationSnapGuide`, and `PresentationMarquee`.
   */
  children?: React.ReactNode;

  /**
   * When `true`, binds undo and redo to the deck: `Ctrl/Cmd+Z` and
   * `Ctrl/Cmd+Shift+Z` (or `Ctrl/Cmd+Y`).
   *
   * Shortcuts only apply within `Presentation`. Text fields keep their own
   * undo. Off by default to avoid conflicts with the surrounding app.
   *
   * @default false
   */
  undoRedoShortcuts?: boolean;

  /**
   * Whether moving and resizing snap to the slide's edges and center and to
   * other shapes, with guides. Hold Alt (Option) while dragging to place
   * freely.
   *
   * @default true
   */
  snapping?: boolean;

  /**
   * How close, in screen pixels, an edge or center has to come to snap.
   *
   * @default 6
   */
  snapThreshold?: number;

  /**
   * Event handler called after an undo triggers.
   */
  onUndo?: (status: "success" | "empty", error?: unknown) => void;

  /**
   * Event handler called after a redo triggers.
   */
  onRedo?: (status: "success" | "empty", error?: unknown) => void;

  /**
   * Event handler called after a node delete is attempted.
   */
  onNodeDelete?: (nodeId: string, error?: unknown) => void;

  /**
   * Event handler called after a node move or resize is attempted.
   */
  onNodeTransform?: (nodeId: string, error?: unknown) => void;

  /**
   * Event handler called after inline text editing is committed.
   */
  onTextChange?: (nodeId: string, error?: unknown) => void;

  /**
   * Event handler called whenever the set of selected nodes changes.
   *
   * Also called with an empty selection when the active slide changes.
   */
  onSelectionChange?: (event: SelectionChangeEvent) => void;

  /**
   * Event handler called when the interaction mode changes. `"move"` starts
   * only once a press drags.
   */
  onModeChange?: (mode: SelectionMode, previousMode: SelectionMode) => void;
}

export interface PresentationSelectionBoxProps
  extends EmptyProps<"div">, RenderProps {
  /**
   * Class name for each outline, or a function of its state.
   */
  className?: string | ((state: SelectionBoxState) => string | undefined);

  /**
   * Style for each outline, or a function of its state.
   */
  style?:
    | React.CSSProperties
    | ((state: SelectionBoxState) => React.CSSProperties | undefined);

  /**
   * `PresentationResizeHandle` and `PresentationRotateHandle`.
   */
  children?: React.ReactNode;
}

export interface PresentationResizeHandleProps
  extends EmptyProps<"div">, RenderProps {
  /**
   * Class name for each handle, or a function of its `direction`.
   */
  className?: string | ((state: ResizeHandleState) => string | undefined);

  /**
   * Style for each handle, or a function of its `direction`.
   */
  style?:
    | React.CSSProperties
    | ((state: ResizeHandleState) => React.CSSProperties | undefined);
}

export interface PresentationRotateHandleProps
  extends EmptyProps<"div">, RenderProps {
  /**
   * Class name for the handle, or a function of its state.
   */
  className?: string | ((state: RotateHandleState) => string | undefined);

  /**
   * Style for the handle, or a function of its state.
   */
  style?:
    | React.CSSProperties
    | ((state: RotateHandleState) => React.CSSProperties | undefined);
}

export interface PresentationSnapGuideProps
  extends EmptyProps<"div">, RenderProps {
  /**
   * Class name for each guide, or a function of its `axis` and `position`.
   */
  className?: string | ((state: SnapGuideState) => string | undefined);

  /**
   * Style for each guide, or a function of its `axis` and `position`.
   */
  style?:
    | React.CSSProperties
    | ((state: SnapGuideState) => React.CSSProperties | undefined);
}

export interface PresentationMarqueeProps
  extends EmptyProps<"div">, RenderProps {
  /**
   * Class name for the marquee.
   */
  className?: string;

  /**
   * Style for the marquee.
   */
  style?: React.CSSProperties;
}

export interface PresentationLoadingProps
  extends Omit<EmptyProps<"div">, "children">, RenderProps {
  /**
   * Rendered while the presentation is loading.
   * Pass a function to receive the current `progress` (0–100).
   *
   * @default (progress) => <span>Loading… {progress}%</span>
   */
  children?: React.ReactNode | ((progress: number) => React.ReactNode);
}

export interface PresentationErrorProps
  extends Omit<EmptyProps<"div">, "children">, RenderProps {
  /**
   * Rendered when the presentation fails to parse.
   * Pass a function to receive the `Error` instance.
   *
   * @default (error) => <span>{error.message}</span>
   */
  children?: React.ReactNode | ((error: Error) => React.ReactNode);
}

export interface PresentationThumbnailListProps
  extends Omit<EmptyProps<"div">, "children">, RenderProps {
  /**
   * - Absent → default `PresentationThumbnailItem` list (one per slide)
   * - ReactNode → rendered as-is inside the container
   * - Function → called with slide state when ready
   */
  children?:
    | React.ReactNode
    | ((state: ThumbnailListRenderState) => React.ReactNode);

  /**
   * When `true`, keyboard navigation wraps from the last item back to the
   * first (and vice versa).
   *
   * @default false
   */
  loop?: boolean;

  /**
   * What takes focus once a presentation finishes loading. `true` focuses the
   * active thumbnail, a ref focuses that element, and a function decides per
   * load.
   *
   * @default false
   */
  initialFocus?:
    | boolean
    | React.RefObject<HTMLElement | null>
    | (() => boolean | void | HTMLElement | null);
}

export interface PresentationThumbnailItemProps
  extends Omit<EmptyProps<"button">, "onSelect">, RenderProps {
  /**
   * Stable id of the slide this item represents.
   */
  slideId: string;

  /**
   * Runs just before this item becomes the active slide, from a click or
   * keyboard roving. Call `preventDefault()` to stop the navigation.
   */
  onSelect?: (event: ThumbnailSelectEvent) => void;

  /**
   * Renders the item's visuals only: no listbox role, no roving focus, and
   * no navigation. Use it for a second copy such as a drag overlay.
   *
   * @default false
   */
  decorative?: boolean;
}

export interface PresentationThumbnailItemPreviewProps
  extends EmptyProps<"div">, RenderProps {}

export interface PresentationThumbnailItemNumberProps
  extends EmptyProps<"span">, RenderProps {}

export interface PresentationZoomSelectProps {
  /**
   * Zoom levels offered alongside Fit, where `1` equals 100%.
   *
   * @default [0.5, 0.75, 1, 1.5, 2]
   */
  levels?: number[];
}

export interface UsePresentationResult {
  /** Parsed presentation data, or `null` before the first successful load. */
  presentation: unknown;

  /** Current lifecycle status of the store. */
  status: PresentationStatus;

  /** Error thrown during the last failed parse, or `null` otherwise. */
  error: Error | null;

  /** Parse progress reported by the store (0-100). */
  progress: number;

  /**
   * Edit revision counter; bumps on every `store.edit()`, `undo()`, or
   * `redo()`.
   */
  revision: number;
}

export interface UseSlideResult {
  /** Full parsed data for the active slide, or `null` before load. */
  slide: unknown;

  /** Stable identity of the active slide. */
  slideId: string | null;

  /** Current display position (0-based). */
  index: number;

  /** Total number of slides in the loaded presentation. */
  total: number;

  /** `true` when the active slide is the first in the deck. */
  isFirst: boolean;

  /** `true` when the active slide is the last in the deck. */
  isLast: boolean;

  /** Navigate to a slide by its stable id. */
  goTo: (slideId: string) => void;

  /** Navigate to a slide by its 0-based index. */
  goToIndex: (index: number) => void;

  /** Advance to the next slide. No-ops on the last slide. */
  next: () => void;

  /** Go back to the previous slide. No-ops on the first slide. */
  prev: () => void;
}

export interface UseZoomResult {
  /** Current zoom level (1 = 100%, 0.5 = 50%). */
  zoom: number;

  /** Whether zoom is tracking the viewport size. */
  isAutoFit: boolean;

  /** Set an explicit zoom level. Turns auto-fit off. */
  setZoom: (zoom: number) => void;

  /** Increases zoom by `step`. Turns auto-fit off. @default step 0.25 */
  zoomIn: (step?: number) => void;

  /** Decreases zoom by `step`. Turns auto-fit off. @default step 0.25 */
  zoomOut: (step?: number) => void;

  /** Turns auto-fit on or off. Turning it on refits the slide immediately. */
  setAutoFit: (isAutoFit: boolean) => void;

  /** Fits the slide inside the given width and height, with optional padding. */
  fitTo: (
    containerWidth: number,
    containerHeight: number,
    padding?: AutoFitPadding,
  ) => void;
}

export interface UseHistoryResult {
  /** Whether there is an edit to undo. */
  canUndo: boolean;

  /** Whether there is an edit to redo. */
  canRedo: boolean;

  /** Whether the deck has unsaved changes. */
  isDirty: boolean;

  /** Revert the most recent edit. Resolves `false` when the undo stack is empty. */
  undo: () => Promise<boolean>;

  /** Re-apply the most recently undone edit. Resolves `false` when the redo stack is empty. */
  redo: () => Promise<boolean>;
}

export interface UseSelectionResult {
  /** Interaction mode of the selection overlay. */
  mode: SelectionMode;

  /** Ids of the selected nodes, in selection order. In text mode, the edited node. */
  nodeIds: string[];

  /** The selected nodes, matching `nodeIds`. */
  nodes: unknown[];

  /**
   * Formatting of the text being edited, or of all text in the selected
   * shapes. `null` when the selection has no text.
   */
  textStyle: ActiveTextStyle | null;

  /**
   * The selection's on-screen bounds, for anchoring a floating toolbar.
   * `null` when nothing is selected.
   */
  anchor: SelectionAnchor | null;

  /** Selects the given nodes on the active slide. Ends text editing. */
  select: (nodeIds: string[]) => void;

  /** Clears the selection. Ends text editing. */
  clear: () => void;

  /** Starts editing a shape's text, with the caret at the end. */
  editText: (nodeId: string) => void;

  /** The armed draw tool, or `null`. */
  drawTool: DrawTool | null;

  /**
   * Arms a draw tool. A click on the slide places a text box or shape at its
   * default size, and a drag draws it. Pass `null`, or press Escape, to disarm.
   */
  startDrawing: (tool: DrawTool | null) => void;

  /** Duplicates the selected shapes and selects the copies. */
  duplicate: () => Promise<void>;

  /** Deletes the selected shapes. */
  remove: () => Promise<void>;

  /** Moves the selected shapes in the stacking order. */
  reorder: (order: NodeOrder) => Promise<void>;

  /**
   * Adds a text box to the active slide and starts editing it. Resolves with
   * the new node's id.
   */
  insertTextBox: (
    options?: InsertOptions & { text?: string },
  ) => Promise<string | undefined>;

  /**
   * Adds a preset shape (e.g. `"rect"`, `"ellipse"`) to the active slide and
   * selects it. Resolves with the new node's id.
   */
  insertShape: (
    geometry: string,
    options?: InsertOptions,
  ) => Promise<string | undefined>;

  /**
   * Formats the selected text (or the word at the caret) in text mode, and
   * all text in the selected shapes otherwise. One undo step.
   */
  setTextStyle: (style: TextStyle) => Promise<void>;

  /**
   * Formats the paragraphs the text selection touches in text mode, and every
   * paragraph in the selected shapes otherwise.
   */
  setParagraphStyle: (style: { align?: ParagraphAlign }) => Promise<void>;
}
