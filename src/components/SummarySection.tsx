import { useMemo } from "react";
import { Award, Sparkles, Lightbulb, RotateCcw } from "lucide-react";
import { ALL_TYPES, CATEGORIES, DIRECTION_ADVICE, TIPS } from "@/data/talentData";
import { useTalentStore, getSubtotal } from "@/store/useTalentStore";

/**
 * 天赋方向汇总区 - 自动计算 Top3 天赋与发展方向建议
 */
export default function SummarySection() {
  const scores = useTalentStore((s) => s.scores);
  const resetAll = useTalentStore((s) => s.resetAll);

  const ranked = useMemo(() => {
    return ALL_TYPES.map((t) => {
      const s = scores[t.id] ?? t.defaultScores;
      const category = CATEGORIES.find((c) => c.id === t.categoryId)!;
      return {
        id: t.id,
        name: t.name,
        categoryName: category.name,
        color: category.color,
        colorRgb: category.colorRgb,
        subtotal: getSubtotal(s),
        advice: DIRECTION_ADVICE[t.id],
      };
    }).sort((a, b) => b.subtotal - a.subtotal);
  }, [scores]);

  const top3 = ranked.slice(0, 3);

  return (
    <section
      id="summary"
      className="relative z-10 mx-auto max-w-5xl px-6 py-20"
    >
      <div className="reveal mb-14 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-starlight/60">
          TALENT DIRECTION SUMMARY
        </p>
        <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
          天赋方向<span className="italic text-starlight">汇总</span>
        </h2>
        <p className="mt-4 text-sm text-white/40">
          结合自评得分与事件验证，这是你值得优先深耕的方向
        </p>
      </div>

      {/* Top3 天赋卡片 */}
      <div className="reveal mb-12 grid gap-5 md:grid-cols-3">
        {top3.map((item, idx) => {
          const isTop = idx === 0;
          return (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm"
              style={{
                borderColor: isTop
                  ? `rgba(${item.colorRgb}, 0.4)`
                  : "rgba(255,255,255,0.06)",
                background: isTop
                  ? `linear-gradient(135deg, rgba(${item.colorRgb}, 0.12), rgba(${item.colorRgb}, 0.02))`
                  : "rgba(255,255,255,0.02)",
                boxShadow: isTop
                  ? `0 0 30px rgba(${item.colorRgb}, 0.15)`
                  : "none",
              }}
            >
              {/* 排名徽章 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award
                    className="h-5 w-5"
                    style={{ color: item.color }}
                  />
                  <span className="text-xs tracking-widest text-white/40">
                    NO.{idx + 1}
                  </span>
                </div>
                {isTop && (
                  <Sparkles
                    className="h-4 w-4 animate-shimmer"
                    style={{ color: item.color }}
                  />
                )}
              </div>

              {/* 天赋名称 */}
              <h3
                className="font-serif text-2xl font-semibold"
                style={{ color: item.color }}
              >
                {item.name}
              </h3>
              <p className="mt-1 text-xs text-white/40">{item.categoryName}</p>

              {/* 分数 */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-white">
                  {item.subtotal}
                </span>
                <span className="text-sm text-white/30">/ 15 分</span>
              </div>

              {/* 进度条 */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item.subtotal / 15) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              {/* 建议领域标签 */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {item.advice.fields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full border px-2.5 py-0.5 text-xs"
                    style={{
                      borderColor: `rgba(${item.colorRgb}, 0.3)`,
                      color: item.color,
                      backgroundColor: `rgba(${item.colorRgb}, 0.06)`,
                    }}
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 发展方向建议 */}
      <div className="reveal mb-12 rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-starlight" />
          <h3 className="font-serif text-xl font-semibold text-white">
            职业 / 技能发展方向
          </h3>
        </div>
        <div className="flex flex-col gap-4">
          {top3.map((item, idx) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-white/5 bg-midnight-700/30 p-4"
            >
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `rgba(${item.colorRgb}, 0.15)`,
                  color: item.color,
                }}
              >
                {idx + 1}
              </div>
              <div>
                <h4
                  className="font-medium"
                  style={{ color: item.color }}
                >
                  {item.name}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-white/55">
                  {item.advice.careers}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 填写小贴士 */}
      <div className="reveal mb-12 rounded-2xl border border-starlight/15 bg-starlight/[0.03] p-6 backdrop-blur-sm sm:p-8">
        <h3 className="mb-4 font-serif text-lg font-semibold text-starlight">
          填写小贴士
        </h3>
        <ul className="flex flex-col gap-3">
          {TIPS.map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/60">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-starlight/60" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* 重置按钮 */}
      <div className="reveal flex justify-center">
        <button
          onClick={() => {
            if (confirm("确定要重置所有打分与填写内容吗？此操作不可撤销。")) {
              resetAll();
            }
          }}
          className="flex items-center gap-2 rounded-full border border-white/10 px-6 py-2.5 text-sm text-white/50 transition-colors hover:border-starlight/30 hover:text-starlight"
        >
          <RotateCcw className="h-4 w-4" />
          重置所有数据
        </button>
      </div>
    </section>
  );
}
