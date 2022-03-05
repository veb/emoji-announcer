import bolt from "@slack/bolt";
import { addEmojiChangedEventHandler } from "./emoji_changed/index.js";

export const addEventHandlers = (app: bolt.App) => {
  addEmojiChangedEventHandler(app);
};
