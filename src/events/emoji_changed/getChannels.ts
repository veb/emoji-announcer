import type { WebClient } from "@slack/web-api";

/**
 * Gets the full list of channels that the bot is in for the given team.
 * @param client Slack web client
 * @param team Slack team ID
 * @returns List of channel IDs
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
