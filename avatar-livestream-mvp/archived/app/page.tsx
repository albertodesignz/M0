'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Home() {
  const r = useRouter()
  const [room, setRoom] = useState('demo')
  const [name, setName] = useState('Player')
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('displayName')
    if (stored) setName(stored)
  }, [])

  async function onJoin(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('displayName', name)
    setConnecting(true)
    r.push(`/room/${encodeURIComponent(room)}?name=${encodeURIComponent(name)}`)
  }

  return (
    <main className="container">
      <div className="card vstack">
        <h1 className="hstack" style={{justifyContent:'space-between'}}>
          <span>Avatar Livestream MVP</span>
          <span className="badge">Alpha</span>
        </h1>
        <form onSubmit={onJoin} className="grid" style={{gridTemplateColumns:'1fr 1fr auto'}}>
          <div className="vstack">
            <label>Room</label>
            <input value={room} onChange={e=>setRoom(e.target.value)} placeholder="room-name" required />
          </div>
          <div className="vstack">
            <label>Display name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div className="vstack" style={{alignSelf:'end'}}>
            <button type="submit" disabled={connecting}>{connecting ? 'Joining...' : 'Join'}</button>
          </div>
        </form>
        <p style={{color:'#A1A1AA', marginTop:8}}>Audio permission will be requested after you join.</p>
      </div>
    </main>
  )
}
