import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/registry/bases/radix/ui/status";

export default function StatusDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Status variant="success">
        <StatusIndicator />
        <StatusLabel>Online</StatusLabel>
      </Status>

      <Status variant="error">
        <StatusIndicator />
        <StatusLabel>Offline</StatusLabel>
      </Status>

      <Status variant="warning">
        <StatusIndicator />
        <StatusLabel>Away</StatusLabel>
      </Status>

      <Status variant="info">
        <StatusIndicator />
        <StatusLabel>Idle</StatusLabel>
      </Status>

      <Status variant="default">
        <StatusIndicator />
        <StatusLabel>Unknown</StatusLabel>
      </Status>
    </div>
  );
}
