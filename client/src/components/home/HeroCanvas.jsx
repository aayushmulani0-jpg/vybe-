import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Environment, Float, Stars } from '@react-three/drei';
import { Suspense } from 'react';

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[1, 0, -1]}>
            <Sphere args={[1.2, 64, 64]}>
              <MeshDistortMaterial 
                color="#1a1a1a" 
                attach="material" 
                distort={0.4} 
                speed={2} 
                roughness={0.1}
                metalness={1}
              />
            </Sphere>
          </Float>
          
          <Float speed={1.5} rotationIntensity={2} floatIntensity={1} position={[-2.5, -1, -2]}>
             <Sphere args={[0.8, 64, 64]}>
              <MeshDistortMaterial 
                color="#A3FF12" 
                attach="material" 
                distort={0.3} 
                speed={1.5} 
                roughness={0.2}
                metalness={0.8}
                emissive="#A3FF12"
                emissiveIntensity={0.2}
              />
            </Sphere>
          </Float>
          
          <Float speed={2.5} rotationIntensity={1.5} floatIntensity={3} position={[2, 1.5, -3]}>
             <Sphere args={[1, 64, 64]}>
              <MeshDistortMaterial 
                color="#00C2FF" 
                attach="material" 
                distort={0.5} 
                speed={3} 
                roughness={0.1}
                metalness={0.9}
                emissive="#00C2FF"
                emissiveIntensity={0.2}
              />
            </Sphere>
          </Float>
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
