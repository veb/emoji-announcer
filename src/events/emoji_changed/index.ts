import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { Batchalyzer } from "../../util/index.js";
import { sendMessages } from "./sendMessages.js";

const BATCH_DELAY = Number(process.env.EMOJI_ANNOUNCER_BATCH_DELAY ?? 30e3);
const BATCH_SIZE = Number(process.env.EMOJI_ANNOUNCER_BATCH_SIZE ?? 100);

const batchalyzer = new Batchalyzer(sendMessages, BATCH_DELAY, BATCH_SIZE);

/**
 * Parse emoji_changed events and send alerts to every channel the bot is in
 * @param event Slack event object
 */
export async function onEmojiChanged(
  event: SlackEventMiddlewareArgs<"emoji_changed"> & AllMiddlewareArgs
): Promise<void> {
  const type = event.payload.subtype;
  if (type !== "add" && type !== "remove" && type !== "rename") {
    // `type` is `never` in this block, but we're guarding against unknown changes to the API
    console.error(`Unknown emoji_changed subtype: ${type as string}`, event);
    return;
  }
  const id = event.body.team_id;
  console.log(
    `Received emoji ${type} event in ${id}. Waiting ${BATCH_DELAY} ms...`
  );
  await batchalyzer.add(id, event);
}
