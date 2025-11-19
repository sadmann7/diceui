import * as Timeline from "@/registry/default/ui/timeline";

export default function TimelineAlternateDemo() {
  return (
    <Timeline.Root position="alternate">
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Founded</Timeline.Title>
            <Timeline.Time dateTime="2020-01">January 2020</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Company established with a vision to revolutionize the industry.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>First Product Launch</Timeline.Title>
            <Timeline.Time dateTime="2020-06">June 2020</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Released our flagship product to the market.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Series A Funding</Timeline.Title>
            <Timeline.Time dateTime="2021-03">March 2021</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Secured $10M in Series A funding to expand operations.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>International Expansion</Timeline.Title>
            <Timeline.Time dateTime="2022-01">January 2022</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Opened offices in Europe and Asia Pacific.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item active>
        <Timeline.Dot />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>1 Million Users</Timeline.Title>
            <Timeline.Time dateTime="2024-03">March 2024</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Reached the milestone of 1 million active users worldwide.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline.Root>
  );
}
