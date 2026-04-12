'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function lerpColor(score: number): THREE.Color {
  // score 0..100 → Apple red @ 0, Apple orange @ 50, Apple green @ 100
  const danger = new THREE.Color('#FF3B30')
  const warning = new THREE.Color('#FF9F0A')
  const success = new THREE.Color('#30D158')
  const c = new THREE.Color()
  if (score >= 50) {
    const t = (score - 50) / 50
    c.copy(warning).lerp(success, t)
  } else {
    const t = score / 50
    c.copy(danger).lerp(warning, t)
  }
  return c
}

function Orb({ score }: { score: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const groupRef = useRef<THREE.Group>(null)

  const targetColor = useMemo(() => lerpColor(score), [score])
  const currentColor = useRef(targetColor.clone())

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()

    // Rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1
    }

    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.5
      innerRef.current.rotation.z += delta * 0.2
    }

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.08
    }

    // Smoothly lerp color towards target
    currentColor.current.lerp(targetColor, delta * 1.5)
    const mat = meshRef.current?.material as THREE.MeshPhongMaterial | undefined
    const innerMat = innerRef.current?.material as
      | THREE.MeshBasicMaterial
      | undefined
    if (mat) {
      mat.color.copy(currentColor.current)
      mat.emissive.copy(currentColor.current).multiplyScalar(0.3)
    }
    if (innerMat) {
      innerMat.color.copy(currentColor.current)
    }
    if (lightRef.current) {
      lightRef.current.color.copy(currentColor.current)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer translucent shield sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshPhongMaterial
          color={targetColor}
          emissive={targetColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.25}
          shininess={80}
          wireframe
        />
      </mesh>

      {/* Inner solid core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.75, 2]} />
        <meshBasicMaterial color={targetColor} transparent opacity={0.85} />
      </mesh>

      {/* Point light for inner glow */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={2.5}
        distance={5}
        decay={2}
        color={targetColor}
      />
    </group>
  )
}

function OrbitingParticles({ score }: { score: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, count } = useMemo(() => {
    const n = 60
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2
      const radius = 1.6 + Math.random() * 0.3
      arr[i * 3] = Math.cos(angle) * radius
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.6
      arr[i * 3 + 2] = Math.sin(angle) * radius
    }
    return { positions: arr, count: n }
  }, [])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.4
    }
  })

  const color = useMemo(() => lerpColor(score), [score])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export function DisciplineOrb({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  return (
    <div className={className ?? 'w-full h-full relative'}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[3, 3, 3]} intensity={0.4} />
        <Orb score={score} />
        <OrbitingParticles score={score} />
      </Canvas>
    </div>
  )
}
