"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage, pick } from "@/lib/language-context";
import { LanguageToggle } from "@/components/language-toggle";
import { FeedbackForm, type RateableItem } from "./feedback-form";
import { getRecentOrderItems } from "@/app/actions/feedback";

function FeedbackPageContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const initialTable = searchParams.get("table") ?? undefined;
  const [rateableItems, setRateableItems] = useState<RateableItem[]>([]);

  useEffect(() => {
    if (!initialTable) return;
    let cancelled = false;
    getRecentOrderItems(initialTable).then((items) => {
      if (!cancelled) setRateableItems(items);
    });
    return () => {
      cancelled = true;
    };
  }, [initialTable]);

  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo.png"
            alt=""
            width={64}
            height={64}
            className="h-8 w-8 rounded-full ring-1 ring-[var(--hc-accent)]/40"
          />
          <span className="font-display text-lg tracking-wide">
            {pick(lang, "دجاج حمدوني", "Hamdouni's Chicken")}
          </span>
        </Link>
        <LanguageToggle />
      </div>

      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl tracking-wide">
          {pick(lang, "رأيكم يهمنا", "Votre avis compte")}
        </h1>
        <div className="hairline mx-auto mt-3 w-32" />
        <p className="mt-4 text-sm text-[var(--hc-muted)]">
          {pick(
            lang,
            "أخبرونا برأيكم في الطعام والخدمة",
            "Dites-nous comment s'est passée votre expérience"
          )}
        </p>
      </div>

      <FeedbackForm
        lang={lang}
        initialTable={initialTable}
        rateableItems={rateableItems}
      />
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={null}>
      <FeedbackPageContent />
    </Suspense>
  );
}
