import { useEffect, useRef } from "react";

/**
 * 银白星空动态背景
 * - 底层 Canvas：银白色闪烁星星 + 偶尔划过的流星
 * - 上层 Canvas：鼠标滑动时泛起银白涟漪（screen 混合模式提亮）
 * - 大星点带十字星芒，流星带渐变尾迹
 * - 移动端自动减少星星数量，性能更优
 */
export default function StarfieldBackground() {
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const rippleCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = starCanvasRef.current;
    const rippleCanvas = rippleCanvasRef.current;
    if (!canvas || !rippleCanvas) return;
    const ctx = canvas.getContext("2d");
    const rippleCtx = rippleCanvas.getContext("2d");
    if (!ctx || !rippleCtx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let ripples: Ripple[] = [];
    let animationId = 0;
    let lastTime = performance.now();
    let resizeTimeout: number | undefined;
    let meteorTimer: number | undefined;
    const isMobile = window.innerWidth < 768;

    // 鼠标状态
    let mouseX = -200;
    let mouseY = -200;
    let prevMouseX = -200;
    let prevMouseY = -200;
    let mouseOnScreen = false;
    // 涟漪生成距离阈值（移动端稍大，减少密度）
    const rippleDistThreshold = isMobile ? 18 : 14;

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

        const coreGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 1.2);
        coreGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        coreGrad.addColorStop(0.35, `rgba(240,245,255,${alpha * 0.9})`);
        coreGrad.addColorStop(0.7, `rgba(210,220,240,${alpha * 0.5})`);
        coreGrad.addColorStop(1, "rgba(170,185,210,0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, r * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

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

    // ==================== 涟漪 ====================
    class Ripple {
      x: number;
      y: number;
      initialRadius: number;
      maxRadius: number;
      currentRadius: number;
      maxLife: number;
      life: number;
      intensity = 1.0;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.initialRadius = 12 + Math.random() * 28;
        this.maxRadius = 180 + Math.random() * 320;
        this.currentRadius = this.initialRadius;
        this.maxLife = 1.2 + Math.random() * 2.0;
        this.life = this.maxLife;
      }

      update(deltaTime: number): boolean {
        this.life -= deltaTime;
        if (this.life <= 0) {
          this.life = 0;
          this.intensity = 0;
          return false;
        }
        const lifeRatio = this.life / this.maxLife;
        // smoothstep 衰减
        this.intensity = lifeRatio * lifeRatio * (3 - 2 * lifeRatio);
        this.currentRadius =
          this.initialRadius + (this.maxRadius - this.initialRadius) * (1 - lifeRatio);
        return true;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.intensity < 0.003) return;
        const r = this.currentRadius;
        const intensity = this.intensity;

        // 水波径向渐变：中心亮→暗→波纹亮→波谷暗→微弱波纹→消失
        const grad = ctx.createRadialGradient(this.x, this.y, r * 0.02, this.x, this.y, r);
        const baseAlpha = intensity;
        grad.addColorStop(0, `rgba(225,235,255,${baseAlpha * 0.65})`);
        grad.addColorStop(0.08, `rgba(220,230,252,${baseAlpha * 0.55})`);
        grad.addColorStop(0.2, `rgba(200,215,245,${baseAlpha * 0.28})`);
        grad.addColorStop(0.35, `rgba(215,228,250,${baseAlpha * 0.42})`);
        grad.addColorStop(0.5, `rgba(190,205,238,${baseAlpha * 0.12})`);
        grad.addColorStop(0.65, `rgba(200,218,245,${baseAlpha * 0.2})`);
        grad.addColorStop(0.82, `rgba(180,198,230,${baseAlpha * 0.04})`);
        grad.addColorStop(1, "rgba(160,180,215,0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    // ==================== 尺寸与初始化 ====================
    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
      rippleCanvas!.width = width;
      rippleCanvas!.height = height;

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

    // ==================== 涟漪生成 ====================
    function spawnRipple(x: number, y: number) {
      // 限制涟漪总数，移除最旧的一个
      if (ripples.length >= 70) {
        ripples.shift();
      }
      ripples.push(new Ripple(x, y));
    }

    // 生成大涟漪（点击时增强效果）
    function spawnBigRipple(x: number, y: number) {
      if (ripples.length >= 70) ripples.shift();
      const big = new Ripple(x, y);
      big.initialRadius = 30;
      big.maxRadius = 350 + Math.random() * 200;
      big.maxLife = 1.8 + Math.random() * 1.5;
      big.life = big.maxLife;
      big.currentRadius = big.initialRadius;
      ripples.push(big);
    }

    // ==================== 动画循环 ====================
    function animate(currentTime: number) {
      const rawDelta = (currentTime - lastTime) / 1000;
      const deltaTime = Math.min(rawDelta, 0.1);
      lastTime = currentTime;

      // 星空层
      ctx!.clearRect(0, 0, width, height);

      const bgGrad = ctx!.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, "rgba(12,12,28,0)");
      bgGrad.addColorStop(0.5, "rgba(8,8,22,0.3)");
      bgGrad.addColorStop(1, "rgba(4,4,16,0.7)");
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, width, height);

      for (const star of stars) {
        star.update(deltaTime);
        star.draw(ctx!);
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const meteor = meteors[i];
        meteor.update(deltaTime);
        if (!meteor.alive) {
          meteors.splice(i, 1);
        } else {
          meteor.draw(ctx!);
        }
      }

      // 涟漪层（独立 canvas，screen 混合模式提亮下方）
      rippleCtx!.clearRect(0, 0, width, height);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        const alive = ripple.update(deltaTime);
        if (!alive) {
          ripples.splice(i, 1);
        } else {
          ripple.draw(rippleCtx!);
        }
      }

      // 鼠标当前位置的主光晕（聚光灯跟随）
      if (mouseOnScreen && mouseX > -100 && mouseY > -100) {
        const glowRadius = 130;
        const glowGrad = rippleCtx!.createRadialGradient(
          mouseX, mouseY, 0, mouseX, mouseY, glowRadius
        );
        glowGrad.addColorStop(0, "rgba(228,238,255,0.38)");
        glowGrad.addColorStop(0.15, "rgba(220,232,252,0.3)");
        glowGrad.addColorStop(0.35, "rgba(200,218,245,0.15)");
        glowGrad.addColorStop(0.6, "rgba(175,195,230,0.04)");
        glowGrad.addColorStop(0.8, "rgba(150,175,215,0.008)");
        glowGrad.addColorStop(1, "rgba(130,155,195,0)");

        rippleCtx!.beginPath();
        rippleCtx!.arc(mouseX, mouseY, glowRadius, 0, Math.PI * 2);
        rippleCtx!.fillStyle = glowGrad;
        rippleCtx!.fill();

        // 内层更亮的光核
        const innerGlow = rippleCtx!.createRadialGradient(
          mouseX, mouseY, 0, mouseX, mouseY, 45
        );
        innerGlow.addColorStop(0, "rgba(240,245,255,0.5)");
        innerGlow.addColorStop(0.4, "rgba(225,235,252,0.25)");
        innerGlow.addColorStop(1, "rgba(200,215,240,0)");

        rippleCtx!.beginPath();
        rippleCtx!.arc(mouseX, mouseY, 45, 0, Math.PI * 2);
        rippleCtx!.fillStyle = innerGlow;
        rippleCtx!.fill();
      }

      animationId = requestAnimationFrame(animate);
    }

    // ==================== 鼠标交互 ====================
    // 在移动轨迹上按距离插值生成连续涟漪
    function spawnRipplesAlongPath(x0: number, y0: number, x1: number, y1: number) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > rippleDistThreshold && x0 > -100) {
        // 在轨迹上按阈值插值生成多个涟漪（模拟连续波纹）
        const steps = Math.floor(dist / rippleDistThreshold);
        for (let i = 1; i <= steps; i++) {
          const t = i / (steps + 1);
          spawnRipple(x0 + dx * t, y0 + dy * t);
        }
      } else if (dist > 3 && x0 < -100) {
        // 鼠标刚进入屏幕，生成第一个涟漪
        spawnRipple(x1, y1);
      }
    }

    function onMouseMove(e: MouseEvent) {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseOnScreen = true;
      spawnRipplesAlongPath(prevMouseX, prevMouseY, mouseX, mouseY);
    }

    function onMouseEnter(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      prevMouseX = -200;
      prevMouseY = -200;
      mouseOnScreen = true;
      spawnRipple(mouseX, mouseY);
    }

    function onMouseLeave() {
      mouseOnScreen = false;
      // 鼠标离开时在最后位置留下一个涟漪
      if (mouseX > -100 && mouseY > -100) {
        spawnRipple(mouseX, mouseY);
      }
    }

    // 移动端 touch 生成涟漪
    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = touch.clientX;
      mouseY = touch.clientY;
      mouseOnScreen = true;
      spawnRipplesAlongPath(prevMouseX, prevMouseY, mouseX, mouseY);
    }

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      mouseX = touch.clientX;
      mouseY = touch.clientY;
      prevMouseX = -200;
      prevMouseY = -200;
      mouseOnScreen = true;
      spawnRipple(mouseX, mouseY);
    }

    function onTouchEnd() {
      if (mouseX > -100 && mouseY > -100) {
        spawnRipple(mouseX, mouseY);
      }
      mouseOnScreen = false;
    }

    // 点击：触发流星 + 生成大涟漪（小彩蛋）
    function onClick(e: MouseEvent) {
      // 流星从点击位置上方出现，朝向点击方向飞去
      if (meteors.length < (isMobile ? 2 : 4)) {
        const meteor = new Meteor();
        const cx = e.clientX;
        const cy = e.clientY;
        meteor.x = cx + (Math.random() - 0.5) * 200;
        meteor.y = cy - 150 - Math.random() * 200;
        meteor.angle = Math.atan2(cy - meteor.y, cx - meteor.x);
        if (meteor.angle < Math.PI * 0.3) meteor.angle = Math.PI * 0.3;
        if (meteor.angle > Math.PI * 0.7) meteor.angle = Math.PI * 0.7;
        meteor.speed = 500 + Math.random() * 600;
        meteor.length = 80 + Math.random() * 140;
        meteors.push(meteor);
      }
      // 点击生成普通涟漪 + 延迟大涟漪增强
      spawnRipple(e.clientX, e.clientY);
      window.setTimeout(() => {
        spawnBigRipple(e.clientX, e.clientY);
      }, 150);
    }

    // ==================== 启动 ====================
    function init() {
      resizeCanvas();
      initStars();
      meteors = [];
      ripples = [];

      if (Math.random() < 0.7) spawnMeteor();
      if (Math.random() < 0.4) {
        window.setTimeout(spawnMeteor, 1500 + Math.random() * 3000);
      }
      scheduleNextMeteor();

      lastTime = performance.now();
      animationId = requestAnimationFrame(animate);
    }

    function onResize() {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        resizeCanvas();
      }, 300);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("click", onClick);

    init();

    // ==================== 清理 ====================
    return () => {
      cancelAnimationFrame(animationId);
      window.clearTimeout(meteorTimer);
      window.clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 星空层 */}
      <canvas
        ref={starCanvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />
      {/* 涟漪层（screen 混合模式：白色提亮，透明不影响） */}
      <canvas
        ref={rippleCanvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block", mixBlendMode: "screen" }}
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
