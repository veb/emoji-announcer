import { Accumulator } from "./Accumulator.js";

/**
 * A keyed accumulator + debouncer, I guess? Naming things is hard. It takes a callback, which gets called after the
 * specified delay, or after the specified number of wrapped invocations, whichever is sooner. The callback is passed
 * all of the values that were passed to the wrapped method, as an array.
 */
export class Batchalyzer<K, V> {
  private timers = new Map<K, NodeJS.Timeout>();
  private payloads = new Accumulator<K, V>();
  /**
   * @param callback Method to invoke
   * @param batchDelay Delay in milliseconds to wait after last invocation before calling callback
   * @param batchSize Maximum number of invocations before calling callback without delay
   */
  constructor(
    private callback: (key: K, values: V[]) => void | Promise<void>,
    private batchDelay: number,
    private batchSize: number
  ) {}

  // Not called clearTimeout to avoid accidentally using the global
  private clearTimer(key: K): void {
    const timer = this.timers.get(key);
    if (timer) clearTimeout(timer);
    this.timers.delete(key);
  }

  // Not called setTimeout to avoid accidentlaly using the global
  private setTimer(key: K): void {
    this.clearTimer(key);
    const timer = setTimeout((k) => void this.execute(k), this.batchDelay, key);
    this.timers.set(key, timer);
  }

  private async execute(key: K): Promise<void> {
    this.clearTimer(key);
    const values = this.payloads.flush(key);
    await this.callback(key, values);
  }

  public async add(key: K, value: V): Promise<void> {
    this.payloads.append(key, value);
    if (this.payloads.count(key) >= this.batchSize) {
      console.log(`Batch size limit (${this.batchSize}) hit. Flushing.`);
      await this.execute(key);
    } else {
      this.setTimer(key);
    }
  }
}
