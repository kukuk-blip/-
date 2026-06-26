import { useEffect, useMemo, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import {
  Search, Filter, X, GraduationCap, BookOpen,
  TrendingUp, Coins, ClipboardList, School, ChevronLeft,
  ChevronRight, Loader2, Sparkles, ExternalLink, MapPin, Database, Target,
} from "lucide-react";

// ============ 类型定义 ============
// 本科批: [排名, 院校代号, 院校名称, 专业组代码, 再选科目, 专业代码, 专业名称,
//          录取人数, 最高分, 平均分, 最低分, 最低分位次, 专业组投档最低分, 专业组投档最低分位次,
//          天赋IDs, 学费档级, 学费min, 学费max, 学费label]
type BenkeRow = [
  number, string, string, string, string, string, string,
  number | null, number | null, number | null, number, number | null,
  number | null, number | null, string, number, number, number, string
];

// 专科批: [排名, 院校代号, 院校名称, 专业组代码, 再选科目, 录取人数, 最高分, 平均分,
//          最低分, 最低分位次, 包含专业, 天赋IDs, 学费档级, 学费min, 学费max, 学费label]
type ZhuankeRow = [
  number, string, string, string, string,
  number | null, number | null, number | null, number, number | null,
  string, string, number, number, number, string
];

interface GaokaoData {
  m: string;
  g: string;
  b: BenkeRow[];
  z: ZhuankeRow[];
}

interface Meta {
  benkeCount: number;
  zhuankeCount: number;
  benkeScoreRange: { min: number; max: number };
  zhuankeScoreRange: { min: number; max: number };
  benkeRankRange: { min: number; max: number };
  zhuankeRankRange: { min: number; max: number };
  subjects: string[];
  schoolCount: number;
  tuitionTiers: { tier: number; label: string; range: string; color: string }[];
  talents: { id: string; name: string; color: string }[];
}

const TUITION_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "普通", color: "#66e0a0" },
  2: { label: "医学类", color: "#4fc3f7" },
  3: { label: "软件/艺术类", color: "#ffa94d" },
  4: { label: "中外合作", color: "#ff7e9f" },
};

const PAGE_SIZE = 50;

// ============ 选科要求映射 ============
// 数据中"再选科目"字段值 → 标准化分类
const SUBJECT_ALIASES: Record<string, string> = {
  "不限": "不限",
  "化学": "化学",
  "化学或生物学": "化学",  // 含化学
  "化学,生物学": "化学",
  "生物学": "生物",
  "生物或化学": "生物",
  "思想政治": "政治",
  "政治": "政治",
  "地理": "地理",
  "物理": "物理",
  "历史": "历史",
};

// 选科筛选选项（与用户要求对齐）
const SUBJECT_OPTIONS = [
  { key: "不限", label: "不限", color: "#9ca3af" },
  { key: "物理", label: "物理", color: "#60a5fa" },
  { key: "化学", label: "化学", color: "#34d399" },
  { key: "政治", label: "政治", color: "#fbbf24" },
  { key: "生物", label: "生物", color: "#a78bfa" },
  { key: "地理", label: "地理", color: "#f472b6" },
  { key: "历史", label: "历史", color: "#fb923c" },
];

// ============ 特殊类别匹配（基于 2026 招生考试之友分类）============
interface CategoryDef {
  key: string;
  label: string;
  color: string;
  desc: string;
  // 匹配函数：基于院校名 + 专业名/包含专业
  match: (schoolName: string, majorText: string) => boolean;
}

const CATEGORY_DEFS: CategoryDef[] = [
  {
    key: "art",
    label: "艺术类",
    color: "#ec4899",
    desc: "音乐/美术/设计/戏剧/影视/舞蹈等",
    match: (_s, m) => /音乐|舞蹈|美术|绘画|雕塑|设计学|视觉传达|动画|戏剧|影视|摄影|播音|表演|录音|作曲|书法|艺术|戏曲|影视学/.test(m),
  },
  {
    key: "military",
    label: "军警提前批",
    color: "#dc2626",
    desc: "军事/公安/司法/警察类院校",
    match: (s, m) => /军事|公安|警察|司法|警官|军校|国防|武装|边防|消防|警犬|侦查/.test(s + m),
  },
  {
    key: "sport",
    label: "体育类",
    color: "#16a34a",
    desc: "体育教育/运动训练等",
    match: (_s, m) => /体育|运动训练|运动康复|社会体育|休闲体育|武术与民族传统/.test(m),
  },
  {
    key: "teacher",
    label: "师范类",
    color: "#0891b2",
    desc: "师范/教育类专业",
    match: (s, m) => /师范|教育|学前|小学教育|学科教育|公费师范/.test(s + m),
  },
  {
    key: "medical",
    label: "医学类",
    color: "#0ea5e9",
    desc: "临床/口腔/中医/护理等",
    match: (_s, m) => /临床医学|口腔医学|中医|中药|药学|护理|医学|预防医学|影像|检验|康复治疗/.test(m),
  },
  {
    key: "cooperation",
    label: "中外合作",
    color: "#f43f5e",
    desc: "中外合作办学/国际学院",
    match: (s, m) => /中外合作|国际学院|联办|莫斯科|利莫瑞克|乌拉尔|帕特里斯|中俄|中德|中法|中英|中日|中韩|中爱|马拉加/.test(s + m),
  },
  {
    key: "software",
    label: "软件类",
    color: "#f59e0b",
    desc: "软件工程/软件学院",
    match: (s, m) => /软件工程|软件类|软件学院|软件技术/.test(s + m),
  },
  {
    key: "special",
    label: "专项计划",
    color: "#7c3aed",
    desc: "国家/地方/高校专项",
    match: (s, m) => /国家专项|地方专项|高校专项|专项计划|公费师范|定向/.test(s + m),
  },
];

// 标准化科目值（将数据中的"再选科目"映射为标准分类）
function normalizeSubject(raw: string): string {
  if (!raw) return "不限";
  // 直接查表
  if (SUBJECT_ALIASES[raw]) return SUBJECT_ALIASES[raw];
  // 模糊匹配
  for (const [k, v] of Object.entries(SUBJECT_ALIASES)) {
    if (raw.includes(k)) return v;
  }
  return "不限";
}

