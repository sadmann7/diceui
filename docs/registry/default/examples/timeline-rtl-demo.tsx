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
    id: "registration-opened",
    dateTime: "2024-01-01",
    date: "January 1, 2024",
    title: "Registration Opened",
    description: "Online registration portal opens.",
  },
  {
    id: "early-bird-deadline",
    dateTime: "2024-02-15",
    date: "February 15, 2024",
    title: "Early Bird Deadline",
    description: "Last day for early bird pricing.",
  },
  {
    id: "event-day",
    dateTime: "2024-03-01",
    date: "March 1, 2024",
    title: "Event Day",
    description: "Main event begins at 9:00 AM.",
  },
];

export default function TimelineRtlDemo() {
  return (
    <Timeline dir="rtl" activeIndex={1}>
      {timelineItems.map((item) => (
        <TimelineItem key={item.id}>
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
