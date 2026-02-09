import { Status, StatusLabel } from "@/registry/bases/radix/ui/status";

export default function StatusTextOnlyDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Status variant="success">
        <StatusLabel>Active</StatusLabel>
      </Status>

      <Status variant="error">
        <StatusLabel>Inactive</StatusLabel>
      </Status>

      <Status variant="warning">
        <StatusLabel>Pending</StatusLabel>
      </Status>

      <Status variant="info">
        <StatusLabel>Processing</StatusLabel>
      </Status>

      <Status variant="default">
        <StatusLabel>Draft</StatusLabel>
      </Status>
    </div>
  );
}
