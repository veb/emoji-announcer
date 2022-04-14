import { Accumulator } from "./Accumulator.js";

/**
 * An accumulating debouncer that looks up by key, I guess? Naming things is hard. It takes a callback, which gets
 * called after the specified delay or after the specified number of wrapped invocations, whichever is sooner. The
 * callback is passed an array of all of the values that were passed to the wrapped method.
 * @param callback Method to invoke, takes a key and array of values
 * @param batchDelay Delay in milliseconds to wait after last invocation before calling callback
 * @param batchSize Maximum number of invocations before calling callback without delay
 * @returns batchalyzed function, takes a key and a single value
 */
export function batchalyze<K, V>(
  callback: (key: K, values: V[]) => void | Promise<void>,
  batchDelay: number,
  batchSize: number
): (key: K, value: V) => Promise<void> {
  const timers = new Map<K, NodeJS.Timeout>();
  const payloads = new Accumulator<K, V>();

  // Not called clearTimeout to avoid accidentally using the global
  function clearTimer(key: K): void {
    const timer = timers.get(key);
    if (timer) clearTimeout(timer);
    timers.delete(key);
  }

  async function execute(key: K): Promise<void> {
    clearTimer(key);
    const values = payloads.flush(key);
    await callback(key, values);
  }

  return async function batchalyzed(key: K, value: V): Promise<void> {
    payloads.append(key, value);
    if (payloads.count(key) >= batchSize) {
      console.log(`Batch size limit (${batchSize}) hit. Flushing.`);
      await execute(key);
    } else {
      clearTimer(key);
      const timer = setTimeout((k) => void execute(k), batchDelay, key);
      timers.set(key, timer);
    }
  };
}
