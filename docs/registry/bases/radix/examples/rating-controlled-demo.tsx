"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Rating, RatingItem } from "@/registry/bases/radix/ui/rating";

export default function RatingControlledDemo() {
  const [rating, setRating] = React.useState(3);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-sm">Controlled Rating</h4>
        <Rating value={rating} onValueChange={setRating}>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
        <p className="text-muted-foreground text-sm">
          Current rating: {rating}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setRating(0)}>
          Clear
        </Button>
        <Button variant="outline" size="sm" onClick={() => setRating(5)}>
          Set to 5
        </Button>
        <Button variant="outline" size="sm" onClick={() => setRating(2.5)}>
          Set to 2.5
        </Button>
      </div>
    </div>
  );
}
