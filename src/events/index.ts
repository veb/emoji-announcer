import type { App } from "@slack/bolt";
import { onEmojiChanged } from "./emoji_changed/index.js";

export const addEventHandlers = (app: App) => {
  app.event("emoji_changed", onEmojiChanged);
};
