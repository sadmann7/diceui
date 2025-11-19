import * as Timeline from "@/registry/default/ui/timeline";

export default function TimelineDemo() {
  return (
    <Timeline.Root>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Project Kickoff</Timeline.Title>
            <Timeline.Time dateTime="2024-01-15">
              January 15, 2024
            </Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Initial meeting with stakeholders to define project scope and
            requirements.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Design Phase</Timeline.Title>
            <Timeline.Time dateTime="2024-02-01">
              February 1, 2024
            </Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Created wireframes and mockups for the user interface.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item active>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Development</Timeline.Title>
            <Timeline.Time dateTime="2024-03-01">March 1, 2024</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Building the application with React and TypeScript.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Launch</Timeline.Title>
            <Timeline.Time dateTime="2024-04-01">April 1, 2024</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Deploy to production and announce to users.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline.Root>
  );
}
