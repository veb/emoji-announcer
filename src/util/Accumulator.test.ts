import { expect } from "chai";
import { Accumulator } from "./Accumulator.js";

describe("Accumulator", () => {
  it("adds a values for a key", () => {
    const acc = new Accumulator(Object.is);
    acc.append("foo", "bar");
    acc.append("foo", "foo");
    expect(acc.count("foo")).to.equal(2);
    expect(acc.flush("foo")).to.deep.equal(["bar", "foo"]);
  });

  it("clears the accumulated list when flushed", () => {
    const acc = new Accumulator(Object.is);
    acc.append("foo", "bar");
    acc.append("foo", "foo");
    const result = acc.flush("foo");
    expect(result.length).to.equal(2);
    expect(acc.count("foo")).to.equal(0);
    expect(acc.flush("foo")).to.not.equal(result);
  });

  it("counts the number of entries in the list", () => {
    const acc = new Accumulator(Object.is);
    acc.append("foo", "foo");
    acc.append("foo", "bar");
    acc.append("bar", "bar");
    expect(acc.count("foo")).to.equal(2);
    expect(acc.count("bar")).to.equal(1);
  });

  it("doesn't add duplicate values", () => {
    const acc = new Accumulator(Object.is);
    acc.append("foo", "foo");
    acc.append("foo", "bar");
    acc.append("foo", "foo");
    expect(acc.count("foo")).to.equal(2);
    expect(acc.flush("foo")).to.deep.equal(["foo", "bar"]);
  });
});
