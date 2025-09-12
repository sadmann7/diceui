import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Stack } from "@/registry/default/ui/stack";

const avatars = [
  { name: "John Doe", initials: "JD", color: "bg-blue-500" },
  { name: "Jane Smith", initials: "JS", color: "bg-green-500" },
  { name: "Bob Wilson", initials: "BW", color: "bg-red-500" },
  { name: "Alice Brown", initials: "AB", color: "bg-purple-500" },
  { name: "Charlie Davis", initials: "CD", color: "bg-yellow-500" },
  { name: "Diana Miller", initials: "DM", color: "bg-pink-500" },
];

export default function StackDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Avatar Stack</h3>
        <Stack size={40} orientation="vertical">
          {avatars.slice(0, 4).map((avatar, index) => (
            <Avatar key={index}>
              <AvatarFallback className={cn(avatar.color)}>
                {avatar.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </Stack>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Avatar Stack with Count</h3>
        <Stack size={40}>
          {avatars.slice(0, 3).map((avatar, index) => (
            <Avatar key={index}>
              <AvatarFallback className={cn(avatar.color)}>
                {avatar.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          <Avatar className="size-full rounded-full bg-muted">
            <AvatarFallback className="rounded-full font-medium text-muted-foreground text-xs">
              +3
            </AvatarFallback>
          </Avatar>
        </Stack>
      </div>
    </div>
  );
}
