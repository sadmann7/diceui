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
    id: "company-founded",
    dateTime: "2020-06",
    date: "June 2020",
    title: "Company Founded",
    description: "Started with a team of five.",
  },
  {
    id: "series-a-funding",
    dateTime: "2021-03",
    date: "March 2021",
    title: "Series A Funding",
    description: "Raised $10M seed funding.",
  },
  {
    id: "product-launch",
    dateTime: "2022-01",
    date: "January 2022",
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
