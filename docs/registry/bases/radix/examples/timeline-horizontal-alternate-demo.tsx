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
    id: "company-founded",
    dateTime: "2023-06",
    date: "June 2023",
    title: "Company Founded",
    description: "Started with a team of five.",
  },
  {
    id: "series-a-funding",
    dateTime: "2024-03",
    date: "March 2024",
    title: "Series A Funding",
    description: "Raised $10M seed funding.",
  },
  {
    id: "product-launch",
    dateTime: "2025-01",
    date: "January 2025",
    title: "Product Launch",
    description: "Released MVP to beta testers.",
  },
];

export default function TimelineHorizontalAlternateDemo() {
  return (
    <Timeline variant="alternate" orientation="horizontal" activeIndex={1}>
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
