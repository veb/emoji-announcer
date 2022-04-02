import type {
  AllMiddlewareArgs,
  EmojiChangedEvent,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";

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

const codify = (str: string): string => str && `\`${str}\``;
const colonize = (str: string): string => str && `:${str}:`;
const isAlias = (str: string): boolean => str.startsWith("alias:");
const unalias = (str: string): string => str && str.slice(6);

export function parseEmojiChangedEvent({
  body,
  payload,
}: SlackEventMiddlewareArgs<"emoji_changed"> & AllMiddlewareArgs): {
  text?: string;
  icon?: string;
} {
  if (isEmojiAddedEvent(payload)) {
    const emoji = colonize(payload.name);
    const escaped = codify(emoji);
    const url = payload.value;
    let text: string;
    if (isAlias(url)) {
      const original = codify(colonize(unalias(url)));
      text = `New emoji alias: ${emoji} ${escaped} (alias for ${original})`;
    } else {
      text = `New emoji: ${emoji} ${escaped}`;
    }
    return { text, icon: payload.name };
  } else if (isEmojiRemovedEvent(payload)) {
    const removed = payload.names
      .map((name) => codify(colonize(name)))
      .join(" ");
    return { text: `Emoji removed: ${removed}` };
  } else if (isEmojiRenamedEvent(payload)) {
    const emoji = colonize(payload.new_name);
    const escaped = codify(emoji);
    const prev = codify(colonize(payload.old_name));
    return {
      text: `Emoji name changed: ${emoji} ${escaped} (was ${prev})`,
      icon: payload.new_name,
    };
  } else {
    console.error("Unknown emoji event?", body);
    return {};
  }
}
