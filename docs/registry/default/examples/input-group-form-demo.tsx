"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import * as InputGroup from "@/registry/default/ui/input-group";

export default function InputGroupFormDemo() {
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
        <label className="font-medium text-sm leading-none">Phone Number</label>
        <InputGroup.Root
          className="w-full max-w-sm"
          aria-label="Phone number input"
        >
          <InputGroup.Item
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
            aria-label="Country code"
          />
          <InputGroup.Item
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
            aria-label="Area code"
          />
          <InputGroup.Item
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
            aria-label="Phone number"
          />
        </InputGroup.Root>
      </div>
      <Button type="submit" size="sm">
        Submit
      </Button>
    </form>
  );
}
