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
];

export default function StackRtlDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">RTL</h3>
        <Stack dir="rtl">
          {avatars.map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </Stack>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Reverse RTL</h3>
        <Stack dir="rtl" reverse>
          {avatars.map((avatar, index) => (
            <Avatar key={index}>
              <AvatarImage src={avatar.src} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </Stack>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Vertical RTL</h3>
        <div className="flex justify-center">
          <Stack orientation="vertical" dir="rtl">
            {avatars.map((avatar, index) => (
              <Avatar key={index}>
                <AvatarImage src={avatar.src} />
                <AvatarFallback>{avatar.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </Stack>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Vertical reverse RTL</h3>
        <div className="flex justify-center">
          <Stack orientation="vertical" dir="rtl" reverse>
            {avatars.map((avatar, index) => (
              <Avatar key={index}>
                <AvatarImage src={avatar.src} />
                <AvatarFallback>{avatar.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </Stack>
        </div>
      </div>
    </div>
  );
}
