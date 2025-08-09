'use client'

import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { usePoseStore, Pose } from '@/state/poseStore'

type RemoteAvatar = {
  mesh: THREE.Object3D
}

export default function ThreeStage() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const players = usePoseStore(s => s.players)
  const me = usePoseStore(s => s.me)

  const remotesRef = useRef(new Map<string, RemoteAvatar>())

  useEffect(() => {
    if (!mountRef.current) return

    // Scene basics
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0b0e14)

    const camera = new THREE.PerspectiveCamera(70, 1, 0.01, 1000)
    camera.position.set(0, 1.7, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    // Resize
    const onResize = () => {
      if (!mountRef.current) return
      const { clientWidth, clientHeight } = mountRef.current
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }
    window.addEventListener('resize', onResize)
    onResize()

    // Lights + ground
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 1.0)
    dir.position.set(5, 10, 7)
    scene.add(dir)

    const grid = new THREE.GridHelper(200, 200, 0x334, 0x223)
    scene.add(grid)

    // Me avatar placeholder (camera-follow gizmo)
    const meMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x66aaff })
    )
    meMarker.position.set(0, 1.7, 0)
    scene.add(meMarker)

    // Controls: very simple flycam
    const keys = new Set<string>()
    let yaw = 0
    let pitch = 0
    let mouseDown = false

    const vel = new THREE.Vector3()

    const onKey = (e: KeyboardEvent) => {
      if (e.type === 'keydown') keys.add(e.code)
      else keys.delete(e.code)
    }
    const onMouseDown = (e: MouseEvent) => { if (e.button === 2) mouseDown = true }
    const onMouseUp = (e: MouseEvent) => { if (e.button === 2) mouseDown = false }
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return
      yaw -= e.movementX * 0.0025
      pitch -= e.movementY * 0.0025
      pitch = Math.max(-Math.PI/2+0.001, Math.min(Math.PI/2-0.001, pitch))
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('contextmenu', (e)=>{ if (mouseDown) e.preventDefault() })

    // Animate
    let raf = 0
    let last = performance.now()
    const tmp = new THREE.Vector3()
    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      // Movement
      const speed = keys.has('ShiftLeft') ? 8 : 3
      vel.set(0,0,0)
      if (keys.has('KeyW')) vel.z -= 1
      if (keys.has('KeyS')) vel.z += 1
      if (keys.has('KeyA')) vel.x -= 1
      if (keys.has('KeyD')) vel.x += 1
      if (keys.has('Space')) vel.y += 1
      if (keys.has('ControlLeft')) vel.y -= 1
      if (vel.lengthSq() > 0) vel.normalize().multiplyScalar(speed * dt)

      // Apply camera transform
      camera.rotation.set(pitch, yaw, 0, 'YXZ')
      tmp.copy(vel).applyEuler(camera.rotation)
      camera.position.add(tmp)

      meMarker.position.copy(camera.position)

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  // Apply remote players to scene
  useEffect(() => {
    const root = mountRef.current
    if (!root) return
    const canvas = root.querySelector('canvas')
    if (!canvas) return

    // To keep the sample compact, we don't attach/remap meshes here.
    // Remote players are rendered by the server via pose markers could be added in future iterations.
  }, [players])

  return <div ref={mountRef} style={{position:'fixed', left:0, top:0, right:0, bottom:0}} />
}
