"use client";

import { Rating, RatingItem } from "@/registry/default/ui/rating";

export default function RatingSizesDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-sm">Small</h4>
        <Rating defaultValue={3} size="sm">
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-sm">Default</h4>
        <Rating defaultValue={3}>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-sm">Large</h4>
        <Rating defaultValue={3} size="lg">
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>
    </div>
  );
}
