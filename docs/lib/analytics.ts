import { z } from "zod";

declare global {
  interface Window {
    stonks?: {
      event: (
        name: string,
        properties?: Record<string, string | number | boolean | null>
      ) => void;
    };
  }
}

const eventSchema = z.object({
  name: z.enum(["copy_code", "copy_install_command", "copy_component_code"]),
  properties: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()])
    )
    .optional(),
});

export type Event = z.infer<typeof eventSchema>;

export function trackEvent(input: Event): void {
  const event = eventSchema.parse(input);
  
  // eslint-disable-next-line no-console
  console.log("📊 Analytics Event:", event);
  
  if (event && typeof window !== "undefined" && window.stonks) {
    window.stonks.event(event.name, event.properties as Record<string, string>);
    // eslint-disable-next-line no-console
    console.log("✅ Event sent to OneDollarStats");
  } else {
    // eslint-disable-next-line no-console
    console.warn("⚠️ OneDollarStats not loaded");
  }
}
