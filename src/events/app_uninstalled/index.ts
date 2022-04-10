import {
  AllMiddlewareArgs,
  HTTPReceiver,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";

export async function onAppUninstalled(
  event: SlackEventMiddlewareArgs<"app_uninstalled"> & AllMiddlewareArgs
) {
  // `receiver` is a private prop on the client, so we need the assertion to access it without complaint.
  // I think this is the only way to access the installation store without passing it ourselves, which could get messy.
  const client = event.client as { receiver?: HTTPReceiver };
  if (!client.receiver) {
    // Playing it safe in case the private interface changes!
    throw new Error("Client has no receiver?");
  }
  console.log("Uninstalling", event.body);
  await client.receiver.installer?.installationStore?.deleteInstallation?.({
    enterpriseId: event.body.enterprise_id,
    isEnterpriseInstall: Boolean(event.body.enterprise_id),
    teamId: event.body.team_id,
  });
}
