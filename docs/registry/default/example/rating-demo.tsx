"use client";

import { Rating, RatingItem } from "@/registry/default/ui/rating";

export default function RatingDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Basic Rating (Auto-indexed)</h3>
        <Rating defaultValue={3}>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Manual Index Rating</h3>
        <Rating defaultValue={3}>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} index={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Controlled Rating</h3>
        <Rating
          value={4}
          onValueChange={(value) => console.log("Rating changed:", value)}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-medium text-sm">Sizes</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 text-muted-foreground text-xs">SM</span>
            <Rating defaultValue={3} size="sm">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 text-muted-foreground text-xs">Default</span>
            <Rating defaultValue={3}>
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 text-muted-foreground text-xs">LG</span>
            <Rating defaultValue={3} size="lg">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Read-only</h3>
        <Rating defaultValue={4} readOnly>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Disabled</h3>
        <Rating defaultValue={2} disabled>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">
          Allow Clear (click same rating to clear)
        </h3>
        <Rating defaultValue={3} allowClear>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Custom Max (10 stars)</h3>
        <Rating defaultValue={7} max={10}>
          {Array.from({ length: 10 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-medium text-sm">Activation Modes</h3>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Automatic (default) - activates on focus
            </span>
            <Rating defaultValue={2} activationMode="automatic">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Manual - requires Enter/Space to activate
            </span>
            <Rating defaultValue={2} activationMode="manual">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Allow Half</h3>
        <Rating defaultValue={2.5} allowHalf>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-medium text-sm">Custom Colors</h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Yellow (text-yellow-500)
            </span>
            <Rating defaultValue={3} className="text-yellow-500">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Red (text-red-500)
            </span>
            <Rating defaultValue={4} className="text-red-500">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Green (text-green-500)
            </span>
            <Rating defaultValue={2} className="text-green-500">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Blue (text-blue-500)
            </span>
            <Rating defaultValue={5} className="text-blue-500">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Purple (text-purple-500)
            </span>
            <Rating defaultValue={3} className="text-purple-500">
              {Array.from({ length: 5 }, (_, i) => (
                <RatingItem key={i} />
              ))}
            </Rating>
          </div>
        </div>
      </div>
    </div>
  );
}
