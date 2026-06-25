import { ALL_TYPES, CATEGORIES } from "@/data/talentData";
import { useTalentStore, getSubtotal } from "@/store/useTalentStore";

/**
 * 维度排名条 - 按小计分数从高到低的横向条形图
 */
export default function RankingBars() {
  const scores = useTalentStore((s) => s.scores);

  const ranked = ALL_TYPES.map((t) => {
    const s = scores[t.id] ?? t.defaultScores;
    const category = CATEGORIES.find((c) => c.id === t.categoryId)!;
    return {
      id: t.id,
      name: t.name,
      color: category.color,
      colorRgb: category.colorRgb,
      subtotal: getSubtotal(s),
    };
  }).sort((a, b) => b.subtotal - a.subtotal);

  const maxScore = 15;

  return (
    <div className="flex flex-col gap-2.5">
      {ranked.map((item, idx) => {
        const widthPct = (item.subtotal / maxScore) * 100;
        const isTop = idx < 3;
        return (
          <div key={item.id} className="group flex items-center gap-3">
            <span className="w-5 shrink-0 text-right font-display text-sm text-white/30">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="w-20 shrink-0 truncate text-xs text-white/60 sm:w-24">
              {item.name}
            </span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-white/[0.03]">
              <div
                className="absolute inset-y-0 left-0 rounded-md transition-all duration-500 ease-out"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, rgba(${item.colorRgb}, 0.25), rgba(${item.colorRgb}, 0.7))`,
                  boxShadow: isTop
                    ? `0 0 12px rgba(${item.colorRgb}, 0.4)`
                    : "none",
                }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-white/80">
                {item.subtotal}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
