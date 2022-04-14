import { Accumulator } from "./Accumulator";

const BATCH_DELAY = Number(process.env.EMOJI_ANNOUNCER_BATCH_DELAY ?? 30e3);
const BATCH_SIZE = Number(process.env.EMOJI_ANNOUNCER_BATCH_SIZE ?? 100);

export class Batchalyzer<K, V> {
  private timers = new Map<K, NodeJS.Timeout>();
  private payloads = new Accumulator<K, V>();
  constructor(
    private callback: (key: K, values: V[]) => void | Promise<void>,
    private batchDelay = BATCH_DELAY,
    private batchSize = BATCH_SIZE
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
      await this.execute(key);
    } else {
      this.setTimer(key);
    }
  }
}
