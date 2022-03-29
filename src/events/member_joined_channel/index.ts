import type { App, SlackEventMiddlewareArgs } from "@slack/bolt";

// eslint-disable-next-line @typescript-eslint/require-await
async function onMemberJoinedChannel(
  event: SlackEventMiddlewareArgs<"member_joined_channel">
) {
  console.log("event", event);
  console.log("json", JSON.stringify(event));
  console.log("payload", event.payload);
}

export function addMemberJoinedChannelEventHandler(app: App) {
  app.event("member_joined_channel", onMemberJoinedChannel);
}
