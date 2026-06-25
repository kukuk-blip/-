import RadarChart from "./RadarChart";
import RankingBars from "./RankingBars";

/**
 * 天赋概览区 - 雷达图与排名条左右分栏
 */
export default function OverviewSection() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
      <div className="reveal mb-12 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-starlight/60">
          YOUR TALENT CONSTELLATION
        </p>
        <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
          天赋<span className="italic text-starlight">星图</span>
        </h2>
        <p className="mt-4 text-sm text-white/40">
          12 个维度的实时分布 — 悬停查看单项详情，下方调整分数即可重塑星图
        </p>
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* 雷达图 */}
        <div className="reveal flex justify-center">
          <div className="relative">
            <RadarChart />
            {/* 装饰光环 */}
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(245,185,66,0.06),transparent_60%)] blur-2xl" />
          </div>
        </div>

        {/* 排名条 */}
        <div className="reveal">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-white">
              维度排名
            </h3>
            <span className="text-xs text-white/30">按小计分数降序</span>
          </div>
          <RankingBars />
        </div>
      </div>
    </section>
  );
}
