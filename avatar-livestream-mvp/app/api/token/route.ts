import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export const runtime = 'nodejs' // ensure Node runtime for crypto

export async function POST(req: NextRequest) {
  try {
    const { room, name } = await req.json()
    if (!room || !name) {
      return NextResponse.json({ error: 'room and name required' }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const lkUrl = process.env.LIVEKIT_URL

    if (!apiKey || !apiSecret || !lkUrl) {
      return NextResponse.json({ error: 'LiveKit env not configured' }, { status: 500 })
    }

    const at = new AccessToken(apiKey, apiSecret, { identity: `${name}-${Math.random().toString(36).slice(2,8)}` })
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true })

    const token = await at.toJwt()
    return NextResponse.json({ token, url: lkUrl })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 })
  }
}
