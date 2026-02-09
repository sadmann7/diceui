import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/registry/bases/radix/ui/status";

export default function StatusVariantsDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Success Variants</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <Status variant="success">
            <StatusIndicator />
            <StatusLabel>Online</StatusLabel>
          </Status>
          <Status variant="success">
            <StatusIndicator />
            <StatusLabel>Active</StatusLabel>
          </Status>
          <Status variant="success" className="hidden sm:inline-flex">
            <StatusIndicator />
            <StatusLabel>Connected</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Error Variants</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <Status variant="error">
            <StatusIndicator />
            <StatusLabel>Offline</StatusLabel>
          </Status>
          <Status variant="error">
            <StatusIndicator />
            <StatusLabel>Disconnected</StatusLabel>
          </Status>
          <Status variant="error" className="hidden sm:inline-flex">
            <StatusIndicator />
            <StatusLabel>Failed</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Warning Variants</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <Status variant="warning">
            <StatusIndicator />
            <StatusLabel>Away</StatusLabel>
          </Status>
          <Status variant="warning">
            <StatusIndicator />
            <StatusLabel>Busy</StatusLabel>
          </Status>
          <Status variant="warning" className="hidden sm:inline-flex">
            <StatusIndicator />
            <StatusLabel>Pending</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Info Variants</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <Status variant="info">
            <StatusIndicator />
            <StatusLabel>Idle</StatusLabel>
          </Status>
          <Status variant="info">
            <StatusIndicator />
            <StatusLabel>In Progress</StatusLabel>
          </Status>
          <Status variant="info" className="hidden sm:inline-flex">
            <StatusIndicator />
            <StatusLabel>Syncing</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Default Variants</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <Status variant="default">
            <StatusIndicator />
            <StatusLabel>Unknown</StatusLabel>
          </Status>
          <Status variant="default">
            <StatusIndicator />
            <StatusLabel>Not Set</StatusLabel>
          </Status>
          <Status variant="default" className="hidden sm:inline-flex">
            <StatusIndicator />
            <StatusLabel>N/A</StatusLabel>
          </Status>
        </div>
      </div>
    </div>
  );
}
