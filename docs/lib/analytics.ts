import { z } from "zod";

declare global {
  interface Window {
    stonks?: {
      event: (name: string, properties?: Record<string, string>) => void;
    };
  }
}

const eventSchema = z.object({
  name: z.enum(["copy_code", "copy_install_command"]),
  properties: z.record(z.string(), z.string()).optional(),
});

type Event = z.infer<typeof eventSchema>;

function trackEvent(input: Event) {
  const result = eventSchema.safeParse(input);
  if (!result.success) {
    return;
  }

  if (typeof window !== "undefined" && window.stonks) {
    window.stonks.event(result.data.name, result.data.properties);
  }
}

export {
  trackEvent,
  //
  type Event,
};
