import React from "react";

export default function Modal({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="glass-card p-6 max-w-md">
        <p className="text-lg mb-4">{content}</p>
        <button onClick={onClose} className="btn btn-primary w-full">
          Close
        </button>
      </div>
    </div>
  );
}