import {
  KeyValue,
  KeyValueAddButton,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemoveButton,
  KeyValueValueInput,
} from "@/registry/default/ui/key-value";

export default function KeyValueDemo() {
  return (
    <KeyValue className="w-full max-w-2xl">
      <KeyValueList>
        <KeyValueItem>
          <KeyValueKeyInput className="flex-1" />
          <KeyValueValueInput className="flex-1" />
          <KeyValueRemoveButton />
        </KeyValueItem>
      </KeyValueList>
      <KeyValueAddButton />
    </KeyValue>
  );
}
