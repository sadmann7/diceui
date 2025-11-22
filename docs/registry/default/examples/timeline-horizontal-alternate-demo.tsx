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
    dateTime: "2020-06",
    date: "June 2020",
    title: "Company Founded",
    description:
      "Started with a small team of five passionate engineers in a garage.",
  },
  {
    id: 2,
    completed: true,
    dateTime: "2021-03",
    date: "March 2021",
    title: "Series A Funding",
    description:
      "Raised $10M to expand the team and accelerate product development.",
  },
  {
    id: 3,
    completed: true,
    dateTime: "2022-01",
    date: "January 2022",
    title: "Product Launch",
    description:
      "Released our MVP to 1,000 beta testers with overwhelmingly positive feedback.",
  },
  {
    id: 4,
    completed: true,
    dateTime: "2023-08",
    date: "August 2023",
    title: "100K Users",
    description:
      "Reached major milestone of 100,000 active users across 50 countries.",
  },
  {
    id: 5,
    completed: false,
    dateTime: "2024-12",
    date: "December 2024",
    title: "Global Expansion",
    description:
      "Planning to expand operations to Asia-Pacific and European markets.",
  },
];

export default function TimelineHorizontalAlternateDemo() {
  return (
    <Timeline variant="alternate" orientation="horizontal">
      {timelineItems.map((item) => (
        <TimelineItem key={item.id} completed={item.completed}>
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
