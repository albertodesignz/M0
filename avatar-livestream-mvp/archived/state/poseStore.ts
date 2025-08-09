import { create } from 'zustand'

export type Pose = {
  position: [number, number, number]
  rotation: [number, number, number]
}

type Player = {
  id: string
  name: string
  pose: Pose
  lastSeen: number
}

type PoseState = {
  me?: Player
  players: Record<string, Player>
  setMe: (p: Player) => void
  upsert: (p: Player) => void
  prune: (ageMs: number) => void
}

export const usePoseStore = create<PoseState>((set, get) => ({
  me: undefined,
  players: {},
  setMe: (p) => set({ me: p }),
  upsert: (p) =>
    set((s) => ({ players: { ...s.players, [p.id]: p } })),
  prune: (ageMs) => {
    const now = Date.now()
    const filtered: Record<string, Player> = {}
    const entries = Object.entries(get().players)
    for (const [id, pl] of entries) {
      if (now - pl.lastSeen <= ageMs) filtered[id] = pl
    }
    set({ players: filtered })
  },
}))
