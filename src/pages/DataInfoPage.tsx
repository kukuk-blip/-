import { useGkTheme, default as ThemeToggle } from "@/components/ThemeToggle";
import {
  ChevronLeft, Database, Shield, FileText, AlertCircle,
  ExternalLink, Calendar, Building2, BookOpen, CheckCircle2, MapPin,
} from "lucide-react";

// ============ 官方数据源清单 ============
interface DataSource {
  name: string;
  url: string;
  coverage: string;     // 覆盖数据类型
  level: "L1" | "L2" | "L3";  // 权威等级
  updateFreq: string;    // 更新频率
}

const NATIONAL_SOURCES: DataSource[] = [
  {
    name: "教育部阳光高考平台",
    url: "https://gaokao.chsi.com.cn/",
    coverage: "全国院校招生章程、选科要求、招生计划、专业目录、专项计划",
    level: "L1",
    updateFreq: "每年招生季前",
  },
  {
    name: "学信网（中国高等教育学生信息网）",
    url: "https://www.chsi.com.cn/",
    coverage: "正规本专科院校名单核验、学籍备案数据",
    level: "L1",
    updateFreq: "实时",
  },
  {
    name: "教育部政务公开平台",
    url: "https://www.moe.gov.cn/jyb_xxgk/",
    coverage: "全国高考报名总量、教育事业统计公报、新高考改革政策",
    level: "L1",
    updateFreq: "每年发布",
  },
];

