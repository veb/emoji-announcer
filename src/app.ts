import bolt from "@slack/bolt";
import dotenv from "dotenv";
import { addEventHandlers } from "./events/index.js";
import { ensureEnv } from "./util/index.js";

dotenv.config();
ensureEnv(process.env, "SLACK_BOT_TOKEN");
ensureEnv(process.env, "SLACK_SIGNING_SECRET");
ensureEnv(process.env, "PORT");

export const app = new bolt.App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

addEventHandlers(app);

await app.start(Number(process.env.PORT));
console.log("Up and running!");
