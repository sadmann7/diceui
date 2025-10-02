"use client";

import { Rating, RatingItem } from "@/registry/default/ui/rating";

export default function RatingDemo() {
  return (
    <div className="space-y-6">
      {/* Basic Rating */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Basic Rating</h3>
        <Rating defaultValue={3}>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i + 1} value={i + 1} />
          ))}
        </Rating>
      </div>

      {/* Controlled Rating */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Controlled Rating</h3>
        <Rating
          value={4}
          onValueChange={(value) => console.log("Rating changed:", value)}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i + 1} value={i + 1} />
          ))}
        </Rating>
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Sizes</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 text-muted-foreground text-xs">SM</span>
            <Rating defaultValue={3} size="sm">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i + 1} value={i + 1} />
              ))}
            </Rating>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 text-muted-foreground text-xs">MD</span>
            <Rating defaultValue={3} size="md">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i + 1} value={i + 1} />
              ))}
            </Rating>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 text-muted-foreground text-xs">LG</span>
            <Rating defaultValue={3} size="lg">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i + 1} value={i + 1} />
              ))}
            </Rating>
          </div>
        </div>
      </div>

      {/* Read-only Rating */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Read-only</h3>
        <Rating defaultValue={4} readOnly>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i + 1} value={i + 1} />
          ))}
        </Rating>
      </div>

      {/* Disabled Rating */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Disabled</h3>
        <Rating defaultValue={2} disabled>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i + 1} value={i + 1} />
          ))}
        </Rating>
      </div>

      {/* Allow Clear */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">
          Allow Clear (click same rating to clear)
        </h3>
        <Rating defaultValue={3} allowClear>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i + 1} value={i + 1} />
          ))}
        </Rating>
      </div>

      {/* Custom Max */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Custom Max (10 stars)</h3>
        <Rating defaultValue={7} max={10}>
          {Array.from({ length: 10 }, (_, i) => (
            <RatingItem key={i + 1} value={i + 1} />
          ))}
        </Rating>
      </div>
    </div>
  );
}
