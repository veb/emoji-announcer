import type { WebClient } from "@slack/web-api";
import type { Channel } from "@slack/web-api/dist/response/UsersConversationsResponse";

class ChannelError extends Error {
  constructor(message: string, public channel: Channel) {
    super(message);
  }
}

/**
 * This method assumes that (a) emoji are added infrequently, so the API call to get channels will be done infrequently,
 * and (2) the bot will only be added to a handful of channels per workspace, so it should only take one API call. With
 * the default batch delay, this should only be called at most once per minute per team.
 * @param client
 * @param team
 */
export async function* getChannels(
  client: WebClient,
  team: string
): AsyncGenerator<string, void, unknown> {
  let cursor = "";
  do {
    const response = await client.users.conversations({
      exclude_archived: true,
      limit: 1000,
      team_id: team,
      types: "public_channel,private_channel",
    });
    cursor = response.response_metadata?.next_cursor ?? "";
    for (const channel of response.channels ?? []) {
      if (channel.id) yield channel.id;
      else throw new ChannelError(`Channel is missing ID.`, channel);
    }
  } while (cursor !== "");
}
