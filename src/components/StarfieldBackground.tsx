import { useEffect, useMemo, useRef, useState } from "react";

interface Star {
  cx: number;
  cy: number;
  r: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface ConstellationStar {
  x: number;  // 相对坐标 0-100
  y: number;
  size: number;
}

interface Constellation {
  name: string;
  stars: ConstellationStar[];
  links: [number, number][];  // 星点索引对，形成连线
  cx: number;  // 星座中心 x（用于距离判定）
  cy: number;
}

// ============ 预设星座 ============
// 坐标系：0-100 相对屏幕宽高
const CONSTELLATIONS: Constellation[] = [
  {
    // 大熊座（北斗七星，勺子形）
    name: "大熊座",
    cx: 22,
    cy: 25,
    stars: [
      { x: 8,  y: 22, size: 1.6 },
      { x: 14, y: 20, size: 1.4 },
      { x: 20, y: 22, size: 1.5 },
      { x: 26, y: 24, size: 1.3 },
      { x: 28, y: 30, size: 1.4 },
      { x: 22, y: 34, size: 1.3 },
      { x: 16, y: 32, size: 1.2 },
    ],
    links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],
  },
  {
    // 猎户座（沙漏形 + 腰带三星）
    name: "猎户座",
    cx: 72,
    cy: 30,
    stars: [
      { x: 66, y: 22, size: 1.6 },  // 左肩
      { x: 78, y: 20, size: 1.5 },  // 右肩
      { x: 70, y: 30, size: 1.3 },  // 腰带1
      { x: 72, y: 31, size: 1.3 },  // 腰带2
      { x: 74, y: 32, size: 1.3 },  // 腰带3
      { x: 64, y: 42, size: 1.5 },  // 左脚
      { x: 80, y: 40, size: 1.4 },  // 右脚
    ],
    links: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[0,1]],
  },
  {
    // 仙后座（W 形）
    name: "仙后座",
    cx: 50,
    cy: 70,
    stars: [
      { x: 38, y: 65, size: 1.4 },
      { x: 44, y: 72, size: 1.5 },
      { x: 50, y: 66, size: 1.3 },
      { x: 56, y: 72, size: 1.5 },
      { x: 62, y: 65, size: 1.4 },
    ],
    links: [[0,1],[1,2],[2,3],[3,4]],
  },
];

/**
 * 星空背景 - 星座版
 * - 底层：静止闪烁的星点（背景星空）
 * - 中层：3 个预设星座（北斗/猎户/仙后），星点之间有连线
 * - 交互：鼠标移动时整个星座层产生视差移动；鼠标靠近某星座时该星座高亮
 * - 移动端：无鼠标，降级为静态星座 + 自动缓慢视差
 */
export default function StarfieldBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const rafRef = useRef<number>(0);

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  // 背景闪烁星点
  const stars = useMemo<Star[]>(() => {
    const list: Star[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const count = isMobile ? 30 : 55;
    for (let i = 0; i < count; i++) {
      list.push({
        cx: rand() * 100,
        cy: rand() * 100,
        r: rand() * 1.1 + 0.3,
        delay: rand() * 6,
        duration: rand() * 4 + 3,
        opacity: rand() * 0.5 + 0.2,
      });
    }
    return list;
  }, [isMobile]);

  // 鼠标视差 + 高亮判定
  useEffect(() => {
    if (isMobile) {
      // 移动端：自动缓慢视差（正弦摆动）
      let t = 0;
      const id = setInterval(() => {
        t += 0.02;
        setParallax({
          x: Math.sin(t) * 8,
          y: Math.cos(t * 0.7) * 6,
        });
      }, 80);
      return () => clearInterval(id);
    }

    const onMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        // 鼠标相对屏幕中心的位置，归一化到 -1 ~ 1
        const nx = (e.clientX / w) * 2 - 1;
        const ny = (e.clientY / h) * 2 - 1;
        // 视差移动幅度：±18px
        setParallax({ x: nx * 18, y: ny * 14 });

        // 判定鼠标最靠近哪个星座（用星座中心点坐标换算到屏幕像素）
        let nearest = -1;
        let minDist = Infinity;
        CONSTELLATIONS.forEach((c, i) => {
          const px = (c.cx / 100) * w;
          const py = (c.cy / 100) * h;
          const d = Math.hypot(px - e.clientX, py - e.clientY);
          if (d < minDist) {
            minDist = d;
            nearest = i;
          }
        });
        // 距离阈值：屏幕对角线的 25% 以内才高亮
        const threshold = Math.hypot(w, h) * 0.25;
        setActiveIdx(minDist < threshold ? nearest : -1);
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* 底层：静止闪烁星点 */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <g style={{ willChange: "opacity" }}>
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#ffffff"
              className="animate-twinkle"
              style={{
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </g>
      </svg>

      {/* 中层：星座（随鼠标视差移动） */}
      <div
        style={{
          transform: `translate(${parallax.x}px, ${parallax.y}px)`,
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
        className="absolute inset-0"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* 银白星光晕染渐变 */}
          <defs>
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#dce8ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a8c5ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {CONSTELLATIONS.map((c, ci) => {
            const isActive = activeIdx === ci;
            const lineOpacity = isActive ? 0.75 : 0.22;
            const lineColor = isActive ? "#a8d8ff" : "#c9d4e8";
            const starColor = isActive ? "#ffffff" : "#e8edf5";
            const glowOpacity = isActive ? 0.9 : 0.5;
            return (
              <g key={c.name}>
                {/* 连线 */}
                {c.links.map(([a, b], li) => (
                  <line
                    key={li}
                    x1={c.stars[a].x}
                    y1={c.stars[a].y}
                    x2={c.stars[b].x}
                    y2={c.stars[b].y}
                    stroke={lineColor}
                    strokeWidth={isActive ? 0.35 : 0.2}
                    strokeLinecap="round"
                    opacity={lineOpacity}
                    style={{ transition: "opacity 0.5s ease, stroke 0.5s ease, stroke-width 0.5s ease" }}
                  />
                ))}
                {/* 星点 */}
                {c.stars.map((s, si) => (
                  <g key={si}>
                    {/* 光晕：银白带淡蓝 */}
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={s.size * 2.8}
                      fill="url(#starGlow)"
                      opacity={glowOpacity * 0.5}
                      style={{
                        transition: "opacity 0.5s ease",
                      }}
                    />
                    {/* 核心 */}
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={s.size}
                      fill={starColor}
                      className="animate-twinkle"
                      style={{
                        opacity: glowOpacity,
                        animationDelay: `${si * 0.4}s`,
                        transition: "fill 0.5s ease, opacity 0.5s ease",
                      }}
                    />
                  </g>
                ))}
                {/* 星座名（高亮时显示） */}
                {isActive && (
                  <text
                    x={c.cx}
                    y={c.cy + 8}
                    textAnchor="middle"
                    fontSize="1.6"
                    fill="#a8d8ff"
                    opacity="0.85"
                    style={{
                      fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
                      fontStyle: "italic",
                      letterSpacing: "0.3px",
                      transition: "opacity 0.5s ease",
                    }}
                  >
                    {c.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 远景星云光晕：仅桌面端启用 */}
      <div className="absolute -left-1/4 top-1/4 hidden h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(79,195,247,0.07),transparent_70%)] blur-3xl animate-drift md:block" />
      <div
        className="absolute right-0 top-1/2 hidden h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(255,126,159,0.06),transparent_70%)] blur-3xl animate-drift md:block"
        style={{ animationDelay: "8s" }}
      />
    </div>
  );
}
