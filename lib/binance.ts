export async function binanceFetch<T = any>(
  path: string,
  params: Record<string, string | number> = {},
  apiKey: string,
  apiSecret: string
): Promise<T> {
  const stringParams: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) stringParams[k] = String(v)

  const res = await fetch('/api/binance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, params: stringParams, apiKey, apiSecret }),
    cache: 'no-store',
  })

  if (!res.ok) {
    let err: { error?: string } = {}
    try {
      err = await res.json()
    } catch {
      /* ignore */
    }
    throw new Error(err.error || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}
