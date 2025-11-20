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
    dateTime: "2024-01-15",
    date: "January 15, 2024",
    title: "Project Kickoff",
    description:
      "Initial meeting with stakeholders to define project scope and requirements.",
  },
  {
    id: 2,
    completed: true,
    dateTime: "2024-02-01",
    date: "February 1, 2024",
    title: "Design Phase",
    description: "Created wireframes and mockups for the user interface.",
  },
  {
    id: 3,
    completed: true,
    dateTime: "2024-03-01",
    date: "March 1, 2024",
    title: "Development",
    description: "Building the application with React and TypeScript.",
  },
  {
    id: 4,
    completed: false,
    dateTime: "2024-04-01",
    date: "April 1, 2024",
    title: "Launch",
    description: "Deploy to production and announce to users.",
  },
];

export default function TimelineDemo() {
  return (
    <Timeline>
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
