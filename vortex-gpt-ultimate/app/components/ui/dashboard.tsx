import { useTranslation } from "react-i18next";

export default function Dashboard({
  usage,
}: {
  usage: { calls: number; limit: number };
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold neon-text">{t("apiUsageDashboard")}</h3>
      <p>
        {t("apiUsage")}: {usage.calls}/{usage.limit} {t("calls")}
      </p>
      <div className="w-full bg-gray-700/20 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-purple-400/70 to-cyan-400/70 h-2.5 rounded-full"
          style={{ width: `${(usage.calls / usage.limit) * 100}%` }}
        />
      </div>
    </div>
  );
}