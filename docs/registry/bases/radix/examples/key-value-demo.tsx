import {
  KeyValue,
  KeyValueAdd,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemove,
  KeyValueValueInput,
} from "@/registry/bases/radix/ui/key-value";

export default function KeyValueDemo() {
  return (
    <KeyValue>
      <KeyValueList>
        <KeyValueItem>
          <KeyValueKeyInput />
          <KeyValueValueInput placeholder="Test" />
          <KeyValueRemove />
        </KeyValueItem>
      </KeyValueList>
      <KeyValueAdd />
    </KeyValue>
  );
}
