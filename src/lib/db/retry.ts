export async function retryAsync<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMsBase = 200
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // If it's the last attempt, rethrow after loop
      if (attempt === attempts) break;
      // Small backoff
      await new Promise(resolve => setTimeout(resolve, attempt * delayMsBase));
    }
  }

  throw lastError;
}
