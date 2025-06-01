"use client";

import { useState } from "react";

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex border-b border-gray-700/20">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-3 font-medium transition-all duration-300 relative ${
              activeTab === tab
                ? "text-cyan-400/70 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-purple-400/50 before:to-cyan-400/50"
                : "text-gray-500/70 hover:text-gray-300/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4">{activeTab === tabs[0] ? tabs[0] : activeTab === tabs[1] ? tabs[1] : activeTab === tabs[2] ? tabs[2] : tabs[3]}</div>
    </div>
  );
}