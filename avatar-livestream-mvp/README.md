# Avatar Livestream MVP

Real-time 3D room with avatars (VRM), spatial voice, and pose sync over LiveKit.
Frontend runs on Vercel (Next.js). Uses LiveKit Cloud for the SFU and token minting via a Next.js API route.

## What works in this MVP
- Join a room with a display name
- Connect to LiveKit (audio on; push to talk toggle)
- Load a default VRM avatar (or a cube fallback)
- WASD to move, QE to yaw, Space/Shift to move up/down (flycam), mouse look (hold right mouse)
- Broadcast pose over LiveKit DataChannel (20 Hz), interpolate remote avatars

## Quick start

1. Copy `.env.example` to `.env.local` and fill with LiveKit Cloud creds.
   - LIVEKIT_URL: e.g. `wss://<your-subdomain>.livekit.cloud`
   - LIVEKIT_API_KEY / LIVEKIT_API_SECRET: from LiveKit Cloud Console
2. `npm i`
3. `npm run dev`
4. Open http://localhost:3000

## Deploy to Vercel
- Push this repo to GitHub.
- In Vercel Dashboard, **Import Project** from GitHub.
- Add Environment Variables from `.env.example` to the project.
- Deploy.

## Notes
- This build keeps room size conservative (<= 30). For large events, shard rooms and mirror stage state.
- Interest management is client-side. For 100+ CCU, add a relay service on WebSockets for selective fan-out.
