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
    name: "Delba de Oliveira",
    src: "https://github.com/delbaoliveira.png",
    fallback: "DO",
  },
  {
    name: "Shu Ding",
    src: "https://github.com/shuding.png",
    fallback: "SD",
  },
];

export default function AvatarGroupTruncationDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Max 3 items</h3>
        <AvatarGroup max={3}>
          {avatars.map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Max 5 items</h3>
        <AvatarGroup max={5}>
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
