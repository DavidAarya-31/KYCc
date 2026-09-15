export class TimeoutError extends Error {
  constructor() { super('Request timed out'); this.name = 'TimeoutError'; }
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30_000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new TimeoutError();
    throw e;
  } finally {
    clearTimeout(id);
  }
}