const PROVINCE_SOURCES: DataSource[] = [
  { name: "河南省教育考试院", url: "https://www.haeea.cn/", coverage: "报名人数、选科统计、一分一段、投档线", level: "L1", updateFreq: "高考后分3次" },
  { name: "河北省教育考试院", url: "https://www.hebeea.edu.cn/", coverage: "物理 / 历史类选科人数、本科投档", level: "L1", updateFreq: "录取期间" },
  { name: "山东省教育招生考试院", url: "https://www.sdzk.cn/", coverage: "选科人数、一分一段、专业投档", level: "L1", updateFreq: "录取期间" },
  { name: "湖北省教育考试院", url: "https://www.hubeizsks.com/", coverage: "3+1+2 选科统计、招生计划", level: "L1", updateFreq: "录取期间" },
  { name: "湖南省教育考试院", url: "https://jyt.hunan.gov.cn/jyt/sjyt/hnsjyksy/", coverage: "科目报考人数、位次统计", level: "L1", updateFreq: "录取期间" },
  { name: "江苏省教育考试院", url: "https://www.jseea.cn/", coverage: "选科组合报名人数、分段统计", level: "L1", updateFreq: "录取期间" },
  { name: "浙江省教育考试院", url: "https://www.zjzs.net/", coverage: "选考科目报考数据、投档位次", level: "L1", updateFreq: "录取期间" },
  { name: "广东省教育考试院", url: "https://eea.gd.gov.cn/", coverage: "高考报名人数、物理历史选科", level: "L1", updateFreq: "录取期间" },
  { name: "安徽省教育招生考试院", url: "https://www.ahzsks.cn/", coverage: "高考总报名人数、本科录取统计", level: "L1", updateFreq: "录取期间" },
  { name: "福建省教育考试院", url: "https://www.eeafj.cn/", coverage: "新高考选科报名数据、投档线", level: "L1", updateFreq: "录取期间" },
  { name: "四川省教育考试院", url: "https://www.sceea.cn/", coverage: "报考总人数、文理 / 选科录取", level: "L1", updateFreq: "录取期间" },
  { name: "北京市教育考试院", url: "https://www.bjeea.cn/", coverage: "报名人数、一分一段、投档线", level: "L1", updateFreq: "录取期间" },
  { name: "上海市教育考试院", url: "https://www.shmeea.com.cn/", coverage: "3+3 选科人数、院校录取", level: "L1", updateFreq: "录取期间" },
  { name: "天津市招考资讯网", url: "https://www.zhaokao.net/", coverage: "录取统计、招生计划、等级考", level: "L1", updateFreq: "录取期间" },
  { name: "重庆市教育考试院", url: "https://www.cqksy.cn/", coverage: "新高考选科数据、一分一段", level: "L1", updateFreq: "录取期间" },
  { name: "辽宁省招生考试之窗", url: "https://www.lnzsks.com/", coverage: "3+1+2 选科报名数据、位次表", level: "L1", updateFreq: "录取期间" },
  { name: "江西省教育考试院", url: "https://www.jxeea.cn/", coverage: "报考人数、各批次招生计划", level: "L1", updateFreq: "录取期间" },
  { name: "山西省招生考试网", url: "https://www.sxkszx.cn/", coverage: "高考报名总量、批次录取统计", level: "L1", updateFreq: "录取期间" },
  { name: "广西招生考试院", url: "https://www.gxeea.cn/", coverage: "历年报考人数、院校录取分数线", level: "L1", updateFreq: "录取期间" },
  { name: "陕西省教育考试院", url: "https://www.sneac.com/", coverage: "报考人数、本科专科录取数据", level: "L1", updateFreq: "录取期间" },
  { name: "云南省招考频道", url: "https://www.ynzs.cn/", coverage: "高考报名人数、投档分数线", level: "L1", updateFreq: "录取期间" },
  { name: "贵州省教育考试院", url: "https://zsksy.guizhou.gov.cn/", coverage: "招生计划、录取结果汇总", level: "L1", updateFreq: "录取期间" },
  { name: "甘肃省教育考试院", url: "https://www.ganseea.cn/", coverage: "历年报名总量、投档位次表", level: "L1", updateFreq: "录取期间" },
  { name: "黑龙江省招生考试信息港", url: "https://www.hljea.org.cn/", coverage: "高考报名统计、投档结果公示", level: "L1", updateFreq: "录取期间" },
  { name: "吉林省教育考试院", url: "https://www.jleea.edu.cn/", coverage: "招生计划汇总、录取分数线", level: "L1", updateFreq: "录取期间" },
  { name: "内蒙古招生考试信息网", url: "https://www.nm.zsks.cn/", coverage: "历年报考人数、院校录取明细", level: "L1", updateFreq: "录取期间" },
  { name: "海南省考试局", url: "https://ea.hainan.gov.cn/", coverage: "选科报名统计、投档数据", level: "L1", updateFreq: "录取期间" },
  { name: "新疆教育考试院", url: "https://www.xjzk.gov.cn/", coverage: "高考报名人数、各批次投档", level: "L1", updateFreq: "录取期间" },
  { name: "宁夏教育考试院", url: "https://www.nxjyks.cn/", coverage: "选科报名数据、录取统计", level: "L1", updateFreq: "录取期间" },
  { name: "青海省教育考试网", url: "https://www.qhjyks.com/", coverage: "全省报考人数、招生计划", level: "L1", updateFreq: "录取期间" },
  { name: "西藏教育考试院", url: "https://zsks.edu.xizang.gov.cn/", coverage: "全区报考统计、录取公示", level: "L1", updateFreq: "录取期间" },
];

const SUPPLEMENT_SOURCES: DataSource[] = [
  {
    name: "高校本科招生网（统一检索入口）",
    url: "https://gaokao.chsi.com.cn/sch/search.dhtml",
    coverage: "分省分专业招生计划、历年报考人数、专业录取均分、选科限制",
    level: "L2",
    updateFreq: "每年 5-7 月",
  },
  {
    name: "教育部年度教育事业发展统计公报",
    url: "https://www.moe.gov.cn/jyb_sjzl/",
    coverage: "历年全国高考总报名人数（用于交叉校验）",
    level: "L2",
    updateFreq: "每年发布",
  },
  {
    name: "高校本科教学质量报告",
    url: "https://www.chsi.com.cn/z/baobiao/",
    coverage: "院校报考概况、生源质量趋势（仅定性参考）",
    level: "L3",
    updateFreq: "每年发布",
  },
];

