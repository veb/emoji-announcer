import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { Accumulator } from "../../util/index.js";
import { debounceById } from "./debounce.js";
import { getChannels } from "./getChannels.js";
import { parseEmojiChangedEvents } from "./parse.js";

const BATCH_DELAY = Number(process.env.EMOJI_ANNOUNCER_BATCH_DELAY ?? 60e3);
const BATCH_SIZE = Number(process.env.EMOJI_ANNOUNCER_BATCH_SIZE ?? 100);

type EmojiChangedMiddlewareArgs = AllMiddlewareArgs &
  SlackEventMiddlewareArgs<"emoji_changed">;

const events = new Accumulator<string, EmojiChangedMiddlewareArgs>();

/**
 * Sends alerts about emoji_changed events to every channel the bot is in. If there's a real flood of changes, it will
 * send messages in batches.
 * @param id ID of team to send messages to
 */
async function sendMessages(id: string): Promise<void> {
  const batches = events.flush(id);
  const { client } = batches[0];
  const channels = await getChannels(client, id);
  console.log(
    `Reporting ${batches.length} emoji_changed events to ${channels.length} channels in ${id}.`
  );

  while (batches.length) {
    const batch = batches.splice(0, BATCH_SIZE);
    const message = parseEmojiChangedEvents(batch);
    if (!message.text) continue;
    console.log(`Sending to ${id}:`, message);
    for (const channel of channels) {
      await client.chat.postMessage({
        ...message,
        channel,
      });
    }
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
  debounceById(id, sendMessages, BATCH_DELAY, id);
  console.log(`Received emoji ${type} event in ${id}.`);
}
