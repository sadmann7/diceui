import { Status, StatusLabel } from "@/registry/default/ui/status";

export default function StatusTextOnlyDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
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
