// Deterministic offline nutrition estimator used when the AI engine is unavailable.
// Values are per standard Indian serving (cooked), and are ESTIMATES.
import { EMPTY_NUTRITION, type Nutrition } from "./shared";

type Food = {
  /** match terms, English + Hindi/Hinglish */
  keys: string[];
  /** kcal, protein, carbs, fat per one standard unit */
  per: [number, number, number, number];
  /** what one unit means, for the item line */
  unit: string;
};

const FOODS: Food[] = [
  { keys: ["roti", "chapati", "chapathi", "phulka"], per: [110, 3, 22, 1], unit: "1 roti" },
  { keys: ["paratha", "prantha"], per: [210, 4, 28, 9], unit: "1 paratha" },
  { keys: ["rice", "chawal", "bhaat"], per: [200, 4, 44, 0.5], unit: "1 bowl" },
  { keys: ["biryani"], per: [500, 18, 62, 20], unit: "1 plate" },
  { keys: ["khichdi"], per: [250, 9, 40, 6], unit: "1 bowl" },
  { keys: ["dal", "daal", "toor", "moong", "chana dal"], per: [140, 8, 18, 4], unit: "1 katori" },
  { keys: ["rajma"], per: [210, 10, 30, 5], unit: "1 katori" },
  { keys: ["chole", "chana"], per: [210, 10, 30, 5], unit: "1 katori" },
  { keys: ["sabzi", "sabji", "bhaji", "curry"], per: [130, 3, 13, 7], unit: "1 katori" },
  { keys: ["aloo", "potato"], per: [180, 3, 24, 8], unit: "1 katori" },
  { keys: ["paneer"], per: [250, 13, 8, 19], unit: "1 katori" },
  { keys: ["curd", "dahi", "yogurt", "yoghurt"], per: [90, 5, 7, 5], unit: "1 katori" },
  { keys: ["milk", "doodh", "dudh"], per: [145, 8, 12, 6], unit: "1 glass" },
  { keys: ["lassi"], per: [220, 7, 30, 7], unit: "1 glass" },
  { keys: ["chai", "tea"], per: [90, 3, 12, 3], unit: "1 cup" },
  { keys: ["coffee"], per: [80, 3, 10, 3], unit: "1 cup" },
  { keys: ["poha"], per: [250, 5, 45, 6], unit: "1 plate" },
  { keys: ["upma"], per: [270, 6, 42, 9], unit: "1 plate" },
  { keys: ["idli"], per: [60, 2, 12, 0.4], unit: "1 idli" },
  { keys: ["dosa"], per: [160, 3, 24, 5], unit: "1 dosa" },
  { keys: ["sambar"], per: [110, 5, 14, 4], unit: "1 katori" },
  { keys: ["samosa"], per: [260, 4, 30, 14], unit: "1 samosa" },
  { keys: ["pakoda", "pakora", "bhajiya", "bhaji fried"], per: [70, 1.5, 6, 4.5], unit: "1 piece" },
  { keys: ["vada", "wada"], per: [150, 4, 18, 7], unit: "1 piece" },
  { keys: ["kheer", "payasam"], per: [280, 7, 42, 9], unit: "1 bowl" },
  { keys: ["halwa"], per: [330, 4, 45, 15], unit: "1 katori" },
  { keys: ["gulab jamun"], per: [150, 2, 22, 6], unit: "1 piece" },
  { keys: ["ladoo", "laddu"], per: [180, 3, 24, 8], unit: "1 piece" },
  { keys: ["egg", "anda", "ande"], per: [78, 6, 0.6, 5], unit: "1 egg" },
  { keys: ["chicken"], per: [240, 22, 6, 14], unit: "1 katori" },
  { keys: ["fish", "machli"], per: [200, 20, 6, 10], unit: "1 katori" },
  { keys: ["mutton"], per: [280, 22, 5, 20], unit: "1 katori" },
  { keys: ["sprouts", "moong sprouts"], per: [130, 9, 20, 1], unit: "1 katori" },
  { keys: ["banana", "kela"], per: [105, 1.3, 27, 0.3], unit: "1 banana" },
  { keys: ["apple", "seb"], per: [95, 0.5, 25, 0.3], unit: "1 apple" },
  { keys: ["mango", "aam"], per: [150, 1.4, 38, 0.6], unit: "1 mango" },
  { keys: ["bread", "toast"], per: [75, 2.5, 14, 1], unit: "1 slice" },
  { keys: ["oats"], per: [190, 7, 32, 3.5], unit: "1 bowl" },
  { keys: ["salad"], per: [70, 2, 10, 2], unit: "1 bowl" },
];

