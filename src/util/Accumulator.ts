/** Basically just a wrapper for Map<K, V[]> */
export class Accumulator<K, V> {
  private map = new Map<K, V[]>();

  /**
   *
   * @param dedupe Deduplication function to determine if two values should be considered the same
   */
  constructor(private dedupe: (a: V, b: V) => boolean) {}

  /** Gets the list of stored values and resets the store */
  flush(key: K): V[] {
    const list = this.map.get(key);
    this.map.delete(key);
    return list ?? [];
  }

  /** Adds a value to the store */
  append(key: K, value: V): void {
    const list = this.map.get(key) ?? [];
    const exists = list.some((entry) => this.dedupe(entry, value));
    if (!exists) this.map.set(key, list.concat(value));
  }

  /** Counts the number of values in the store */
  count(key: K): number {
    const list = this.map.get(key);
    return list?.length ?? 0;
  }
}
