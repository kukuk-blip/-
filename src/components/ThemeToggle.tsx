import { useEffect, useState } from "react";

// ============ 主题定义 ============
export type GkTheme = "dark" | "morandi" | "blue";

interface ThemeOption {
  key: GkTheme;
  label: string;
  // 缩略预览色（用于按钮内的色块展示，不随主题变）
  preview: { bg: string; primary: string; title: string };
  desc: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: "dark",
    label: "深色",
    desc: "深空蓝 + 金色高亮",
    preview: { bg: "#070a1f", primary: "#f5b942", title: "#e8eaf6" },
  },
  {
    key: "morandi",
    label: "莫兰迪",
    desc: "暖调米白 + 雾霾蓝",
    preview: { bg: "#F5F2ED", primary: "#8FAABE", title: "#3A3733" },
  },
  {
    key: "blue",
    label: "天空蓝",
    desc: "冷调白 + 天空蓝草绿",
    preview: { bg: "#F7FAFC", primary: "#5A9BC7", title: "#2D3748" },
  },
];

const STORAGE_KEY = "gk-theme";
const DEFAULT_THEME: GkTheme = "morandi";

// 读取本地存储的初始主题（避免 SSR 不一致，这里在客户端执行）
function getInitialTheme(): GkTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const saved = window.localStorage.getItem(STORAGE_KEY) as GkTheme | null;
  if (saved && THEME_OPTIONS.some(o => o.key === saved)) return saved;
  return DEFAULT_THEME;
}

interface ThemeToggleProps {
  theme: GkTheme;
  onChange: (theme: GkTheme) => void;
  // 紧凑模式：横向单行小按钮（用于空间受限的导航栏）
  compact?: boolean;
}

export default function ThemeToggle({ theme, onChange, compact = false }: ThemeToggleProps) {
  if (compact) {
    // 紧凑模式：三个小色块按钮，单行排列
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-full"
        style={{
          background: "var(--c-card)",
          border: "1px solid var(--c-border)",
        }}
      >
        {THEME_OPTIONS.map(opt => {
          const active = theme === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              title={`${opt.label}：${opt.desc}`}
              aria-label={`切换到${opt.label}主题`}
              aria-pressed={active}
              className="relative flex items-center justify-center transition-all"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: opt.preview.bg,
                border: active
                  ? `2px solid var(--c-primary)`
                  : "2px solid transparent",
                boxShadow: active ? "0 0 0 2px var(--c-bg)" : "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: opt.preview.primary,
                  display: "block",
                }}
              />
            </button>
          );
        })}
      </div>
    );
  }

  // 默认模式：三按钮分段控件，带文字说明
  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-lg"
      style={{
        background: "var(--c-card)",
        border: "1px solid var(--c-border)",
      }}
      role="radiogroup"
      aria-label="主题切换"
    >
      {THEME_OPTIONS.map(opt => {
        const active = theme === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            title={opt.desc}
            aria-label={`切换到${opt.label}主题`}
            aria-pressed={active}
            role="radio"
            aria-checked={active}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all text-xs"
            style={{
              background: active ? "var(--c-primary)" : "transparent",
              color: active ? "var(--c-hover-text)" : "var(--c-secondary)",
              border: "none",
              cursor: "pointer",
              fontWeight: active ? 600 : 400,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: opt.preview.bg,
                border: `1.5px solid ${opt.preview.primary}`,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ============ 主题 Hook：管理主题状态 + 持久化 + 应用到 DOM ============
export function useGkTheme() {
  const [theme, setTheme] = useState<GkTheme>(getInitialTheme);

  // 应用主题到 document.documentElement（<html>），让 [data-gk-theme] 选择器生效
  // 同时作用于整个 GaokaoPage 子树
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-gk-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return [theme, setTheme] as const;
}
