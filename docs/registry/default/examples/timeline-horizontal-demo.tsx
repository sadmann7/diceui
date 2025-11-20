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

const timelineItems = [
  {
    id: 1,
    completed: true,
    dateTime: "2024-01",
    date: "Jan - Mar",
    title: "Q1",
    description: "Research and planning phase",
  },
  {
    id: 2,
    completed: true,
    dateTime: "2024-04",
    date: "Apr - Jun",
    title: "Q2",
    description: "Development and testing",
  },
  {
    id: 3,
    completed: true,
    dateTime: "2024-07",
    date: "Jul - Sep",
    title: "Q3",
    description: "Beta release",
  },
  {
    id: 4,
    completed: false,
    dateTime: "2024-10",
    date: "Oct - Dec",
    title: "Q4",
    description: "Public launch",
  },
];

export default function TimelineHorizontalDemo() {
  return (
    <Timeline orientation="horizontal">
      {timelineItems.map((item) => (
        <TimelineItem key={item.id} completed={item.completed}>
          <TimelineDot />
          <TimelineConnector />
          <TimelineContent>
            <TimelineHeader>
              <TimelineTitle>{item.title}</TimelineTitle>
              <TimelineTime dateTime={item.dateTime}>{item.date}</TimelineTime>
            </TimelineHeader>
            <TimelineDescription>{item.description}</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
