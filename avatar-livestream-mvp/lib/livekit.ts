
export async function getJoin(room: string, name: string): Promise<{token:string, url:string}> {
  const res = await fetch('/api/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ room, name }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token error: ${res.status} ${text}`)
  }
  const data = await res.json()
  return { token: data.token as string, url: data.url as string }
}
