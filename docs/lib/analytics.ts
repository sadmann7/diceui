declare global {
  interface Window {
    stonks?: {
      event: (name: string, properties?: Record<string, string>) => void;
    };
  }
}

interface Event {
  name: "copy_code" | "copy_install_command";
  properties?: Record<string, string>;
}

function trackEvent(input: Event) {
  if (typeof window === "undefined" || !window.stonks) return;

  window.stonks.event(input.name, input.properties);
}

export {
  //
  type Event,
  trackEvent,
};
