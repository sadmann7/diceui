"use client";

import * as React from "react";
import { Pending } from "@/registry/default/components/pending";

export default function PendingCardDemo() {
  const [activePending, setActivePending] = React.useState<string | null>(null);

  const onCardClick = (cardId: string) => {
    setActivePending(cardId);

    // Simulate async action
    setTimeout(() => {
      setActivePending(null);
    }, 2000);
  };

  const cards = [
    { id: "create", title: "Create Project", icon: "+" },
    { id: "import", title: "Import Project", icon: "↓" },
    { id: "browse", title: "Browse Templates", icon: "📋" },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {cards.map((card) => (
        <Pending key={card.id} isPending={activePending === card.id}>
          <button
            onClick={() => onCardClick(card.id)}
            className="flex flex-1 flex-col items-center gap-3 rounded-lg border bg-card p-6 text-card-foreground transition-colors hover:bg-accent data-pending:cursor-wait data-pending:opacity-70"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-2xl text-primary">
              {card.icon}
            </div>
            <span className="font-medium text-sm">
              {activePending === card.id ? "Loading..." : card.title}
            </span>
          </button>
        </Pending>
      ))}
    </div>
  );
}

