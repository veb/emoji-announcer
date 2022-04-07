// NOTE: Not in util directory because timers aren't universal
const timers = new Map<unknown, NodeJS.Timeout>();

export function debounceById<T extends unknown[]>(
  id: unknown,
  func: (...args: T) => unknown,
  delay: number,
  ...rest: T
): void {
  const prev = timers.get(id);
  if (prev) clearTimeout(prev);
  const callback = (...args: T) => {
    timers.delete(id);
    return func(...args);
  };
  const timer = setTimeout(callback, delay, ...rest);
  timers.set(id, timer);
}
