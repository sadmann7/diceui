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
];

export default function AvatarGroupRtlDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">RTL</h3>
        <AvatarGroup dir="rtl">
          {avatars.map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Reverse RTL</h3>
        <AvatarGroup dir="rtl" reverse>
          {avatars.map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Vertical RTL</h3>
        <div className="flex justify-center">
          <AvatarGroup orientation="vertical" dir="rtl">
            {avatars.map((avatar, index) => (
              <Avatar key={index}>
                <AvatarImage src={avatar.src} />
                <AvatarFallback>{avatar.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Vertical reverse RTL</h3>
        <div className="flex justify-center">
          <AvatarGroup orientation="vertical" dir="rtl" reverse>
            {avatars.map((avatar, index) => (
              <Avatar key={index}>
                <AvatarImage src={avatar.src} />
                <AvatarFallback>{avatar.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </div>
    </div>
  );
}
