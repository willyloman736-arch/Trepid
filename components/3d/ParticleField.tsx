'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const COUNT = 220

function Particles() {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])

  const velocities = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.003
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.003
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.003
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const geom = pointsRef.current?.geometry as THREE.BufferGeometry | undefined
    if (!geom) return
    const attr = geom.attributes.position as THREE.BufferAttribute
    const pos = attr.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += velocities[i * 3]
      pos[i * 3 + 1] +=
        velocities[i * 3 + 1] + Math.sin(t * 0.3 + i) * 0.0008
      pos[i * 3 + 2] += velocities[i * 3 + 2]

      // Wrap
      if (pos[i * 3] > 7) pos[i * 3] = -7
      if (pos[i * 3] < -7) pos[i * 3] = 7
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -4
      if (pos[i * 3 + 1] < -4) pos[i * 3 + 1] = 4
      if (pos[i * 3 + 2] > 5) pos[i * 3 + 2] = -5
      if (pos[i * 3 + 2] < -5) pos[i * 3 + 2] = 5
    }
    attr.needsUpdate = true
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.04
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#5E5CE6"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export function ParticleField() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <Particles />
      </Canvas>
    </div>
  )
}
