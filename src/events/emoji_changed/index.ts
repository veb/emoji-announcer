import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { Accumulator } from "../../util/index.js";
import { debounceById } from "./debounce.js";
import { getChannels } from "./getChannels.js";
import { parseEmojiChangedEvents } from "./parse.js";

const BATCH_DELAY = Number(process.env.EMOJI_ANNOUNCER_BATCH_DELAY ?? 60e3);

type EmojiChangedMiddlewareArgs = AllMiddlewareArgs &
  SlackEventMiddlewareArgs<"emoji_changed">;

const events = new Accumulator<string, EmojiChangedMiddlewareArgs>();

/**
 * Sends an alert about emoji_changed events to every channel the bot is in.
 * @param id Team ID to send messages for
 * @returns
 */
async function sendMessages(id: string) {
  const batch = events.flush(id);
  const message = parseEmojiChangedEvents(batch);
  if (!message.text) return; // Nothing to say
  const { client } = batch[0];
  for await (const channel of getChannels(client, id)) {
    await client.chat.postMessage({
      ...message,
      channel,
    });
  }
}

/**
 * Parse emoji_changed events and send alerts to every channel the bot is in
 * @param event Slack event object
 */
export function onEmojiChanged(event: EmojiChangedMiddlewareArgs): void {
  const type = event.payload.subtype;
  if (type !== "add" && type !== "remove" && type !== "rename") {
    // `type` is `never` in this block, but we're guarding against unknown changes to the API
    console.error(`Unknown emoji_changed subtype: ${type as string}`, event);
    return;
  }
  const id = event.body.team_id;
  events.append(id, event);
}
