import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/registry/bases/radix/ui/avatar-group";

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
  {
    name: "JJ Kasper",
    src: "https://github.com/ijjk.png",
    fallback: "JK",
  },
  {
    name: "Sebastian Markbåge",
    src: "https://github.com/sebmarkbage.png",
    fallback: "SM",
  },
];

export default function AvatarGroupCustomOverflowDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Default Overflow</h3>
        <AvatarGroup max={4}>
          {avatars.map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Custom Overflow with Badge</h3>
        <AvatarGroup
          max={4}
          renderOverflow={(count) => (
            <div className="flex size-full items-center justify-center rounded-full border-2 border-primary border-dashed bg-primary/10 font-semibold text-primary text-xs">
              {count}+
            </div>
          )}
        >
          {avatars.map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Custom Overflow with Gradient</h3>
        <AvatarGroup
          max={3}
          renderOverflow={(count) => (
            <div className="flex size-full items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 font-bold text-white text-xs">
              +{count}
            </div>
          )}
        >
          {avatars.map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
    </div>
  );
}
