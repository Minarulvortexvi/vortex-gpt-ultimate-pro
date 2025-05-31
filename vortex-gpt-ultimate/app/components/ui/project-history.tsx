"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ProjectHistory({ userId }: { userId: string | undefined }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    if (userId) {
      fetch(`/api/history?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => setHistory(data));
    }
  }, [userId]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold neon-text">{t("projectHistory")}</h3>
      {history.length === 0 ? (
        <p>{t("noHistory")}</p>
      ) : (
        <ul className="space-y-2">
          {history.map((item: any) => (
            <li key={item.id} className="p-3 bg-gray-800/20 rounded-xl">
              <p>{t("cloned")}: {item.url}</p>
              <p>{t("createdAt")}: {new Date(item.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}