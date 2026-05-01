export async function apiFetch<T>(
  url: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(rest.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(url, { ...rest, headers })
  const json = await res.json()

  if (!json.ok) throw new Error(json.error ?? 'Request failed')
  return json.data as T
}
