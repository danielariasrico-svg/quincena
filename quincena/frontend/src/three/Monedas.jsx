import { Component, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, ContactShadows, RoundedBox, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

// Moneda: cilindro dorado con anillo en relieve. Gira y sigue suavemente el mouse.
function Moneda({ position, rotation = [0, 0, 0], radio = 1, velocidad = 1, mouse }) {
  const ref = useRef()
  useFrame((st, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.6 * velocidad
    const tx = rotation[0] + mouse.current.y * 0.35
    const tz = rotation[2] + mouse.current.x * 0.35
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, tx, 0.05)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, tz, 0.05)
  })
  const oro = { color: '#d4af37', metalness: 1, roughness: 0.22, envMapIntensity: 1.4 }
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[radio, radio, radio * 0.16, 72]} />
        <meshStandardMaterial {...oro} />
      </mesh>
      <mesh position={[0, radio * 0.085, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radio * 0.8, radio * 0.035, 16, 72]} />
        <meshStandardMaterial {...oro} color="#f1dc8a" roughness={0.15} />
      </mesh>
      <mesh position={[0, -radio * 0.085, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radio * 0.8, radio * 0.035, 16, 72]} />
        <meshStandardMaterial {...oro} color="#f1dc8a" roughness={0.15} />
      </mesh>
      <mesh position={[0, radio * 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radio * 0.3, radio * 0.42, 48]} />
        <meshStandardMaterial {...oro} color="#b8911d" roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// Tarjeta azul con banda dorada, inclinada, que flota detrás de las monedas.
function Tarjeta({ mouse }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, -0.5 + mouse.current.x * 0.25, 0.04)
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0.25 - mouse.current.y * 0.2, 0.04)
  })
  return (
    <group ref={ref} position={[0.2, -0.3, -1.4]} rotation={[0.25, -0.5, 0]}>
      <RoundedBox args={[3.3, 2.0, 0.08]} radius={0.16} smoothness={6} castShadow>
        <meshPhysicalMaterial color="#0b3c8c" metalness={0.6} roughness={0.3} clearcoat={1} clearcoatRoughness={0.1} />
      </RoundedBox>
      <mesh position={[0, 0.45, 0.05]}>
        <boxGeometry args={[3.3, 0.3, 0.01]} />
        <meshStandardMaterial color="#c9a227" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[-1.1, -0.45, 0.05]}>
        <boxGeometry args={[0.7, 0.5, 0.01]} />
        <meshStandardMaterial color="#f1dc8a" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.9, -0.2, 0.05]}>
        <boxGeometry args={[1.4, 0.08, 0.01]} />
        <meshStandardMaterial color="#1e9e62" emissive="#1e9e62" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

function Escena({ mouse }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} castShadow shadow-mapSize={1024} />
      <spotLight position={[-5, 4, 2]} intensity={1.2} color="#dff5ea" angle={0.6} />
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.6}>
        <Tarjeta mouse={mouse} />
      </Float>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.9}>
        <Moneda position={[-1.4, 0.6, 0.4]} rotation={[0.3, 0, 0.2]} radio={0.9} mouse={mouse} />
      </Float>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.7}>
        <Moneda position={[1.5, -0.7, 0.6]} rotation={[0.5, 0, -0.3]} radio={0.7} velocidad={1.3} mouse={mouse} />
      </Float>
      <Float speed={2.4} rotationIntensity={0.4} floatIntensity={1}>
        <Moneda position={[0.2, 1.4, -0.3]} rotation={[0.8, 0, 0.1]} radio={0.45} velocidad={1.6} mouse={mouse} />
      </Float>
      <ContactShadows position={[0, -2, 0]} opacity={0.35} scale={10} blur={2.4} far={3} color="#0b3c8c" />
      {/* Entorno procedural (sin descargas): reflejos cálidos para el metal */}
      <Environment resolution={256}>
        <Lightformer intensity={2.5} position={[0, 5, -6]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#f1dc8a" />
        <Lightformer intensity={1.2} position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#d9e6ff" />
        <Lightformer intensity={0.8} position={[0, -5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color="#dff5ea" />
      </Environment>
    </>
  )
}

// Si WebGL falla (equipo sin aceleración), mostramos un respaldo elegante en lugar de romper la app.
class Limite extends Component {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() { return this.state.error ? this.props.fallback : this.props.children }
}

function Respaldo() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-56 w-56">
        <div className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full border-[14px] border-gold-500/80 border-t-gold-300" />
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-700 shadow-glow" />
        <div className="absolute inset-0 grid place-items-center font-display text-5xl font-extrabold text-brand-900/80">$</div>
      </div>
    </div>
  )
}

export default function Monedas({ className = '' }) {
  const mouse = useRef({ x: 0, y: 0 })
  const dpr = useMemo(() => Math.min(window.devicePixelRatio || 1, 2), [])
  return (
    <div
      className={className}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mouse.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2
        mouse.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2
      }}
      onPointerLeave={() => { mouse.current = { x: 0, y: 0 } }}
    >
      <Limite fallback={<Respaldo />}>
        <Canvas dpr={dpr} shadows camera={{ position: [0, 0, 7], fov: 36 }} gl={{ alpha: true, antialias: true }}>
          <Suspense fallback={null}>
            <Escena mouse={mouse} />
          </Suspense>
        </Canvas>
      </Limite>
    </div>
  )
}
