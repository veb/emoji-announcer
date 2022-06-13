import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { batchalyze } from "../../util/index.js";
import { sendMessages } from "./sendMessages.js";

const BATCH_DELAY = Number(process.env.EMOJI_ANNOUNCER_BATCH_DELAY ?? 30e3);
const BATCH_SIZE = Number(process.env.EMOJI_ANNOUNCER_BATCH_SIZE ?? 100);
const batchedSendMessages = batchalyze({
  batchDelay: BATCH_DELAY,
  batchSize: BATCH_SIZE,
  callback: sendMessages,
  // This app is deployed to Heroku. It often goes idle, and is booted when it receives an event. The app will store the
  // event, but the response time while booting is evidently too long for Slack, and Slack sends duplicate events. To
  // avoid sending 3 notifications for the first event that restarted the app, we need to pass a method to dedupe them.
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
    `Received emoji ${type} event in ${id}. Waiting ${BATCH_DELAY} ms...`
  );
  await batchedSendMessages(id, event);
}
