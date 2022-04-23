import { expect } from "chai";
import { ensureEnv } from "./ensureEnv.js";

const err = (key: string) => `Missing required environment variable: $${key}`;

describe("ensureEnv", () => {
  it("throws when a key is missing", () => {
    expect(() => ensureEnv({}, ["KEY"])).to.throw(err("KEY"));
  });

  it("passes when a key is present", () => {
    expect(() => ensureEnv({ KEY: "present" }, ["KEY"])).to.not.throw();
  });

  it("throws when a key is present but value is empty string", () => {
    expect(() => ensureEnv({ KEY: "" }, ["KEY"])).to.throw(err("KEY"));
  });

  it("passes when value is empty string but allow empty string flag is set", () => {
    expect(() => ensureEnv({ KEY: "" }, ["KEY"], true)).to.not.throw();
  });
});
