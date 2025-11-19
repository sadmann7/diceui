import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
} from "lucide-react";
import * as Timeline from "@/registry/default/ui/timeline";

export default function TimelineStatusDemo() {
  return (
    <Timeline.Root>
      <Timeline.Item status="success">
        <Timeline.Dot>
          <CheckCircle2 className="size-2 fill-green-500 text-background" />
        </Timeline.Dot>
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Requirements Gathered</Timeline.Title>
            <Timeline.Time dateTime="2024-01-10">
              January 10, 2024
            </Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            All project requirements have been documented and approved.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item status="success">
        <Timeline.Dot>
          <CheckCircle2 className="size-2 fill-green-500 text-background" />
        </Timeline.Dot>
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Design Completed</Timeline.Title>
            <Timeline.Time dateTime="2024-01-25">
              January 25, 2024
            </Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            UI/UX design finalized and ready for development.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item status="primary" active>
        <Timeline.Dot>
          <Clock className="size-2 fill-primary text-background" />
        </Timeline.Dot>
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Development In Progress</Timeline.Title>
            <Timeline.Time dateTime="2024-02-15">
              February 15, 2024
            </Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Currently implementing core features and functionality.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item status="warning">
        <Timeline.Dot>
          <AlertCircle className="size-2 fill-yellow-500 text-background" />
        </Timeline.Dot>
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Testing - Blocked</Timeline.Title>
            <Timeline.Time dateTime="2024-03-01">March 1, 2024</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Waiting for development completion before testing can begin.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot>
          <Circle className="size-2 fill-border text-background" />
        </Timeline.Dot>
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Deployment</Timeline.Title>
            <Timeline.Time dateTime="2024-03-15">March 15, 2024</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Final deployment to production environment.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline.Root>
  );
}
