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
} from "@/registry/bases/radix/ui/timeline";

const timelineItems = [
  {
    id: "project-kickoff",
    dateTime: "2025-01-15",
    date: "January 15, 2025",
    title: "Project Kickoff",
    description: "Initial meeting to define scope.",
  },
  {
    id: "design-phase",
    dateTime: "2025-02-01",
    date: "February 1, 2025",
    title: "Design Phase",
    description: "Created wireframes and mockups.",
  },
  {
    id: "development",
    dateTime: "2025-03-01",
    date: "March 1, 2025",
    title: "Development",
    description: "Building core features.",
  },
];

export default function TimelineDemo() {
  return (
    <Timeline activeIndex={1}>
      {timelineItems.map((item) => (
        <TimelineItem key={item.id}>
          <TimelineDot />
          <TimelineConnector />
          <TimelineContent>
            <TimelineHeader>
              <TimelineTime dateTime={item.dateTime}>{item.date}</TimelineTime>
              <TimelineTitle>{item.title}</TimelineTitle>
            </TimelineHeader>
            <TimelineDescription>{item.description}</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
