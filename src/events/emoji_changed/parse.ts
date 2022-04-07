import type {
  AllMiddlewareArgs,
  EmojiChangedEvent,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { ChatPostMessageArguments } from "@slack/web-api";

type EmojiChangedMiddlewareArgs = AllMiddlewareArgs &
  SlackEventMiddlewareArgs<"emoji_changed">;

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

/**
 * Writes a sentence about the emoji_changed event
 * @param event - Single emoji_changed event
 * @returns Human-readable string describing the event
 */
export function getEventSummary({
  payload,
}: EmojiChangedMiddlewareArgs): string {
  if (isEmojiAddedEvent(payload)) {
    const emojified = colonize(payload.name);
    const escaped = codify(emojified);
    const url = payload.value;
    if (isAlias(url)) {
      const original = codify(colonize(unalias(url)));
      return `New emoji alias: ${emojified} ${escaped} (alias for ${original})`;
    } else {
      return `New emoji: ${emojified} ${escaped}`;
    }
  } else if (isEmojiRemovedEvent(payload)) {
    const removed = payload.names
      .map((name) => codify(colonize(name)))
      .join(" ");
    return `Emoji removed: ${removed}`;
  } else if (isEmojiRenamedEvent(payload)) {
    const emojified = colonize(payload.new_name);
    const escaped = codify(emojified);
    const prev = codify(colonize(payload.old_name));
    return `Emoji name changed: ${emojified} ${escaped} (was ${prev})`;
  } else {
    // This case should never happen, as it should already be guarded against in the event handler
    const type = payload.subtype;
    return `Slack told me about an event called "${type}", but I don't know what that means.`;
  }
}

/**
 * Finds the last emoji in the batch that was not deleted or renamed
 * @param events Batch of emoji_changed events
 * @returns Name of a new emoji
 */
export function findUsableIcon(
  events: EmojiChangedMiddlewareArgs[]
): string | undefined {
  // Track emoji that were removed or renamed, because they won't work as icons
  const skip = new Set<string>();
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const { payload } = events[i];
    if (isEmojiAddedEvent(payload)) {
      // Return added emoji if it doesn't get removed later in the batch
      if (!skip.has(payload.name)) return payload.name;
    } else if (isEmojiRemovedEvent(payload)) {
      // Add removed emoji to skip list because it's no longer valid
      payload.names.forEach((name) => skip.add(name));
    } else if (isEmojiRenamedEvent(payload)) {
      // Use new name if it doesn't get removed later in the batch
      if (!skip.has(payload.new_name)) return payload.new_name;
      // Add old name to skip list because it's no longer valid
      skip.add(payload.old_name);
    }
  }
}

/**
 * Parses a list of emoji_payload events into a Slack message
 * @param events Batch of emoji_changed events
 * @returns Parsed message to send to Slack
 */
export function parseEmojiChangedEvents(
  events: EmojiChangedMiddlewareArgs[]
): Omit<ChatPostMessageArguments, "channel"> {
  if (events.length === 0) return {};
  const text = events.map((event) => getEventSummary(event)).join("\n");
  const icon = findUsableIcon(events);
  return {
    text,
    ...(icon && { icon_emoji: icon }),
  };
}
