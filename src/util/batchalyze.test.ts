import { use, expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { batchalyze } from "./batchalyze.js";

use(sinonChai);

describe("batchalyze", () => {
  const callback = sinon.stub();
  beforeEach(() => callback.reset());
  // Take control of setTimeout/clearTimeout for tests
  let clock: sinon.SinonFakeTimers;
  before(() => (clock = sinon.useFakeTimers()));
  after(() => clock.restore());
  beforeEach(() => clock.reset());
  // Make sure that nothing's left dangling
  afterEach(() => expect(clock.countTimers()).to.equal(0));
  // Suppress console logs
  let consoleStub: sinon.SinonStub;
  before(() => (consoleStub = sinon.stub(console, "log")));
  after(() => consoleStub.restore());

  it("calls the callback after a delay", async () => {
    const func = batchalyze({
      batchDelay: 3,
      batchSize: 10,
      callback,
      dedupe: Object.is,
    });
    await func("key", "value");
    clock.next();
    expect(callback).to.have.been.calledWith("key", ["value"]);
    expect(clock.now).to.equal(3);
  });

  it("restarts the delay for multiple calls", async () => {
    const func = batchalyze({
      batchDelay: 10,
      batchSize: 10,
      callback,
      dedupe: Object.is,
    });
    await func("key", 1);
    clock.tick(9); // Wait a bit, but don't trigger callback
    await func("key", 2);
    clock.next();
    expect(callback).to.have.been.calledWith("key", [1, 2]);
    expect(clock.now).to.equal(19);
  });

  it("calls the callback before delay runs out if batch limit is reached", async () => {
    const func = batchalyze({
      batchDelay: 1,
      batchSize: 2,
      callback,
      dedupe: Object.is,
    });
    // The spies are for sinon's fake timers, which get cleaned up elsewhere
    const setTimeoutSpy = sinon.spy(global, "setTimeout");
    const clearTimeoutSpy = sinon.spy(global, "clearTimeout");
    await func("key", 1);
    await func("key", 2);
    expect(callback).to.have.been.calledWith("key", [1, 2]);
    expect(clock.now).to.equal(0);
    expect(setTimeoutSpy).to.have.been.calledOnce;
    expect(clearTimeoutSpy).to.have.been.calledOnce;
  });

  it("does not add duplicates to a batch", async () => {
    const func = batchalyze({
      batchDelay: 1,
      batchSize: 3,
      callback,
      dedupe: Object.is,
    });
    await func("key", 1);
    await func("key", 2);
    await func("key", 1);
    clock.next();
    expect(callback).to.have.been.calledWith("key", [1, 2]);
  });
});
