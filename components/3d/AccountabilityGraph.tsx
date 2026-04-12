'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AccountabilityLink } from '@/types'

interface GraphProps {
  traderName: string
  partners: AccountabilityLink[]
  selectedId: string | null
  onSelect?: (id: string | null) => void
}

function Node({
  position,
  color,
  size = 0.3,
  pulse = false,
  selected = false,
}: {
  position: [number, number, number]
  color: string
  size?: number
  pulse?: boolean
  selected?: boolean
}) {
  const ref = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }, delta) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    if (pulse) {
      const scale = 1 + Math.sin(t * 2) * 0.08
      ref.current.scale.setScalar(scale)
    }
    if (glowRef.current) {
      const glowScale = pulse ? 1.4 + Math.sin(t * 2) * 0.12 : selected ? 1.5 : 1.3
      glowRef.current.scale.setScalar(glowScale)
    }
  })

  return (
    <group position={position}>
      {/* Soft outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.14} />
      </mesh>
      {/* Solid core */}
      <mesh ref={ref}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
    </group>
  )
}

function Connection({
  from,
  to,
  pulsing,
}: {
  from: [number, number, number]
  to: [number, number, number]
  pulsing: boolean
}) {
  const ref = useRef<THREE.Line>(null)
  const matRef = useRef<THREE.LineBasicMaterial>(null)

  const { geometry } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const points = new Float32Array([...from, ...to])
    g.setAttribute('position', new THREE.BufferAttribute(points, 3))
    return { geometry: g }
  }, [from, to])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    if (pulsing) {
      matRef.current.opacity = 0.3 + Math.abs(Math.sin(clock.getElapsedTime() * 2)) * 0.7
    } else {
      matRef.current.opacity = 0.35
    }
  })

  return (
    // @ts-expect-error — R3F line element type quirks
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial
        ref={matRef}
        color={pulsing ? '#FF3B30' : '#4F6EF7'}
        transparent
        opacity={0.35}
      />
    </line>
  )
}

function Graph({ traderName, partners, selectedId }: GraphProps) {
  const groupRef = useRef<THREE.Group>(null)
  const active = partners.filter((p) => p.status === 'ACTIVE')

  // Layout partners in a ring around center trader
  const layout = useMemo(() => {
    return active.map((p, i) => {
      const angle = (i / Math.max(1, active.length)) * Math.PI * 2
      const radius = 2
      return {
        partner: p,
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.6,
          Math.sin(angle + i) * 0.3,
        ] as [number, number, number],
      }
    })
  }, [active])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Center trader node */}
      <Node position={[0, 0, 0]} color="#4F6EF7" size={0.42} pulse selected />

      {/* Partner nodes */}
      {layout.map(({ partner, position }) => {
        const color =
          partner.role === 'MENTOR' ? '#30D158' : '#BF5AF2'
        const pulsing = partner.lastNotifiedAt
          ? Date.now() - new Date(partner.lastNotifiedAt).getTime() <
            6 * 60 * 60 * 1000 // pulse within last 6h
          : false
        return (
          <group key={partner.id}>
            <Node
              position={position}
              color={color}
              size={0.22}
              pulse={pulsing}
              selected={selectedId === partner.id}
            />
            <Connection from={[0, 0, 0]} to={position} pulsing={pulsing} />
          </group>
        )
      })}

      {/* Center point light */}
      <pointLight position={[0, 0, 0]} intensity={3} color="#4F6EF7" distance={8} />
      <pointLight position={[3, 2, 2]} intensity={0.8} color="#30D158" distance={6} />
    </group>
  )
}

export function AccountabilityGraph({
  traderName,
  partners,
  selectedId = null,
  onSelect,
}: GraphProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.6, 5.5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <Graph
          traderName={traderName}
          partners={partners}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </Canvas>
    </div>
  )
}
