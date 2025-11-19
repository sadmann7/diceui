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

export default function TimelineHorizontalDemo() {
  return (
    <Timeline orientation="horizontal">
      <TimelineItem>
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Q1</TimelineTitle>
            <TimelineTime dateTime="2024-01">Jan - Mar</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>Research and planning phase</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Q2</TimelineTitle>
            <TimelineTime dateTime="2024-04">Apr - Jun</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>Development and testing</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem active>
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Q3</TimelineTitle>
            <TimelineTime dateTime="2024-07">Jul - Sep</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>Beta release</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Q4</TimelineTitle>
            <TimelineTime dateTime="2024-10">Oct - Dec</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>Public launch</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
