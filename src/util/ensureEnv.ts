/**
 * Ensures that the given list of keys are present in the given env.
 * @param env process.env
 * @param keys List of keys
 * @param allowEmptyString Whether empty string is considered a valid value
 */
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
