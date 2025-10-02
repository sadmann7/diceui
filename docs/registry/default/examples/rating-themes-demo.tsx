"use client";

import { Heart, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rating, RatingItem } from "@/registry/default/ui/rating";

const themes = [
  {
    name: "Default",
    value: 4,
    icon: Star,
    className: "text-primary",
    description: "Classic star rating",
  },
  {
    name: "Gold",
    value: 5,
    icon: Star,
    className: "text-yellow-500",
    description: "Premium gold stars",
  },
  {
    name: "Blue",
    value: 3,
    icon: Star,
    className: "text-blue-500",
    description: "Cool blue theme",
  },
  {
    name: "Purple",
    value: 4,
    icon: Star,
    className: "text-purple-500",
    description: "Elegant purple",
  },
  {
    name: "Hearts",
    value: 5,
    icon: Heart,
    className: "text-pink-500",
    description: "Love & favorites",
  },
  {
    name: "Energy",
    value: 4,
    icon: Zap,
    className: "text-orange-500",
    description: "Performance rating",
  },
  {
    name: "Subtle",
    value: 3,
    icon: Star,
    className: "text-gray-400",
    description: "Minimal gray theme",
  },
  {
    name: "Emerald",
    value: 4,
    icon: Star,
    className: "text-emerald-500",
    description: "Fresh green accent",
  },
];

export default function RatingThemesDemo() {
  return (
    <>
      <div className="hidden grid-cols-4 gap-4 sm:grid">
        {themes.map((theme) => (
          <RatingCard key={theme.name} theme={theme} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:hidden">
        {themes.slice(0, 4).map((theme) => (
          <RatingCard key={theme.name} theme={theme} />
        ))}
      </div>
    </>
  );
}

interface RatingCardProps {
  theme: (typeof themes)[0];
}

function RatingCard({ theme }: RatingCardProps) {
  const Icon = theme.icon;

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
      <Rating
        defaultValue={theme.value}
        className={cn("gap-1", theme.className)}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <RatingItem key={i} className="transition-colors duration-200">
            <Icon className="size-full" />
          </RatingItem>
        ))}
      </Rating>
      <div className="flex flex-col items-center gap-1 text-center">
        <h4 className="font-medium text-sm">{theme.name}</h4>
        <p className="text-muted-foreground text-xs">{theme.description}</p>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">Interactive rating</span>
        </div>
      </div>
    </div>
  );
}
