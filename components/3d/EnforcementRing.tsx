'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LEVEL_COLORS } from '@/lib/enforcement-engine'

function Ring({ level }: { level: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const fillRef = useRef<THREE.Mesh>(null)

  const color = useMemo(() => new THREE.Color(LEVEL_COLORS[level] || '#30D158'), [level])
  const targetFill = useMemo(() => (level / 6) * Math.PI * 2, [level])
  const currentFill = useRef(0)

  useFrame((_, delta) => {
    // smooth animate fill
    currentFill.current = THREE.MathUtils.lerp(
      currentFill.current,
      targetFill,
      Math.min(1, delta * 3)
    )

    if (fillRef.current && fillRef.current.geometry) {
      const geom = fillRef.current.geometry as THREE.TorusGeometry
      // We can't easily dynamically update a torus arc,
      // so we scale the existing mesh on the Y axis for effect.
      // The approach below uses a rotation trick instead.
    }

    if (groupRef.current) {
      groupRef.current.rotation.z = -currentFill.current / 2
    }
  })

  // Number of segments fills based on level
  const segments = useMemo(() => {
    const total = 60
    const filled = Math.round((level / 6) * total)
    return { total, filled }
  }, [level])

  return (
    <group ref={groupRef}>
      {/* Base ring (dim) */}
      <mesh>
        <torusGeometry args={[1.3, 0.08, 16, 80]} />
        <meshBasicMaterial color="#141E2E" transparent opacity={0.6} />
      </mesh>

      {/* Filled segment ring, drawn from 0 to current angle using arc-length approximation */}
      <mesh ref={fillRef}>
        <torusGeometry args={[1.3, 0.1, 16, 80, Math.max(0.001, (level / 6) * Math.PI * 2)]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>

      {/* Outer glow ring */}
      <mesh>
        <torusGeometry args={[1.35, 0.02, 12, 80, Math.max(0.001, (level / 6) * Math.PI * 2)]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Center point light for glow */}
      <pointLight position={[0, 0, 1]} intensity={level > 0 ? 1.5 : 0} color={color} distance={4} />

      {/* Inner dot marker segments */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const isFilled = i < level
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.85, Math.sin(angle) * 0.85, 0]}
          >
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial
              color={isFilled ? LEVEL_COLORS[i + 1] : '#1F2938'}
              transparent
              opacity={isFilled ? 1 : 0.4}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function EnforcementRing({
  level,
  className,
}: {
  level: number
  className?: string
}) {
  return (
    <div className={className ?? 'w-full h-full'}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <Ring level={level} />
      </Canvas>
    </div>
  )
}
