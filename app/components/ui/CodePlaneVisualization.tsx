"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Plane, Text } from "@react-three/drei";
import * as THREE from "three";

interface PlaneProps {
  position: [number, number, number];
  label: string;
  color: string;
}

const CodePlane: React.FC<PlaneProps> = ({ position, label, color }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
    }
  });

  return (
    <group position={position}>
      <Plane ref={meshRef} args={[2, 1, 10, 10]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} aria-label={`Code element: ${label}`}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </Plane>
      <Text position={[0, 0.6, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">{label}</Text>
    </group>
  );
};

interface CodePlaneVisualizationProps {
  html: string;
}

export default function CodePlaneVisualization({ html }: CodePlaneVisualizationProps) {
  const [planes, setPlanes] = useState<PlaneProps[]>([]);
  const radius = 10;

  useEffect(() => {
    const htmlToParse = html || "<div>Default Content</div>";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlToParse, "text/html");
    const elements = doc.body.getElementsByTagName("*");
    const newPlanes = Array.from(elements).map((el, i) => {
      const angle = (i / elements.length) * Math.PI * 2;
      return { position: [Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(i * 0.3) * 2], label: el.tagName.toLowerCase(), color: `#${Math.floor(Math.random() * 16777215).toString(16)}` };
    });
    setPlanes(newPlanes);
  }, [html]);

  return (
    <Canvas style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }} camera={{ position: [0, 0, 20], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {planes.map((plane, i) => <CodePlane key={i} {...plane} />)}
      <OrbitControls enablePan={false} enableZoom={true} minDistance={10} maxDistance={25} />
    </Canvas>
  );
}