// ============ 统计口径术语 ============
const GLOSSARY = [
  { term: "报名人数", def: "当年报名参加夏季高考的考生总数（含弃考）" },
  { term: "参考人数", def: "实际参加考试的人数（报名人数 - 弃考）" },
  { term: "上线人数", def: "成绩达到某批次控制分数线的考生人数" },
  { term: "投档人数", def: "档案实际投递到院校的考生人数" },
  { term: "招生计划数", def: "院校当年计划招生的名额（实际录取可能有微调）" },
  { term: "一分一段表", def: "按 1 分为区间统计的同分考生位次排名表" },
  { term: "投档线", def: "院校某专业组录取的最后一名考生分数" },
  { term: "选科模式", def: "3+1+2（物理/历史+2选）/ 3+3（6选3）/ 文理分科" },
];

// ============ 更新日志 ============
const CHANGELOG = [
  {
    version: "v1.2",
    date: "2026-06-26",
    changes: "新增专科批 10 cells 院校汇总格式解析，专科批院校由 336 所增至 1,350 所",
  },
  {
    version: "v1.1",
    date: "2026-06-26",
    changes: "放宽本科批专业名长度限制，修复部分中外合作方向专业被误过滤",
  },
  {
    version: "v1.0",
    date: "2026-06-25",
    changes: "首批数据上线：河南省 2024-2025 物理类录取统计，本科批 26,487 条 + 专科批 2,353 条",
  },
];

