import * as Timeline from "@/registry/default/ui/timeline";

export default function TimelineHorizontalDemo() {
  return (
    <Timeline.Root orientation="horizontal">
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Q1</Timeline.Title>
            <Timeline.Time dateTime="2024-01">Jan - Mar</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Research and planning phase
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Q2</Timeline.Title>
            <Timeline.Time dateTime="2024-04">Apr - Jun</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>Development and testing</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item active>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Q3</Timeline.Title>
            <Timeline.Time dateTime="2024-07">Jul - Sep</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>Beta release</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Q4</Timeline.Title>
            <Timeline.Time dateTime="2024-10">Oct - Dec</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>Public launch</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline.Root>
  );
}
