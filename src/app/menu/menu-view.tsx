"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage, pick, type Lang } from "@/lib/language-context";
import { LanguageToggle } from "@/components/language-toggle";
import type { MenuSectionView, MenuItemView } from "./types";
import { formatPriceDelta } from "@/lib/menu-options";

function slug(id: string) {
  return `cat-${id}`;
}

function PriceBadge({ item, lang }: { item: MenuItemView; lang: Lang }) {
  const base =
    "font-display whitespace-nowrap rounded-full px-2.5 py-1 text-xs shadow-[0_4px_14px_-4px_rgba(0,0,0,0.8)]";

  if (item.comingSoon) {
    return (
      <span className={`${base} bg-[var(--hc-bg)]/85 text-[var(--hc-accent)] ring-1 ring-[var(--hc-accent)]/50`}>
        {pick(lang, "قريباً", "Bientôt")}
      </span>
    );
  }

  const unit = pick(lang, "درهم", "DH");
  let label: string | null = null;
  if (item.price != null && item.priceLarge != null) {
    label = `${item.price} / ${item.priceLarge} ${unit}`;
  } else if (item.price != null) {
    label = `${item.price} ${unit}`;
  }
  if (!label) return null;

  return (
    <span className={`${base} bg-gradient-to-b from-[var(--hc-accent-soft)] to-[var(--hc-accent)] text-[var(--hc-bg)]`}>
      {label}
    </span>
  );
}

