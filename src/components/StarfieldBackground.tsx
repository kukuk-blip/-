import { useEffect, useRef } from "react";

/**
 * 银白星空动态背景
 * - Canvas 渲染：银白色闪烁星星 + 偶尔划过的流星
 * - 大星点带十字星芒，流星带渐变尾迹
 * - 移动端自动减少星星数量，性能更优
 * - 组件卸载时自动清理动画与事件
 */
export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let animationId = 0;
    let lastTime = performance.now();
    let resizeTimeout: number | undefined;
    let meteorTimer: number | undefined;
    const isMobile = window.innerWidth < 768;

    // ==================== 星星 ====================
    class Star {
      x = 0;
      y = 0;
      radius = 0.3;
      baseAlpha = 0.35;
      twinklePhase = 0;
      twinkleSpeed = 0.3;
      twinkleAmplitude = 0.2;

      constructor() {
        this.reset();
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.3 + Math.random() * 1.8;
        this.twinkleAmplitude = 0.2 + Math.random() * 0.55;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = 0.3 + Math.random() * 2.2;
        this.baseAlpha = 0.35 + Math.random() * 0.65;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.3 + Math.random() * 1.8;
        this.twinkleAmplitude = 0.2 + Math.random() * 0.55;
      }

      update(deltaTime: number) {
        this.twinklePhase += this.twinkleSpeed * deltaTime;
      }

      getAlpha() {
        const twinkle = Math.sin(this.twinklePhase) * this.twinkleAmplitude;
        return Math.max(0.08, Math.min(1, this.baseAlpha + twinkle));
      }

      draw(ctx: CanvasRenderingContext2D) {
        const alpha = this.getAlpha();
        const r = this.radius;

        // 柔和光晕
        const glowGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 3.5);
        glowGrad.addColorStop(0, `rgba(240,245,255,${alpha})`);
        glowGrad.addColorStop(0.15, `rgba(220,230,250,${alpha * 0.85})`);
        glowGrad.addColorStop(0.4, `rgba(190,205,235,${alpha * 0.4})`);
        glowGrad.addColorStop(0.7, `rgba(150,170,210,${alpha * 0.08})`);
        glowGrad.addColorStop(1, "rgba(100,120,160,0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // 核心亮点
        const coreGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 1.2);
        coreGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        coreGrad.addColorStop(0.35, `rgba(240,245,255,${alpha * 0.9})`);
        coreGrad.addColorStop(0.7, `rgba(210,220,240,${alpha * 0.5})`);
        coreGrad.addColorStop(1, "rgba(170,185,210,0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, r * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // 十字星芒（仅较大星星）
        if (r > 1.1 && alpha > 0.4) {
          const spikeAlpha = alpha * 0.5;
          const spikeLen = r * 5;
          const spikeWidth = r * 0.35;

          ctx.save();
          ctx.globalAlpha = spikeAlpha;
          ctx.strokeStyle = "#e8eef8";
          ctx.lineWidth = spikeWidth;
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(this.x - spikeLen, this.y);
          ctx.lineTo(this.x + spikeLen, this.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(this.x, this.y - spikeLen);
          ctx.lineTo(this.x, this.y + spikeLen);
          ctx.stroke();

          const diagLen = spikeLen * 0.5;
          const diagWidth = spikeWidth * 0.5;
          ctx.lineWidth = diagWidth;
          ctx.globalAlpha = spikeAlpha * 0.45;

          ctx.beginPath();
          ctx.moveTo(this.x - diagLen, this.y - diagLen);
          ctx.lineTo(this.x + diagLen, this.y + diagLen);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(this.x + diagLen, this.y - diagLen);
          ctx.lineTo(this.x - diagLen, this.y + diagLen);
          ctx.stroke();

          ctx.restore();
        }
      }
    }

    // ==================== 流星 ====================
    class Meteor {
      x = 0;
      y = 0;
      angle = Math.PI / 2;
      speed = 350;
      length = 60;
      headRadius = 1.2;
      tailWidth = 0.4;
      alpha = 0.75;
      maxAlpha = 0.75;
      fadingOut = false;
      fadeSpeed = 0.6;
      alive = true;
      distanceTraveled = 0;
      maxDistance = 0;
      trailPoints: { x: number; y: number; alpha: number }[] = [];
      trailMaxPoints = 40;

      constructor() {
        this.reset();
      }

      reset() {
        const side = Math.random();
        if (side < 0.6) {
          this.x = Math.random() * width;
          this.y = -20 - Math.random() * 120;
        } else if (side < 0.85) {
          this.x = -20 - Math.random() * 100;
          this.y = Math.random() * height * 0.5;
        } else {
          this.x = width + 20 + Math.random() * 100;
          this.y = Math.random() * height * 0.5;
        }

        this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.9;
        if (this.angle < Math.PI * 0.35) this.angle = Math.PI * 0.35;
        if (this.angle > Math.PI * 0.65) this.angle = Math.PI * 0.65;

        this.speed = 350 + Math.random() * 650;
        this.length = 60 + Math.random() * 160;
        this.headRadius = 1.2 + Math.random() * 2.5;
        this.tailWidth = 0.4 + Math.random() * 1.2;
        this.alpha = 0.75 + Math.random() * 0.25;
        this.maxAlpha = this.alpha;
        this.fadingOut = false;
        this.fadeSpeed = 0.6 + Math.random() * 1.5;
        this.alive = true;
        this.distanceTraveled = 0;
        this.maxDistance = height * 0.7 + Math.random() * height * 0.8;
        this.trailPoints = [];
      }

      update(deltaTime: number) {
        const vx = Math.cos(this.angle) * this.speed * deltaTime;
        const vy = Math.sin(this.angle) * this.speed * deltaTime;

        this.x += vx;
        this.y += vy;
        this.distanceTraveled += Math.abs(vy) + Math.abs(vx) * 0.5;

        this.trailPoints.unshift({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trailPoints.length > this.trailMaxPoints) {
          this.trailPoints.length = this.trailMaxPoints;
        }
        for (let i = 0; i < this.trailPoints.length; i++) {
          this.trailPoints[i].alpha *= 0.88;
        }

        if (this.distanceTraveled > this.maxDistance * 0.75 && !this.fadingOut) {
          this.fadingOut = true;
        }
        if (this.fadingOut) {
          this.alpha -= this.fadeSpeed * deltaTime;
          if (this.alpha <= 0.02) this.alive = false;
        }
        if (this.y > height + 200 || this.x < -200 || this.x > width + 200) {
          this.alive = false;
        }
        this.trailPoints = this.trailPoints.filter((p) => p.alpha > 0.005);
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.trailPoints.length < 2) {
          const headGlow = ctx.createRadialGradient(
            this.x, this.y, 0, this.x, this.y, this.headRadius * 4
          );
          headGlow.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
          headGlow.addColorStop(0.2, `rgba(240,245,255,${this.alpha * 0.8})`);
          headGlow.addColorStop(0.5, `rgba(200,215,240,${this.alpha * 0.3})`);
          headGlow.addColorStop(1, "rgba(150,170,200,0)");

          ctx.beginPath();
          ctx.arc(this.x, this.y, this.headRadius * 4, 0, Math.PI * 2);
          ctx.fillStyle = headGlow;
          ctx.fill();
          return;
        }

        const points = this.trailPoints;
        if (points.length >= 2) {
          ctx.save();
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const segAlpha = p1.alpha * this.alpha;
            const segWidth = this.tailWidth * (0.3 + 0.7 * (i / points.length));
            if (segAlpha < 0.003) continue;

            ctx.strokeStyle = `rgba(220,230,250,${segAlpha})`;
            ctx.lineWidth = segWidth;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 头部光晕
        const headGlow = ctx.createRadialGradient(
          this.x, this.y, 0, this.x, this.y, this.headRadius * 5
        );
        headGlow.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        headGlow.addColorStop(0.1, `rgba(245,248,255,${this.alpha * 0.9})`);
        headGlow.addColorStop(0.3, `rgba(210,225,248,${this.alpha * 0.5})`);
        headGlow.addColorStop(0.6, `rgba(170,190,220,${this.alpha * 0.12})`);
        headGlow.addColorStop(1, "rgba(120,140,180,0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.headRadius * 5, 0, Math.PI * 2);
        ctx.fillStyle = headGlow;
        ctx.fill();

        // 头部核心白点
        const coreGlow = ctx.createRadialGradient(
          this.x, this.y, 0, this.x, this.y, this.headRadius * 1.5
        );
        coreGlow.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        coreGlow.addColorStop(0.5, `rgba(255,255,255,${this.alpha * 0.7})`);
        coreGlow.addColorStop(1, "rgba(220,230,250,0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.headRadius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();
      }
    }

    // ==================== 尺寸与初始化 ====================
    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;

      // 移动端减少密度，避免卡顿
      const divisor = isMobile ? 4200 : 2800;
      const targetStarCount = Math.floor((width * height) / divisor);
      const clampedCount = Math.max(
        isMobile ? 100 : 180,
        Math.min(isMobile ? 320 : 600, targetStarCount)
      );

      while (stars.length < clampedCount) {
        const star = new Star();
        star.x = Math.random() * width;
        star.y = Math.random() * height;
        stars.push(star);
      }
      while (stars.length > clampedCount) {
        stars.pop();
      }
      stars.forEach((star) => {
        if (star.x > width || star.y > height) {
          star.x = Math.random() * width;
          star.y = Math.random() * height;
        }
      });
    }

    function initStars() {
      stars = [];
      const divisor = isMobile ? 4200 : 2800;
      const targetStarCount = Math.floor((width * height) / divisor);
      const clampedCount = Math.max(
        isMobile ? 100 : 180,
        Math.min(isMobile ? 320 : 600, targetStarCount)
      );
      for (let i = 0; i < clampedCount; i++) {
        const star = new Star();
        star.x = Math.random() * width;
        star.y = Math.random() * height;
        star.twinklePhase = Math.random() * Math.PI * 2;
        stars.push(star);
      }
    }

    // ==================== 流星生成 ====================
    function spawnMeteor() {
      meteors.push(new Meteor());
    }

    function scheduleNextMeteor() {
      // 移动端间隔更长，节省性能
      const baseDelay = isMobile ? 7000 : 4000;
      const variance = isMobile ? 16000 : 14000;
      const delay = baseDelay + Math.random() * variance;
      meteorTimer = window.setTimeout(() => {
        if (meteors.length < (isMobile ? 2 : 3)) {
          spawnMeteor();
        }
        scheduleNextMeteor();
      }, delay);
    }

    // ==================== 动画循环 ====================
    function animate(currentTime: number) {
      const rawDelta = (currentTime - lastTime) / 1000;
      const deltaTime = Math.min(rawDelta, 0.1);
      lastTime = currentTime;

      ctx!.clearRect(0, 0, width, height);

      // 微弱背景色调（径向渐变）
      const bgGrad = ctx!.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, "rgba(12,12,28,0)");
      bgGrad.addColorStop(0.5, "rgba(8,8,22,0.3)");
      bgGrad.addColorStop(1, "rgba(4,4,16,0.7)");
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, width, height);

      // 星星
      for (const star of stars) {
        star.update(deltaTime);
        star.draw(ctx!);
      }

      // 流星
      for (let i = meteors.length - 1; i >= 0; i--) {
        const meteor = meteors[i];
        meteor.update(deltaTime);
        if (!meteor.alive) {
          meteors.splice(i, 1);
        } else {
          meteor.draw(ctx!);
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    // ==================== 启动 ====================
    function init() {
      resizeCanvas();
      initStars();
      meteors = [];

      if (Math.random() < 0.7) spawnMeteor();
      if (Math.random() < 0.4) {
        window.setTimeout(spawnMeteor, 1500 + Math.random() * 3000);
      }
      scheduleNextMeteor();

      lastTime = performance.now();
      animationId = requestAnimationFrame(animate);
    }

    // 响应窗口大小变化
    function onResize() {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        resizeCanvas();
      }, 300);
    }

    // 点击额外触发流星（小彩蛋）—— 流星从点击位置上方出现，朝向点击方向飞去
    function onClick(e: MouseEvent) {
      if (meteors.length >= (isMobile ? 2 : 4)) return;
      const meteor = new Meteor();
      const cx = e.clientX;
      const cy = e.clientY;
      meteor.x = cx + (Math.random() - 0.5) * 200;
      meteor.y = cy - 150 - Math.random() * 200;
      meteor.angle = Math.atan2(cy - meteor.y, cx - meteor.x);
      // 限制角度，确保大致向下飞
      if (meteor.angle < Math.PI * 0.3) meteor.angle = Math.PI * 0.3;
      if (meteor.angle > Math.PI * 0.7) meteor.angle = Math.PI * 0.7;
      meteor.speed = 500 + Math.random() * 600;
      meteor.length = 80 + Math.random() * 140;
      meteors.push(meteor);
    }

    window.addEventListener("resize", onResize);
    canvas.addEventListener("click", onClick);

    init();

    // ==================== 清理 ====================
    return () => {
      cancelAnimationFrame(animationId);
      window.clearTimeout(meteorTimer);
      window.clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />
      {/* 底部柔光氛围 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[30%]"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(180,190,210,0.06) 0%, rgba(140,150,180,0.03) 30%, transparent 70%)",
        }}
      />
      {/* 顶部微光 */}
      <div
        className="absolute inset-x-0 top-0 h-[20%]"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(200,210,230,0.04) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
