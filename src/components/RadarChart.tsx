import { useState } from "react";
import { ALL_TYPES, CATEGORIES } from "@/data/talentData";
import { useTalentStore, getSubtotal } from "@/store/useTalentStore";

const SIZE = 460;
const CENTER = SIZE / 2;
const RADIUS = 170;
const RINGS = 5; // 同心圆层数

/**
 * SVG 雷达图 - 12 维度天赋可视化，实时反映打分
 */
export default function RadarChart() {
  const scores = useTalentStore((s) => s.scores);
  const [hovered, setHovered] = useState<string | null>(null);

  const axes = ALL_TYPES.map((t, i) => {
    const angle = (Math.PI * 2 * i) / ALL_TYPES.length - Math.PI / 2;
    const s = scores[t.id] ?? t.defaultScores;
    const subtotal = getSubtotal(s);
    const ratio = subtotal / 15; // 归一化 0-1
    const category = CATEGORIES.find((c) => c.id === t.categoryId)!;
    return {
      id: t.id,
      name: t.name,
      color: category.color,
      angle,
      // 轴端点（满格位置）
      axisX: CENTER + Math.cos(angle) * RADIUS,
      axisY: CENTER + Math.sin(angle) * RADIUS,
      // 实际数据点
      pointX: CENTER + Math.cos(angle) * RADIUS * ratio,
      pointY: CENTER + Math.sin(angle) * RADIUS * ratio,
      subtotal,
      ratio,
    };
  });

  // 数据多边形路径
  const dataPath = axes.map((a) => `${a.pointX},${a.pointY}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full max-w-[460px]"
      >
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245, 185, 66, 0.35)" />
            <stop offset="100%" stopColor="rgba(245, 185, 66, 0.08)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 同心多边形网格 */}
        {Array.from({ length: RINGS }).map((_, ringIdx) => {
          const r = (RADIUS * (ringIdx + 1)) / RINGS;
          const points = ALL_TYPES.map((_, i) => {
            const angle = (Math.PI * 2 * i) / ALL_TYPES.length - Math.PI / 2;
            return `${CENTER + Math.cos(angle) * r},${CENTER + Math.sin(angle) * r}`;
          }).join(" ");
          return (
            <polygon
              key={ringIdx}
              points={points}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* 轴线 */}
        {axes.map((a) => (
          <line
            key={`axis-${a.id}`}
            x1={CENTER}
            y1={CENTER}
            x2={a.axisX}
            y2={a.axisY}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        ))}

        {/* 数据多边形 */}
        <polygon
          points={dataPath}
          fill="url(#radarFill)"
          stroke="#f5b942"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#glow)"
          style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />

        {/* 数据点 */}
        {axes.map((a) => (
          <g key={`point-${a.id}`}>
            <circle
              cx={a.pointX}
              cy={a.pointY}
              r={hovered === a.id ? 6 : 4}
              fill={a.color}
              stroke="#070a1f"
              strokeWidth="2"
              style={{ transition: "all 0.3s ease" }}
            />
            {hovered === a.id && (
              <circle
                cx={a.pointX}
                cy={a.pointY}
                r="10"
                fill="none"
                stroke={a.color}
                strokeWidth="1.5"
                opacity="0.5"
              />
            )}
          </g>
        ))}

        {/* 标签 */}
        {axes.map((a) => {
          const labelDist = RADIUS + 28;
          const lx = CENTER + Math.cos(a.angle) * labelDist;
          const ly = CENTER + Math.sin(a.angle) * labelDist;
          const isHovered = hovered === a.id;
          return (
            <g
              key={`label-${a.id}`}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* 透明命中区域 */}
              <circle cx={lx} cy={ly} r="22" fill="transparent" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-sans"
                fontSize={isHovered ? "13" : "11"}
                fill={isHovered ? a.color : "rgba(232, 234, 246, 0.55)"}
                style={{ transition: "all 0.2s ease", fontWeight: isHovered ? 600 : 400 }}
              >
                {a.name.replace("型", "")}
              </text>
              {isHovered && (
                <text
                  x={lx}
                  y={ly + 14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill={a.color}
                  opacity="0.8"
                >
                  {a.subtotal}/15
                </text>
              )}
            </g>
          );
        })}

        {/* 中心点 */}
        <circle cx={CENTER} cy={CENTER} r="3" fill="#f5b942" opacity="0.6" />
      </svg>
    </div>
  );
}
