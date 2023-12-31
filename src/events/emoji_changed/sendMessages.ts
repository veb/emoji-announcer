import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { getChannels } from "./getChannels.js";
import { parseEmojiChangedEvents } from "./parseEvents.js";

/**
 * Sends alerts about emoji_changed events to every channel the bot is in.
 * @param id ID of team to send messages to
 * @param events List of Slack emoji_changed events to send messages about
 */
export async function sendMessages(
  id: string,
  events: Array<SlackEventMiddlewareArgs<"emoji_changed"> & AllMiddlewareArgs>
): Promise<void> {
  if (events.length === 0) return;
  const { client } = events[0];
  const channels = await getChannels(client, id);
  console.log(
    `Reporting ${events.length} emoji_changed events to ${channels.length} channels in ${id}.`
  );
  if (!channels.length) return;
  const message = parseEmojiChangedEvents(events);
  if (!message.text) return;
  console.log(`Sending to ${id}:`, message);
  for (const channel of channels) {
    await client.chat.postMessage({
      ...message,
      channel,
    });
  }
}
