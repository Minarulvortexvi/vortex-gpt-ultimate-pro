"use client";

export default function ThemeToggle({
  theme,
  toggleTheme,
}: {
  theme: string;
  toggleTheme: () => void;
}) {
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 btn btn-secondary p-2 rounded-full"
    >
      {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}