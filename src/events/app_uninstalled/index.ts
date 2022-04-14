import {
  AllMiddlewareArgs,
  InstallationStore,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";

/**
 * Removes the installation information for the workspace from which the app was uninstalled
 * @param event Slack app_uninstalled event
 * @param store Store to update
 */
export async function onAppUninstalled(
  event: SlackEventMiddlewareArgs<"app_uninstalled"> & AllMiddlewareArgs,
  store: InstallationStore
): Promise<void> {
  console.log("Uninstalling", event.body);
  await store.deleteInstallation?.({
    enterpriseId: event.body.enterprise_id,
    isEnterpriseInstall: Boolean(event.body.enterprise_id),
    teamId: event.body.team_id,
  });
}
