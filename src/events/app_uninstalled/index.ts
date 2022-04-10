import {
  AllMiddlewareArgs,
  InstallationStore,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";

export async function onAppUninstalled(
  event: SlackEventMiddlewareArgs<"app_uninstalled"> & AllMiddlewareArgs,
  store: InstallationStore
) {
  console.log("Uninstalling", event.body);
  await store.deleteInstallation?.({
    enterpriseId: event.body.enterprise_id,
    isEnterpriseInstall: Boolean(event.body.enterprise_id),
    teamId: event.body.team_id,
  });
}
