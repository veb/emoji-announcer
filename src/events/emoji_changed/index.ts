import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { getChannels } from "./getChannels.js";
import { parseEmojiChangedEvent } from "./parse.js";

/**
 * Parse emoji_changed events and send alerts to every channel the bot is in
 * @param event Slack event object
 */
export async function onEmojiChanged(
  event: SlackEventMiddlewareArgs<"emoji_changed"> & AllMiddlewareArgs
): Promise<void> {
  const { icon, text } = parseEmojiChangedEvent(event);
  if (!text) return; // Nothing to say about this event
  const { body, client } = event;

  for await (const channel of getChannels(client, body.team_id)) {
    await client.chat.postMessage({
      channel,
      text,
      icon_emoji: icon,
    });
  }
}
