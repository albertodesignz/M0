'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { getJoin } from '@/lib/livekit'
import { Room, RoomEvent, DataPacket_Kind, RemoteParticipant, LocalParticipant } from 'livekit-client'
import ThreeStage from '@/components/ThreeStage'
import { usePoseStore, Pose } from '@/state/poseStore'

type PoseMsg = {
  t: 'pose'
  id: string
  name: string
  p: [number, number, number] // position
  r: [number, number, number] // rotation
  ts: number
}

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const q = useSearchParams()
  const name = (q.get('name') || 'Player').slice(0, 40)

  const [status, setStatus] = useState<'idle'|'connecting'|'connected'|'error'>('idle')
  const roomRef = useRef<Room | null>(null)
  const setMe = usePoseStore(s=>s.setMe)
  const upsert = usePoseStore(s=>s.upsert)
  const prune = usePoseStore(s=>s.prune)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setStatus('connecting')
        const { token, url } = await getJoin(roomId, name)
        if (!mounted) return
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        })
        roomRef.current = room

        // Subscribe to events
        room.on(RoomEvent.ParticipantConnected, (p) => {
          console.log('participant connected', p.identity)
        })
        room.on(RoomEvent.ParticipantDisconnected, (p) => {
          console.log('participant disconnected', p.identity)
        })
        room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
          try {
            const msg = JSON.parse(new TextDecoder().decode(payload)) as PoseMsg
            if (msg.t === 'pose') {
              upsert({ id: msg.id, name: msg.name, pose: { position: msg.p, rotation: msg.r }, lastSeen: msg.ts })
            }
          } catch {}
        })

        await room.connect(url, token) // URL comes from token (Cloud), leave empty
        await room.localParticipant.enableMicrophone()

        // Set my initial state
        setMe({ id: room.localParticipant.identity, name, pose: { position: [0,1.7,5], rotation: [0,0,0] }, lastSeen: Date.now() })
        setStatus('connected')

        // Begin pose broadcast loop @20Hz
        let raf = 0
        function loop() {
          const cam = document.querySelector('canvas')
          // In this MVP, we don't read the camera; a real build would read from Stage refs.
          // We'll just not send pose here; keep code path for future iterations.
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)

        const interval = setInterval(() => {
          prune(5_000)
        }, 2000)

        return () => {
          cancelAnimationFrame(raf)
          clearInterval(interval)
          room.disconnect()
        }
      } catch (e) {
        console.error(e)
        setStatus('error')
      }
    })()
    return () => { mounted = false }
  }, [roomId, name, setMe, upsert, prune])

  return (
    <>
      <div className="toolbar">
        <button onClick={() => roomRef.current?.localParticipant.setMicrophoneEnabled(true)}>Mic On</button>
        <button onClick={() => roomRef.current?.localParticipant.setMicrophoneEnabled(false)}>Mic Off</button>
        <a href="/" style={{padding:'10px 12px', border:'1px solid #222838', borderRadius:8}}>Leave</a>
      </div>
      <div className="overlay">
        <div><strong>Room:</strong> {roomId}</div>
        <div><strong>Name:</strong> {name}</div>
        <div><strong>Status:</strong> {status}</div>
        <div style={{marginTop:8, color:'#A1A1AA'}}>WASD to move · Right mouse to look · Shift to sprint</div>
      </div>
      <ThreeStage />
    </>
  )
}
