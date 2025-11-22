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
    dateTime: "2024-01-15",
    date: "January 15, 2024",
    title: "Project Kickoff",
    description:
      "Initial meeting with stakeholders to define project scope and requirements.",
  },
  {
    id: 2,
    dateTime: "2024-02-01",
    date: "February 1, 2024",
    title: "Design Phase",
    description: "Created wireframes and mockups for the user interface.",
  },
  {
    id: 3,
    dateTime: "2024-03-01",
    date: "March 1, 2024",
    title: "Development",
    description: "Building the application with React and TypeScript.",
  },
  {
    id: 4,
    dateTime: "2024-04-01",
    date: "April 1, 2024",
    title: "Testing",
    description: "Comprehensive testing across all features and browsers.",
  },
  {
    id: 5,
    dateTime: "2024-05-01",
    date: "May 1, 2024",
    title: "Launch",
    description: "Deploy to production and announce to users.",
  },
];

export default function TimelineAlternateDemo() {
  return (
    <Timeline variant="alternate" activeIndex={3}>
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
