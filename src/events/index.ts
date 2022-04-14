import type { App, InstallationStore } from "@slack/bolt";
import { onAppUninstalled } from "./app_uninstalled/index.js";
import { onEmojiChanged } from "./emoji_changed/index.js";

/**
 * Adds event handlers to an app
 * @param app Slack app
 * @param store Installation store used by the app because it's not directly accessible :\
 */
export const addEventHandlers = (app: App, store: InstallationStore) => {
  // The installation store is attached to the app, but only via the private `receiver` property :\
  app.event("app_uninstalled", (event) => onAppUninstalled(event, store));
  app.event(
    "emoji_changed",
    // The handler is sync, but bolt wants it to be async and eslint is particular about fake async
    async (event) => await Promise.resolve(onEmojiChanged(event))
  );
};
