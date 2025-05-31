"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function ChatInterface({
  onSend,
  isCollaborating,
  onToggleCollaboration,
  className,
}: {
  onSend: (message: string) => Promise < string > ;
  isCollaborating: boolean;
  onToggleCollaboration: () => void;
  className ? : string;
}) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState < string[] > ([]);
  const [input, setInput] = useState("");
  const socket = io(process.env.SOCKET_IO_SERVER_URL || "http://localhost:4000");
  
  useEffect(() => {
    if (isCollaborating) {
      socket.on("message", (msg) => {
        setMessages((prev) => [...prev, `Collaborator: ${msg.text}`]);
        toast.success(t("collaboratorMessageReceived"));
      });
      socket.on("collaborator_update", (users) =>
        console.log("Collaborators:", users)
      );
    }
    return () => {
      socket.off("message");
      socket.off("collaborator_update");
    };
  }, [isCollaborating]);
  
  const handleSend = async () => {
    if (!input) return;
    const reply = await onSend(input);
    setMessages((prev) => [...prev, `You: ${input}`, `Bot: ${reply}`]);
    if (isCollaborating) socket.emit("message", { text: input, reply });
    setInput("");
  };
  
  return (
    <div className={`${className} glass-card p-5`}>
      <div className="flex justify-between items-center mb-5">
        <h3 className={`${orbitron.className} text-lg font-semibold neon-text`}>
          {t("chatWithGPT")}
        </h3>
        <button
          onClick={onToggleCollaboration}
          className="btn btn-secondary text-sm"
        >
          {isCollaborating ? t("endCollaboration") : t("startCollaboration")}
        </button>
      </div>
      <div className="h-60 overflow-y-auto bg-gray-800/20 p-4 rounded-xl mb-5 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg shadow-sm ${
              msg.startsWith("You:")
                ? "bg-purple-600/20 ml-auto"
                : "bg-cyan-600/20 mr-auto"
            } animate-fade-in`}
          >
            {msg}
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input flex-1"
          placeholder={t("askCodeOrCollaborate")}
        />
        <button
          onClick={handleSend}
          className="btn btn-primary flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {t("send")}
        </button>
      </div>
    </div>
  );
}