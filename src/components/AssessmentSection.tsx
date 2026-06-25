import { CATEGORIES } from "@/data/talentData";
import ScoreCard from "./ScoreCard";

/**
 * 维度自评区 - 4 大类 12 个天赋类型的打分卡片
 */
export default function AssessmentSection() {
  return (
    <section id="assessment" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
      <div className="reveal mb-14 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-starlight/60">
          DIMENSION SELF-ASSESSMENT
        </p>
        <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
          天赋维度<span className="italic text-starlight">自评</span>
        </h2>
        <p className="mt-4 text-sm text-white/40">
          拖动滑块调整每条描述的符合程度，雷达图与排名将实时更新
        </p>
      </div>

      <div className="flex flex-col gap-16">
        {CATEGORIES.map((category) => (
          <div key={category.id} className="reveal">
            {/* 类别标题 */}
            <div className="mb-6 flex items-center gap-4">
              <div
                className="h-10 w-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <h3 className="font-serif text-2xl font-semibold text-white">
                  {category.name}
                </h3>
                <p
                  className="text-xs tracking-[0.2em]"
                  style={{ color: category.color, opacity: 0.7 }}
                >
                  {category.subtitle}
                </p>
              </div>
            </div>

            {/* 打分卡片网格 */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {category.types.map((type) => (
                <ScoreCard
                  key={type.id}
                  type={type}
                  color={category.color}
                  colorRgb={category.colorRgb}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
