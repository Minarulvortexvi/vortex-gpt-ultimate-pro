import React from "react";

export default function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={`w-full bg-gray-700/20 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-gradient-to-r from-purple-400/70 to-cyan-400/70 h-2.5 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}