import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import * as BaseTimeline from "@/registry/bases/base/ui/timeline";
import * as RadixTimeline from "@/registry/bases/radix/ui/timeline";

describe.each([
  ["radix", RadixTimeline],
  ["base", BaseTimeline],
])(
  "Timeline (%s)",
  (_, { Timeline, TimelineConnector, TimelineDot, TimelineItem }) => {
    test("derives each item's status and connector from its position", () => {
      const { container } = render(
        <Timeline activeIndex={1}>
          {["one", "two", "three"].map((item) => (
            <TimelineItem key={item}>
              <TimelineDot />
              <TimelineConnector />
            </TimelineItem>
          ))}
        </Timeline>,
      );

      const items = container.querySelectorAll('[data-slot="timeline-item"]');
      expect(
        Array.from(items, (item) => item.getAttribute("data-status")),
      ).toEqual(["completed", "active", "pending"]);

      const connectors = container.querySelectorAll(
        '[data-slot="timeline-connector"]',
      );
      expect(connectors).toHaveLength(2);
      expect(connectors[0]).toHaveAttribute("data-completed");
      expect(connectors[1]).not.toHaveAttribute("data-completed");
    });
  },
);
