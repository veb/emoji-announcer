import type {
  AllMiddlewareArgs,
  EmojiChangedEvent,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { getChannels } from "./getChannels.js";

// `EmojiChangedEvent` doesn't specify what's present for which subtype.
// See: https://api.slack.com/events/emoji_changed
type Subtype<
  Sub extends EmojiChangedEvent["subtype"],
  Props extends keyof EmojiChangedEvent
> = { subtype: Sub } & Required<
  Pick<EmojiChangedEvent, "type" | "event_ts" | Props>
>;
type EmojiAddedEvent = Subtype<"add", "name" | "value">;
type EmojiRemovedEvent = Subtype<"remove", "names">;
type EmojiRenamedEvent = Subtype<"rename", "new_name" | "old_name" | "value">;

const isEmojiAddedEvent = (e: EmojiChangedEvent): e is EmojiAddedEvent =>
  e?.subtype === "add";
const isEmojiRemovedEvent = (e: EmojiChangedEvent): e is EmojiRemovedEvent =>
  e?.subtype === "remove";
const isEmojiRenamedEvent = (e: EmojiChangedEvent): e is EmojiRenamedEvent =>
  e?.subtype === "rename";

const colonize = (str: string | undefined): string => (str ? `:${str}:` : "");
const codify = (str: string | undefined): string => (str ? `\`${str}\`` : "");
const unalias = (str: string | undefined): string => (str ? str.slice(6) : "");
const isAlias = (str: string | undefined): boolean =>
  typeof str === "string" && str.slice(0, 6) === "alias:";

/**
 * Handle a Slack emoji changed event
 * @param event Slack event object
 * @returns Boolean indicating whether the event was handled
 */
export async function onEmojiChanged({
  body,
  client,
  payload,
}: SlackEventMiddlewareArgs<"emoji_changed"> &
  AllMiddlewareArgs): Promise<void> {
  let text = "";
  let icon: string | undefined = undefined;

  if (isEmojiAddedEvent(payload)) {
    const emoji = colonize(payload.name);
    const escaped = codify(emoji);
    const url = payload.value;
    icon = payload.name;
    if (isAlias(url)) {
      const original = codify(colonize(unalias(url)));
      text = `New emoji alias: ${emoji} ${escaped} (alias for ${original})`;
    } else {
      text = `New emoji: ${emoji} ${escaped}`;
    }
  } else if (isEmojiRemovedEvent(payload)) {
    const removed = payload.names
      .map((name) => codify(colonize(name)))
      .join(" ");
    text = `Emoji removed: ${removed}`;
  } else if (isEmojiRenamedEvent(payload)) {
    const emoji = colonize(payload.new_name);
    const escaped = codify(emoji);
    const prev = codify(colonize(payload.old_name));
    text = `Emoji name changed: ${emoji} ${escaped} (was ${prev})`;
    icon = payload.new_name;
  } else {
    console.error("Unknown emoji event?", body);
    return;
  }

  for await (const channel of getChannels(client, body.team_id)) {
    await client.chat.postMessage({
      channel,
      text,
      icon_emoji: icon,
    });
  }
}