// 判断记录是否属于某特殊类别
function matchCategory(schoolName: string, majorText: string, catKey: string): boolean {
  const def = CATEGORY_DEFS.find(c => c.key === catKey);
  if (!def) return false;
  return def.match(schoolName, majorText);
}

// ============ 省级数据配置 ============
// 当前仅河南省数据可用；其余省份标记为数据整理中
interface ProvinceInfo {
  code: string;
  name: string;
  available: boolean;
  // 2024 物理类控制分数线
  scoreLines?: { benke: number; zhuanke: number; benkeRank?: number };
  examModel?: string; // 考试模式（3+1+2 / 3+3 / 传统）
}

const PROVINCES: ProvinceInfo[] = [
  { code: "ha", name: "河南", available: true, examModel: "3+1+2", scoreLines: { benke: 396, zhuanke: 185 } },
  { code: "he", name: "河北", available: false, examModel: "3+1+2" },
  { code: "sd", name: "山东", available: false, examModel: "3+3" },
  { code: "hb", name: "湖北", available: false, examModel: "3+1+2" },
  { code: "hn", name: "湖南", available: false, examModel: "3+1+2" },
  { code: "js", name: "江苏", available: false, examModel: "3+1+2" },
  { code: "zj", name: "浙江", available: false, examModel: "3+3" },
  { code: "gd", name: "广东", available: false, examModel: "3+1+2" },
  { code: "sc", name: "四川", available: false, examModel: "传统文理" },
  { code: "ah", name: "安徽", available: false, examModel: "3+1+2" },
  { code: "fj", name: "福建", available: false, examModel: "3+1+2" },
  { code: "jx", name: "江西", available: false, examModel: "3+1+2" },
  { code: "sx", name: "山西", available: false, examModel: "传统文理" },
  { code: "ln", name: "辽宁", available: false, examModel: "3+1+2" },
  { code: "jl", name: "吉林", available: false, examModel: "3+1+2" },
  { code: "hl", name: "黑龙江", available: false, examModel: "3+1+2" },
  { code: "gx", name: "广西", available: false, examModel: "3+1+2" },
  { code: "yn", name: "云南", available: false, examModel: "3+1+2" },
  { code: "gz", name: "贵州", available: false, examModel: "3+1+2" },
  { code: "sn", name: "陕西", available: false, examModel: "传统文理" },
  { code: "gs", name: "甘肃", available: false, examModel: "3+1+2" },
  { code: "qh", name: "青海", available: false, examModel: "传统文理" },
  { code: "nx", name: "宁夏", available: false, examModel: "传统文理" },
  { code: "xj", name: "新疆", available: false, examModel: "传统文理" },
  { code: "xz", name: "西藏", available: false, examModel: "传统文理" },
  { code: "hi", name: "海南", available: false, examModel: "3+3" },
  { code: "nm", name: "内蒙古", available: false, examModel: "传统文理" },
  { code: "bj", name: "北京", available: false, examModel: "3+3" },
  { code: "tj", name: "天津", available: false, examModel: "3+3" },
  { code: "sh", name: "上海", available: false, examModel: "3+3" },
  { code: "cq", name: "重庆", available: false, examModel: "3+1+2" },
];

