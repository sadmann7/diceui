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
    dateTime: "2024-01-01",
    date: "January 1, 2024",
    title: "Registration Opened",
    description: "Online registration portal is now open for all participants.",
  },
  {
    id: 2,
    dateTime: "2024-02-15",
    date: "February 15, 2024",
    title: "Early Bird Deadline",
    description: "Last day to register and receive early bird discount.",
  },
  {
    id: 3,
    dateTime: "2024-03-01",
    date: "March 1, 2024",
    title: "Regular Registration",
    description: "Regular registration period with standard pricing.",
  },
  {
    id: 4,
    dateTime: "2024-04-01",
    date: "April 1, 2024",
    title: "Event Day",
    description:
      "The main event begins at 9:00 AM. Check-in starts at 8:00 AM.",
  },
];

export default function TimelineRtlDemo() {
  return (
    <Timeline dir="rtl" activeStep={3}>
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
