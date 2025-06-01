"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTranslation } from "react-i18next";
import Progress from "../components/ui/progress";
import Tabs from "../components/ui/tabs";
import Textarea from "../components/ui/textarea";
import ChatInterface from "../components/ui/chat-interface";
import CodeEditor from "../components/ui/code-editor";
import ThemeToggle from "../components/ui/theme-toggle";
import Dashboard from "../components/ui/dashboard";
import Modal from "../components/ui/modal";
import ThreeDCard from "../components/ui/3d-card";
import LivePreview from "../components/ui/live-preview";
import ProjectHistory from "../components/ui/project-history";
import Auth from "../components/ui/auth";
import FileManager from "../components/ui/file-manager";
import SearchBar from "../components/ui/search-bar";
import ThinkModal from "../components/ui/think-modal";
import { encrypt, decrypt } from "../utils/encryption";
import { initializeFirebase, uploadToFirebaseStorage } from "../utils/firebase";
import { uploadToGCS, downloadFromGCS } from "../utils/gcs";
import * as dotenv from "dotenv";
import toast from "react-hot-toast";
import axios from "axios";
import { nanoid } from "nanoid";
import Fuse from "fuse.js";

dotenv.config();

initializeFirebase();

export default function Home() {
  const { t } = useTranslation();
  const [url, setUrl] = useState("https://hello-in-bangla.vercel.app/");
  const [clonedData, setClonedData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState("grok");
  const [selectedModel, setSelectedModel] = useState("grok-3");
  const [apiUsage, setApiUsage] = useState({ calls: 0, limit: 100 });
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [thinkOpen, setThinkOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [files, setFiles] = useState([]);
  const cardRef = useRef(null);

  const apiProviders = {
    grok: { key: process.env.GROK_API_KEY, models: ["grok-3"] },
    huggingface: {
      key: process.env.HUGGINGFACE_API_KEY,
      models: {
        cloning: ["google/gemma-2-27b", "distilbert-base-uncased"],
        chat: ["google/gemma-2-27b", "mixtral-8x7b"],
      },
    },
  };

  const historyData = [
    { id: 1, url: "https://example.com", created_at: "2025-05-30T12:00:00Z" },
    { id: 2, url: "https://test.com", created_at: "2025-05-29T10:00:00Z" },
  ];

  const fuse = new Fuse(historyData, {
    keys: ["url", "created_at"],
    threshold: 0.3,
  });

  useEffect(() => {
    const storedKey = localStorage.getItem("apiKey");
    if (storedKey) setApiKey(decrypt(storedKey));
    const storedTheme = localStorage.getItem("theme") || "dark";
    setTheme(storedTheme);
    document.body.className = storedTheme;
    checkApiKeyExpiration();
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
    });
    fetchFiles();
  }, []);

  const checkApiKeyExpiration = () => {
    const expiry = localStorage.getItem("apiKeyExpiry");
    if (expiry && new Date(expiry) < new Date()) {
      toast.error(t("apiKeyExpired"));
      localStorage.removeItem("apiKey");
      localStorage.removeItem("apiKeyExpiry");
      setApiKey("");
    }
  };

  const saveApiKey = (key: string) => {
    const encryptedKey = encrypt(key);
    localStorage.setItem("apiKey", encryptedKey);
    localStorage.setItem(
      "apiKeyExpiry",
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    );
    setApiKey(key);
    toast.success(t("apiKeySaved"));
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  const initiateClone = async () => {
    if (!apiKey) {
      toast.error(t("enterApiKey"));
      return;
    }
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
      trackApiUsage();
      if (user) {
        await uploadToGCS(user.uid, data.html, `clones/${nanoid()}.html`);
      }
      setModalContent(t("cloneSuccess"));
    } catch (error) {
      console.error("Clone error:", error);
      setProgress(0);
      setModalContent(t("cloneFailed") + (error as Error).message);
      toast.error(t("cloneFailed") + (error as Error).message);
    }
  };

  const trackApiUsage = async () => {
    const newUsage = { ...apiUsage, calls: apiUsage.calls + 1 };
    setApiUsage(newUsage);
    await fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usage: newUsage }),
    });
    if (newUsage.calls >= newUsage.limit) {
      toast.error(t("apiUsageLimit"));
    }
  };

  const deploy = async () => {
    if (!clonedData) return;
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
      trackApiUsage();
    } catch (error) {
      console.error("Deploy error:", error);
      setModalContent(t("deployFailed") + (error as Error).message);
      toast.error(t("deployFailed") + (error as Error).message);
    }
  };

  const exportZip = async () => {
    if (!clonedData) return;
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
      console.error("Export error:", error);
      setModalContent(t("exportFailed") + (error as Error).message);
      toast.error(t("exportFailed") + (error as Error).message);
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
      return data.reply;
    } catch (error) {
      console.error("Chat error:", error);
      return t("chatError") + (error as Error).message;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = fuse.search(query);
    setSearchResults(results.map((result) => result.item));
  };

  const fetchFiles = async () => {
    if (user) {
      const filesList = await downloadFromGCS(user.uid);
      setFiles(filesList);
    }
  };

  const triggerThink = () => {
    setThinkOpen(true);
    setTimeout(() => setThinkOpen(false), 3000); // Simulate thinking for 3 seconds
  };

  return (
    <div className="container mx-auto py-12 px-6 relative z-10">
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <Auth user={user} setUser={setUser} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={modalContent} />
      <ThinkModal isOpen={thinkOpen} onClose={() => setThinkOpen(false)} />
      <SearchBar query={searchQuery} onSearch={handleSearch} className="mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" ref={cardRef}>
        {/* Control Panel */}
        <div className="lg:col-span-1">
          <ThreeDCard className="animate-float">
            <div className={`${theme === "dark" ? "glass-card" : "glass-card-light"} p-6`}>
              <h2 className={`${orbitron.className} text-xl font-semibold mb-6 neon-text`}>
                {t("controlPanel")}
              </h2>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className={`w-full mb-5 ${theme === "dark" ? "input" : "input-light"}`}
              />
              <select
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value)}
                className={`w-full mb-5 ${theme === "dark" ? "input" : "input-light"}`}
              >
                <option value="grok">{t("grok")}</option>
                <option value="huggingface">{t("huggingFace")}</option>
              </select>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`w-full mb-5 ${theme === "dark" ? "input" : "input-light"}`}
              >
                {apiProvider === "grok" ? (
                  apiProviders.grok.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))
                ) : (
                  <>
                    <optgroup label={t("cloningModels")}>
                      {apiProviders.huggingface.models.cloning.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={t("chatModels")}>
                      {apiProviders.huggingface.models.chat.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
              <button
                onClick={initiateClone}
                className="btn btn-primary w-full mb-5 flex items-center justify-center"
              >
                {t("cloneWebsite")}
              </button>
              <button
                onClick={deploy}
                className="btn btn-secondary w-full mb-5 flex items-center justify-center"
                disabled={!clonedData}
              >
                {t("deploy")}
              </button>
              <button
                onClick={exportZip}
                className="btn btn-secondary w-full mb-5 flex items-center justify-center"
                disabled={!clonedData}
              >
                {t("exportZip")}
              </button>
              <button
                onClick={triggerThink}
                className="btn btn-primary w-full mb-5 flex items-center justify-center"
              >
                {t("think")}
              </button>
              <div className="mt-6">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t("enterApiKeyPlaceholder")}
                  className={`w-full mb-4 ${theme === "dark" ? "input" : "input-light"}`}
                />
                <button
                  onClick={() => saveApiKey(apiKey)}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  {t("saveKey")}
                </button>
              </div>
            </div>
          </ThreeDCard>
          <FileManager files={files} user={user} onUpdate={fetchFiles} className="mt-6" />
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-3">
          <ThreeDCard className="animate-float">
            <div className={`${theme === "dark" ? "glass-card" : "glass-card-light"} p-6`}>
              <Tabs
                tabs={[t("preview"), t("code"), t("dashboard"), t("history")]}
                activeTab={t("preview")}
                onTabChange={(tab) => console.log(tab)}
                className="mb-6"
              >
                <div className="p-6 bg-gray-800/30 rounded-xl">
                  <LivePreview
                    html={clonedData?.html || ""}
                    onChange={(newHtml) =>
                      setClonedData({ ...clonedData, html: newHtml })
                    }
                  />
                </div>
                <div className="p-6 bg-gray-800/30 rounded-xl">
                  <CodeEditor
                    value={clonedData?.html || ""}
                    onChange={(value) =>
                      setClonedData({ ...clonedData, html: value })
                    }
                    language="html"
                    className="w-full h-96"
                  />
                </div>
                <div className="p-6 bg-gray-800/30 rounded-xl">
                  <Dashboard usage={apiUsage} />
                </div>
                <div className="p-6 bg-gray-800/30 rounded-xl">
                  <ProjectHistory userId={user?.uid} />
                </div>
              </Tabs>
              <Progress
                value={progress}
                className="mt-6 w-full bg-gray-700/20 rounded-full"
              />
              <ChatInterface
                onSend={callChat}
                isCollaborating={isCollaborating}
                onToggleCollaboration={() =>
                  setIsCollaborating(!isCollaborating)
                }
                className="mt-8"
              />
              <div className="mt-4 text-sm text-gray-500">
                {t("apiUsage")} {apiUsage.calls}/{apiUsage.limit} {t("calls")}
              </div>
            </div>
          </ThreeDCard>
        </div>
      </div>
    </div>
  );
}