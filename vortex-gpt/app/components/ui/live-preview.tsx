"use client";

import { useEffect, useState } from "react";

export default function LivePreview({
  html,
  onChange,
}: {
  html: string;
  onChange: (newHtml: string) => void;
}) {
  const [previewHtml, setPreviewHtml] = useState(html);

  useEffect(() => {
    setPreviewHtml(html);
  }, [html]);

  const handleIframeChange = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.currentTarget;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      const newHtml = doc.documentElement.outerHTML;
      setPreviewHtml(newHtml);
      onChange(newHtml);
    }
  };

  return (
    <iframe
      srcDoc={previewHtml}
      className="w-full h-96 border border-gray-700/20 rounded-xl"
      onLoad={handleIframeChange}
    />
  );
}