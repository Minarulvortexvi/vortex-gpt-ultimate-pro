"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

export default function ThinkModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      gsap.from(".think-modal-content", {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power3.out",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="glass-card p-4 max-w-xs text-center think-modal-content">
        <p className="text-lg neon-text animate-pulse">Thinking...</p>
        <div className="mt-4 h-2 bg-gray-700/20 rounded-full">
          <div className="bg-gradient-to-r from-purple-400/70 to-cyan-400/70 h-2 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}