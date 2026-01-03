import { event as trackAnalyticsEvent } from "onedollarstats";
import { z } from "zod";

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
  const parsedEvent = eventSchema.parse(input);
  
  // eslint-disable-next-line no-console
  console.log("📊 Analytics Event:", parsedEvent);
  
  if (typeof window !== "undefined") {
    trackAnalyticsEvent(parsedEvent.name, parsedEvent.properties);
    // eslint-disable-next-line no-console
    console.log("✅ Event sent to OneDollarStats");
  }
}
