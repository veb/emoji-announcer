import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
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

  const store = {
    storeInstallation: sinon.stub(),
    fetchInstallation: sinon.stub(),
    deleteInstallation: sinon.stub(),
  };
  beforeEach(() => store.deleteInstallation.reset());

  it("uninstalls a regular installation", async () => {
    const event = {
      body: {
        team_id: "team",
      },
    } as unknown as Event;

    await onAppUninstalled(event, store);
    expect(store.deleteInstallation).to.have.been.calledWith({
      enterpriseId: undefined,
      isEnterpriseInstall: false,
      teamId: "team",
    });
  });

  it("uninstalls an enterprise installation", async () => {
    const event = {
      body: {
        enterprise_id: "enterprise",
      },
    } as unknown as Event;

    await onAppUninstalled(event, store);
    expect(store.deleteInstallation).to.have.been.calledWith({
      enterpriseId: "enterprise",
      isEnterpriseInstall: true,
      teamId: undefined,
    });
  });
});
