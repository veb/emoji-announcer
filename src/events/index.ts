import { App } from "@slack/bolt";
import { addEmojiChangedEventHandler } from "./emoji_changed";

export const addEventHandlers = (app: App) => {
  addEmojiChangedEventHandler(app);
};
