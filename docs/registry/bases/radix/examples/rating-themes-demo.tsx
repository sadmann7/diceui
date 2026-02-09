"use client";

import { Heart, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rating, RatingItem } from "@/registry/bases/radix/ui/rating";

const themes = [
  {
    label: "Default",
    description: "Classic star rating",
    value: 4,
    icon: Star,
    className: "text-primary",
  },
  {
    label: "Gold",
    description: "Premium gold stars",
    value: 5,
    icon: Star,
    className: "text-yellow-500",
  },

  {
    label: "Heart",
    description: "Love & favorites",
    value: 5,
    icon: Heart,
    className: "text-pink-500",
  },
  {
    label: "Energy",
    description: "Performance rating",
    value: 4,
    icon: Zap,
    className: "text-orange-500",
  },
];

export default function RatingThemesDemo() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {themes.map((theme) => (
        <div
          key={theme.label}
          className="flex flex-col items-center gap-3 rounded-lg border p-4"
        >
          <h4 className="font-medium text-sm">{theme.label}</h4>

          <Rating
            defaultValue={theme.value}
            className={cn("gap-1", theme.className)}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <RatingItem key={i}>
                <theme.icon />
              </RatingItem>
            ))}
          </Rating>
          <p className="text-muted-foreground text-xs">{theme.description}</p>
        </div>
      ))}
    </div>
  );
}