export default function GaokaoPage() {
  const containerRef = useReveal<HTMLDivElement>();
  const [data, setData] = useState<GaokaoData | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"benke" | "zhuanke">("benke");
  const [province, setProvince] = useState<ProvinceInfo>(PROVINCES[0]);
  const [showProvincePanel, setShowProvincePanel] = useState(false);

  // ============ 筛选状态 ============
  const [searchSchool, setSearchSchool] = useState("");
  const [searchMajor, setSearchMajor] = useState("");
  const [tuitionFilter, setTuitionFilter] = useState<number | "all">("all");
  // 具体学费数值范围筛选（元/年）
  const [tuitionMin, setTuitionMin] = useState<number>(0);
  const [tuitionMax, setTuitionMax] = useState<number>(60000);
  const [tuitionRangeEnabled, setTuitionRangeEnabled] = useState(false);
  // 选科要求：多选（物理/化学/政治/生物/地理/历史/不限）
  const [subjectFilter, setSubjectFilter] = useState<Set<string>>(new Set());
  // 特殊类别：多选（艺术类/军警提前批/体育类/师范类/医学类/中外合作/软件类/专项计划）
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
  // 录取最低分范围（双向筛选：最低分下限 ~ 最低分上限）
  const [scoreMin, setScoreMin] = useState<number>(0);
  const [scoreMax, setScoreMax] = useState<number>(800);
  // 用户输入的参考分数（当年高考分数）
  const [userScore, setUserScore] = useState<number | "">("");
  // 是否仅显示用户分数可达的记录
  const [onlyAboveUserScore, setOnlyAboveUserScore] = useState(false);
  const [talentFilter, setTalentFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(true);

  // 分页
  const [pageB, setPageB] = useState(1);
  const [pageZ, setPageZ] = useState(1);

  // ============ 加载数据 ============
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dRes, mRes] = await Promise.all([
          fetch("./gaokao-data.json"),
          fetch("./gaokao-meta.json"),
        ]);
        if (!dRes.ok || !mRes.ok) throw new Error("数据加载失败");
        const d = await dRes.json();
        const m = await mRes.json();
        if (cancelled) return;
        setData(d);
        setMeta(m);
        setScoreMin(m.benkeScoreRange.min);
        setScoreMax(m.benkeScoreRange.max);
      } catch (e: any) {
        setError(e.message || "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 切换 tab 时重置分数范围
  useEffect(() => {
    if (!meta) return;
    if (tab === "benke") {
      setScoreMin(meta.benkeScoreRange.min);
      setScoreMax(meta.benkeScoreRange.max);
    } else {
      setScoreMin(meta.zhuankeScoreRange.min);
      setScoreMax(meta.zhuankeScoreRange.max);
    }
    setPageB(1);
    setPageZ(1);
  }, [tab, meta]);

  // 初始化时设置分数范围
  useEffect(() => {
    if (!meta) return;
    setScoreMin(meta.benkeScoreRange.min);
    setScoreMax(meta.benkeScoreRange.max);
  }, [meta]);

  // 院校列表（去重 + 排序），供下拉选择
  const schoolList = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const r of data.b) set.add(r[2]);
    for (const r of data.z) set.add(r[2]);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "zh"));
  }, [data]);

  // 学费范围（从数据中提取的实际范围）
  const tuitionRange = useMemo(() => {
    if (!data) return { min: 0, max: 60000 };
    let min = Infinity, max = -Infinity;
    for (const r of data.b) {
      const lo = r[16], hi = r[17];
      if (lo != null && lo < min) min = lo;
      if (hi != null && hi > max) max = hi;
    }
    for (const r of data.z) {
      const lo = r[13], hi = r[14];
      if (lo != null && lo < min) min = lo;
      if (hi != null && hi > max) max = hi;
    }
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 60000;
    return { min: Math.floor(min / 1000) * 1000, max: Math.ceil(max / 1000) * 1000 };
  }, [data]);

  // 初始化学费范围
  useEffect(() => {
    setTuitionMin(tuitionRange.min);
    setTuitionMax(tuitionRange.max);
  }, [tuitionRange]);

  // ============ 过滤函数 ============
  const filterBenke = (r: BenkeRow) => {
    if (searchSchool && !r[2].includes(searchSchool.trim())) return false;
    if (searchMajor && !r[6].includes(searchMajor.trim())) return false;
    if (tuitionFilter !== "all" && r[15] !== tuitionFilter) return false;
    // 具体学费数值范围筛选（基于估算学费区间，任一端点落在范围内即匹配）
    if (tuitionRangeEnabled) {
      const lo = r[16], hi = r[17];
      if (lo == null || hi == null) return false;
      // 学费区间与筛选区间无交集则过滤
      if (hi < tuitionMin || lo > tuitionMax) return false;
    }
    // 选科要求：多选匹配（任一即可）
    if (subjectFilter.size > 0) {
      const normalized = normalizeSubject(r[4]);
      if (!subjectFilter.has(normalized)) return false;
    }
    // 特殊类别：多选匹配（选中了任一类别且记录属于该类别即通过）
    if (categoryFilter.size > 0) {
      let matched = false;
      for (const cat of categoryFilter) {
        if (matchCategory(r[2], r[6], cat)) { matched = true; break; }
      }
      if (!matched) return false;
    }
    // 录取最低分范围（双向）
    if (r[10] < scoreMin || r[10] > scoreMax) return false;
    // 用户参考分数筛选
    if (onlyAboveUserScore && userScore !== "" && r[10] > Number(userScore)) return false;
    if (talentFilter !== "all") {
      const talents = (r[14] || "").split(",").filter(Boolean);
      if (!talents.includes(talentFilter)) return false;
    }
    return true;
  };

  const filterZhuanke = (r: ZhuankeRow) => {
    if (searchSchool && !r[2].includes(searchSchool.trim())) return false;
    if (searchMajor && !r[10].includes(searchMajor.trim())) return false;
    if (tuitionFilter !== "all" && r[12] !== tuitionFilter) return false;
    if (tuitionRangeEnabled) {
      const lo = r[13], hi = r[14];
      if (lo == null || hi == null) return false;
      if (hi < tuitionMin || lo > tuitionMax) return false;
    }
    if (subjectFilter.size > 0) {
      const normalized = normalizeSubject(r[4]);
      if (!subjectFilter.has(normalized)) return false;
    }
    if (categoryFilter.size > 0) {
      let matched = false;
      for (const cat of categoryFilter) {
        if (matchCategory(r[2], r[10], cat)) { matched = true; break; }
      }
      if (!matched) return false;
    }
    if (r[8] < scoreMin || r[8] > scoreMax) return false;
    if (onlyAboveUserScore && userScore !== "" && r[8] > Number(userScore)) return false;
    if (talentFilter !== "all") {
      const talents = (r[11] || "").split(",").filter(Boolean);
      if (!talents.includes(talentFilter)) return false;
    }
    return true;
  };

  const filteredB = useMemo(() => data?.b.filter(filterBenke) ?? [], [data, searchSchool, searchMajor, tuitionFilter, tuitionRangeEnabled, tuitionMin, tuitionMax, subjectFilter, categoryFilter, scoreMin, scoreMax, onlyAboveUserScore, userScore, talentFilter]);
  const filteredZ = useMemo(() => data?.z.filter(filterZhuanke) ?? [], [data, searchSchool, searchMajor, tuitionFilter, tuitionRangeEnabled, tuitionMin, tuitionMax, subjectFilter, categoryFilter, scoreMin, scoreMax, onlyAboveUserScore, userScore, talentFilter]);

  const pagedB = filteredB.slice((pageB - 1) * PAGE_SIZE, pageB * PAGE_SIZE);
  const pagedZ = filteredZ.slice((pageZ - 1) * PAGE_SIZE, pageZ * PAGE_SIZE);
  const totalPagesB = Math.max(1, Math.ceil(filteredB.length / PAGE_SIZE));
  const totalPagesZ = Math.max(1, Math.ceil(filteredZ.length / PAGE_SIZE));

  const resetFilters = () => {
    setSearchSchool("");
    setSearchMajor("");
    setTuitionFilter("all");
    setTuitionRangeEnabled(false);
    setTuitionMin(tuitionRange.min);
    setTuitionMax(tuitionRange.max);
    setSubjectFilter(new Set());
    setCategoryFilter(new Set());
    setTalentFilter("all");
    setOnlyAboveUserScore(false);
    if (meta) {
      const range = tab === "benke" ? meta.benkeScoreRange : meta.zhuankeScoreRange;
      setScoreMin(range.min);
      setScoreMax(range.max);
    }
    setPageB(1);
    setPageZ(1);
  };

  const hasActiveFilters = !!(searchSchool || searchMajor || tuitionFilter !== "all" ||
    tuitionRangeEnabled || subjectFilter.size > 0 || categoryFilter.size > 0 ||
    talentFilter !== "all" || onlyAboveUserScore);

  // ============ 渲染 ============
  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-starlight" />
          <p className="mt-4 text-white/60">正在加载高考数据...</p>
          <p className="mt-1 text-xs text-white/30">数据文件较大（约 4MB），请稍候</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={() => location.reload()} className="mt-4 rounded-lg bg-starlight/20 px-4 py-2 text-starlight hover:bg-starlight/30">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-midnight-900/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a href="#/" className="flex items-center gap-2 text-white/70 transition hover:text-starlight">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">天赋星图</span>
          </a>
          <h1 className="font-display text-lg text-white sm:text-xl">
            高考志愿 <span className="italic text-starlight">导览</span>
          </h1>
          <a
            href="https://kukuk-blip.github.io/-/#/"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1 text-xs text-white/50 transition hover:text-starlight"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">天赋测试</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* 数据来源 + 省级切换 */}
        <DataSourceSection
          province={province}
          onProvinceChange={setProvince}
          showPanel={showProvincePanel}
          setShowPanel={setShowProvincePanel}
          meta={meta}
        />

        {/* 概要 */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<GraduationCap className="h-5 w-5" />} label="本科批专业" value={meta?.benkeCount.toLocaleString() ?? "-"} color="#4fc3f7" />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="专科批专业组" value={meta?.zhuankeCount.toLocaleString() ?? "-"} color="#66e0a0" />
          <StatCard icon={<School className="h-5 w-5" />} label="院校总数" value={meta?.schoolCount.toLocaleString() ?? "-"} color="#ffa94d" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="数据年份" value="2024-2025" color="#ff7e9f" />
        </section>

        {/* 天赋推荐横幅 */}
        <TalentBanner meta={meta} talentFilter={talentFilter} setTalentFilter={setTalentFilter} />

        {/* 筛选面板切换 */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(s => !s)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/70 transition hover:border-starlight/40 hover:text-starlight"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "收起筛选" : "展开筛选"}
            {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-starlight" />}
          </button>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-white/50 hover:text-red-400">
              <X className="h-3 w-3" /> 清空筛选
            </button>
          )}
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <FilterPanel
            meta={meta}
            tab={tab}
            schoolList={schoolList}
            tuitionRange={tuitionRange}
            searchSchool={searchSchool} setSearchSchool={(v) => { setSearchSchool(v); setPageB(1); setPageZ(1); }}
            searchMajor={searchMajor} setSearchMajor={(v) => { setSearchMajor(v); setPageB(1); setPageZ(1); }}
            tuitionFilter={tuitionFilter} setTuitionFilter={(v) => { setTuitionFilter(v); setPageB(1); setPageZ(1); }}
            tuitionRangeEnabled={tuitionRangeEnabled} setTuitionRangeEnabled={(v) => { setTuitionRangeEnabled(v); setPageB(1); setPageZ(1); }}
            tuitionMin={tuitionMin} setTuitionMin={(v) => { setTuitionMin(v); setPageB(1); setPageZ(1); }}
            tuitionMax={tuitionMax} setTuitionMax={(v) => { setTuitionMax(v); setPageB(1); setPageZ(1); }}
            subjectFilter={subjectFilter} setSubjectFilter={(v) => { setSubjectFilter(v); setPageB(1); setPageZ(1); }}
            categoryFilter={categoryFilter} setCategoryFilter={(v) => { setCategoryFilter(v); setPageB(1); setPageZ(1); }}
            scoreMin={scoreMin} setScoreMin={(v) => { setScoreMin(v); setPageB(1); setPageZ(1); }}
            scoreMax={scoreMax} setScoreMax={(v) => { setScoreMax(v); setPageB(1); setPageZ(1); }}
            userScore={userScore} setUserScore={(v) => { setUserScore(v); setPageB(1); setPageZ(1); }}
            onlyAboveUserScore={onlyAboveUserScore} setOnlyAboveUserScore={(v) => { setOnlyAboveUserScore(v); setPageB(1); setPageZ(1); }}
            talentFilter={talentFilter} setTalentFilter={(v) => { setTalentFilter(v); setPageB(1); setPageZ(1); }}
          />
        )}

        {/* Tab 切换 */}
        <div className="mb-4 flex gap-2 border-b border-white/5">
          <TabButton active={tab === "benke"} onClick={() => setTab("benke")} count={filteredB.length}>
            本科批物理类专业
          </TabButton>
          <TabButton active={tab === "zhuanke"} onClick={() => setTab("zhuanke")} count={filteredZ.length}>
            高职专科批物理类专业组
          </TabButton>
        </div>

        {/* 表格 */}
        {tab === "benke" ? (
          <BenkeTable rows={pagedB} talentFilter={talentFilter} meta={meta} />
        ) : (
          <ZhuankeTable rows={pagedZ} talentFilter={talentFilter} meta={meta} />
        )}

        {/* 分页 */}
        {tab === "benke" ? (
          <Pagination page={pageB} totalPages={totalPagesB} setPage={setPageB} total={filteredB.length} />
        ) : (
          <Pagination page={pageZ} totalPages={totalPagesZ} setPage={setPageZ} total={filteredZ.length} />
        )}
      </main>

      <footer className="relative z-10 border-t border-white/5 py-6 text-center">
        <p className="font-display text-sm text-white/30">高考志愿导览 · Gaokao Navigator</p>
        <p className="mt-1 text-xs text-white/20">
          数据源自《2024-2025 河南物理类录取统计》· 学费为估算区间仅供参考
        </p>
      </footer>
    </div>
  );
}

