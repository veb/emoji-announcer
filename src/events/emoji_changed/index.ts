import { App, EmojiChangedEvent, SlackEventMiddlewareArgs } from "@slack/bolt";
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
export const addEmojiChangedEventHandler = (app: App) => {
  app.event(
    "emoji_changed",
    async function onEmojiChanged({
      event,
      body,
    }: SlackEventMiddlewareArgs<"emoji_changed">): Promise<void> {
      let text = "";
      let icon: string | undefined = undefined;

      if (isEmojiAddedEvent(event)) {
        const emoji = colonize(event.name);
        const escaped = codify(emoji);
        const url = event.value;
        icon = event.name;
        if (isAlias(url)) {
          const original = codify(colonize(unalias(url)));
          text = `New emoji alias: ${emoji} ${escaped} (alias for ${original})`;
        } else {
          text = `New emoji: ${emoji} ${escaped}`;
        }
      } else if (isEmojiRemovedEvent(event)) {
        const removed = event.names
          .map((name) => codify(colonize(name)))
          .join(" ");
        text = `Emoji removed: ${removed}`;
      } else if (isEmojiRenamedEvent(event)) {
        const emoji = colonize(event.new_name);
        const escaped = codify(emoji);
        const prev = codify(colonize(event.old_name));
        text = `Emoji name changed: ${emoji} ${escaped} (was ${prev})`;
        icon = event.new_name;
      } else {
        console.error("Unknown emoji event?", body);
        return;
      }

      for await (const channel of getChannels(app, body.team_id)) {
        await app.client.chat.postMessage({
          channel,
          text,
          icon_emoji: icon,
        });
      }
    }
  );
};
