import { CheckCircle2, Clock } from "lucide-react";
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
    <div className="flex flex-col gap-8">
      <Timeline variant="primary">
        <TimelineItem active>
          <TimelineDot>
            <Clock className="size-2 fill-primary text-background" />
          </TimelineDot>
          <TimelineConnector />
          <TimelineContent>
            <TimelineHeader>
              <TimelineTitle>Development In Progress</TimelineTitle>
              <TimelineTime dateTime="2024-02-15">
                February 15, 2024
              </TimelineTime>
            </TimelineHeader>
            <TimelineDescription>
              Currently implementing core features and functionality.
            </TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      </Timeline>

      <Timeline variant="success">
        <TimelineItem>
          <TimelineDot>
            <CheckCircle2 className="size-2 fill-green-500 text-background" />
          </TimelineDot>
          <TimelineConnector />
          <TimelineContent>
            <TimelineHeader>
              <TimelineTitle>Requirements Gathered</TimelineTitle>
              <TimelineTime dateTime="2024-01-10">
                January 10, 2024
              </TimelineTime>
            </TimelineHeader>
            <TimelineDescription>
              All project requirements have been documented and approved.
            </TimelineDescription>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineDot>
            <CheckCircle2 className="size-2 fill-green-500 text-background" />
          </TimelineDot>
          <TimelineConnector />
          <TimelineContent>
            <TimelineHeader>
              <TimelineTitle>Design Completed</TimelineTitle>
              <TimelineTime dateTime="2024-01-25">
                January 25, 2024
              </TimelineTime>
            </TimelineHeader>
            <TimelineDescription>
              UI/UX design finalized and ready for development.
            </TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
