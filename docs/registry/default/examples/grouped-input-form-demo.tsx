"use client";

import { Button } from "@/components/ui/button";
import { GroupedInput } from "@/registry/default/ui/grouped-input";
import * as React from "react";

export default function GroupedInputFormDemo() {
  const [phoneNumber, setPhoneNumber] = React.useState({
    countryCode: "+1",
    areaCode: "",
    number: "",
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(
      "Phone number:",
      `${phoneNumber.countryCode} ${phoneNumber.areaCode}-${phoneNumber.number}`,
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="font-medium text-sm">Phone Number</label>
        <div className="flex w-full max-w-sm items-center space-x-0">
          <GroupedInput
            position="first"
            placeholder="+1"
            value={phoneNumber.countryCode}
            onChange={(e) =>
              setPhoneNumber((prev) => ({
                ...prev,
                countryCode: e.target.value,
              }))
            }
            className="w-16"
          />
          <GroupedInput
            position="middle"
            placeholder="555"
            value={phoneNumber.areaCode}
            onChange={(e) =>
              setPhoneNumber((prev) => ({ ...prev, areaCode: e.target.value }))
            }
            className="w-20"
            maxLength={3}
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <GroupedInput
            position="last"
            placeholder="1234567"
            value={phoneNumber.number}
            onChange={(e) =>
              setPhoneNumber((prev) => ({ ...prev, number: e.target.value }))
            }
            className="flex-1"
            maxLength={7}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
      </div>
      <Button type="submit" size="sm">
        Submit
      </Button>
    </form>
  );
}
