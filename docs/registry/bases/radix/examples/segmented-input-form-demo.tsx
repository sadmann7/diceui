"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  SegmentedInput,
  SegmentedInputItem,
} from "@/registry/bases/radix/ui/segmented-input";

export default function SegmentedInputFormDemo() {
  const [phoneNumber, setPhoneNumber] = React.useState({
    countryCode: "+1",
    areaCode: "",
    number: "",
  });

  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      console.log(
        "Phone number:",
        `${phoneNumber.countryCode} ${phoneNumber.areaCode}-${phoneNumber.number}`,
      );
    },
    [phoneNumber],
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm leading-none">Phone Number</label>
        <SegmentedInput
          className="w-full max-w-sm"
          aria-label="Phone number input"
        >
          <SegmentedInputItem
            placeholder="+1"
            value={phoneNumber.countryCode}
            onChange={(event) =>
              setPhoneNumber((prev) => ({
                ...prev,
                countryCode: event.target.value,
              }))
            }
            className="w-16"
            aria-label="Country code"
          />
          <SegmentedInputItem
            placeholder="555"
            value={phoneNumber.areaCode}
            onChange={(event) =>
              setPhoneNumber((prev) => ({
                ...prev,
                areaCode: event.target.value,
              }))
            }
            className="w-20"
            maxLength={3}
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Area code"
          />
          <SegmentedInputItem
            placeholder="1234567"
            value={phoneNumber.number}
            onChange={(event) =>
              setPhoneNumber((prev) => ({
                ...prev,
                number: event.target.value,
              }))
            }
            className="flex-1"
            maxLength={7}
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Phone number"
          />
        </SegmentedInput>
      </div>
      <Button type="submit" size="sm">
        Submit
      </Button>
    </form>
  );
}
