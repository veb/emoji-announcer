/** Basically just a wrapper for Map<K, V[]> */
export class Accumulator<K, V> {
  private map = new Map<K, V[]>();

  /** Gets the list of stored values and resets the store */
  flush(key: K): V[] {
    const list = this.map.get(key);
    this.map.delete(key);
    return list ?? [];
  }

  /** Adds a value to the store */
  append(key: K, value: V): void {
    const list = this.map.get(key) ?? [];
    this.map.set(key, list.concat(value));
  }

  /** Counts the number of values in the store */
  count(key: K): number {
    const list = this.map.get(key);
    return list?.length ?? 0;
  }
}