// ============ 子组件 ============

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-xs text-white/50">{label}</span>
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

// 数据来源 + 省级切换 + 分数线参考
function DataSourceSection({ province, onProvinceChange, showPanel, setShowPanel, meta }: {
  province: ProvinceInfo;
  onProvinceChange: (p: ProvinceInfo) => void;
  showPanel: boolean;
  setShowPanel: (v: boolean) => void;
  meta: Meta | null;
}) {
  return (
    <section className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* 数据来源 */}
        <div className="flex items-center gap-2 rounded-lg bg-starlight/[0.08] px-3 py-1.5">
          <Database className="h-4 w-4 text-starlight" />
          <span className="text-xs text-white/70">数据来源：</span>
          <span className="text-sm font-medium text-starlight">
            {province.name}省 · 2024-2025 物理类
          </span>
        </div>

        {/* 省份切换按钮 */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:border-starlight/40 hover:text-starlight"
        >
          <MapPin className="h-4 w-4" />
          切换省份
          <span className="text-xs text-white/40">({PROVINCES.filter(p => p.available).length}/{PROVINCES.length} 可用)</span>
        </button>

        {/* 考试模式 */}
        {province.examModel && (
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/50">
            考试模式：{province.examModel}
          </span>
        )}

        {/* 分数线参考 */}
        {province.scoreLines && (
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5">
              <Target className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs text-white/60">本科批控制线</span>
              <span className="font-display text-sm font-semibold text-blue-400">{province.scoreLines.benke}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-1.5">
              <Target className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs text-white/60">专科批控制线</span>
              <span className="font-display text-sm font-semibold text-orange-400">{province.scoreLines.zhuanke}</span>
            </div>
          </div>
        )}
      </div>

      {/* 省份选择面板 */}
      {showPanel && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-starlight/60" />
            <span className="text-xs text-white/60">选择省份（含中国地图标注）</span>
          </div>
          <ChinaMapSelector
            current={province}
            onSelect={(p) => {
              if (p.available) {
                onProvinceChange(p);
                setShowPanel(false);
              }
            }}
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PROVINCES.map(p => (
              <button
                key={p.code}
                onClick={() => {
                  if (p.available) {
                    onProvinceChange(p);
                    setShowPanel(false);
                  }
                }}
                disabled={!p.available}
                className={`rounded-md border px-2.5 py-1 text-xs transition ${
                  p.code === province.code
                    ? "border-starlight bg-starlight/20 text-starlight"
                    : p.available
                    ? "border-white/10 text-white/70 hover:border-starlight/40 hover:text-starlight"
                    : "border-white/5 text-white/20 cursor-not-allowed"
                }`}
                title={p.available ? `${p.name} · ${p.examModel}` : `${p.name} · 数据整理中`}
              >
                {p.name}
                {!p.available && <span className="ml-1 text-[10px]">·待</span>}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/30">
            注：当前仅河南省数据完整可用。其余省份数据正在整理中，敬请期待。
            分数线为 2024 年该省物理类控制分数线，仅供参考。
          </p>
        </div>
      )}
    </section>
  );
}

// 简化版中国地图 - 以 SVG 显示省份分布
function ChinaMapSelector({ current, onSelect }: {
  current: ProvinceInfo;
  onSelect: (p: ProvinceInfo) => void;
}) {
  // 简化版中国地图：使用网格布局展示省份，已选中省份高亮
  // 完整地理地图需要 GeoJSON 数据（5MB+），此处用网格替代以保证加载速度
  const regions: { name: string; area: string }[] = [
    { name: "黑龙江", area: "东北" }, { name: "吉林", area: "东北" }, { name: "辽宁", area: "东北" },
    { name: "北京", area: "华北" }, { name: "天津", area: "华北" }, { name: "河北", area: "华北" }, { name: "山西", area: "华北" }, { name: "内蒙古", area: "华北" },
    { name: "上海", area: "华东" }, { name: "江苏", area: "华东" }, { name: "浙江", area: "华东" }, { name: "安徽", area: "华东" }, { name: "福建", area: "华东" }, { name: "江西", area: "华东" }, { name: "山东", area: "华东" },
    { name: "河南", area: "华中" }, { name: "湖北", area: "华中" }, { name: "湖南", area: "华中" },
    { name: "广东", area: "华南" }, { name: "广西", area: "华南" }, { name: "海南", area: "华南" },
    { name: "重庆", area: "西南" }, { name: "四川", area: "西南" }, { name: "贵州", area: "西南" }, { name: "云南", area: "西南" }, { name: "西藏", area: "西南" },
    { name: "陕西", area: "西北" }, { name: "甘肃", area: "西北" }, { name: "青海", area: "西北" }, { name: "宁夏", area: "西北" }, { name: "新疆", area: "西北" },
  ];
  const areas = ["东北", "华北", "华东", "华中", "华南", "西南", "西北"];

  return (
    <div className="rounded-lg border border-white/5 bg-midnight-800/30 p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {areas.map(area => (
          <div key={area}>
            <div className="mb-1.5 text-[10px] tracking-widest text-white/30">{area.toUpperCase()}</div>
            <div className="flex flex-wrap gap-1">
              {regions.filter(r => r.area === area).map(r => {
                const p = PROVINCES.find(x => x.name === r.name);
                if (!p) return null;
                const isCurrent = p.code === current.code;
                return (
                  <button
                    key={p.code}
                    onClick={() => onSelect(p)}
                    disabled={!p.available}
                    className={`rounded px-2 py-0.5 text-xs transition ${
                      isCurrent
                        ? "bg-starlight text-midnight-900 font-medium"
                        : p.available
                        ? "bg-white/5 text-white/70 hover:bg-white/10"
                        : "bg-white/[0.02] text-white/20 cursor-not-allowed"
                    }`}
                    title={p.available ? `${p.name}（可用）` : `${p.name}（数据整理中）`}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TalentBanner({ meta, talentFilter, setTalentFilter }: {
  meta: Meta | null;
  talentFilter: string;
  setTalentFilter: (v: string) => void;
}) {
  return (
    <section className="mb-6 rounded-xl border border-starlight/20 bg-gradient-to-r from-starlight/[0.08] to-transparent p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-starlight" />
        <div className="flex-1">
          <h3 className="font-display text-base text-white">天赋匹配 · 专业推荐</h3>
          <p className="mt-0.5 text-xs text-white/50">
            选择你的天赋类型，高亮匹配的专业。未测天赋？
            <a href="https://kukuk-blip.github.io/-/#/" target="_blank" rel="noopener" className="text-starlight hover:underline">前往天赋测试 →</a>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setTalentFilter("all")}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                talentFilter === "all"
                  ? "border-starlight bg-starlight/20 text-starlight"
                  : "border-white/10 text-white/50 hover:border-white/30"
              }`}
            >
              全部
            </button>
            {meta?.talents.map(t => (
              <button
                key={t.id}
                onClick={() => setTalentFilter(talentFilter === t.id ? "all" : t.id)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                  talentFilter === t.id
                    ? "border-transparent text-white"
                    : "border-white/10 text-white/50 hover:border-white/30"
                }`}
                style={talentFilter === t.id ? { background: t.color, color: "#070a1f" } : {}}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterPanel(props: {
  meta: Meta | null;
  tab: "benke" | "zhuanke";
  schoolList: string[];
  tuitionRange: { min: number; max: number };
  searchSchool: string; setSearchSchool: (v: string) => void;
  searchMajor: string; setSearchMajor: (v: string) => void;
  tuitionFilter: number | "all"; setTuitionFilter: (v: number | "all") => void;
  tuitionRangeEnabled: boolean; setTuitionRangeEnabled: (v: boolean) => void;
  tuitionMin: number; setTuitionMin: (v: number) => void;
  tuitionMax: number; setTuitionMax: (v: number) => void;
  subjectFilter: Set<string>; setSubjectFilter: (v: Set<string>) => void;
  categoryFilter: Set<string>; setCategoryFilter: (v: Set<string>) => void;
  scoreMin: number; setScoreMin: (v: number) => void;
  scoreMax: number; setScoreMax: (v: number) => void;
  userScore: number | ""; setUserScore: (v: number | "") => void;
  onlyAboveUserScore: boolean; setOnlyAboveUserScore: (v: boolean) => void;
  talentFilter: string; setTalentFilter: (v: string) => void;
}) {
  const { meta, tab, schoolList, tuitionRange } = props;
  // 院校下拉提示的展开状态（必须在任何 return 之前调用 hooks）
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  // 院校下拉的过滤结果（前 30 条，避免渲染过多）
  const schoolSuggestions = useMemo(() => {
    const q = props.searchSchool.trim();
    if (!q) return schoolList.slice(0, 30);
    return schoolList.filter(s => s.includes(q)).slice(0, 30);
  }, [props.searchSchool, schoolList]);
  if (!meta) return null;
  const range = tab === "benke" ? meta.benkeScoreRange : meta.zhuankeScoreRange;

  // 多选切换辅助
  const toggleInSet = (set: Set<string>, key: string): Set<string> => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  return (
    <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 院校搜索（带下拉建议，可点击精确选择） */}
        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
            <School className="h-3.5 w-3.5" /> 院校名称
            <span className="text-[10px] text-white/30">（可输入或从下拉选择，共 {schoolList.length} 所）</span>
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              value={props.searchSchool}
              onChange={(e) => {
                props.setSearchSchool(e.target.value);
                setSchoolDropdownOpen(true);
              }}
              onFocus={() => setSchoolDropdownOpen(true)}
              onBlur={() => setTimeout(() => setSchoolDropdownOpen(false), 200)}
              placeholder="如：北京大学 / 郑州大学"
              className="w-full rounded-lg border border-white/10 bg-midnight-800/50 py-1.5 pl-8 pr-8 text-sm text-white placeholder-white/30 focus:border-starlight/40 focus:outline-none"
            />
            {props.searchSchool && (
              <button
                onClick={() => props.setSearchSchool("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                title="清除"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {schoolDropdownOpen && schoolSuggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-white/10 bg-midnight-800/95 shadow-xl backdrop-blur-md">
              {schoolSuggestions.map(s => (
                <li
                  key={s}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    props.setSearchSchool(s);
                    setSchoolDropdownOpen(false);
                  }}
                  className="cursor-pointer px-3 py-1.5 text-xs text-white/70 hover:bg-starlight/20 hover:text-starlight"
                >
                  {s}
                </li>
              ))}
              {schoolSuggestions.length === 30 && (
                <li className="px-3 py-1 text-[10px] text-white/30">仅显示前 30 条，继续输入可精确筛选…</li>
              )}
            </ul>
          )}
        </div>

        {/* 专业搜索 */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
            <BookOpen className="h-3.5 w-3.5" /> 专业名称
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              value={props.searchMajor}
              onChange={(e) => props.setSearchMajor(e.target.value)}
              placeholder="如：计算机"
              className="w-full rounded-lg border border-white/10 bg-midnight-800/50 py-1.5 pl-8 pr-3 text-sm text-white placeholder-white/30 focus:border-starlight/40 focus:outline-none"
            />
          </div>
        </div>

        {/* 当年高考分数参考（用户输入） */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
            <Target className="h-3.5 w-3.5" /> 当年高考分数参考
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={props.userScore}
              onChange={(e) => props.setUserScore(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="输入你的分数"
              min={0}
              max={750}
              className="w-full rounded-lg border border-white/10 bg-midnight-800/50 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:border-starlight/40 focus:outline-none"
            />
            {props.userScore !== "" && (
              <label className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={props.onlyAboveUserScore}
                  onChange={(e) => props.setOnlyAboveUserScore(e.target.checked)}
                  className="accent-starlight"
                />
                仅显示可达
              </label>
            )}
          </div>
          {props.userScore !== "" && (
            <p className="mt-1 text-[10px] text-white/40">
              {props.onlyAboveUserScore
                ? `仅显示录取最低分 ≤ ${props.userScore} 的专业（你可达）`
                : `勾选「仅显示可达」筛选你分数能上的专业`}
            </p>
          )}
        </div>

        {/* 再选科目（多选） */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
            <ClipboardList className="h-3.5 w-3.5" />
            报名条件 · 再选科目要求（多选，任一匹配）
            {props.subjectFilter.size > 0 && (
              <button
                onClick={() => props.setSubjectFilter(new Set())}
                className="ml-2 text-white/40 hover:text-red-400"
              >
                清除
              </button>
            )}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_OPTIONS.map(s => {
              const active = props.subjectFilter.has(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => props.setSubjectFilter(toggleInSet(props.subjectFilter, s.key))}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition ${
                    active
                      ? "border-transparent text-white"
                      : "border-white/10 text-white/50 hover:border-white/30"
                  }`}
                  style={active ? { background: s.color, color: "#070a1f" } : {}}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: active ? "#070a1f" : s.color }}
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 特殊类别（多选，源自 2026 招生考试之友分类） */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
            <Filter className="h-3.5 w-3.5" />
            特殊类别筛选（多选，源自 2026 河南招生考试之友）
            {props.categoryFilter.size > 0 && (
              <button
                onClick={() => props.setCategoryFilter(new Set())}
                className="ml-2 text-white/40 hover:text-red-400"
              >
                清除
              </button>
            )}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_DEFS.map(c => {
              const active = props.categoryFilter.has(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => props.setCategoryFilter(toggleInSet(props.categoryFilter, c.key))}
                  className={`rounded-md border px-2.5 py-1 text-xs transition ${
                    active
                      ? "border-transparent text-white"
                      : "border-white/10 text-white/50 hover:border-white/30"
                  }`}
                  style={active ? { background: c.color, color: "#070a1f" } : {}}
                  title={c.desc}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          {props.categoryFilter.size > 0 && (
            <p className="mt-1.5 text-[10px] text-white/30">
              {Array.from(props.categoryFilter).map(k => CATEGORY_DEFS.find(c => c.key === k)?.desc).filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* 学费档级 */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
            <Coins className="h-3.5 w-3.5" /> 专业价格 · 学费档级（粗筛）
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => props.setTuitionFilter("all")}
              className={`rounded-md border px-2.5 py-1 text-xs transition ${
                props.tuitionFilter === "all"
                  ? "border-starlight bg-starlight/20 text-starlight"
                  : "border-white/10 text-white/50 hover:border-white/30"
              }`}
            >
              全部
            </button>
            {meta.tuitionTiers.map(t => (
              <button
                key={t.tier}
                onClick={() => props.setTuitionFilter(props.tuitionFilter === t.tier ? "all" : t.tier)}
                className={`rounded-md border px-2.5 py-1 text-xs transition ${
                  props.tuitionFilter === t.tier
                    ? "border-transparent text-white"
                    : "border-white/10 text-white/50 hover:border-white/30"
                }`}
                style={props.tuitionFilter === t.tier ? { background: t.color, color: "#070a1f" } : {}}
                title={t.range}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 具体学费数值范围筛选（精筛，基于估算学费区间） */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
            <Coins className="h-3.5 w-3.5" />
            专业价格 · 具体学费范围（精筛，元/年）
            <label className="ml-2 flex cursor-pointer items-center gap-1 text-[10px] text-white/50">
              <input
                type="checkbox"
                checked={props.tuitionRangeEnabled}
                onChange={(e) => props.setTuitionRangeEnabled(e.target.checked)}
                className="accent-starlight"
              />
              启用
            </label>
            {props.tuitionRangeEnabled && (
              <span className="text-white/30">
                当前：<span className="text-starlight">¥{props.tuitionMin.toLocaleString()}</span>
                <span className="mx-1">~</span>
                <span className="text-starlight">¥{props.tuitionMax.toLocaleString()}</span>
                <span className="ml-1 text-white/20">（数据范围：¥{tuitionRange.min.toLocaleString()} - ¥{tuitionRange.max.toLocaleString()}）</span>
              </span>
            )}
          </label>
          {props.tuitionRangeEnabled && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="range"
                  min={tuitionRange.min}
                  max={tuitionRange.max}
                  step={500}
                  value={props.tuitionMin}
                  onChange={(e) => props.setTuitionMin(Math.min(Number(e.target.value), props.tuitionMax))}
                  style={{ ["--progress" as any]: `${((props.tuitionMin - tuitionRange.min) / (tuitionRange.max - tuitionRange.min)) * 100}%` }}
                />
              </div>
              <div className="flex-1">
                <input
                  type="range"
                  min={tuitionRange.min}
                  max={tuitionRange.max}
                  step={500}
                  value={props.tuitionMax}
                  onChange={(e) => props.setTuitionMax(Math.max(Number(e.target.value), props.tuitionMin))}
                  style={{ ["--progress" as any]: `${((props.tuitionMax - tuitionRange.min) / (tuitionRange.max - tuitionRange.min)) * 100}%` }}
                />
              </div>
            </div>
          )}
          {props.tuitionRangeEnabled && (
            <p className="mt-1 text-[10px] text-white/30">
              注：学费为基于专业类型的估算区间，非院校官方公示数据，仅供参考。实际学费请以院校招生章程为准。
            </p>
          )}
        </div>

        {/* 录取最低分范围（双向） */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
            <TrendingUp className="h-3.5 w-3.5" />
            录取最低分范围：
            <span className="text-starlight">{props.scoreMin}</span>
            <span className="text-white/30">~</span>
            <span className="text-starlight">{props.scoreMax}</span>
            <span className="text-white/30">（{range.min} - {range.max}）</span>
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="range"
                min={range.min}
                max={range.max}
                value={props.scoreMin}
                onChange={(e) => props.setScoreMin(Math.min(Number(e.target.value), props.scoreMax))}
                style={{ ["--progress" as any]: `${((props.scoreMin - range.min) / (range.max - range.min)) * 100}%` }}
              />
            </div>
            <div className="flex-1">
              <input
                type="range"
                min={range.min}
                max={range.max}
                value={props.scoreMax}
                onChange={(e) => props.setScoreMax(Math.max(Number(e.target.value), props.scoreMin))}
                style={{ ["--progress" as any]: `${((props.scoreMax - range.min) / (range.max - range.min)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, count, children }: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition ${
        active ? "text-starlight" : "text-white/50 hover:text-white/80"
      }`}
    >
      {children}
      <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">{count.toLocaleString()}</span>
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-starlight" />}
    </button>
  );
}

function TalentTags({ talentsStr, meta, highlight }: { talentsStr: string; meta: Meta | null; highlight?: string }) {
  const arr = (talentsStr || "").split(",").filter(Boolean);
  if (arr.length === 0) return <span className="text-white/20">-</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {arr.map(id => {
        const t = meta?.talents.find(x => x.id === id);
        if (!t) return null;
        const isHL = highlight && id === highlight;
        return (
          <span
            key={id}
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{
              background: isHL ? t.color : `${t.color}33`,
              color: isHL ? "#070a1f" : t.color,
              fontWeight: isHL ? 600 : 400,
            }}
          >
            {t.name}
          </span>
        );
      })}
    </div>
  );
}

function TuitionBadge({ tier, label }: { tier: number; label: string }) {
  const info = TUITION_LABELS[tier];
  if (!info) return <span className="text-white/30">-</span>;
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px]"
      style={{ background: `${info.color}33`, color: info.color }}
    >
      {label}
    </span>
  );
}

function BenkeTable({ rows, talentFilter, meta }: { rows: BenkeRow[]; talentFilter: string; meta: Meta | null }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full min-w-[1400px] text-left text-xs">
        <thead className="sticky top-[57px] z-10 bg-midnight-800/90 backdrop-blur-sm">
          <tr className="text-white/60">
            <Th>排名</Th>
            <Th>院校代号</Th>
            <Th>院校名称</Th>
            <Th>专业组代码</Th>
            <Th>再选科目</Th>
            <Th>专业名称</Th>
            <Th right>录取人数</Th>
            <Th right>最高分</Th>
            <Th right>平均分</Th>
            <Th right>最低分</Th>
            <Th right>最低分位次</Th>
            <Th right>专业组投档最低分</Th>
            <Th right>专业组投档最低分位次</Th>
            <Th>天赋匹配</Th>
            <Th>学费档</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isHL = talentFilter !== "all" && (r[14] || "").split(",").includes(talentFilter);
            return (
              <tr
                key={i}
                className={`border-t border-white/5 transition hover:bg-white/[0.03] ${
                  isHL ? "bg-starlight/[0.08]" : ""
                }`}
              >
                <Td><span className="font-mono text-white/40">{r[0]}</span></Td>
                <Td><span className="font-mono">{r[1]}</span></Td>
                <Td><span className="text-white/90">{r[2]}</span></Td>
                <Td><span className="font-mono text-white/70">{r[3] || "-"}</span></Td>
                <Td><span className="text-white/60">{r[4] || "-"}</span></Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-white/30">{r[5]}</span>
                    <span className="text-white/90">{r[6]}</span>
                  </div>
                </Td>
                <Td right>{r[7] ?? "-"}</Td>
                <Td right>{r[8] ?? "-"}</Td>
                <Td right>{r[9] ?? "-"}</Td>
                <Td right><span className="font-semibold text-starlight">{r[10]}</span></Td>
                <Td right>{r[11]?.toLocaleString() ?? "-"}</Td>
                <Td right>{r[12] ?? "-"}</Td>
                <Td right>{r[13]?.toLocaleString() ?? "-"}</Td>
                <Td><TalentTags talentsStr={r[14]} meta={meta} highlight={talentFilter} /></Td>
                <Td><TuitionBadge tier={r[15]} label={r[18]} /></Td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={15} className="py-12 text-center text-white/30">无匹配数据，请调整筛选条件</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ZhuankeTable({ rows, talentFilter, meta }: { rows: ZhuankeRow[]; talentFilter: string; meta: Meta | null }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full min-w-[1200px] text-left text-xs">
        <thead className="sticky top-[57px] z-10 bg-midnight-800/90 backdrop-blur-sm">
          <tr className="text-white/60">
            <Th>排名</Th>
            <Th>院校代号</Th>
            <Th>院校名称</Th>
            <Th>专业组代码</Th>
            <Th>再选科目</Th>
            <Th right>录取人数</Th>
            <Th right>最高分</Th>
            <Th right>平均分</Th>
            <Th right>最低分</Th>
            <Th right>最低分位次</Th>
            <Th>包含专业</Th>
            <Th>天赋匹配</Th>
            <Th>学费档</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isHL = talentFilter !== "all" && (r[11] || "").split(",").includes(talentFilter);
            return (
              <tr
                key={i}
                className={`border-t border-white/5 transition hover:bg-white/[0.03] ${
                  isHL ? "bg-starlight/[0.08]" : ""
                }`}
              >
                <Td><span className="font-mono text-white/40">{r[0]}</span></Td>
                <Td><span className="font-mono">{r[1]}</span></Td>
                <Td><span className="text-white/90">{r[2]}</span></Td>
                <Td><span className="font-mono text-white/70">{r[3] || "-"}</span></Td>
                <Td><span className="text-white/60">{r[4] || "-"}</span></Td>
                <Td right>{r[5] ?? "-"}</Td>
                <Td right>{r[6] ?? "-"}</Td>
                <Td right>{r[7] ?? "-"}</Td>
                <Td right><span className="font-semibold text-starlight">{r[8]}</span></Td>
                <Td right>{r[9]?.toLocaleString() ?? "-"}</Td>
                <Td><div className="max-w-md whitespace-pre-wrap text-white/70">{r[10]}</div></Td>
                <Td><TalentTags talentsStr={r[11]} meta={meta} highlight={talentFilter} /></Td>
                <Td><TuitionBadge tier={r[12]} label={r[15]} /></Td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={13} className="py-12 text-center text-white/30">无匹配数据，请调整筛选条件</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-2 py-2 font-medium ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <td className={`px-2 py-2 ${right ? "text-right" : "text-left"}`}>
      {children}
    </td>
  );
}

function Pagination({ page, totalPages, setPage, total }: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  total: number;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs text-white/50">
        共 <span className="text-starlight">{total.toLocaleString()}</span> 条记录 · 第 {page}/{totalPages} 页
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="rounded border border-white/10 px-2 py-1 text-xs text-white/60 transition hover:border-starlight/40 hover:text-starlight disabled:opacity-30"
        >
          首页
        </button>
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-xs text-white/60 transition hover:border-starlight/40 hover:text-starlight disabled:opacity-30"
        >
          <ChevronLeft className="h-3 w-3" /> 上一页
        </button>
        <span className="px-2 text-xs text-white/60">{page} / {totalPages}</span>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-xs text-white/60 transition hover:border-starlight/40 hover:text-starlight disabled:opacity-30"
        >
          下一页 <ChevronRight className="h-3 w-3" />
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className="rounded border border-white/10 px-2 py-1 text-xs text-white/60 transition hover:border-starlight/40 hover:text-starlight disabled:opacity-30"
        >
          末页
        </button>
      </div>
    </div>
  );
}
