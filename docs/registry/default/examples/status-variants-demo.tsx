import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/registry/default/ui/status";

export default function StatusVariantsDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Success States</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Status variant="success">
            <StatusIndicator />
            <StatusLabel>Online</StatusLabel>
          </Status>
          <Status variant="success">
            <StatusIndicator />
            <StatusLabel>Active</StatusLabel>
          </Status>
          <Status variant="success">
            <StatusIndicator />
            <StatusLabel>Connected</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Error States</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Status variant="error">
            <StatusIndicator />
            <StatusLabel>Offline</StatusLabel>
          </Status>
          <Status variant="error">
            <StatusIndicator />
            <StatusLabel>Disconnected</StatusLabel>
          </Status>
          <Status variant="error">
            <StatusIndicator />
            <StatusLabel>Failed</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Warning States</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Status variant="warning">
            <StatusIndicator />
            <StatusLabel>Away</StatusLabel>
          </Status>
          <Status variant="warning">
            <StatusIndicator />
            <StatusLabel>Busy</StatusLabel>
          </Status>
          <Status variant="warning">
            <StatusIndicator />
            <StatusLabel>Pending</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Info States</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Status variant="info">
            <StatusIndicator />
            <StatusLabel>Idle</StatusLabel>
          </Status>
          <Status variant="info">
            <StatusIndicator />
            <StatusLabel>In Progress</StatusLabel>
          </Status>
          <Status variant="info">
            <StatusIndicator />
            <StatusLabel>Syncing</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Default States</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Status variant="default">
            <StatusIndicator />
            <StatusLabel>Unknown</StatusLabel>
          </Status>
          <Status variant="default">
            <StatusIndicator />
            <StatusLabel>Not Set</StatusLabel>
          </Status>
          <Status variant="default">
            <StatusIndicator />
            <StatusLabel>N/A</StatusLabel>
          </Status>
        </div>
      </div>
    </div>
  );
}