function ItemCard({ item, lang, wide }: { item: MenuItemView; lang: Lang; wide: boolean }) {
  const primary = pick(lang, item.nameAr, item.nameFr);
  const secondary = pick(lang, item.nameFr, item.nameAr);
  const description = pick(lang, item.descriptionAr ?? "", item.descriptionFr ?? "");
  const note = pick(lang, item.noteAr ?? "", item.noteFr ?? "");

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-[var(--hc-accent)]/45 bg-[var(--hc-surface)] shadow-[0_10px_30px_-18px_rgba(244,178,35,0.6)] ${
        wide ? "col-span-2 sm:col-span-1" : ""
      } ${item.comingSoon ? "opacity-70" : ""}`}
    >
      <div className={`relative w-full overflow-hidden ${wide ? "aspect-[16/9] sm:aspect-[4/3]" : "aspect-[4/3]"}`}>
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoUrl}
            alt={primary}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--hc-bg)]">
            <Image
              src="/brand/logo.png"
              alt=""
              width={96}
              height={96}
              className="w-16 opacity-40"
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--hc-surface)] to-transparent" />
        <div className="absolute end-2 top-2">
          <PriceBadge item={item} lang={lang} />
        </div>
        {note && (
          <span className="absolute start-2 top-2 rounded-full bg-[var(--hc-red)] px-2 py-0.5 text-[11px] text-white">
            {note}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center gap-0.5 px-3 pb-3 pt-1 text-center">
        <h3 className="font-display text-sm leading-tight text-[var(--hc-ink)] sm:text-base">
          {primary}
        </h3>
        {secondary !== primary && (
          <p
            dir={lang === "ar" ? "ltr" : "rtl"}
            className="text-xs text-[var(--hc-accent)]"
          >
            {secondary}
          </p>
        )}
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-[var(--hc-muted)]">
            {description}
          </p>
        )}
        {item.optionGroups.map((group) => (
          <p key={group.id} className="mt-1 text-[11px] text-[var(--hc-muted)]">
            <span className="text-[var(--hc-ink)]">
              {pick(lang, group.nameAr, group.nameFr)}:
            </span>{" "}
            {group.options
              .map(
                (option) =>
                  pick(lang, option.nameAr, option.nameFr) +
                  (option.priceDelta ? ` (${formatPriceDelta(option.priceDelta)})` : "")
              )
              .join(pick(lang, "، ", ", "))}
          </p>
        ))}
      </div>
    </article>
  );
}

export function MenuView({ sections }: { sections: MenuSectionView[] }) {
  const { lang } = useLanguage();
  const categories = sections
    .flatMap((section) => section.categories)
    .filter((category) => category.items.length > 0);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28">
      <header className="sticky top-0 z-20 -mx-4 border-b border-[var(--hc-line)] bg-[var(--hc-bg)]/90 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label={pick(lang, "الرئيسية", "Accueil")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--hc-line)] text-[var(--hc-ink)] transition hover:border-[var(--hc-accent)] hover:text-[var(--hc-accent)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 rtl:rotate-180"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <LanguageToggle />
        </div>
        {categories.length > 1 && (
          <nav className="-mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${slug(category.id)}`}
                className="whitespace-nowrap rounded-full border border-[var(--hc-line)] bg-[var(--hc-surface)] px-3 py-1 text-xs text-[var(--hc-muted)] transition hover:border-[var(--hc-accent)] hover:text-[var(--hc-accent)]"
              >
                {pick(lang, category.nameAr, category.nameFr)}
              </a>
            ))}
          </nav>
        )}
      </header>

      <section className="flex flex-col items-center pb-8 pt-8 text-center">
        <p className="font-display text-sm tracking-[0.3em] text-[var(--hc-accent-soft)]">
          {pick(lang, "مقهى", "Café")}
        </p>
        <h1 className="font-display bg-gradient-to-b from-[var(--hc-accent-soft)] via-[var(--hc-accent)] to-[var(--hc-accent-dark)] bg-clip-text text-5xl leading-none text-transparent sm:text-6xl">
          {pick(lang, "حمدوني", "Hamdouni")}
        </h1>
        <p className="mt-2 text-xs tracking-[0.35em] text-[var(--hc-ink)]">
          {pick(lang, "كورنيش العرائش", "CORNICHE LARACHE")}
        </p>
        <Image
          src="/brand/logo.png"
          alt="Hamdouni's Chicken"
          width={200}
          height={200}
          priority
          className="mt-5 w-28 rounded-full shadow-[0_0_50px_-8px_rgba(212,42,30,0.8)] ring-2 ring-[var(--hc-accent)]/50"
        />
        <div className="hairline mt-6 w-48" />
      </section>

      <div className="flex flex-col gap-10">
        {categories.map((category) => (
          <section key={category.id} id={slug(category.id)} className="scroll-mt-28">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--hc-accent)]/60 rtl:bg-gradient-to-l" />
              <h2 className="font-display text-lg tracking-[0.08em] text-[var(--hc-accent)]">
                {pick(lang, category.nameAr, category.nameFr)}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--hc-accent)]/60 rtl:bg-gradient-to-r" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {category.items.map((item, index) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  lang={lang}
                  // A lone card (or the odd one out) spans the full row on
                  // phones so the grid never leaves a hole, like the poster.
                  wide={category.items.length % 2 === 1 && index === 0}
                />
              ))}
            </div>
          </section>
        ))}

        {categories.length === 0 && (
          <p className="py-10 text-center text-[var(--hc-muted)]">
            {pick(lang, "القائمة قيد التحضير", "Menu en préparation")}
          </p>
        )}
      </div>

      <div className="mt-14 flex flex-col items-center gap-4 text-center">
        <p className="text-xs tracking-wide text-[var(--hc-muted)]">
          {pick(
            lang,
            "الأسعار شاملة جميع الضرائب بالدرهم المغربي",
            "Nos prix s'entendent TTC en Dirhams"
          )}
        </p>
        <Link
          href="/feedback"
          className="font-display rounded-md border border-[var(--hc-line)] px-5 py-2.5 text-sm tracking-wide text-[var(--hc-ink)] transition hover:border-[var(--hc-accent)] hover:text-[var(--hc-accent)]"
        >
          {pick(lang, "شاركونا رأيكم في وجبتكم", "Laisser un avis sur votre repas")}
        </Link>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hc-line)] bg-[var(--hc-bg)]/90 px-4 py-3 backdrop-blur">
        <Link
          href="/order"
          className="btn-flame font-display mx-auto flex max-w-md items-center justify-center gap-3 rounded-md border px-6 py-3.5 text-base tracking-wide transition"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 shrink-0"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {pick(lang, "اطلبوا الآن", "Commander maintenant")}
        </Link>
      </div>
    </main>
  );
}