// ============ 主组件 ============
export default function DataInfoPage() {
  const [theme, setTheme] = useGkTheme();

  const goBack = () => {
    window.location.hash = "#/";
  };

  const renderSourceCard = (s: DataSource) => {
    const levelColor = s.level === "L1" ? "var(--c-primary)" : s.level === "L2" ? "var(--c-success)" : "var(--c-warning)";
    const levelText = s.level === "L1" ? "一级核心" : s.level === "L2" ? "二级补充" : "三级参考";
    return (
      <a
        key={s.name}
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border p-4 transition-all hover:shadow-md"
        style={{
          background: "var(--c-card)",
          borderColor: "var(--c-border)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "var(--c-primary)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "var(--c-border)";
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: levelColor, color: "var(--c-hover-text)" }}
            >
              {levelText}
            </span>
            <span className="font-medium truncate" style={{ color: "var(--c-title)" }}>
              {s.name}
            </span>
            <ExternalLink size={12} style={{ color: "var(--c-secondary)" }} className="shrink-0" />
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--c-body)" }}>
          {s.coverage}
        </p>
        <div className="mt-2 flex items-center gap-1 text-[11px]" style={{ color: "var(--c-secondary)" }}>
          <Calendar size={11} />
          <span>{s.updateFreq}</span>
        </div>
      </a>
    );
  };

  return (
    <div
      data-gk-theme={theme}
      style={{ minHeight: "100vh", background: "var(--c-bg)" }}
    >
      {/* 顶部导航 */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: "color-mix(in srgb, var(--c-bg) 88%, transparent)",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--c-secondary)" }}
          >
            <ChevronLeft size={18} />
            <span>返回</span>
          </button>
          <div className="flex items-center gap-2">
            <Database size={18} style={{ color: "var(--c-primary)" }} />
            <h1 className="text-base font-semibold md:text-lg" style={{ color: "var(--c-title)" }}>
              数据说明
            </h1>
          </div>
          <ThemeToggle theme={theme} onChange={setTheme} compact />
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-6 md:px-6 md:py-10">
        {/* 概述 */}
        <section
          className="mb-6 rounded-2xl p-6 md:p-8"
          style={{
            background: "var(--c-card)",
            border: "1px solid var(--c-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h2 className="mb-3 text-xl font-semibold md:text-2xl" style={{ color: "var(--c-title)" }}>
            数据来源与可信度说明
          </h2>
          <p className="text-sm leading-relaxed md:text-base" style={{ color: "var(--c-body)" }}>
            本站所有高考报名、招生录取数据均来源于<strong style={{ color: "var(--c-title)" }}>政府公开政务信息</strong>，
            包括教育部阳光高考平台、各省教育考试院及高校本科招生网公开公告。
            数据经结构化整理后入库，无预估、无编造，缺失年份统一标注「官方暂未公布」。
          </p>
          <div
            className="mt-4 rounded-lg p-3"
            style={{
              background: "var(--c-primary-8)",
              border: "1px solid var(--c-primary-15)",
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "var(--c-body)" }}>
              <strong style={{ color: "var(--c-primary)" }}>数据分级原则：</strong>
              一级核心源（省考试院/阳光高考/教育部）为唯一采信标准；二级源用于交叉校验；
              三级源仅作定性参考，不展示具体数值。
            </p>
          </div>
        </section>

        {/* 国家级数据源 */}
        <section className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={20} style={{ color: "var(--c-primary)" }} />
            <h2 className="text-lg font-semibold md:text-xl" style={{ color: "var(--c-title)" }}>
              国家级权威数据源
            </h2>
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ background: "var(--c-primary-15)", color: "var(--c-primary)" }}
            >
              一级核心
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {NATIONAL_SOURCES.map(renderSourceCard)}
          </div>
        </section>

        {/* 省级考试院 */}
        <section className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={20} style={{ color: "var(--c-primary)" }} />
            <h2 className="text-lg font-semibold md:text-xl" style={{ color: "var(--c-title)" }}>
              全国 31 省教育考试院
            </h2>
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ background: "var(--c-primary-15)", color: "var(--c-primary)" }}
            >
              报名 / 投档 / 选科数据唯一来源
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROVINCE_SOURCES.map(renderSourceCard)}
          </div>
        </section>

        {/* 补充数据源 */}
        <section className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen size={20} style={{ color: "var(--c-success)" }} />
            <h2 className="text-lg font-semibold md:text-xl" style={{ color: "var(--c-title)" }}>
              补充数据源
            </h2>
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ background: "var(--c-success)", color: "var(--c-hover-text)", opacity: 0.85 }}
            >
              交叉校验 / 历史补齐
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SUPPLEMENT_SOURCES.map(renderSourceCard)}
          </div>
        </section>

        {/* 统计口径说明 */}
        <section
          className="mb-6 rounded-2xl p-6 md:p-8"
          style={{
            background: "var(--c-card)",
            border: "1px solid var(--c-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <FileText size={20} style={{ color: "var(--c-primary)" }} />
            <h2 className="text-lg font-semibold md:text-xl" style={{ color: "var(--c-title)" }}>
              统计口径说明
            </h2>
          </div>
          <p className="mb-4 text-sm" style={{ color: "var(--c-body)" }}>
            以下术语在数据展示中严格遵守口径区分，禁止混用：
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {GLOSSARY.map(g => (
              <div
                key={g.term}
                className="flex items-start gap-2 rounded-lg p-3"
                style={{ background: "var(--c-block-30)" }}
              >
                <span
                  className="shrink-0 rounded px-2 py-0.5 text-xs font-medium"
                  style={{ background: "var(--c-primary-15)", color: "var(--c-primary)" }}
                >
                  {g.term}
                </span>
                <span className="text-xs leading-relaxed" style={{ color: "var(--c-body)" }}>
                  {g.def}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 更新日志 */}
        <section
          className="mb-6 rounded-2xl p-6 md:p-8"
          style={{
            background: "var(--c-card)",
            border: "1px solid var(--c-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Calendar size={20} style={{ color: "var(--c-primary)" }} />
            <h2 className="text-lg font-semibold md:text-xl" style={{ color: "var(--c-title)" }}>
              数据更新日志
            </h2>
          </div>
          <div className="space-y-3">
            {CHANGELOG.map(c => (
              <div
                key={c.version}
                className="flex flex-col gap-1 rounded-lg p-3 md:flex-row md:items-center md:gap-4"
                style={{ background: "var(--c-block-30)" }}
              >
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="rounded px-2 py-0.5 text-xs font-semibold"
                    style={{ background: "var(--c-primary)", color: "var(--c-hover-text)" }}
                  >
                    {c.version}
                  </span>
                  <span className="text-xs" style={{ color: "var(--c-secondary)" }}>{c.date}</span>
                </div>
                <p className="text-sm" style={{ color: "var(--c-body)" }}>{c.changes}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 数据清洗流程 */}
        <section
          className="mb-6 rounded-2xl p-6 md:p-8"
          style={{
            background: "var(--c-card)",
            border: "1px solid var(--c-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} style={{ color: "var(--c-success)" }} />
            <h2 className="text-lg font-semibold md:text-xl" style={{ color: "var(--c-title)" }}>
              数据清洗与校验流程
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { title: "口径统一", desc: "区分报名/参考/上线/投档人数，标注选科模式与批次" },
              { title: "异常剔除", desc: "数值同比波动>30% 自动标记，逻辑矛盾（如计划>报名）暂不展示" },
              { title: "交叉验证", desc: "关键数据经至少 2 个官方源比对一致后上线" },
              { title: "缺漏处理", desc: "短期缺漏标注「暂未公布」，历史缺漏展示相邻年份参考" },
            ].map(item => (
              <div
                key={item.title}
                className="rounded-lg p-3"
                style={{ background: "var(--c-block-30)" }}
              >
                <div className="mb-1 text-sm font-medium" style={{ color: "var(--c-title)" }}>
                  {item.title}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--c-body)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 免责与合规声明 */}
        <section
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "var(--c-card)",
            border: "1px solid var(--c-warning)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Shield size={20} style={{ color: "var(--c-warning)" }} />
            <h2 className="text-lg font-semibold md:text-xl" style={{ color: "var(--c-title)" }}>
              免责与合规声明
            </h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--c-body)" }}>
            <p>
              <strong style={{ color: "var(--c-title)" }}>数据来源：</strong>
              本站所有高考报名、选科、录取数据均来源于各省教育考试院及高校官方公开信息，
              仅为对公开政务信息的整理汇总，无预估、无编造。
            </p>
            <p>
              <strong style={{ color: "var(--c-title)" }}>使用边界：</strong>
              不爬取非公开数据、不破解官方接口、不对原始数据进行篡改；
              站点不售卖原始数据，仅提供查询、筛选、对比等工具化服务。
            </p>
            <p>
              <strong style={{ color: "var(--c-title)" }}>参考性质：</strong>
              本站数据仅供升学参考，不构成志愿填报建议；最终分数线、招生计划与录取结果
              <strong style={{ color: "var(--c-warning)" }}>请以本省教育考试院及高校当年正式公告为准</strong>。
            </p>
            <p>
              <strong style={{ color: "var(--c-title)" }}>隐私保护：</strong>
              本站仅收录汇总级统计数据，绝不采集、展示任何考生个人信息，不与第三方共享用户查询数据。
            </p>
          </div>
          <div
            className="mt-4 flex items-start gap-2 rounded-lg p-3"
            style={{ background: "var(--c-warning)", opacity: 0.85 }}
          >
            <AlertCircle size={16} style={{ color: "var(--c-hover-text)", flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--c-hover-text)" }}>
              如发现数据异常，请以官方原始文件为准。数据更新节点：每年 1 月（报名）、6 月（招生计划）、7-8 月（录取数据）。
            </p>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs" style={{ color: "var(--c-secondary)" }}>
        数据说明 · Data Information
      </footer>
    </div>
  );
}
