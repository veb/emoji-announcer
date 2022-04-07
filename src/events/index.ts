import type { App } from "@slack/bolt";
import { onEmojiChanged } from "./emoji_changed/index.js";

export const addEventHandlers = (app: App) => {
  app.event(
    "emoji_changed",
    // The handler is sync, but bolt wants it to be async and eslint is particular about fake async
    async (event) => await Promise.resolve(onEmojiChanged(event))
  );
};
