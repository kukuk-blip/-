import { useMemo, useState } from "react";
import { useGkTheme, default as ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft, RotateCcw, Sparkles, Check, ArrowRight } from "lucide-react";

// ============ 题库数据 ============
type Dimension = "logic" | "language" | "space" | "nature" | "memory" | "practice";

interface Question {
  id: number;
  title: string;
  dimension: Dimension;
}

const QUESTIONS: Question[] = [
  { id: 1, title: "解理科题目时，我能快速拆解出多个解题步骤，并推导不同方法的关联", dimension: "logic" },
  { id: 2, title: "遇到陌生公式，我能很快理解它的推导逻辑，而非死记硬背", dimension: "logic" },
  { id: 3, title: "阅读文章时，我能轻松捕捉作者的情感倾向与核心观点", dimension: "language" },
  { id: 4, title: "写作文 / 总结时，我擅长组织语言，把零散的想法整理成通顺的内容", dimension: "language" },
  { id: 5, title: "看立体几何图形时，我能快速在脑中构建出完整的空间结构", dimension: "space" },
  { id: 6, title: "到陌生城市，我能很快分清方向，看懂地图路线", dimension: "space" },
  { id: 7, title: "观察生物 / 化学实验时，我能注意到别人忽略的细节变化", dimension: "nature" },
  { id: 8, title: "我擅长发现不同知识点之间的共性规律，分类记忆", dimension: "nature" },
  { id: 9, title: "背诵文科知识点时，我能通过搭建框架长期记住大量内容", dimension: "memory" },
  { id: 10, title: "复习时，我习惯自己梳理知识体系，而非只看现成笔记", dimension: "memory" },
  { id: 11, title: "做理化实验时，我能严格按步骤操作，精准控制变量与用量", dimension: "practice" },
  { id: 12, title: "我喜欢拆解物品的运作原理，动手尝试组装 / 修复小物件", dimension: "practice" },
];

const DIMENSION_NAMES: Record<Dimension, string> = {
  logic: "逻辑数理",
  language: "语言表达",
  space: "空间想象",
  nature: "自然观察",
  memory: "记忆归纳",
  practice: "动手实操",
};

// 维度对应的适配学科提示
const DIMENSION_SUBJECTS: Record<Dimension, string> = {
  logic: "数学、物理",
  language: "语文、英语、历史",
  space: "物理、地理",
  nature: "生物、化学",
  memory: "历史、政治、生物",
  practice: "化学、物理实验",
};

// ============ 学科权重 ============
type Subject = "physics" | "chemistry" | "biology" | "history" | "politics" | "geography";

const SUBJECT_NAMES: Record<Subject, string> = {
  physics: "物理",
  chemistry: "化学",
  biology: "生物",
  history: "历史",
  politics: "政治",
  geography: "地理",
};

const SUBJECT_WEIGHTS: Record<Subject, Record<Dimension, number>> = {
  physics:   { logic: 0.9, space: 0.7, nature: 0.4, memory: 0.2, practice: 0.5, language: 0.1 },
  chemistry: { logic: 0.6, space: 0.3, nature: 0.8, memory: 0.4, practice: 0.8, language: 0.2 },
  biology:   { logic: 0.3, space: 0.2, nature: 0.9, memory: 0.7, practice: 0.6, language: 0.2 },
  history:   { logic: 0.1, space: 0.2, nature: 0.3, memory: 0.9, practice: 0.1, language: 0.8 },
  politics:  { logic: 0.2, space: 0.1, nature: 0.2, memory: 0.8, practice: 0.1, language: 0.7 },
  geography: { logic: 0.4, space: 0.8, nature: 0.5, memory: 0.6, practice: 0.2, language: 0.3 },
};

// ============ 3+1+2 选科组合 ============
interface SubjectCombo {
  name: string;
  subjects: Subject[];
  majorRate: number;   // 专业覆盖率（%）
  diffScore: number;   // 赋分优势（0-100，越高越容易拿高分）
  learnDiff: number;   // 学习难度（0-100，越高越难）
}

