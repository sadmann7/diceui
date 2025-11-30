"use client";

import {
  KeyValue,
  KeyValueAddButton,
  KeyValueError,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemoveButton,
  KeyValueValueInput,
} from "@/registry/default/ui/key-value";

export default function KeyValueValidationDemo() {
  return (
    <KeyValue
      className="w-full max-w-2xl"
      defaultEntries={[
        { id: "1", key: "API_KEY", value: "sk-1234567890" },
        { id: "2", key: "invalid key", value: "" },
        { id: "3", key: "DATABASE_URL", value: "short" },
      ]}
      keyPlaceholder="KEY"
      valuePlaceholder="value"
      validateKey={(key) => {
        if (!key) return "Key is required";
        if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
          return "Must be uppercase with underscores";
        }
        return undefined;
      }}
      validateValue={(value, key) => {
        if (key.includes("KEY") && value.length < 10) {
          return "API keys must be at least 10 characters";
        }
        return undefined;
      }}
      allowDuplicateKeys={false}
    >
      <KeyValueList>
        <KeyValueItem className="flex-col items-start">
          <div className="flex w-full gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <KeyValueKeyInput />
              <KeyValueError field="key" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <KeyValueValueInput />
              <KeyValueError field="value" />
            </div>
            <KeyValueRemoveButton />
          </div>
        </KeyValueItem>
      </KeyValueList>
      <KeyValueAddButton />
    </KeyValue>
  );
}
