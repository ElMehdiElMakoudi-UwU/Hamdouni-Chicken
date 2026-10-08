"use client";

import { useState } from "react";
import { pick, type Lang } from "@/lib/language-context";
import type { MenuItemView } from "@/app/menu/types";
import { resolveOptions, formatPriceDelta } from "@/lib/menu-options";
import { basePriceFor, type Size } from "@/lib/cart-draft";

export function hasSizes(item: MenuItemView) {
  return item.price != null && item.priceLarge != null;
}

// Bottom sheet for choosing a dish's size (when it has M/L prices and
// `size` is undefined) and its options before adding it to the cart.
export function OptionPicker({
  item,
  size: fixedSize,
  lang,
  onCancel,
  onConfirm,
}: {
  item: MenuItemView;
  size?: Size | null;
  lang: Lang;
  onCancel: () => void;
  onConfirm: (size: Size | null, optionIds: string[]) => void;
}) {
  const groups = item.optionGroups;
  const chooseSize = fixedSize === undefined && hasSizes(item);
  const [size, setSize] = useState<Size | null>(
    fixedSize !== undefined ? fixedSize : hasSizes(item) ? "REGULAR" : null
  );
  const [selected, setSelected] = useState<string[]>(() =>
    // Pre-select the first choice of required single-choice groups.
    groups
      .filter((g) => g.required && g.maxSelect === 1)
      .map((g) => g.options[0].id)
  );
  const [showErrors, setShowErrors] = useState(false);

  const resolved = resolveOptions(groups, selected);
  const unitPrice =
    (basePriceFor(item, size) ?? 0) + (resolved.ok ? resolved.priceDelta : 0);

  function toggle(groupId: string, optionId: string) {
    const group = groups.find((g) => g.id === groupId)!;
    const groupOptionIds = new Set(group.options.map((o) => o.id));
    setSelected((prev) => {
      if (group.maxSelect === 1) {
        const others = prev.filter((id) => !groupOptionIds.has(id));
        return prev.includes(optionId) && !group.required
          ? others
          : [...others, optionId];
      }
      if (prev.includes(optionId)) return prev.filter((id) => id !== optionId);
      const inGroup = prev.filter((id) => groupOptionIds.has(id)).length;
      if (group.maxSelect > 0 && inGroup >= group.maxSelect) return prev;
      return [...prev, optionId];
    });
  }

  function confirm() {
    if (!resolved.ok) {
      setShowErrors(true);
      return;
    }
    onConfirm(size, resolved.optionIds);
  }

  const choiceClass = (checked: boolean) =>
    `flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
      checked
        ? "border-[var(--hc-accent)] bg-[var(--hc-surface)]"
        : "border-[var(--hc-line)]"
    }`;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-xl bg-[var(--hc-bg)] sm:rounded-xl"
      >
        <div className="border-b border-[var(--hc-line)] px-5 py-4">
          <h3 className="font-display text-lg text-[var(--hc-ink)]">
            {pick(lang, item.nameAr, item.nameFr)}
            {!chooseSize && size === "LARGE" && (
              <span className="ml-1 text-sm text-[var(--hc-muted)]">(L)</span>
            )}
          </h3>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-4">
          {chooseSize && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[var(--hc-ink)]">
                {pick(lang, "الحجم", "Taille")}
              </legend>
              <div className="flex flex-col gap-1.5">
                {(["REGULAR", "LARGE"] as const).map((option) => (
                  <label key={option} className={choiceClass(size === option)}>
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="size"
                        checked={size === option}
                        onChange={() => setSize(option)}
                        className="accent-[var(--hc-accent)]"
                      />
                      {option === "REGULAR"
                        ? pick(lang, "عادي", "Normal")
                        : pick(lang, "كبير", "Grand")}
                    </span>
                    <span className="whitespace-nowrap text-xs text-[var(--hc-muted)]">
                      {basePriceFor(item, option)} {pick(lang, "درهم", "DH")}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {groups.map((group) => {
            const count = group.options.filter((o) => selected.includes(o.id)).length;
            const invalid =
              showErrors && !resolved.ok && resolved.groupId === group.id;
            return (
              <fieldset key={group.id}>
                <legend className="mb-2 flex w-full items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--hc-ink)]">
                    {pick(lang, group.nameAr, group.nameFr)}
                  </span>
                  <span
                    className={`text-xs ${invalid ? "text-red-700" : "text-[var(--hc-muted)]"}`}
                  >
                    {group.required
                      ? pick(lang, "إجباري", "Obligatoire")
                      : pick(lang, "اختياري", "Optionnel")}
                    {group.maxSelect > 1 &&
                      ` · ${count}/${group.maxSelect}`}
                  </span>
                </legend>
                <div className="flex flex-col gap-1.5">
                  {group.options.map((option) => {
                    const checked = selected.includes(option.id);
                    return (
                      <label key={option.id} className={choiceClass(checked)}>
                        <span className="flex items-center gap-2.5">
                          <input
                            type={group.maxSelect === 1 ? "radio" : "checkbox"}
                            name={group.id}
                            checked={checked}
                            onChange={() => toggle(group.id, option.id)}
                            onClick={() => {
                              // Radios don't fire onChange when re-clicked; allow
                              // un-selecting an optional single choice.
                              if (group.maxSelect === 1 && checked && !group.required) {
                                toggle(group.id, option.id);
                              }
                            }}
                            className="accent-[var(--hc-accent)]"
                          />
                          {pick(lang, option.nameAr, option.nameFr)}
                        </span>
                        {option.priceDelta !== 0 && (
                          <span className="whitespace-nowrap text-xs text-[var(--hc-muted)]">
                            {formatPriceDelta(option.priceDelta)} {pick(lang, "درهم", "DH")}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <div className="flex items-center gap-3 border-t border-[var(--hc-line)] px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[var(--hc-line)] px-4 py-3 text-sm text-[var(--hc-muted)]"
          >
            {pick(lang, "إلغاء", "Annuler")}
          </button>
          <button
            type="button"
            onClick={confirm}
            className="btn-flame font-display border flex-1 rounded-md px-4 py-3 text-sm tracking-wide transition"
          >
            {pick(lang, "إضافة", "Ajouter")} · {unitPrice} {pick(lang, "درهم", "DH")}
          </button>
        </div>
      </div>
    </div>
  );
}
