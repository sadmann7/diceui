import * as Timeline from "@/registry/default/ui/timeline";

export default function TimelineRightDemo() {
  return (
    <Timeline.Root position="right">
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Registration Opened</Timeline.Title>
            <Timeline.Time dateTime="2024-01-01">January 1, 2024</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Online registration portal is now open for all participants.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Early Bird Deadline</Timeline.Title>
            <Timeline.Time dateTime="2024-02-15">
              February 15, 2024
            </Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Last day to register and receive early bird discount.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item active>
        <Timeline.Dot />
        <Timeline.Connector />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Regular Registration</Timeline.Title>
            <Timeline.Time dateTime="2024-03-01">March 1, 2024</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            Regular registration period with standard pricing.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Dot />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Event Day</Timeline.Title>
            <Timeline.Time dateTime="2024-04-01">April 1, 2024</Timeline.Time>
          </Timeline.Header>
          <Timeline.Description>
            The main event begins at 9:00 AM. Check-in starts at 8:00 AM.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline.Root>
  );
}
