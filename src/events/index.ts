import type { App } from "@slack/bolt";
import { addMemberJoinedChannelEventHandler } from "./member_joined_channel/index.js";
import { addEmojiChangedEventHandler } from "./emoji_changed/index.js";

export const addEventHandlers = (app: App) => {
  addMemberJoinedChannelEventHandler(app);
  addEmojiChangedEventHandler(app);
};
