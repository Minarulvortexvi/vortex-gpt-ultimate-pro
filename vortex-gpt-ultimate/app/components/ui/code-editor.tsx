"use client";

import MonacoEditor from "@monaco-editor/react";

export default function CodeEditor({
  value,
  onChange,
  language,
  className,
}: {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  className?: string;
}) {
  return (
    <MonacoEditor
      height="400px"
      defaultLanguage={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        suggest: {
          showSnippets: true,
          showWords: true,
        },
        quickSuggestions: true,
        codeLens: true,
      }}
      className={className}
    />
  );
}