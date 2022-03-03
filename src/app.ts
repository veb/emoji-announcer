import { App } from "@slack/bolt";
import dotenv from "dotenv";
import { addEventHandlers } from "./events";
import { ensureEnv } from "./util";

dotenv.config();
ensureEnv(process.env, "SLACK_BOT_TOKEN");
ensureEnv(process.env, "SLACK_SIGNING_SECRET");
ensureEnv(process.env, "PORT");

export const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

addEventHandlers(app);

await app.start(Number(process.env.PORT));
console.log("Up and running!");
