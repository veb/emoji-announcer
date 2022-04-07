export class Accumulator<K, V> {
  private map = new Map<K, V[]>();

  flush(key: K): V[] {
    const list = this.map.get(key);
    this.map.delete(key);
    return list ?? [];
  }

  append(key: K, value: V): void {
    const list = this.map.get(key) ?? [];
    this.map.set(key, list.concat(value));
  }
}
