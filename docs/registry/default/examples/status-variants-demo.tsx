import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/registry/default/ui/status";

export default function StatusVariantsDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Success</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Status variant="success">
            <StatusIndicator />
            <StatusLabel>Online</StatusLabel>
          </Status>
          <Status variant="success">
            <StatusIndicator />
            <StatusLabel>Active</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Error</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Status variant="error">
            <StatusIndicator />
            <StatusLabel>Offline</StatusLabel>
          </Status>
          <Status variant="error">
            <StatusIndicator />
            <StatusLabel>Failed</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Warning</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Status variant="warning">
            <StatusIndicator />
            <StatusLabel>Away</StatusLabel>
          </Status>
          <Status variant="warning">
            <StatusIndicator />
            <StatusLabel>Busy</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Info</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Status variant="info">
            <StatusIndicator />
            <StatusLabel>Idle</StatusLabel>
          </Status>
          <Status variant="info">
            <StatusIndicator />
            <StatusLabel>Syncing</StatusLabel>
          </Status>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Default</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Status variant="default">
            <StatusIndicator />
            <StatusLabel>Unknown</StatusLabel>
          </Status>
        </div>
      </div>
    </div>
  );
}
