import bolt from "@slack/bolt";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import SequelizeInstallationStore from "slack-bolt-sequelize";
import { addEventHandlers } from "./events/index.js";
import { ensureEnv } from "./util/index.js";

dotenv.config();
ensureEnv(process.env, [
  "DATABASE_URL",
  "PORT",
  "SLACK_APP_SCOPES",
  "SLACK_CLIENT_ID",
  "SLACK_CLIENT_SECRET",
  "SLACK_SIGNING_SECRET",
  "SLACK_STATE_SECRET",
] as const);
// SLACK_DEVELOPER_MODE is also checked, but is not required

const installationStore =
  new SequelizeInstallationStore.SequelizeInstallationStore({
    clientId: process.env.SLACK_CLIENT_ID,
    sequelize: new Sequelize(process.env.DATABASE_URL),
  });

export const app = new bolt.App({
  developerMode: process.env.SLACK_DEVELOPER_MODE === "true",
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  installationStore,
  installerOptions: {
    directInstall: true,
  },
  scopes: process.env.SLACK_APP_SCOPES.split(","),
});

addEventHandlers(app, installationStore);

await app.start(Number(process.env.PORT));
console.log("Up and running!");
