import { AlertCircle, CheckCircle2, Circle, Clock } from "lucide-react";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/registry/default/ui/timeline";

export default function TimelineStatusDemo() {
  return (
    <Timeline>
      <TimelineItem status="success">
        <TimelineDot>
          <CheckCircle2 className="size-2 fill-green-500 text-background" />
        </TimelineDot>
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Requirements Gathered</TimelineTitle>
            <TimelineTime dateTime="2024-01-10">January 10, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            All project requirements have been documented and approved.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem status="success">
        <TimelineDot>
          <CheckCircle2 className="size-2 fill-green-500 text-background" />
        </TimelineDot>
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Design Completed</TimelineTitle>
            <TimelineTime dateTime="2024-01-25">January 25, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            UI/UX design finalized and ready for development.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem status="primary" active>
        <TimelineDot>
          <Clock className="size-2 fill-primary text-background" />
        </TimelineDot>
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Development In Progress</TimelineTitle>
            <TimelineTime dateTime="2024-02-15">February 15, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Currently implementing core features and functionality.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem status="warning">
        <TimelineDot>
          <AlertCircle className="size-2 fill-yellow-500 text-background" />
        </TimelineDot>
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Testing - Blocked</TimelineTitle>
            <TimelineTime dateTime="2024-03-01">March 1, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Waiting for development completion before testing can begin.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot>
          <Circle className="size-2 fill-border text-background" />
        </TimelineDot>
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Deployment</TimelineTitle>
            <TimelineTime dateTime="2024-03-15">March 15, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Final deployment to production environment.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
