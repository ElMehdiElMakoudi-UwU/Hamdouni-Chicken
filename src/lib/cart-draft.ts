// A cart the guest builds on /menu before choosing table / takeaway /
// delivery. It lives in sessionStorage so it survives the /order step and
// is picked up by the order builder. Prices here are display-only: the
// server recomputes every line when the order is placed.

import type { MenuSectionView, MenuItemView } from "@/app/menu/types";
import { resolveOptions } from "@/lib/menu-options";

export type Size = "REGULAR" | "LARGE";

export type CartLine = {
  menuItemId: string;
  nameAr: string;
  nameFr: string;
  size: Size | null;
  optionIds: string[];
  optionsAr: string | null;
  optionsFr: string | null;
  unitPrice: number;
  quantity: number;
};

export type Cart = Record<string, CartLine>;

const STORAGE_KEY = "hamdouni-cart";

export function cartKey(menuItemId: string, size: Size | null, optionIds: string[]) {
  return `${menuItemId}:${size ?? "REGULAR"}:${[...optionIds].sort().join(",")}`;
}

export function basePriceFor(item: MenuItemView, size: Size | null): number | null {
  return size === "LARGE" ? item.priceLarge : item.price;
}

// Returns the cart with one more of the given item/size/options, or the
// cart unchanged if the choice is no longer valid.
export function addLine(
  cart: Cart,
  item: MenuItemView,
  size: Size | null,
  optionIds: string[]
): Cart {
  const basePrice = basePriceFor(item, size);
  const resolved = resolveOptions(item.optionGroups, optionIds);
  if (basePrice == null || !resolved.ok) return cart;
  const key = cartKey(item.id, size, resolved.optionIds);
  const existing = cart[key];
  return {
    ...cart,
    [key]: existing
      ? { ...existing, quantity: existing.quantity + 1 }
      : {
          menuItemId: item.id,
          nameAr: item.nameAr,
          nameFr: item.nameFr,
          size,
          optionIds: resolved.optionIds,
          optionsAr: resolved.labelAr,
          optionsFr: resolved.labelFr,
          unitPrice: basePrice + resolved.priceDelta,
          quantity: 1,
        },
  };
}

export function changeQuantity(cart: Cart, key: string, delta: number): Cart {
  const existing = cart[key];
  if (!existing) return cart;
  const quantity = existing.quantity + delta;
  if (quantity <= 0) {
    const next = { ...cart };
    delete next[key];
    return next;
  }
  return { ...cart, [key]: { ...existing, quantity } };
}

export function loadCartDraft(): Cart {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Cart) : {};
  } catch {
    return {};
  }
}

export function saveCartDraft(cart: Cart) {
  try {
    if (Object.keys(cart).length === 0) {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  } catch {
    // Storage blocked (private mode): the cart just won't carry over.
  }
}

export function clearCartDraft() {
  saveCartDraft({});
}

// Rebuilds a stored cart against the current menu, dropping lines whose
// dish or options are gone and refreshing names and prices.
export function reconcileCart(cart: Cart, sections: MenuSectionView[]): Cart {
  const items = new Map<string, MenuItemView>();
  for (const section of sections) {
    for (const category of section.categories) {
      for (const item of category.items) items.set(item.id, item);
    }
  }

  let next: Cart = {};
  for (const line of Object.values(cart)) {
    const item = items.get(line?.menuItemId);
    if (!item || item.comingSoon || !(line.quantity > 0)) continue;
    const optionIds = line.optionIds ?? [];
    const key = cartKey(item.id, line.size, optionIds);
    const withOne = addLine(next, item, line.size, optionIds);
    if (withOne === next || !withOne[key]) continue;
    next = {
      ...withOne,
      [key]: { ...withOne[key], quantity: (next[key]?.quantity ?? 0) + line.quantity },
    };
  }
  return next;
}
