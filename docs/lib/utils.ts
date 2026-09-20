export { cn } from "cn";

export function getIsExternalLink(href: string) {
  return href.startsWith("http") || href.startsWith("https");
}

export function getIsEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
