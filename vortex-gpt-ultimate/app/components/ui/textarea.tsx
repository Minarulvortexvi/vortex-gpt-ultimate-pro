import React from "react";

export default function Textarea({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-96 bg-gray-700/20 border border-gray-600/20 rounded-xl p-4 text-white ${className}`}
    />
  );
}