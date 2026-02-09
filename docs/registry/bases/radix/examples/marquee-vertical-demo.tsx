"use client";

import {
  Marquee,
  MarqueeContent,
  MarqueeEdge,
  MarqueeItem,
} from "@/registry/bases/radix/ui/marquee";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Frontend Developer",
    company: "TechCorp",
    content:
      "This component library has transformed our development workflow. The quality and attention to detail is outstanding.",
    avatar: "AJ",
  },
  {
    name: "Sarah Chen",
    role: "Design Lead",
    company: "StartupXYZ",
    content:
      "Beautiful components that are easy to customize. Our design system has never looked better.",
    avatar: "SC",
  },
  {
    name: "Michael Rodriguez",
    role: "Full Stack Engineer",
    company: "WebSolutions",
    content:
      "The accessibility features built into these components saved us weeks of development time.",
    avatar: "MR",
  },
  {
    name: "Emily Davis",
    role: "Product Manager",
    company: "InnovateLab",
    content:
      "Our team productivity increased significantly after adopting this component library.",
    avatar: "ED",
  },
  {
    name: "David Kim",
    role: "Senior Developer",
    company: "CodeCraft",
    content:
      "Clean, modern components with excellent TypeScript support. Highly recommended!",
    avatar: "DK",
  },
  {
    name: "Lisa Thompson",
    role: "UI/UX Designer",
    company: "DesignStudio",
    content:
      "The design tokens and theming system make it incredibly easy to maintain brand consistency.",
    avatar: "LT",
  },
];

export default function MarqueeVerticalDemo() {
  return (
    <Marquee side="bottom" className="h-[320px]">
      <MarqueeContent>
        {testimonials.map((testimonial) => (
          <MarqueeItem key={testimonial.name} asChild>
            <div className="flex w-full flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
                  {testimonial.avatar}
                </div>
                <div className="flex flex-col">
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          </MarqueeItem>
        ))}
      </MarqueeContent>
      <MarqueeEdge side="top" />
      <MarqueeEdge side="bottom" />
    </Marquee>
  );
}
