import { Accumulator } from "./Accumulator.js";

export class Batchalyzer<K, V> {
  private timers = new Map<K, NodeJS.Timeout>();
  private payloads = new Accumulator<K, V>();
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
