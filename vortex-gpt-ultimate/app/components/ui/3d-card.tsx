"use client";

import React from "react";
import Tilt from "react-tilt";

export default function ThreeDCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tilt
      options={{ max: 25, scale: 1.05, speed: 300 }}
      className={`relative ${className}`}
    >
      {children}
    </Tilt>
  );
}