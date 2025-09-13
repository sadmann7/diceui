import { Bell, Heart, MessageCircle, Settings, Star, User } from "lucide-react";
import { Stack } from "@/registry/default/ui/stack";

const iconData = [
  { icon: User, color: "bg-blue-500" },
  { icon: Heart, color: "bg-red-500" },
  { icon: Star, color: "bg-yellow-500" },
  { icon: MessageCircle, color: "bg-green-500" },
  { icon: Settings, color: "bg-purple-500" },
  { icon: Bell, color: "bg-orange-500" },
];

export default function StackIconsDemo() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Icon Stack</h3>
        <Stack>
          {iconData.slice(0, 4).map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`flex size-10 items-center justify-center rounded-full text-white ${item.color}`}
              >
                <IconComponent size={16} />
              </div>
            );
          })}
        </Stack>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Icon Stack with Truncation</h3>
        <Stack max={3}>
          {iconData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`flex size-10 items-center justify-center rounded-full text-white ${item.color}`}
              >
                <IconComponent size={16} />
              </div>
            );
          })}
        </Stack>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Reverse Icon Stack</h3>
        <Stack reverse>
          {iconData.slice(0, 4).map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`flex size-10 items-center justify-center rounded-full text-white ${item.color}`}
              >
                <IconComponent size={16} />
              </div>
            );
          })}
        </Stack>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Reverse with Truncation</h3>
        <Stack reverse max={3}>
          {iconData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`flex size-10 items-center justify-center rounded-full text-white ${item.color}`}
              >
                <IconComponent size={16} />
              </div>
            );
          })}
        </Stack>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Vertical Icon Stack</h3>
        <div className="flex justify-center">
          <Stack orientation="vertical" size={32}>
            {iconData.slice(0, 4).map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className={`flex size-8 items-center justify-center rounded-full text-white ${item.color}`}
                >
                  <IconComponent size={14} />
                </div>
              );
            })}
          </Stack>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Vertical Reverse Icon Stack</h3>
        <div className="flex justify-center">
          <Stack orientation="vertical" reverse size={32}>
            {iconData.slice(0, 4).map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className={`flex size-8 items-center justify-center rounded-full text-white ${item.color}`}
                >
                  <IconComponent size={14} />
                </div>
              );
            })}
          </Stack>
        </div>
      </div>
    </div>
  );
}
