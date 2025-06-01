"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
import { uploadToGCS, downloadFromGCS } from "../../utils/gcs";
import toast from "react-hot-toast";

export default function FileManager({
  files,
  user,
  onUpdate,
  className,
}: {
  files: string[];
  user: any;
  onUpdate: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const [newFileName, setNewFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  const handleUpload = async () => {
    if (!user || !newFileName || !fileContent) {
      toast.error(t("missingFileDetails"));
      return;
    }
    try {
      await uploadToGCS(user.uid, fileContent, newFileName);
      setNewFileName("");
      setFileContent("");
      onUpdate();
      toast.success(t("fileUploaded"));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("uploadFailed"));
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const content = await downloadFromGCS(user.uid, fileName);
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      saveAs(blob, fileName);
      toast.success(t("fileDownloaded"));
    } catch (error) {
      console.error("Download error:", error);
      toast.error(t("downloadFailed"));
    }
  };

  return (
    <div className={`${className} glass-card p-5`}>
      <h3 className={`${orbitron.className} text-lg font-semibold mb-6 neon-text`}>
        {t("fileManager")}
      </h3>
      <div className="mb-6">
        <input
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder={t("fileName")}
          className="input w-full mb-3"
        />
        <textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          placeholder={t("fileContent")}
          className="input w-full h-24 mb-3"
        />
        <button onClick={handleUpload} className="btn btn-primary w-full">
          {t("uploadFile")}
        </button>
      </div>
      <div className="space-y-3">
        <h4 className="text-md font-medium">{t("existingFiles")}</h4>
        {files.length === 0 ? (
          <p>{t("noFiles")}</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file} className="p-3 bg-gray-800/20 rounded-xl flex justify-between">
                <span>{file}</span>
                <button
                  onClick={() => handleDownload(file)}
                  className="btn btn-secondary text-sm"
                >
                  {t("download")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}