import { useRef } from "react";
import StarfieldBackground from "@/components/StarfieldBackground";
import Hero from "@/components/Hero";
import OverviewSection from "@/components/OverviewSection";
import AssessmentSection from "@/components/AssessmentSection";
import EventSelfCheck from "@/components/EventSelfCheck";
import SummarySection from "@/components/SummarySection";
import { useReveal } from "@/hooks/useReveal";

export default function Home() {
  const containerRef = useReveal<HTMLDivElement>();
  const assessmentRef = useRef<HTMLDivElement>(null);

  const scrollToAssessment = () => {
    assessmentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <StarfieldBackground />

      <Hero onScrollToAssessment={scrollToAssessment} />

      <OverviewSection />

      <div ref={assessmentRef}>
        <AssessmentSection />
      </div>

      <EventSelfCheck />

      <SummarySection />

      {/* 页脚 */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="font-display text-sm text-white/30">
          天赋星图 · Talent Constellation
        </p>
        <p className="mt-1 text-xs text-white/20">
          数据已自动保存至本地 · 你的回答不会上传任何服务器
        </p>
      </footer>
    </div>
  );
}
