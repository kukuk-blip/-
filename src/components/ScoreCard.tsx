import { useTalentStore, getSubtotal } from "@/store/useTalentStore";
import type { TalentType } from "@/data/talentData";

interface ScoreCardProps {
  type: TalentType;
  color: string;
  colorRgb: string;
}

/**
 * 打分卡片 - 单个天赋类型，含 3 条描述与滑块
 */
export default function ScoreCard({ type, color, colorRgb }: ScoreCardProps) {
  const scores = useTalentStore((s) => s.scores[type.id] ?? type.defaultScores);
  const setScore = useTalentStore((s) => s.setScore);

  const subtotal = getSubtotal(scores);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
      style={{ boxShadow: `inset 3px 0 0 0 ${color}` }}
    >
      {/* 悬浮光晕 */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `rgba(${colorRgb}, 0.15)` }}
      />

      {/* 标题行 */}
      <div className="mb-5 flex items-baseline justify-between">
        <h4 className="font-serif text-lg font-semibold text-white">
          {type.name}
        </h4>
        <div className="flex items-baseline gap-1">
          <span
            className="font-display text-2xl font-semibold"
            style={{ color }}
          >
            {subtotal}
          </span>
          <span className="text-xs text-white/30">/ 15</span>
        </div>
      </div>

      {/* 三条描述 + 滑块 */}
      <div className="flex flex-col gap-4">
        {type.questions.map((q, i) => {
          const value = scores[i];
          const progress = ((value - 1) / 4) * 100;
          return (
            <div key={i}>
              <p className="mb-2 text-sm leading-relaxed text-white/55">
                {q}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={value}
                  onChange={(e) => setScore(type.id, i, Number(e.target.value))}
                  className="flex-1"
                  style={
                    {
                      "--progress": `${progress}%`,
                    } as React.CSSProperties
                  }
                />
                <div className="flex w-20 shrink-0 justify-end gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className="h-1.5 w-1.5 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          n <= value ? color : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
                <span
                  className="w-4 shrink-0 text-center text-xs font-medium"
                  style={{ color: value > 0 ? color : "rgba(255,255,255,0.3)" }}
                >
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
