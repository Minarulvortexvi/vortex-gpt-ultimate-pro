import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Particles from "react-particles-js";
import Header from "../components/shared/header";
import Footer from "../components/shared/footer";
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/i18n";
import { Toaster } from "react-hot-toast";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "VorTex GPT Ultimate - Ultimate Website Cloning Platform",
  description: "Clone, edit, and deploy websites with advanced AI tools, 3D UI, and real-time collaboration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark relative gradient-animated`}>
        <Canvas
          style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
          camera={{ position: [0, 0, 5], fov: 75 }}
          className="particles-canvas"
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Environment preset="sunset" />
          <OrbitControls enableZoom={false} />
        </Canvas>
        <Particles
          params={{
            particles: {
              number: { value: 50, density: { enable: true, value_area: 800 } },
              color: { value: "#a855f7" },
              shape: { type: "circle" },
              opacity: { value: 0.3, random: true },
              size: { value: 2, random: true },
              move: { enable: true, speed: 1.5, direction: "none", random: true },
              line_linked: { enable: false },
            },
            interactivity: {
              events: { onhover: { enable: true, mode: "repulse" } },
            },
          }}
        />
        <I18nextProvider i18n={i18n}>
          <Header />
          <main className="container mx-auto py-12 px-6 relative z-10">{children}</main>
          <Footer />
          <Toaster position="top-right" />
        </I18nextProvider>
      </body>
    </html>
  );
}