const SUBJECT_COMBOS: SubjectCombo[] = [
  { name: "物理 + 化学 + 生物", subjects: ["physics", "chemistry", "biology"],    majorRate: 96, diffScore: 85, learnDiff: 90 },
  { name: "物理 + 化学 + 地理", subjects: ["physics", "chemistry", "geography"],   majorRate: 95, diffScore: 80, learnDiff: 80 },
  { name: "物理 + 化学 + 政治", subjects: ["physics", "chemistry", "politics"],    majorRate: 95, diffScore: 75, learnDiff: 85 },
  { name: "物理 + 生物 + 地理", subjects: ["physics", "biology", "geography"],     majorRate: 78, diffScore: 70, learnDiff: 70 },
  { name: "物理 + 生物 + 政治", subjects: ["physics", "biology", "politics"],      majorRate: 76, diffScore: 65, learnDiff: 75 },
  { name: "物理 + 地理 + 政治", subjects: ["physics", "geography", "politics"],    majorRate: 72, diffScore: 60, learnDiff: 65 },
  { name: "历史 + 政治 + 地理", subjects: ["history", "politics", "geography"],    majorRate: 52, diffScore: 65, learnDiff: 60 },
  { name: "历史 + 政治 + 生物", subjects: ["history", "politics", "biology"],       majorRate: 58, diffScore: 60, learnDiff: 65 },
  { name: "历史 + 政治 + 化学", subjects: ["history", "politics", "chemistry"],    majorRate: 60, diffScore: 55, learnDiff: 75 },
  { name: "历史 + 地理 + 生物", subjects: ["history", "geography", "biology"],      majorRate: 55, diffScore: 62, learnDiff: 60 },
  { name: "历史 + 地理 + 化学", subjects: ["history", "geography", "chemistry"],   majorRate: 57, diffScore: 58, learnDiff: 70 },
  { name: "历史 + 生物 + 化学", subjects: ["history", "biology", "chemistry"],     majorRate: 62, diffScore: 55, learnDiff: 75 },
];

// ============ 5 级评分选项 ============
const OPTIONS = [
  { score: 1, label: "非常不符合" },
  { score: 2, label: "不太符合" },
  { score: 3, label: "一般" },
  { score: 4, label: "比较符合" },
  { score: 5, label: "非常符合" },
];

// ============ 类型定义 ============
type Phase = "start" | "test" | "result";

interface DimensionScore {
  dimension: Dimension;
  name: string;
  score: number;       // 0-100
  rawAvg: number;      // 1-5 原始均分
  subjects: string;    // 适配学科
}

interface ComboResult extends SubjectCombo {
  talentScore: number;   // 天赋匹配度 0-100
  totalScore: number;    // 综合得分 0-100
}

interface Scheme {
  tag: string;
  desc: string;
  data: ComboResult;
  color: string;       // 方案主色（CSS 变量）
}

// ============ 算法 ============
function calcDimensionScores(answers: Record<Dimension, number[]>): DimensionScore[] {
  const dims: Dimension[] = ["logic", "language", "space", "nature", "memory", "practice"];
  return dims.map(dim => {
    const arr = answers[dim] || [];
    const rawAvg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 3;
    return {
      dimension: dim,
      name: DIMENSION_NAMES[dim],
      score: Math.round(rawAvg * 20),  // 1-5 → 20-100
      rawAvg,
      subjects: DIMENSION_SUBJECTS[dim],
    };
  });
}

function calcSubjectScore(dimScores: DimensionScore[], subject: Subject): number {
  const weights = SUBJECT_WEIGHTS[subject];
  let total = 0;
  let weightSum = 0;
  for (const ds of dimScores) {
    const w = weights[ds.dimension] || 0;
    total += ds.score * w;
    weightSum += w;
  }
  return weightSum > 0 ? total / weightSum : 0;
}

