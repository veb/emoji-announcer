import {
  Installation,
  InstallationQuery,
  InstallationStore,
} from "@slack/bolt";

import IORedis from "ioredis";

import { ErrorWithData } from "./ErrorWithData.js";

// @types/ioredis is missing the `call` method...
interface RedisClient extends IORedis.Redis {
  call: (method: string, ...args: unknown[]) => unknown;
}

export class RedisInstallationStore implements InstallationStore {
  public redis: RedisClient;
  constructor(url: string) {
    // Type assertion is necessary to use the corrected type
    this.redis = new IORedis(url) as RedisClient;
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
    await this.redis.call("JSON.SET", id, "$", installation);
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
    const installation = await this.redis.call("JSON.GET", id, { path: "$" });
    if (installation == null || typeof installation !== "object") {
      throw new ErrorWithData("Fetching installation failed.", {
        installation,
      });
    }
    // The only data we store is installation data, so this must be an Installation
    return installation as Installation;
  }

  async deleteInstallation(query: InstallationQuery<boolean>): Promise<void> {
    const id = query.isEnterpriseInstall ? query.enterpriseId : query.teamId;
    if (!id) {
      throw new ErrorWithData("Could not determine installation ID.", {
        query,
      });
    }
    await this.redis.call("JSON.DEL", id);
  }
}
