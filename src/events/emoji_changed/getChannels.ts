import type { WebClient } from "@slack/web-api";

/**
 * This method assumes that (a) emoji are added infrequently, so the API call to get channels will be done infrequently,
 * and (2) the bot will only be added to a handful of channels per workspace, so it should only take one API call. With
 * the default batch delay, this should only be called at most once per minute per team.
 * @param client
 * @param team
 */
export async function getChannels(
  client: WebClient,
  team: string
): Promise<string[]> {
  let cursor = "";
  const channels: string[] = [];
  do {
    const response = await client.users.conversations({
      exclude_archived: true,
      limit: 1000,
      team_id: team,
      types: "public_channel,private_channel",
    });
    cursor = response.response_metadata?.next_cursor ?? "";
    console.log(
      `Found ${response.channels?.length ?? "no"} channels in ${team}.`
    );
    for (const channel of response.channels ?? []) {
      if (channel.id) {
        console.debug(`Found channel ${channel.id ?? "<???>"} in ${team}.`);
        channels.push(channel.id);
      } else {
        throw Object.assign(new Error(`Channel is missing ID.`), { channel });
      }
    }
  } while (cursor !== "");
  return channels;
}
