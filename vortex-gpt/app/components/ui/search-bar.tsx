"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SearchBar({
  query,
  onSearch,
  className,
}: {
  query: string;
  onSearch: (query: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState(query);

  const handleSearch = () => {
    onSearch(input);
  };

  return (
    <div className={`${className} flex gap-3`}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="input flex-1"
      />
      <button onClick={handleSearch} className="btn btn-primary">
        {t("search")}
      </button>
    </div>
  );
}