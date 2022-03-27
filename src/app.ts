import bolt from "@slack/bolt";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import SequelizeInstallationStore from "slack-bolt-sequelize";
import { addEventHandlers } from "./events/index.js";
import { ensureEnv } from "./util/index.js";

dotenv.config();
ensureEnv(process.env, "DATABASE_URL");
ensureEnv(process.env, "PORT");
ensureEnv(process.env, "SLACK_CLIENT_ID");
ensureEnv(process.env, "SLACK_CLIENT_SECRET");
ensureEnv(process.env, "SLACK_SIGNING_SECRET");
ensureEnv(process.env, "SLACK_STATE_SECRET");

export const app = new bolt.App({
  developerMode: process.env.SLACK_DEVELOPER_MODE === "true",
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  installationStore: new SequelizeInstallationStore.SequelizeInstallationStore({
    clientId: process.env.SLACK_CLIENT_ID,
    sequelize: new Sequelize(process.env.DATABASE_URL),
  }),
  scopes: [
    "channels:read",
    "chat:write",
    "chat:write.customize",
    "emoji:read",
    "groups:read",
  ],
});

addEventHandlers(app);

await app.start(Number(process.env.PORT));
console.log("Up and running!");
