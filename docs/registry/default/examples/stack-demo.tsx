import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stack } from "@/registry/default/ui/stack";

const avatars = [
  {
    name: "shadcn",
    src: "https://github.com/shadcn.png",
    fallback: "CN",
  },
  {
    name: "Ethan Niser",
    src: "https://github.com/ethanniser.png",
    fallback: "EN",
  },
  {
    name: "Guillermo Rauch",
    src: "https://github.com/rauchg.png",
    fallback: "GR",
  },
  {
    name: "Lee Robinson",
    src: "https://github.com/leerob.png",
    fallback: "LR",
  },
  {
    name: "Evil Rabbit",
    src: "https://github.com/evilrabbit.png",
    fallback: "ER",
  },
  {
    name: "Tim Neutkens",
    src: "https://github.com/timneutkens.png",
    fallback: "TN",
  },
];

export default function StackDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Avatar Stack</h3>
        <Stack>
          {avatars.slice(0, 4).map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </Stack>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Avatar Stack with Count</h3>
        <Stack>
          {avatars.slice(0, 3).map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
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