function calcCombos(dimScores: DimensionScore[]): ComboResult[] {
  return SUBJECT_COMBOS.map(combo => {
    let talentScore = 0;
    combo.subjects.forEach(sub => {
      talentScore += calcSubjectScore(dimScores, sub);
    });
    talentScore = talentScore / combo.subjects.length;
    // 综合得分：天赋 40% + 专业覆盖 15% + 赋分 15% + 学习难度(反向) 10% + 兴趣(默认中等 70) 20%
    const totalScore =
      talentScore * 0.4 +
      combo.majorRate * 0.15 +
      combo.diffScore * 0.15 +
      (100 - combo.learnDiff) * 0.1 +
      70 * 0.2;
    return {
      ...combo,
      talentScore: Math.round(talentScore),
      totalScore: Math.round(totalScore),
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

function buildSchemes(combos: ComboResult[]): Scheme[] {
  const bestTalent = combos[0];
  const bestMajor = combos.find(c => c.majorRate >= 90) || combos[1] || combos[0];
  const bestCost = combos
    .filter(c => c.learnDiff <= 70)
    .sort((a, b) => b.totalScore - a.totalScore)[0] || combos[2] || combos[0];

  return [
    { tag: "天赋最优", desc: "最大化发挥你的能力优势，学习效率更高", data: bestTalent, color: "var(--c-primary)" },
    { tag: "就业友好", desc: "专业覆盖率高，适配工科 / 医学等热门方向", data: bestMajor, color: "var(--c-primary)" },
    { tag: "高性价比", desc: "学习压力适中，赋分竞争难度较低", data: bestCost, color: "var(--c-success)" },
  ];
}

// ============ 雷达图组件 ============
function RadarSVG({ scores }: { scores: DimensionScore[] }) {
  const SIZE = 460;
  const CENTER = SIZE / 2;
  const RADIUS = 150;
  const RINGS = 5;
  const [hovered, setHovered] = useState<number | null>(null);

  const axes = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / scores.length - Math.PI / 2;
    const ratio = s.score / 100;
    return {
      ...s,
      angle,
      axisX: CENTER + Math.cos(angle) * RADIUS,
      axisY: CENTER + Math.sin(angle) * RADIUS,
      pointX: CENTER + Math.cos(angle) * RADIUS * ratio,
      pointY: CENTER + Math.sin(angle) * RADIUS * ratio,
    };
  });

  const dataPath = axes.map(a => `${a.pointX},${a.pointY}`).join(" ");

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full max-w-[420px]">
        {/* 同心多边形网格 */}
        {Array.from({ length: RINGS }).map((_, ringIdx) => {
          const r = (RADIUS * (ringIdx + 1)) / RINGS;
          const points = scores.map((_, i) => {
            const angle = (Math.PI * 2 * i) / scores.length - Math.PI / 2;
            return `${CENTER + Math.cos(angle) * r},${CENTER + Math.sin(angle) * r}`;
          }).join(" ");
          return (
            <polygon
              key={ringIdx}
              points={points}
              fill="none"
              stroke="var(--c-border)"
              strokeWidth="1"
              opacity={ringIdx === RINGS - 1 ? 0.8 : 0.4}
            />
          );
        })}

        {/* 轴线 */}
        {axes.map((a, i) => (
          <line
            key={`axis-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={a.axisX}
            y2={a.axisY}
            stroke="var(--c-border)"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* 数据多边形 */}
        <polygon
          points={dataPath}
          fill="var(--c-primary-15)"
          stroke="var(--c-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />

        {/* 数据点 */}
        {axes.map((a, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={a.pointX}
              cy={a.pointY}
              r={hovered === i ? 6 : 4}
              fill="var(--c-primary)"
              stroke="var(--c-card-solid)"
              strokeWidth="2"
              style={{ transition: "all 0.3s ease" }}
            />
            {hovered === i && (
              <circle
                cx={a.pointX}
                cy={a.pointY}
                r="10"
                fill="none"
                stroke="var(--c-primary)"
                strokeWidth="1.5"
                opacity="0.5"
              />
            )}
          </g>
        ))}

        {/* 标签 */}
        {axes.map((a, i) => {
          const labelDist = RADIUS + 32;
          const lx = CENTER + Math.cos(a.angle) * labelDist;
          const ly = CENTER + Math.sin(a.angle) * labelDist;
          const isHovered = hovered === i;
          return (
            <g
              key={`label-${i}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={lx} cy={ly} r="24" fill="transparent" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isHovered ? "14" : "12"}
                fill={isHovered ? "var(--c-primary)" : "var(--c-secondary)"}
                style={{ transition: "all 0.2s ease", fontWeight: isHovered ? 600 : 400 }}
              >
                {a.name}
              </text>
              {isHovered && (
                <text
                  x={lx}
                  y={ly + 16}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fill="var(--c-primary)"
                  opacity="0.85"
                >
                  {a.score}分
                </text>
              )}
            </g>
          );
        })}

        {/* 中心点 */}
        <circle cx={CENTER} cy={CENTER} r="3" fill="var(--c-primary)" opacity="0.6" />
      </svg>
    </div>
  );
}

