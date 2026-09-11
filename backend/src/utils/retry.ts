const parseRetryAfterMs = (error: any): number | null => {
  try {
    // Try to parse retryDelay from the Gemini API error details
    const body = typeof error?.message === "string" ? JSON.parse(error.message) : null;
    const details: any[] = body?.error?.details ?? [];
    for (const detail of details) {
      if (detail?.retryDelay) {
        // retryDelay is like "41s" or "41.757s"
        const seconds = parseFloat(detail.retryDelay.replace("s", ""));
        if (!isNaN(seconds)) return Math.ceil(seconds) * 1000;
      }
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 5000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;

    // Only retry on 503 or 429
    if (
      error?.status === 503 ||
      error?.status === 429 ||
      error?.message?.includes("503") ||
      error?.message?.includes("429")
    ) {
      // Respect the retryDelay suggested by the API, else fall back to exponential
      const apiSuggestedMs = parseRetryAfterMs(error);
      const waitMs = apiSuggestedMs ?? delay;

      console.log(
        `[AI Retry] Rate limited. Waiting ${Math.round(waitMs / 1000)}s before retry... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return withRetry(fn, retries - 1, delay * 2);
    }

    throw error;
  }
};
