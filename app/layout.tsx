import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Particles from "react-particles-js";
import Header from "../components/shared/header";
import Footer from "../components/shared/footer";
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/i18n";
import { Toaster } from "react-hot-toast";
import CodePlaneVisualization from "../components/ui/CodePlaneVisualization";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "VorTex GPT Ultimate Pro",
  description: "Advanced website cloning with 3D UI and AI tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark relative gradient-bg gradient-animated`}>
        <I18nextProvider i18n={i18n}>
          <Particles
            params={{
              particles: { number: { value: 30 }, color: { value: "#a855f7" }, opacity: 0.2 },
              interactivity: { events: { onhover: { enable: true, mode: "repulse" } } },
            }}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -2 }}
          />
          <CodePlaneVisualization html="" />
          <Header />
          <main className="container mx-auto py-12 px-6 relative z-10">{children}</main>
          <Footer />
          <Toaster position="top-right" />
        </I18nextProvider>
      </body>
    </html>
  );
}
