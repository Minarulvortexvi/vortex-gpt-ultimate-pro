"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTranslation } from "react-i18next";
import Progress from "../components/ui/progress";
import Tabs from "../components/ui/tabs";
import ThemeToggle from "../components/ui/theme-toggle";
import Dashboard from "../components/ui/dashboard";
import Modal from "../components/ui/modal";
import ThreeDCard from "../components/ui/3d-card";
import LivePreview from "../components/ui/live-preview";
import ProjectHistory from "../components/ui/project-history";
import Auth from "../components/ui/auth";
import { encrypt, decrypt } from "../utils/encryption";
import { initializeFirebase, uploadToFirebaseStorage } from "../utils/firebase";
import * as dotenv from "dotenv";
import toast from "react-hot-toast";
import axios from "axios";
import { nanoid } from "nanoid";
import { BeatLoader } from "react-spinners";
import useSWR from "swr";
import ChatInterface from "../components/ui/chat-interface";

dotenv.config();
initializeFirebase();

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { t } = useTranslation();
  const [url, setUrl] = useState("https://hello-in-bangla.vercel.app/");
  const [clonedData, setClonedData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState("grok");
  const [selectedModel, setSelectedModel] = useState("grok-3");
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [activeTab, setActiveTab] = useState(t("preview"));
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const { data: apiUsage, mutate: mutateUsage } = useSWR("/api/usage", fetcher, {
    fallbackData: { calls: 0, limit: 100 },
  });

  const apiProviders = {
    grok: { key: process.env.GROK_API_KEY, models: ["grok-3"] },
    huggingface: {
      key: process.env.HUGGINGFACE_API_KEY,
      models: { cloning: ["gemma-2-27b"], chat: ["mixtral-8x7b"] },
    },
  };

  useEffect(() => {
    const storedKey = localStorage.getItem("apiKey");
    if (storedKey) setApiKey(decrypt(storedKey));
    const storedTheme = localStorage.getItem("theme") || "dark";
    setTheme(storedTheme);
    document.body.className = storedTheme;
    checkApiKeyExpiration();
    gsap.from(cardRef.current, { opacity: 0, y: 50, duration: 1, ease: "power3.out" });
  }, []);

  const checkApiKeyExpiration = () => {
    const expiry = localStorage.getItem("apiKeyExpiry");
    if (expiry && new Date(expiry) < new Date()) {
      toast.error(t("apiKeyExpired"));
      localStorage.removeItem("apiKey");
      setApiKey("");
    }
  };

  const saveApiKey = (key: string) => {
    const encryptedKey = encrypt(key);
    localStorage.setItem("apiKey", encryptedKey);
    localStorage.setItem("apiKeyExpiry", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());
    setApiKey(key);
    toast.success(t("apiKeySaved"));
  };

  const initiateClone = async () => {
    if (!apiKey) return toast.error(t("enterApiKey"));
    setLoading(true);
    setProgress(5);
    setModalContent(t("cloningInProgress"));
    setModalOpen(true);
    try {
      const response = await fetch("/api/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, apiKey, provider: apiProvider, model: selectedModel }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setClonedData(data);
      setProgress(100);
      if (user) await uploadToFirebaseStorage(user.uid, data.html, `clones/${nanoid()}.html`);
      setModalContent(t("cloneSuccess"));
      toast.success(t("cloneSuccess"));
    } catch (error) {
      setProgress(0);
      setModalContent(t("cloneFailed") + (error as Error).message);
      toast.error(t("cloneFailed") + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deploy = async () => {
    if (!clonedData) return;
    setLoading(true);
    setModalContent(t("deployingInProgress"));
    setModalOpen(true);
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clonedData, apiKey, provider: apiProvider }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setModalContent(t("deploySuccess") + data.liveUrl);
      toast.success(t("deploySuccess") + data.liveUrl);
    } catch (error) {
      setModalContent(t("deployFailed") + (error as Error).message);
      toast.error(t("deployFailed") + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const exportZip = async () => {
    if (!clonedData) return;
    setLoading(true);
    setModalContent(t("exportingInProgress"));
    setModalOpen(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clonedData }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cloned-site.zip";
      a.click();
      window.URL.revokeObjectURL(url);
      setModalContent(t("exportSuccess"));
      toast.success(t("exportSuccess"));
    } catch (error) {
      setModalContent(t("exportFailed") + (error as Error).message);
      toast.error(t("exportFailed") + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const callChat = async (message: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, apiKey, provider: apiProvider, model: selectedModel }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.reply;
    } catch (error) {
      return t("chatError") + (error as Error).message;
    }
  };

  return (
    <div className="container mx-auto py-12 px-6 relative z-10">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <BeatLoader color="#22d3ee" />
        </div>
      )}
      <ThemeToggle theme={theme} toggleTheme={() => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.body.className = newTheme;
        localStorage.setItem("theme", newTheme);
      }} />
      <Auth user={user} setUser={setUser} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={modalContent} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" ref={cardRef}>
        <div className="lg:col-span-1">
          <ThreeDCard className="animate-float">
            <div className={`${theme === "dark" ? "glass-card" : "glass-card-light"} p-6`}>
              <h2 className={`${orbitron.className} text-xl font-semibold mb-6 neon-text`}>{t("controlPanel")}</h2>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={`w-full mb-5 ${theme === "dark" ? "input" : "input-light"}`} />
              <select value={apiProvider} onChange={(e) => setApiProvider(e.target.value)} className={`w-full mb-5 ${theme === "dark" ? "input" : "input-light"}`}>
                <option value="grok">{t("grok")}</option>
                <option value="huggingface">{t("huggingFace")}</option>
              </select>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className={`w-full mb-5 ${theme === "dark" ? "input" : "input-light"}`}>
                {apiProvider === "grok" ? apiProviders.grok.models.map((model) => <option key={model} value={model}>{model}</option>) : Object.entries(apiProviders.huggingface.models).map(([type, models]) => <optgroup key={type} label={t(type + "Models")}>{models.map((model) => <option key={model} value={model}>{model}</option>)}</optgroup>)}
              </select>
              <button onClick={initiateClone} className="btn btn-primary w-full mb-5" disabled={loading}>{loading ? t("cloning") : t("cloneWebsite")}</button>
              <button onClick={deploy} className="btn btn-secondary w-full mb-5" disabled={!clonedData || loading}>{t("deploy")}</button>
              <button onClick={exportZip} className="btn btn-secondary w-full" disabled={!clonedData || loading}>{t("exportZip")}</button>
              <div className="mt-6">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={t("enterApiKeyPlaceholder")} className={`w-full mb-4 ${theme === "dark" ? "input" : "input-light"}`} />
                <button onClick={() => saveApiKey(apiKey)} className="btn btn-primary w-full" disabled={loading}>{t("saveKey")}</button>
              </div>
            </div>
          </ThreeDCard>
        </div>
        <div className="lg:col-span-3">
          <ThreeDCard className="animate-float">
            <div className={`${theme === "dark" ? "glass-card" : "glass-card-light"} p-6`}>
              <Tabs tabs={[t("preview"), t("code"), t("dashboard"), t("history")]} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6">
                <div className="p-6 bg-gray-800/30 rounded-xl"><LivePreview html={clonedData?.html || ""} onChange={(newHtml) => setClonedData({ ...clonedData, html: newHtml })} /></div>
                <div className="p-6 bg-gray-800/30 rounded-xl"><CodeEditor value={clonedData?.html || ""} onChange={(value) => setClonedData({ ...clonedData, html: value })} language="html" className="w-full h-96" /></div>
                <div className="p-6 bg-gray-800/30 rounded-xl"><Dashboard usage={apiUsage} /></div>
                <div className="p-6 bg-gray-800/30 rounded-xl"><ProjectHistory userId={user?.uid} /></div>
              </Tabs>
              <Progress value={progress} className="mt-6 w-full bg-gray-700/20 rounded-full" />
              <ChatInterface onSend={callChat} isCollaborating={isCollaborating} onToggleCollaboration={() => setIsCollaborating(!isCollaborating)} className="mt-8" />
              <div className="mt-4 text-sm text-gray-500">{t("apiUsage")} {apiUsage.calls}/{apiUsage.limit} {t("calls")}</div>
            </div>
          </ThreeDCard>
        </div>
      </div>
    </div>
  );
}
