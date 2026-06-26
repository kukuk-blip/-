import { useMemo } from "react";
import { useTalentStore, getSubtotal } from "@/store/useTalentStore";
import { ALL_TYPES } from "@/data/talentData";
import {
  calcDimensionScoresFromTalent,
  calcCombos,
  buildSchemes,
  type TalentId,
} from "@/lib/subjectRecommend";
import { GraduationCap, TrendingUp, Award, Layers } from "lucide-react";

/**
 * 选科推荐板块 - 嵌入天赋星图页
 * 实时读取 12 维天赋分数，换算为 6 维学科能力，输出三套选科方案
 * 调分时推荐同步变化
 */
export default function SubjectRecommendation() {
  const scores = useTalentStore((s) => s.scores);

  // 12 维小计 → 6 维学科能力 → 三套方案
  const { dimScores, combos, schemes } = useMemo(() => {
    const subtotals = {} as Record<TalentId, number>;
    for (const t of ALL_TYPES) {
      const s = scores[t.id] ?? t.defaultScores;
      subtotals[t.id as TalentId] = getSubtotal(s);
    }
    const dims = calcDimensionScoresFromTalent(subtotals);
    const cs = calcCombos(dims);
    const ss = buildSchemes(cs);
    return { dimScores: dims, combos: cs, schemes: ss };
  }, [scores]);

  return (
    <section id="subject-recommend" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
      {/* 板块标题 */}
      <div className="reveal mb-14 text-center">
        <p className="mb-3 flex items-center justify-center gap-2 text-xs tracking-[0.3em] text-starlight/60">
          <GraduationCap className="h-3.5 w-3.5" />
          SUBJECT RECOMMENDATION
        </p>
        <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
          选科 <span className="italic text-starlight">推荐</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-white/40">
          基于上方 12 维天赋得分实时换算为 6 维学科能力，结合新高考 3+1+2 模式输出推荐方案
          <br />
          <span className="text-white/30">调整任意维度滑块，下方推荐将同步更新</span>
        </p>
      </div>

      {/* 学科能力画像 */}
      <div className="reveal mb-12 rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <h3 className="mb-5 flex items-center gap-2 font-serif text-xl font-semibold text-white">
          <TrendingUp className="h-5 w-5 text-starlight" />
          学科能力换算
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {dimScores.map(ds => (
            <div
              key={ds.dimension}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium text-white/70">{ds.name}</span>
                <span className="font-display text-2xl font-semibold text-starlight">
                  {ds.score}
                </span>
              </div>
              {/* 进度条 */}
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-starlight/60 to-starlight transition-all duration-500"
                  style={{ width: `${ds.score}%` }}
                />
              </div>
              <div className="text-xs text-white/30">适配：{ds.subjects}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 三套推荐方案 */}
      <div className="reveal mb-12">
        <h3 className="mb-5 flex items-center gap-2 font-serif text-xl font-semibold text-white">
          <Award className="h-5 w-5 text-starlight" />
          推荐选科方案
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {schemes.map((scheme, idx) => {
            const isPrimary = idx === 0;
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border p-6 transition-all"
                style={{
                  borderColor: isPrimary ? "rgba(245, 185, 66, 0.4)" : "rgba(255,255,255,0.06)",
                  background: isPrimary
                    ? "linear-gradient(180deg, rgba(245,185,66,0.06) 0%, rgba(245,185,66,0.01) 100%)"
                    : "rgba(255,255,255,0.02)",
                  boxShadow: isPrimary ? "0 0 24px rgba(245, 185, 66, 0.08)" : "none",
                }}
              >
                {/* 标签 */}
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      background: isPrimary ? "rgba(245, 185, 66, 0.15)" : "rgba(255,255,255,0.05)",
                      color: isPrimary ? "#f5b942" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {scheme.tag}
                  </span>
                  <span className="font-display text-3xl font-bold text-starlight">
                    {scheme.data.totalScore}
                    <span className="ml-1 text-xs font-normal text-white/30">综合分</span>
                  </span>
                </div>

                {/* 组合名 */}
                <div
                  className="mb-3 font-display text-2xl font-semibold"
                  style={{ color: isPrimary ? "#fcd34d" : "rgba(255,255,255,0.9)" }}
                >
                  {scheme.data.name}
                </div>

                <p className="mb-4 text-xs leading-relaxed text-white/40">
                  {scheme.desc}
                </p>

                {/* 数据三宫格 */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white/[0.03] py-2">
                    <div className="font-display text-base font-semibold text-starlight/90">
                      {scheme.data.talentScore}
                    </div>
                    <div className="text-[10px] text-white/30">天赋匹配</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] py-2">
                    <div className="font-display text-base font-semibold text-starlight/90">
                      {scheme.data.majorRate}%
                    </div>
                    <div className="text-[10px] text-white/30">专业覆盖</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] py-2">
                    <div className="font-display text-base font-semibold text-starlight/90">
                      {scheme.data.learnDiff}
                    </div>
                    <div className="text-[10px] text-white/30">学习难度</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 全部组合排名 */}
      <div className="reveal mb-8 rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <h3 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-white">
          <Layers className="h-5 w-5 text-starlight" />
          全部 12 种组合排名
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 px-2 text-left font-normal text-white/40">排名</th>
                <th className="py-2 px-2 text-left font-normal text-white/40">组合</th>
                <th className="py-2 px-2 text-right font-normal text-white/40">综合分</th>
                <th className="py-2 px-2 text-right font-normal text-white/40">天赋</th>
                <th className="py-2 px-2 text-right font-normal text-white/40">覆盖率</th>
                <th className="py-2 px-2 text-right font-normal text-white/40">难度</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((c, i) => {
                const isTop = i < 3;
                return (
                  <tr
                    key={i}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="py-2 px-2">
                      <span
                        className="font-display font-semibold"
                        style={{ color: isTop ? "#f5b942" : "rgba(255,255,255,0.4)" }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td
                      className="py-2 px-2 font-medium"
                      style={{ color: isTop ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)" }}
                    >
                      {c.name}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-starlight">{c.totalScore}</td>
                    <td className="py-2 px-2 text-right text-white/60">{c.talentScore}</td>
                    <td className="py-2 px-2 text-right text-white/60">{c.majorRate}%</td>
                    <td className="py-2 px-2 text-right text-white/60">{c.learnDiff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 说明 */}
      <div className="reveal rounded-xl border border-starlight/15 bg-starlight/[0.03] p-5 text-xs leading-relaxed text-white/50">
        <strong className="text-starlight">换算说明：</strong>
        12 维天赋得分按权重映射至 6 维学科能力（如「逻辑分析型」→「逻辑数理」、「空间视觉型」→「空间想象」），
        再结合各学科权重计算单科匹配度。综合分 = 天赋 40% + 兴趣 20% + 专业覆盖 15% + 赋分 15% + 难度 10%。
        数据基于新高考 3+1+2 河南模式，结果仅供参考。
      </div>
    </section>
  );
}
