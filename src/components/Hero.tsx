import { Sparkles, ChevronDown, GraduationCap } from "lucide-react";

interface HeroProps {
  onScrollToAssessment: () => void;
}

/**
 * 标题区 - 大号衬线标题 + 使用说明 + 滚动指引
 */
export default function Hero({ onScrollToAssessment }: HeroProps) {
  return (
    <header className="relative z-10 flex min-h-[88vh] flex-col items-center justify-center px-6 text-center">
      {/* 顶部小标签 */}
      <div className="mb-8 flex items-center gap-2 rounded-full border border-starlight/30 bg-starlight/5 px-4 py-1.5 text-xs tracking-[0.3em] text-starlight/80 animate-float-up">
        <Sparkles className="h-3.5 w-3.5" />
        <span>TALENT CONSTELLATION</span>
      </div>

      {/* 主标题 */}
      <h1 className="animate-float-up font-display text-6xl font-semibold leading-[1.05] text-white sm:text-7xl md:text-8xl" style={{ animationDelay: "0.1s", opacity: 0 }}>
        天赋<span className="italic text-starlight">星图</span>
      </h1>

      {/* 副标题 */}
      <p className="mt-6 max-w-2xl animate-float-up font-serif text-lg leading-relaxed text-white/60 sm:text-xl" style={{ animationDelay: "0.25s", opacity: 0 }}>
        个人天赋自测表 · 交互式探索
        <br />
        <span className="text-base text-white/40">
          调整维度打分，看见属于你的天赋星座
        </span>
      </p>

      {/* 使用说明 */}
      <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
        {[
          { num: "01", text: "每条描述按符合程度打 1~5 分" },
          { num: "02", text: "雷达图实时反映你的天赋分布" },
          { num: "03", text: "得分最高的维度即你的核心赛道" },
        ].map((item, i) => (
          <div
            key={item.num}
            className="animate-float-up rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 text-left"
            style={{ animationDelay: `${0.4 + i * 0.12}s`, opacity: 0 }}
          >
            <div className="font-display text-2xl text-starlight/70">{item.num}</div>
            <p className="mt-1 text-sm leading-relaxed text-white/50">{item.text}</p>
          </div>
        ))}
      </div>

      {/* 滚动指引 */}
      <button
        onClick={onScrollToAssessment}
        className="group mt-16 flex flex-col items-center gap-2 text-white/40 transition-colors hover:text-starlight"
      >
        <span className="text-xs tracking-widest">开始探索</span>
        <ChevronDown className="h-5 w-5 animate-bounce transition-transform group-hover:translate-y-1" />
      </button>

      {/* 高考志愿导览入口（现为首页） */}
      <a
        href="#/"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-starlight/30 bg-starlight/[0.06] px-5 py-2 text-sm text-starlight/90 transition hover:bg-starlight/15 hover:text-starlight"
      >
        <GraduationCap className="h-4 w-4" />
        高考志愿导览 · 专业筛选推荐
        <ChevronDown className="h-3 w-3 -rotate-90" />
      </a>
    </header>
  );
}
