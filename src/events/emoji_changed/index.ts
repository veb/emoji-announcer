import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { batchalyze } from "../../util/index.js";
import { sendMessages } from "./sendMessages.js";

// Ideally, the batch delay would be shorter, as I'd expect most users take less than a minute to upload consecutive
// emoji. However, Slack sends duplicate events if the app doesn't respond within 3 seconds, which is longer than the
// app takes to boot from idle on Heroku. As a result, the app receives 3 duplicate events, and the last ~60s after the
// first. The best solution would be to improve app start time to less than 3 seconds, but the easy solution is to just
// increase the batch delay and dedupe the events.
// TODO: Now that the app is deployed on Railway, can the delay be reduced?
const BATCH_DELAY = Number(process.env.EMOJI_ANNOUNCER_BATCH_DELAY ?? 65e3);
const BATCH_SIZE = Number(process.env.EMOJI_ANNOUNCER_BATCH_SIZE ?? 100);
const batchedSendMessages = batchalyze({
  batchDelay: BATCH_DELAY,
  batchSize: BATCH_SIZE,
  callback: sendMessages,
  dedupe: (a, b) => a.body.event_id === b.body.event_id,
});

/**
 * Parses emoji_changed events and send alerts to every channel the bot is in
 * @param event Slack emoji_changed event
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
    `Received event ${event.body.event_id} (emoji ${type} event) in ${id}. Waiting ${BATCH_DELAY} ms...`
  );
  await batchedSendMessages(id, event);
}
