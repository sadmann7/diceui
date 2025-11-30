import {
  KeyValue,
  KeyValueAdd,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemove,
  KeyValueValueInput,
} from "@/registry/default/ui/key-value";

export default function KeyValueDemo() {
  return (
    <KeyValue className="w-full max-w-2xl">
      <KeyValueList>
        <KeyValueItem>
          <KeyValueKeyInput className="flex-1" />
          <KeyValueValueInput className="flex-1" />
          <KeyValueRemove />
        </KeyValueItem>
      </KeyValueList>
      <KeyValueAdd />
    </KeyValue>
  );
}