const WORD_NUM: Record<string, number> = {
  half: 0.5, aadha: 0.5, aadhi: 0.5, adha: 0.5, one: 1, ek: 1, two: 2, do: 2, three: 3,
  teen: 3, four: 4, char: 4, five: 5, paanch: 5, six: 6, little: 0.5, bit: 0.5, thoda: 0.5,
  small: 0.7, medium: 1, large: 1.5,
};

const PORTION_SCALE: { re: RegExp; scale: number }[] = [
  { re: /\bhalf (plate|bowl|katori|glass|cup)\b/, scale: 0.5 },
  { re: /\bplate\b/, scale: 1.6 },
  { re: /\b(bowl|katori)\b/, scale: 1 },
  { re: /\b(glass|cup)\b/, scale: 1 },
  { re: /\btablespoon|tbsp\b/, scale: 0.15 },
];

function quantityFor(segment: string): number {
  // "3 to 4" -> 3.5 ; "2 rotis" -> 2 ; "aadhi plate" -> 0.5
  const range = segment.match(/(\d+)\s*(?:to|-|–)\s*(\d+)/);
  if (range) return (Number(range[1]) + Number(range[2])) / 2;
  const grams = segment.match(/(\d+)\s*(?:g|gram|grams)\b/);
  if (grams) return Number(grams[1]) / 150; // relative to a ~150g standard serving
  const n = segment.match(/(\d+(?:\.\d+)?)/);
  if (n) return Number(n[1]);
  for (const [w, v] of Object.entries(WORD_NUM)) {
    if (new RegExp(`\\b${w}\\b`).test(segment)) return v;
  }
  return 1;
}

function portionScale(segment: string): number {
  for (const p of PORTION_SCALE) if (p.re.test(segment)) return p.scale;
  return 1;
}

/** Splits a free-text meal into components and sums a realistic estimate. */
export function estimateFoodOffline(text: string): Nutrition {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s,.+&/-]/g, " ");
  const segments = clean
    .split(/,|\+|\band\b|\baur\b|\bwith\b|\bke saath\b|\/|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  let total = { ...EMPTY_NUTRITION };
  const items: string[] = [];

  for (const seg of segments) {
    const food = FOODS.find((f) => f.keys.some((k) => seg.includes(k)));
    if (!food) continue;
    const qty = Math.min(20, Math.max(0.25, quantityFor(seg) * portionScale(seg)));
    const [kc, p, c, f] = food.per;
    const kcal = Math.round(kc * qty);
    total = {
      ...total,
      calories: total.calories + kcal,
      protein: total.protein + p * qty,
      carbs: total.carbs + c * qty,
      fat: total.fat + f * qty,
      fiber: total.fiber + 1.2 * qty,
      sugar: total.sugar + 1.5 * qty,
      satFat: total.satFat + f * qty * 0.35,
      sodium: total.sodium + 220 * qty,
    };
    items.push(`${seg.trim()} — approx ${food.unit} basis, ${kcal} kcal`);
  }

  if (!items.length) {
    // Unknown food: a conservative single standard serving assumption.
    total = { ...total, calories: 250, protein: 8, carbs: 32, fat: 9, fiber: 3, sugar: 4, satFat: 3, sodium: 350 };
    items.push(`${text.trim().slice(0, 60)} — standard serving assumed (estimate)`);
  }

  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    ...total,
    calories: Math.round(total.calories),
    protein: round(total.protein),
    carbs: round(total.carbs),
    fat: round(total.fat),
    fiber: round(total.fiber),
    sugar: round(total.sugar),
    satFat: round(total.satFat),
    sodium: Math.round(total.sodium),
    items,
  };
}
