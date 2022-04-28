import {
  AllMiddlewareArgs,
  InstallationStore,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { expect, use } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { onAppUninstalled } from "./index.js";

use(sinonChai);

type Event = SlackEventMiddlewareArgs<"app_uninstalled"> & AllMiddlewareArgs;

describe("app_uninstalled event handler", () => {
  let consoleStub: sinon.SinonStub;
  before(() => (consoleStub = sinon.stub(console, "log")));
  after(() => consoleStub.restore());

  it("deletes the installation info", async () => {
    const store: InstallationStore = {
      storeInstallation: sinon.stub(),
      fetchInstallation: sinon.stub(),
      deleteInstallation: sinon.stub(),
    };
    const event = {
      body: {
        enterprise_id: "",
        team_id: "team",
      },
    } as unknown as Event;

    await onAppUninstalled(event, store);
    expect(store.deleteInstallation).to.have.been.called;
  });
});
