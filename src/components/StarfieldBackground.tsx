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
 */
export default function StarfieldBackground() {
  const stars = useMemo<Star[]>(() => {
    const list: Star[] = [];
    // 用确定性伪随机，保证刷新位置稳定
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 90; i++) {
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
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="#f5b942"
            style={{
              opacity: s.opacity,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </svg>
      {/* 远景星云光晕 */}
      <div className="absolute -left-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(79,195,247,0.07),transparent_70%)] blur-3xl animate-drift" />
      <div className="absolute right-0 top-1/2 h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(255,126,159,0.06),transparent_70%)] blur-3xl animate-drift" style={{ animationDelay: "8s" }} />
    </div>
  );
}
