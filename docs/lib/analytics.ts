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
  const parsedInput = eventSchema.safeParse(input);

  if (!parsedInput.success || !(typeof window !== "undefined" && window.stonks))
    return;

  window.stonks.event(parsedInput.data.name, parsedInput.data.properties);
}

export {
  trackEvent,
  //
  type Event,
};
