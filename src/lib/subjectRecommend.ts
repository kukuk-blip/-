// ============ 选科推荐算法（供天赋星图板块与 TalentTest 复用） ============

// 6 维学科能力
export type Dimension = "logic" | "language" | "space" | "nature" | "memory" | "practice";

// 12 维天赋 id（来自 talentData）
export type TalentId =
  | "logical" | "creative" | "insight"
  | "empathy" | "organize" | "connect"
  | "visual" | "handson" | "rhythm"
  | "goal" | "iterate" | "stable";

export interface DimensionScore {
  dimension: Dimension;
  name: string;
  score: number;        // 0-100
  subjects: string;    // 适配学科
}

interface SubjectCombo {
  name: string;
  subjects: Subject[];
  majorRate: number;
  diffScore: number;
  learnDiff: number;
}

export interface ComboResult extends SubjectCombo {
  talentScore: number;
  totalScore: number;
}

export interface Scheme {
  tag: string;
  desc: string;
  data: ComboResult;
}

export type Subject = "physics" | "chemistry" | "biology" | "history" | "politics" | "geography";

// ============ 维度名称与适配学科 ============
export const DIMENSION_NAMES: Record<Dimension, string> = {
  logic: "逻辑数理",
  language: "语言表达",
  space: "空间想象",
  nature: "自然观察",
  memory: "记忆归纳",
  practice: "动手实操",
};

const DIMENSION_SUBJECTS: Record<Dimension, string> = {
  logic: "数学、物理",
  language: "语文、英语、历史",
  space: "物理、地理",
  nature: "生物、化学",
  memory: "历史、政治、生物",
  practice: "化学、物理实验",
};

// ============ 12 维天赋 → 6 维学科能力 映射权重 ============
// 把天赋星图的 12 维得分换算为 6 维学科能力得分
export const TALENT_TO_DIMENSION: Record<Dimension, Partial<Record<TalentId, number>>> = {
  logic:    { logical: 0.9, insight: 0.5, iterate: 0.3 },
  language: { empathy: 0.8, connect: 0.6, rhythm: 0.4 },
  space:    { visual: 0.9, creative: 0.4 },
  nature:   { handson: 0.5, insight: 0.4, iterate: 0.4 },
  memory:   { iterate: 0.6, organize: 0.5, stable: 0.3 },
  practice: { handson: 0.9, goal: 0.4 },
};

// ============ 学科权重（6 维 → 单科匹配） ============
export const SUBJECT_WEIGHTS: Record<Subject, Record<Dimension, number>> = {
  physics:   { logic: 0.9, space: 0.7, nature: 0.4, memory: 0.2, practice: 0.5, language: 0.1 },
  chemistry: { logic: 0.6, space: 0.3, nature: 0.8, memory: 0.4, practice: 0.8, language: 0.2 },
  biology:   { logic: 0.3, space: 0.2, nature: 0.9, memory: 0.7, practice: 0.6, language: 0.2 },
  history:   { logic: 0.1, space: 0.2, nature: 0.3, memory: 0.9, practice: 0.1, language: 0.8 },
  politics:  { logic: 0.2, space: 0.1, nature: 0.2, memory: 0.8, practice: 0.1, language: 0.7 },
  geography: { logic: 0.4, space: 0.8, nature: 0.5, memory: 0.6, practice: 0.2, language: 0.3 },
};

// ============ 3+1+2 选科组合基准数据 ============
export const SUBJECT_COMBOS: SubjectCombo[] = [
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

// ============ 计算函数 ============

/**
 * 由 12 维天赋小计分数（每个 3-15）换算为 6 维学科能力得分（0-100）
 * @param talentSubtotals - { logical: 8, creative: 7, ... } 每个维度的小计
 */
export function calcDimensionScoresFromTalent(
  talentSubtotals: Record<TalentId, number>
): DimensionScore[] {
  const dims: Dimension[] = ["logic", "language", "space", "nature", "memory", "practice"];
  return dims.map(dim => {
    const weights = TALENT_TO_DIMENSION[dim];
    let total = 0;
    let weightSum = 0;
    for (const [talentId, w] of Object.entries(weights) as [TalentId, number][]) {
      // 小计 3-15 → 归一化 0-100（默认 3 分时为 20，满分 15 时为 100）
      const sub = talentSubtotals[talentId] ?? 9;
      const normalized = (sub / 15) * 100;
      total += normalized * w;
      weightSum += w;
    }
    return {
      dimension: dim,
      name: DIMENSION_NAMES[dim],
      score: Math.round(weightSum > 0 ? total / weightSum : 50),
      subjects: DIMENSION_SUBJECTS[dim],
    };
  });
}

/**
 * 由 6 维学科能力得分（直接给出 0-100，用于 TalentTest 答题场景）
 */
export function calcDimensionScoresFromRaw(
  rawScores: Record<Dimension, number[]>
): DimensionScore[] {
  const dims: Dimension[] = ["logic", "language", "space", "nature", "memory", "practice"];
  return dims.map(dim => {
    const arr = rawScores[dim] || [];
    const rawAvg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 3;
    return {
      dimension: dim,
      name: DIMENSION_NAMES[dim],
      score: Math.round(rawAvg * 20),
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

export function calcCombos(dimScores: DimensionScore[]): ComboResult[] {
  return SUBJECT_COMBOS.map(combo => {
    let talentScore = 0;
    combo.subjects.forEach(sub => {
      talentScore += calcSubjectScore(dimScores, sub);
    });
    talentScore = talentScore / combo.subjects.length;
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

export function buildSchemes(combos: ComboResult[]): Scheme[] {
  const bestTalent = combos[0];
  const bestMajor = combos.find(c => c.majorRate >= 90) || combos[1] || combos[0];
  const bestCost = combos
    .filter(c => c.learnDiff <= 70)
    .sort((a, b) => b.totalScore - a.totalScore)[0] || combos[2] || combos[0];

  return [
    { tag: "天赋最优", desc: "最大化发挥你的能力优势，学习效率更高", data: bestTalent },
    { tag: "就业友好", desc: "专业覆盖率高，适配工科 / 医学等热门方向", data: bestMajor },
    { tag: "高性价比", desc: "学习压力适中，赋分竞争难度较低", data: bestCost },
  ];
}
