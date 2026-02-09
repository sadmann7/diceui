import { Rating, RatingItem } from "@/registry/bases/radix/ui/rating";

export default function RatingDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-sm">Basic Rating</h4>
        <Rating defaultValue={3}>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-sm">Half Steps (LTR)</h4>
        <Rating defaultValue={2.5} step={0.5}>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-sm">Half Steps (RTL)</h4>
        <Rating dir="rtl" defaultValue={2.5} step={0.5}>
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} />
          ))}
        </Rating>
      </div>
    </div>
  );
}
