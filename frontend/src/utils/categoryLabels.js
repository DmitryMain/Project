export const CATEGORY_LABELS = {
  SMARTPHONE: "Смартфон",
  LAPTOP: "Ноутбук",
  TABLET: "Планшет",
  ACCESSORY: "Аксессуар",
  OTHER: "Другое"
};

export function categoryLabel(code) {
  return CATEGORY_LABELS[code] ?? code ?? "—";
}
