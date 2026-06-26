import { useMemo } from "react";

interface Star {
  cx: number;
  cy: number;
  r: number;
  delay: number;
  duration: number;
  opacity: number;
}

/**
 * 星空背景 - 固定定位的 SVG 星点，带闪烁动画
 * 移动端优化：减少星数 + 禁用大型 blur 星云，降低 GPU 负担
 */
export default function StarfieldBackground() {
  const stars = useMemo<Star[]>(() => {
    const list: Star[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    // 移动端 40 颗，桌面端 70 颗（原 90 颗过多导致移动端卡顿）
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const count = isMobile ? 40 : 70;
    for (let i = 0; i < count; i++) {
      list.push({
        cx: rand() * 100,
        cy: rand() * 100,
        r: rand() * 1.4 + 0.3,
        delay: rand() * 6,
        duration: rand() * 4 + 3,
        opacity: rand() * 0.6 + 0.2,
      });
    }
    return list;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 星点：使用 CSS 变量驱动 will-change 优化 */}
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
              fill="#f5b942"
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

      {/* 远景星云光晕：仅桌面端启用（blur-3xl 在移动端极耗 GPU） */}
      <div className="absolute -left-1/4 top-1/4 hidden h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(79,195,247,0.07),transparent_70%)] blur-3xl animate-drift md:block" />
      <div
        className="absolute right-0 top-1/2 hidden h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(255,126,159,0.06),transparent_70%)] blur-3xl animate-drift md:block"
        style={{ animationDelay: "8s" }}
      />
    </div>
  );
}
