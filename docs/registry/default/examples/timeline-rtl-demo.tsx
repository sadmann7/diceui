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

export default function TimelineRtlDemo() {
  return (
    <Timeline dir="rtl">
      <TimelineItem>
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Registration Opened</TimelineTitle>
            <TimelineTime dateTime="2024-01-01">January 1, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Online registration portal is now open for all participants.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Early Bird Deadline</TimelineTitle>
            <TimelineTime dateTime="2024-02-15">February 15, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Last day to register and receive early bird discount.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem active>
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Regular Registration</TimelineTitle>
            <TimelineTime dateTime="2024-03-01">March 1, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Regular registration period with standard pricing.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Event Day</TimelineTitle>
            <TimelineTime dateTime="2024-04-01">April 1, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            The main event begins at 9:00 AM. Check-in starts at 8:00 AM.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
