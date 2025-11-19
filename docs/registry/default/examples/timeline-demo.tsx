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

export default function TimelineDemo() {
  return (
    <Timeline defaultValue="development">
      <TimelineItem value="kickoff">
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Project Kickoff</TimelineTitle>
            <TimelineTime dateTime="2024-01-15">January 15, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Initial meeting with stakeholders to define project scope and
            requirements.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem value="design">
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Design Phase</TimelineTitle>
            <TimelineTime dateTime="2024-02-01">February 1, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Created wireframes and mockups for the user interface.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem value="development">
        <TimelineDot />
        <TimelineConnector />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Development</TimelineTitle>
            <TimelineTime dateTime="2024-03-01">March 1, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Building the application with React and TypeScript.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem value="launch">
        <TimelineDot />
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Launch</TimelineTitle>
            <TimelineTime dateTime="2024-04-01">April 1, 2024</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Deploy to production and announce to users.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
