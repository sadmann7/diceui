import Link from "next/link";

const COMPONENTS = [
  { name: "Action Bar", slug: "action-bar" },
  { name: "Angle Slider", slug: "angle-slider" },
  { name: "Avatar Group", slug: "avatar-group" },
  { name: "Badge Overflow", slug: "badge-overflow" },
  { name: "Checkbox Group", slug: "checkbox-group" },
  { name: "Circular Progress", slug: "circular-progress" },
  { name: "Color Picker", slug: "color-picker" },
  { name: "Color Swatch", slug: "color-swatch" },
  { name: "Combobox", slug: "combobox" },
  { name: "Compare Slider", slug: "compare-slider" },
  { name: "Cropper", slug: "cropper" },
  { name: "Data Grid", slug: "data-grid" },
  { name: "Data Table", slug: "data-table" },
  { name: "Editable", slug: "editable" },
  { name: "File Upload", slug: "file-upload" },
  { name: "FPS", slug: "fps" },
  { name: "Gauge", slug: "gauge" },
  { name: "Kanban", slug: "kanban" },
  { name: "Kbd", slug: "kbd" },
  { name: "Key Value", slug: "key-value" },
  { name: "Listbox", slug: "listbox" },
  { name: "Marquee", slug: "marquee" },
  { name: "Mask Input", slug: "mask-input" },
  { name: "Masonry", slug: "masonry" },
  { name: "Media Player", slug: "media-player" },
  { name: "Mention", slug: "mention" },
  { name: "Phone Input", slug: "phone-input" },
  { name: "QR Code", slug: "qr-code" },
  { name: "Rating", slug: "rating" },
  { name: "Relative Time Card", slug: "relative-time-card" },
  { name: "Responsive Dialog", slug: "responsive-dialog" },
  { name: "Scroll Spy", slug: "scroll-spy" },
  { name: "Scroller", slug: "scroller" },
  { name: "Segmented Input", slug: "segmented-input" },
  { name: "Selection Toolbar", slug: "selection-toolbar" },
  { name: "Sortable", slug: "sortable" },
  { name: "Speed Dial", slug: "speed-dial" },
  { name: "Stack", slug: "stack" },
  { name: "Stat", slug: "stat" },
  { name: "Status", slug: "status" },
  { name: "Stepper", slug: "stepper" },
  { name: "Swap", slug: "swap" },
  { name: "Tags Input", slug: "tags-input" },
  { name: "Time Picker", slug: "time-picker" },
  { name: "Timeline", slug: "timeline" },
  { name: "Tour", slug: "tour" },
] as const;

interface ComponentListProps {
  base?: "radix" | "base";
}

export function ComponentList({ base = "radix" }: ComponentListProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {COMPONENTS.map(({ name, slug }) => (
        <Link
          key={slug}
          href={`/docs/components/${base}/${slug}`}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