// ============ 主组件 ============
export default function TalentTest() {
  const [theme, setTheme] = useGkTheme();
  const [phase, setPhase] = useState<Phase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<Dimension, number[]>>({
    logic: [], language: [], space: [], nature: [], memory: [], practice: [],
  });

  const dimScores = useMemo(
    () => calcDimensionScores(answers),
    [answers]
  );

  const combos = useMemo(
    () => phase === "result" ? calcCombos(dimScores) : [],
    [phase, dimScores]
  );

  const schemes = useMemo(
    () => phase === "result" ? buildSchemes(combos) : [],
    [phase, combos]
  );

  const startTest = () => {
    setPhase("test");
    setCurrentIndex(0);
    setAnswers({ logic: [], language: [], space: [], nature: [], memory: [], practice: [] });
  };

  const selectOption = (score: number) => {
    const q = QUESTIONS[currentIndex];
    setAnswers(prev => ({
      ...prev,
      [q.dimension]: [...prev[q.dimension], score],
    }));
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setPhase("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    window.location.hash = "#/";
  };

  const progress = phase === "test" ? (currentIndex / QUESTIONS.length) * 100 : phase === "result" ? 100 : 0;

  return (
    <div
      data-gk-theme={theme}
      style={{ minHeight: "100vh", background: "var(--c-bg)" }}
      className="font-sans"
    >
      {/* 顶部导航 */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: "color-mix(in srgb, var(--c-bg) 88%, transparent)",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--c-secondary)" }}
          >
            <ChevronLeft size={18} />
            <span>返回高考志愿</span>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: "var(--c-primary)" }} />
            <h1 className="text-base md:text-lg font-semibold" style={{ color: "var(--c-title)" }}>
              天赋测评 · 选科推荐
            </h1>
          </div>
          <ThemeToggle theme={theme} onChange={setTheme} compact />
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-[760px] mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* === 开始页 === */}
        {phase === "start" && (
          <div
            className="rounded-2xl p-6 md:p-10"
            style={{
              background: "var(--c-card)",
              border: "1px solid var(--c-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: "var(--c-primary-15)" }}
              >
                <Sparkles size={32} style={{ color: "var(--c-primary)" }} />
              </div>
              <h2
                className="text-2xl md:text-3xl font-semibold mb-3"
                style={{ color: "var(--c-title)" }}
              >
                高考选科天赋测评
              </h2>
              <p style={{ color: "var(--c-secondary)" }} className="leading-relaxed">
                基于多元智能理论，结合新高考选科要求<br />
                为你推荐适配的选科组合
              </p>
            </div>

            <div
              className="rounded-xl p-5 mb-6"
              style={{ background: "var(--c-primary-8)", border: "1px solid var(--c-primary-15)" }}
            >
              <div className="space-y-2.5 text-sm" style={{ color: "var(--c-body)" }}>
                <div className="flex items-start gap-2">
                  <Check size={16} style={{ color: "var(--c-primary)", marginTop: 3, flexShrink: 0 }} />
                  <span>精简版共 <strong style={{ color: "var(--c-title)" }}>12 题</strong>，约 <strong style={{ color: "var(--c-title)" }}>3 分钟</strong> 完成</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={16} style={{ color: "var(--c-primary)", marginTop: 3, flexShrink: 0 }} />
                  <span>覆盖 <strong style={{ color: "var(--c-title)" }}>6 大学科能力维度</strong>：逻辑数理 / 语言表达 / 空间想象 / 自然观察 / 记忆归纳 / 动手实操</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={16} style={{ color: "var(--c-primary)", marginTop: 3, flexShrink: 0 }} />
                  <span>输出 <strong style={{ color: "var(--c-title)" }}>三套选科方案</strong>：天赋最优 / 就业友好 / 高性价比</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={16} style={{ color: "var(--c-primary)", marginTop: 3, flexShrink: 0 }} />
                  <span>兼容新高考 <strong style={{ color: "var(--c-title)" }}>3+1+2</strong> 与 <strong style={{ color: "var(--c-title)" }}>3+3</strong> 模式</span>
                </div>
              </div>
            </div>

            <button
              onClick={startTest}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-medium transition-all hover:opacity-90"
              style={{
                background: "var(--c-primary)",
                color: "var(--c-hover-text)",
                minHeight: 48,
              }}
            >
              开始测评
              <ArrowRight size={20} />
            </button>

            <p className="text-center text-xs mt-4" style={{ color: "var(--c-secondary)" }}>
              测评结果为学习潜力参考，请结合自身成绩与职业规划综合决策
            </p>
          </div>
        )}

        {/* === 答题页 === */}
        {phase === "test" && (
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: "var(--c-card)",
              border: "1px solid var(--c-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span style={{ color: "var(--c-secondary)" }}>
                  第 {currentIndex + 1} / {QUESTIONS.length} 题
                </span>
                <span style={{ color: "var(--c-primary)" }} className="font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--c-block-30)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "var(--c-primary)" }}
                />
              </div>
            </div>

            {/* 题目 */}
            <div key={currentIndex} className="reveal is-visible">
              <div
                className="text-lg md:text-xl font-medium mb-6 leading-relaxed"
                style={{ color: "var(--c-title)" }}
              >
                {QUESTIONS[currentIndex].title}
              </div>

              {/* 选项 */}
              <div className="flex flex-col gap-2.5">
                {OPTIONS.map(opt => (
                  <button
                    key={opt.score}
                    onClick={() => selectOption(opt.score)}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-left text-sm md:text-base transition-all"
                    style={{
                      background: "var(--c-card)",
                      border: "1px solid var(--c-border)",
                      color: "var(--c-body)",
                      minHeight: 48,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--c-primary)";
                      e.currentTarget.style.background = "var(--c-primary-8)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "var(--c-border)";
                      e.currentTarget.style.background = "var(--c-card)";
                    }}
                  >
                    <span>{opt.label}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--c-block-30)",
                        color: "var(--c-secondary)",
                      }}
                    >
                      {opt.score} 分
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === 结果页 === */}
        {phase === "result" && (
          <div className="space-y-6">
            {/* 能力画像 */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: "var(--c-card)",
                border: "1px solid var(--c-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h2
                className="text-xl md:text-2xl font-semibold mb-2 text-center"
                style={{ color: "var(--c-title)" }}
              >
                你的能力画像
              </h2>
              <p className="text-center text-sm mb-4" style={{ color: "var(--c-secondary)" }}>
                鼠标悬停雷达图节点查看详细得分
              </p>
              <RadarSVG scores={dimScores} />

              {/* 维度得分列表 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                {dimScores.map(ds => (
                  <div
                    key={ds.dimension}
                    className="rounded-lg p-3"
                    style={{
                      background: "var(--c-block-30)",
                      border: "1px solid var(--c-border)",
                    }}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--c-title)" }}>
                        {ds.name}
                      </span>
                      <span className="text-lg font-semibold" style={{ color: "var(--c-primary)" }}>
                        {ds.score}
                      </span>
                    </div>
                    {/* 进度条 */}
                    <div
                      className="h-1.5 rounded-full overflow-hidden mb-1.5"
                      style={{ background: "var(--c-border)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${ds.score}%`, background: "var(--c-primary)" }}
                      />
                    </div>
                    <div className="text-xs" style={{ color: "var(--c-secondary)" }}>
                      适配：{ds.subjects}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 推荐方案 */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: "var(--c-card)",
                border: "1px solid var(--c-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h2
                className="text-xl md:text-2xl font-semibold mb-5"
                style={{ color: "var(--c-title)" }}
              >
                推荐选科方案
              </h2>

              <div className="space-y-4">
                {schemes.map((scheme, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-5 transition-all"
                    style={{
                      background: "var(--c-card)",
                      border: `2px solid ${scheme.color}`,
                      borderLeft: `4px solid ${scheme.color}`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: scheme.color,
                            color: "var(--c-hover-text)",
                          }}
                        >
                          {scheme.tag}
                        </span>
                        <span
                          className="text-xl md:text-2xl font-semibold"
                          style={{ color: "var(--c-title)" }}
                        >
                          {scheme.data.name}
                        </span>
                      </div>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: scheme.color }}
                      >
                        {scheme.data.totalScore}
                        <span className="text-sm font-normal ml-1" style={{ color: "var(--c-secondary)" }}>
                          综合分
                        </span>
                      </span>
                    </div>

                    <p className="text-sm mb-3" style={{ color: "var(--c-body)" }}>
                      {scheme.desc}
                    </p>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div
                        className="rounded-lg py-2 px-1"
                        style={{ background: "var(--c-primary-8)" }}
                      >
                        <div className="text-base font-semibold" style={{ color: "var(--c-primary)" }}>
                          {scheme.data.talentScore}
                        </div>
                        <div className="text-xs" style={{ color: "var(--c-secondary)" }}>天赋匹配</div>
                      </div>
                      <div
                        className="rounded-lg py-2 px-1"
                        style={{ background: "var(--c-primary-8)" }}
                      >
                        <div className="text-base font-semibold" style={{ color: "var(--c-primary)" }}>
                          {scheme.data.majorRate}%
                        </div>
                        <div className="text-xs" style={{ color: "var(--c-secondary)" }}>专业覆盖</div>
                      </div>
                      <div
                        className="rounded-lg py-2 px-1"
                        style={{ background: "var(--c-primary-8)" }}
                      >
                        <div className="text-base font-semibold" style={{ color: "var(--c-primary)" }}>
                          {scheme.data.learnDiff}/100
                        </div>
                        <div className="text-xs" style={{ color: "var(--c-secondary)" }}>学习难度</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 全部组合排名 */}
              <details className="mt-5">
                <summary
                  className="cursor-pointer text-sm font-medium py-2"
                  style={{ color: "var(--c-secondary)" }}
                >
                  查看全部 12 种选科组合排名 ▾
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: `1px solid var(--c-border)` }}>
                        <th className="py-2 px-2 text-left" style={{ color: "var(--c-secondary)" }}>排名</th>
                        <th className="py-2 px-2 text-left" style={{ color: "var(--c-secondary)" }}>组合</th>
                        <th className="py-2 px-2 text-right" style={{ color: "var(--c-secondary)" }}>综合分</th>
                        <th className="py-2 px-2 text-right" style={{ color: "var(--c-secondary)" }}>天赋</th>
                        <th className="py-2 px-2 text-right" style={{ color: "var(--c-secondary)" }}>覆盖率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combos.map((c, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid var(--c-border-soft)` }}>
                          <td className="py-2 px-2" style={{ color: "var(--c-secondary)" }}>{i + 1}</td>
                          <td className="py-2 px-2 font-medium" style={{ color: "var(--c-title)" }}>{c.name}</td>
                          <td className="py-2 px-2 text-right font-semibold" style={{ color: "var(--c-primary)" }}>{c.totalScore}</td>
                          <td className="py-2 px-2 text-right" style={{ color: "var(--c-body)" }}>{c.talentScore}</td>
                          <td className="py-2 px-2 text-right" style={{ color: "var(--c-body)" }}>{c.majorRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={startTest}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{
                  background: "var(--c-card)",
                  border: "1px solid var(--c-border)",
                  color: "var(--c-body)",
                  minHeight: 48,
                }}
              >
                <RotateCcw size={16} />
                重新测评
              </button>
              <button
                onClick={goBack}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{
                  background: "var(--c-primary)",
                  color: "var(--c-hover-text)",
                  minHeight: 48,
                }}
              >
                查看高考数据
                <ArrowRight size={16} />
              </button>
            </div>

            {/* 温馨提示 */}
            <div
              className="rounded-xl p-4 text-xs leading-relaxed"
              style={{
                background: "var(--c-primary-8)",
                color: "var(--c-secondary)",
                border: "1px solid var(--c-primary-15)",
              }}
            >
              <strong style={{ color: "var(--c-title)" }}>温馨提示：</strong>
              测评结果为学习潜力参考，最终选科请结合自身成绩、学校师资、职业规划综合判断。
              专业覆盖率、赋分难度等数据基于河南省新高考 3+1+2 模式统计，其他省份可能略有差异。
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: "var(--c-secondary)" }}>
        基于多元智能理论 · 适配新高考 3+1+2 / 3+3 模式
      </footer>
    </div>
  );
}
