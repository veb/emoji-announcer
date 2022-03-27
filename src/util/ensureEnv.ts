export function ensureEnv<T extends NodeJS.ProcessEnv, K extends string>(
  env: T,
  keys: readonly K[],
  allowEmptyString = false
): asserts env is T & Record<K, string> {
  for (const key of keys) {
    if (!env[key] && !(allowEmptyString && env[key] === "")) {
      throw new Error(`Missing required environment variable: $${key}`);
    }
  }
}
