export function ensureEnv<T extends NodeJS.ProcessEnv, K extends string>(
  env: T,
  key: K,
  allowEmptyString = false
): asserts env is T & Record<K, string> {
  if (!env[key] && !(allowEmptyString && env[key] === "")) {
    throw new Error(`Missing required environment variable: $${key}`);
  }
}
