"use client";

import { useLanguage } from "@/lib/language-context";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-[var(--hc-line)] bg-[var(--hc-surface)] p-0.5 text-sm">
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`rounded-full px-3 py-1 transition ${
          lang === "ar"
            ? "bg-[var(--hc-accent)] text-[var(--hc-bg)]"
            : "text-[var(--hc-muted)]"
        }`}
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`rounded-full px-3 py-1 transition ${
          lang === "fr"
            ? "bg-[var(--hc-accent)] text-[var(--hc-bg)]"
            : "text-[var(--hc-muted)]"
        }`}
      >
        Français
      </button>
    </div>
  );
}
