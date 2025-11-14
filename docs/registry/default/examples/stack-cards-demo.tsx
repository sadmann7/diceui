import * as Stack from "@/registry/default/ui/stack";

export default function StackCardsDemo() {
  const cards = [
    {
      title: "Card 1",
      description: "Beautiful card design with gradient background",
      gradient: "from-pink-500 to-purple-500",
    },
    {
      title: "Card 2",
      description: "Smooth animations on hover and interaction",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Card 3",
      description: "Responsive layout that works on all devices",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Card 4",
      description: "Customizable with various props and options",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="flex min-h-[450px] items-center justify-center">
      <Stack.Root className="w-[380px]" visibleItems={3} offset={12}>
        {cards.map((card, index) => (
          <Stack.Item key={index} className="overflow-hidden p-0">
            <div className={`h-32 bg-gradient-to-br ${card.gradient} p-6`}>
              <h3 className="font-bold text-white text-xl">{card.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground text-sm">
                {card.description}
              </p>
            </div>
          </Stack.Item>
        ))}
      </Stack.Root>
    </div>
  );
}
