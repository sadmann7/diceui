import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import * as Stack from "@/registry/default/ui/stack";

const avatars = [
  { name: "John Doe", initials: "JD", color: "bg-blue-500" },
  { name: "Jane Smith", initials: "JS", color: "bg-green-500" },
  { name: "Bob Wilson", initials: "BW", color: "bg-red-500" },
  { name: "Alice Brown", initials: "AB", color: "bg-purple-500" },
  { name: "Charlie Davis", initials: "CD", color: "bg-yellow-500" },
  { name: "Diana Miller", initials: "DM", color: "bg-pink-500" },
];

export default function StackAvatarDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Avatar Stack</h3>
        <Stack.Root overlap spacing="sm">
          {avatars.slice(0, 4).map((avatar, index) => (
            <Stack.Item key={index}>
              <Avatar
                className={cn("border-2 border-background", avatar.color)}
              >
                <AvatarFallback
                  className={cn("font-medium text-sm text-white", avatar.color)}
                >
                  {avatar.initials}
                </AvatarFallback>
              </Avatar>
            </Stack.Item>
          ))}
        </Stack.Root>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Avatar Stack with Count</h3>
        <Stack.Root overlap spacing="sm">
          {avatars.slice(0, 3).map((avatar, index) => (
            <Stack.Item key={index}>
              <Avatar
                className={cn("border-2 border-background", avatar.color)}
              >
                <AvatarFallback
                  className={cn("font-medium text-sm text-white", avatar.color)}
                >
                  {avatar.initials}
                </AvatarFallback>
              </Avatar>
            </Stack.Item>
          ))}
          <Stack.Item>
            <Avatar className="border-2 border-background">
              <AvatarFallback className="font-medium text-muted-foreground text-xs">
                +3
              </AvatarFallback>
            </Avatar>
          </Stack.Item>
        </Stack.Root>
      </div>
    </div>
  );
}
