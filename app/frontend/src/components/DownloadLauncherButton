import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { API_BASE, api } from "../lib/api";
import { useI18n } from "../lib/i18n";

const STYLES = {
  nav: "hidden items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 lg:inline-flex",
  primary: "inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90",
  outline: "inline-flex items-center gap-2 rounded-md border px-5 py-3 text-sm font-medium transition-colors hover:border-primary/50",
};

const mb = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;

export default function DownloadLauncherButton({ variant = "primary", showInfo = false }) {
  const { t } = useI18n();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!showInfo) return;
    api.get("/launcher/latest").then(({ data }) => setInfo(data)).catch(() => {});
  }, [showInfo]);

  return (
    <span className="inline-flex flex-col items-start gap-1.5">
      <a
        href={`${API_BASE}/launcher/download`}
        data-testid="download-launcher"
        className={STYLES[variant] || STYLES.primary}
      >
        <Download className="h-4 w-4" />
        {t("nav.download")}
      </a>
      {showInfo && (
        <span className="font-mono text-[11px] text-muted-foreground">
          Windows 10/11{info ? ` · v${info.version} · ${mb(info.sizeBytes)}` : ""}
        </span>
      )}
    </span>
  );
}