import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ALL_TYPES, CATEGORIES } from "@/data/talentData";

// 打分状态：每个天赋类型 3 题各 1-5 分
type ScoresState = Record<string, [number, number, number]>;

// 事件自查文本状态
interface PeakEvent {
  process: string;
  bestPart: string;
  ability: string;
}

interface EventsState {
  peakEvents: [PeakEvent, PeakEvent, PeakEvent];
  othersFeedback: {
    helpRequests: string;
    praises: string;
    abilities: string;
  };
  lowEnergyHighOutput: {
    naturalTalent: string;
    flowState: string;
    fulfilling: string;
    abilities: string;
  };
}

interface TalentStore {
  scores: ScoresState;
  events: EventsState;
  setScore: (typeId: string, qIndex: number, value: number) => void;
  resetScores: () => void;
  setEventField: (path: string, value: string) => void;
  resetAll: () => void;
}

// 构建默认打分
function buildDefaultScores(): ScoresState {
  const result: ScoresState = {};
  for (const t of ALL_TYPES) {
    result[t.id] = [...t.defaultScores] as [number, number, number];
  }
  return result;
}

function buildDefaultEvents(): EventsState {
  return {
    peakEvents: [
      { process: "", bestPart: "", ability: "" },
      { process: "", bestPart: "", ability: "" },
      { process: "", bestPart: "", ability: "" },
    ],
    othersFeedback: { helpRequests: "", praises: "", abilities: "" },
    lowEnergyHighOutput: {
      naturalTalent: "",
      flowState: "",
      fulfilling: "",
      abilities: "",
    },
  };
}

export const useTalentStore = create<TalentStore>()(
  persist(
    (set) => ({
      scores: buildDefaultScores(),
      events: buildDefaultEvents(),
      setScore: (typeId, qIndex, value) =>
        set((state) => {
          const current = state.scores[typeId] ?? [3, 3, 3];
          const next = [...current] as [number, number, number];
          next[qIndex] = value;
          return { scores: { ...state.scores, [typeId]: next } };
        }),
      resetScores: () => set({ scores: buildDefaultScores() }),
      setEventField: (path, value) =>
        set((state) => {
          const events = JSON.parse(JSON.stringify(state.events));
          const keys = path.split(".");
          let target: Record<string, unknown> = events;
          for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]] as Record<string, unknown>;
          }
          target[keys[keys.length - 1]] = value;
          return { events };
        }),
      resetAll: () => set({ scores: buildDefaultScores(), events: buildDefaultEvents() }),
    }),
    {
      name: "talent-assessment-storage",
      version: 1,
    }
  )
);

// 计算某个天赋类型的小计分数
export function getSubtotal(scores: [number, number, number]): number {
  return scores[0] + scores[1] + scores[2];
}

// 获取所有类型的小计，按分数降序排列
export function getRankedScores(state: ReturnType<typeof useTalentStore.getState>) {
  return ALL_TYPES.map((t) => {
    const scores = state.scores[t.id] ?? t.defaultScores;
    const category = CATEGORIES.find((c) => c.id === t.categoryId)!;
    return {
      id: t.id,
      name: t.name,
      categoryId: t.categoryId,
      categoryName: category.name,
      color: category.color,
      colorRgb: category.colorRgb,
      subtotal: getSubtotal(scores),
      maxSubtotal: 15,
    };
  }).sort((a, b) => b.subtotal - a.subtotal);
}
