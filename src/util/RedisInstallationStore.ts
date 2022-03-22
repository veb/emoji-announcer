import {
  Installation,
  InstallationQuery,
  InstallationStore,
} from "@slack/bolt";

import { RedisClientType, createClient } from "redis";
import { ErrorWithData } from "./ErrorWithData";

export class RedisInstallationStore implements InstallationStore {
  public redis: RedisClientType;
  constructor(redis: RedisClientType | string) {
    this.redis =
      typeof redis === "string" ? createClient({ url: redis }) : redis;
  }

  async storeInstallation(installation: Installation): Promise<void> {
    const id = installation.isEnterpriseInstall
      ? installation.enterprise?.id
      : installation.team?.id;
    if (!id) {
      throw new ErrorWithData("Could not determine installation ID.", {
        installation,
      });
    }
    // Redis doesn't seem to be happy unless we lie and say it's also a Date...
    await this.redis.json.set(id, "$", installation as Installation & Date);
  }

  async fetchInstallation(
    query: InstallationQuery<boolean>
  ): Promise<Installation<"v1" | "v2", boolean>> {
    const id = query.isEnterpriseInstall ? query.enterpriseId : query.teamId;
    if (!id) {
      throw new ErrorWithData("Could not determine installation ID.", {
        query,
      });
    }
    const installation = await this.redis.json.get(id, { path: "$" });
    if (installation == null || typeof installation !== "object") {
      throw new ErrorWithData("Fetching installation failed.", {
        installation,
      });
    }
    // The only data we store is installation data, so this must be an Installation
    return installation as unknown as Installation;
  }

  async deleteInstallation(query: InstallationQuery<boolean>): Promise<void> {
    const id = query.isEnterpriseInstall ? query.enterpriseId : query.teamId;
    if (!id) {
      throw new ErrorWithData("Could not determine installation ID.", {
        query,
      });
    }
    await this.redis.json.del(id);
  }
}
