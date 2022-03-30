import type { WebClient } from "@slack/web-api";
import type { Channel } from "@slack/web-api/dist/response/UsersConversationsResponse";

class ChannelError extends Error {
  constructor(message: string, public channel: Channel) {
    super(message);
  }
}

export async function* getChannels(
  client: WebClient,
  team: string
): AsyncGenerator<string, void, unknown> {
  let cursor: string | undefined = "";
  do {
    const response = await client.users.conversations({
      exclude_archived: true,
      limit: 1000,
      team_id: team,
      types: "public_channel,private_channel",
    });
    cursor = response.response_metadata?.next_cursor;
    for (const channel of response.channels ?? []) {
      if (channel.id) yield channel.id;
      else throw new ChannelError(`Channel is missing ID.`, channel);
    }
  } while (cursor != null && cursor !== "");
}
