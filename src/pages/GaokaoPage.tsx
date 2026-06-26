import { useEffect, useMemo, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import {
  Search, Filter, X, GraduationCap, BookOpen,
  TrendingUp, Coins, ClipboardList, School, ChevronLeft,
  ChevronRight, Loader2, Sparkles, ExternalLink, MapPin, Database, Target, Download,
} from "lucide-react";
import ThemeToggle, { useGkTheme } from "@/components/ThemeToggle";

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
  1: { label: "普通", color: "var(--c-success)" },
  2: { label: "医学类", color: "var(--c-primary)" },
  3: { label: "软件/艺术类", color: "var(--c-warning)" },
  4: { label: "中外合作", color: "var(--c-error)" },
};

const PAGE_SIZE = 50;

// 导出筛选结果为 CSV
function exportCSV(rows: BenkeRow[] | ZhuankeRow[], type: "benke" | "zhuanke") {
  const headers = type === "benke"
    ? ["排名","院校代号","院校名称","专业组代码","再选科目","专业代码","专业名称","录取人数","最高分","平均分","最低分","最低分位次","专业组投档最低分","专业组投档最低分位次","学费档"]
    : ["排名","院校代号","院校名称","专业组代码","再选科目","录取人数","最高分","平均分","最低分","最低分位次","包含专业","学费档"];

  const escapeCell = (v: unknown): string => {
    const s = String(v ?? "");
    // CSV 转义：含逗号/引号/换行的字段用双引号包裹，内部引号双写
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [headers.map(escapeCell).join(",")];
  if (type === "benke") {
    for (const r of rows as BenkeRow[]) {
      const cells = [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[18]];
      lines.push(cells.map(escapeCell).join(","));
    }
  } else {
    for (const r of rows as ZhuankeRow[]) {
      const cells = [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[15]];
      lines.push(cells.map(escapeCell).join(","));
    }
  }

  const csv = "\uFEFF" + lines.join("\n"); // BOM 保证 Excel 正确识别中文
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `高考志愿_${type === "benke" ? "本科批" : "专科批"}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
  { key: "不限", label: "不限", color: "var(--c-secondary)" },
  { key: "物理", label: "物理", color: "var(--c-primary)" },
  { key: "化学", label: "化学", color: "var(--c-success)" },
  { key: "政治", label: "政治", color: "var(--c-warning)" },
  { key: "生物", label: "生物", color: "var(--c-primary)" },
  { key: "地理", label: "地理", color: "var(--c-error)" },
  { key: "历史", label: "历史", color: "var(--c-error)" },
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
    color: "var(--c-error)",
    desc: "音乐/美术/设计/戏剧/影视/舞蹈等",
    match: (_s, m) => /音乐|舞蹈|美术|绘画|雕塑|设计学|视觉传达|动画|戏剧|影视|摄影|播音|表演|录音|作曲|书法|艺术|戏曲|影视学/.test(m),
  },
  {
    key: "military",
    label: "军警提前批",
    color: "var(--c-error)",
    desc: "军事/公安/司法/警察类院校",
    match: (s, m) => /军事|公安|警察|司法|警官|军校|国防|武装|边防|消防|警犬|侦查/.test(s + m),
  },
  {
    key: "sport",
    label: "体育类",
    color: "var(--c-success)",
    desc: "体育教育/运动训练等",
    match: (_s, m) => /体育|运动训练|运动康复|社会体育|休闲体育|武术与民族传统/.test(m),
  },
  {
    key: "teacher",
    label: "师范类",
    color: "var(--c-primary)",
    desc: "师范/教育类专业",
    match: (s, m) => /师范|教育|学前|小学教育|学科教育|公费师范/.test(s + m),
  },
  {
    key: "medical",
    label: "医学类",
    color: "var(--c-primary)",
    desc: "临床/口腔/中医/护理等",
    match: (_s, m) => /临床医学|口腔医学|中医|中药|药学|护理|医学|预防医学|影像|检验|康复治疗/.test(m),
  },
  {
    key: "cooperation",
    label: "中外合作",
    color: "var(--c-error)",
    desc: "中外合作办学/国际学院",
    match: (s, m) => /中外合作|国际学院|联办|莫斯科|利莫瑞克|乌拉尔|帕特里斯|中俄|中德|中法|中英|中日|中韩|中爱|马拉加/.test(s + m),
  },
  {
    key: "software",
    label: "软件类",
    color: "var(--c-warning)",
    desc: "软件工程/软件学院",
    match: (s, m) => /软件工程|软件类|软件学院|软件技术/.test(s + m),
  },
  {
    key: "special",
    label: "专项计划",
    color: "var(--c-secondary)",
    desc: "国家/地方/高校专项",
    match: (s, m) => /国家专项|地方专项|高校专项|专项计划|公费师范|定向/.test(s + m),
  },
];

// ============ 院校类型识别（985/211/双一流） ============
// 基于院校名称匹配（数据中无标签字段，用名称 + 已知名单识别）
const DOUBLE_FIRST_NAMES = new Set([
  // 双一流（含原985）
  "北京大学","清华大学","复旦大学","上海交通大学","浙江大学","中国科学技术大学","南京大学","西安交通大学","武汉大学","华中科技大学","哈尔滨工业大学","中山大学","北京航空航天大学","四川大学","同济大学","东南大学","北京理工大学","中国人民大学","南开大学","天津大学","吉林大学","山东大学","大连理工大学","中南大学","厦门大学","电子科技大学","湖南大学","重庆大学","东北大学","兰州大学","西北农林科技大学","中国海洋大学","国防科技大学","中央民族大学","华南理工大学","华东师范大学","中国农业大学","北京师范大学","西北工业大学","北京理工大学",
  // 211（非985）
  "北京交通大学","北京工业大学","北京科技大学","北京化工大学","北京邮电大学","北京林业大学","北京中医药大学","北京外国语大学","中国传媒大学","中央财经大学","对外经济贸易大学","中国政法大学","华北电力大学","中国矿业大学(北京)","中国石油大学(北京)","中国地质大学(北京)","上海大学","上海财经大学","华东理工大学","东华大学","第二军医大学","第四军医大学","苏州大学","南京航空航天大学","南京理工大学","中国矿业大学","河海大学","江南大学","南京农业大学","中国药科大学","南京师范大学","合肥工业大学","安徽大学","南昌大学","福州大学","中国石油大学","郑州大学","河南大学","武汉理工大学","中国地质大学","华中农业大学","华中师范大学","中南财经政法大学","湖南师范大学","暨南大学","华南师范大学","海南大学","广西大学","西南交通大学","西南大学","西南财经大学","贵州大学","云南大学","西藏大学","西北大学","长安大学","陕西师范大学","宁夏大学","青海大学","新疆大学","石河子大学","延边大学","东北师范大学","东北农业大学","东北林业大学","哈尔滨工程大学","辽宁大学","大连海事大学","内蒙古大学","太原理工大学","山西大学","天津医科大学","河北工业大学","华东政法大学",
  // 双一流二期新增
  "中国科学院大学","上海科技大学","南方科技大学","首都师范大学","外交学院","中国人民公安大学","中国音乐学院","中央美术学院","中央戏剧学院","上海音乐学院","上海体育学院","南京邮电大学","南京林业大学","南京信息工程大学","南京医科大学","南京中医药大学","浙江工业大学","宁波大学","中国美术学院","安徽大学","福州大学","河南大学","湘潭大学","广州中医药大学","华南农业大学","广州医科大学","广州大学","深圳大学","南方医科大学","成都理工大学","成都中医药大学","西南石油大学","广州海洋大学","天津工业大学","山西大学",
]);

// 985 院校名单（用于「985」筛选）
const PROJECT_985_NAMES = new Set([
  "北京大学","清华大学","复旦大学","上海交通大学","浙江大学","中国科学技术大学","南京大学","西安交通大学","武汉大学","华中科技大学","哈尔滨工业大学","中山大学","北京航空航天大学","四川大学","同济大学","东南大学","北京理工大学","中国人民大学","南开大学","天津大学","吉林大学","山东大学","大连理工大学","中南大学","厦门大学","电子科技大学","湖南大学","重庆大学","东北大学","兰州大学","西北农林科技大学","中国海洋大学","国防科技大学","中央民族大学","华南理工大学","华东师范大学","中国农业大学","北京师范大学","西北工业大学",
]);

// 判断院校类型
function getSchoolType(schoolName: string): ("985" | "211" | "双一流" | "普通")[] {
  const types: ("985" | "211" | "双一流" | "普通")[] = [];
  if (PROJECT_985_NAMES.has(schoolName)) types.push("985");
  if (DOUBLE_FIRST_NAMES.has(schoolName)) types.push("211");
  if (DOUBLE_FIRST_NAMES.has(schoolName)) types.push("双一流");
  if (types.length === 0) types.push("普通");
  return types;
}

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
  const [theme, setTheme] = useGkTheme();
  const [data, setData] = useState<GaokaoData | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStage, setLoadStage] = useState("正在连接服务器...");
  const [loadTime, setLoadTime] = useState(0);
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
  // 院校类型筛选：多选（985/211/双一流/普通）
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<Set<string>>(new Set());
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

  // 排序：字段 + 方向
  type SortField = "minScore" | "maxScore" | "avgScore" | "minRank" | "default";
  type SortDir = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("default");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // 冲稳保推荐：输入分数后自动划分三梯度
  const [showRecommend, setShowRecommend] = useState(false);
  const [recommendScore, setRecommendScore] = useState<number | "">("");

  // ============ 加载数据（带进度跟踪 + 超时检测） ============
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    // 计时器：每秒更新已用时间
    timer = setInterval(() => {
      if (!cancelled) setLoadTime(t => t + 1);
    }, 1000);

    // 超时检测：30 秒未完成视为失败
    timeoutTimer = setTimeout(() => {
      if (!cancelled && loading) {
        setError("数据加载超时，请检查网络后重试");
        setLoading(false);
      }
    }, 30000);

    (async () => {
      try {
        setLoadStage("正在连接服务器...");
        setLoadProgress(10);
        await new Promise(r => setTimeout(r, 100));

        setLoadStage("正在下载院校数据...");
        setLoadProgress(30);
        const dRes = await fetch("./gaokao-data.json");
        if (!dRes.ok) throw new Error(`数据文件请求失败（HTTP ${dRes.status}）`);

        setLoadStage("正在下载元信息...");
        setLoadProgress(60);
        const mRes = await fetch("./gaokao-meta.json");
        if (!mRes.ok) throw new Error(`元信息请求失败（HTTP ${mRes.status}）`);

        setLoadStage("正在解析数据...");
        setLoadProgress(80);
        const d = await dRes.json();
        const m = await mRes.json();

        setLoadStage("正在初始化界面...");
        setLoadProgress(95);
        if (cancelled) return;
        setData(d);
        setMeta(m);
        setScoreMin(m.benkeScoreRange.min);
        setScoreMax(m.benkeScoreRange.max);
        setLoadProgress(100);
        setLoadStage("加载完成");
      } catch (e: any) {
        if (!cancelled) {
          const msg = e instanceof TypeError && e.message.includes("Failed to fetch")
            ? "网络连接失败，请检查网络后重试"
            : (e.message || "数据加载失败");
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
        if (timer) clearInterval(timer);
        if (timeoutTimer) clearTimeout(timeoutTimer);
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
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

  // 学费范围（固定 0 - 60000 元/年）
  const tuitionRange = useMemo(() => ({ min: 0, max: 60000 }), []);

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
    // 院校类型筛选（985/211/双一流/普通）
    if (schoolTypeFilter.size > 0) {
      const types = getSchoolType(r[2]);
      const matched = types.some(t => schoolTypeFilter.has(t));
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
    // 院校类型筛选（985/211/双一流/普通）—— 专科批 r[2] 同样是院校名称
    if (schoolTypeFilter.size > 0) {
      const types = getSchoolType(r[2]);
      const matched = types.some(t => schoolTypeFilter.has(t));
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

  const filteredB = useMemo(() => {
    const arr = data?.b.filter(filterBenke) ?? [];
    if (sortField === "default") return arr;
    return [...arr].sort((a, b) => {
      const idx = sortField === "minScore" ? 10 : sortField === "maxScore" ? 8 : sortField === "avgScore" ? 9 : 11;
      const va = a[idx], vb = b[idx];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return sortDir === "desc" ? Number(vb) - Number(va) : Number(va) - Number(vb);
    });
  }, [data, searchSchool, searchMajor, tuitionFilter, tuitionRangeEnabled, tuitionMin, tuitionMax, subjectFilter, categoryFilter, schoolTypeFilter, scoreMin, scoreMax, onlyAboveUserScore, userScore, talentFilter, sortField, sortDir]);

  const filteredZ = useMemo(() => {
    const arr = data?.z.filter(filterZhuanke) ?? [];
    if (sortField === "default") return arr;
    return [...arr].sort((a, b) => {
      const idx = sortField === "minScore" ? 8 : sortField === "maxScore" ? 6 : sortField === "avgScore" ? 7 : 9;
      const va = a[idx], vb = b[idx];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return sortDir === "desc" ? Number(vb) - Number(va) : Number(va) - Number(vb);
    });
  }, [data, searchSchool, searchMajor, tuitionFilter, tuitionRangeEnabled, tuitionMin, tuitionMax, subjectFilter, categoryFilter, schoolTypeFilter, scoreMin, scoreMax, onlyAboveUserScore, userScore, talentFilter, sortField, sortDir]);

  // 冲稳保推荐：基于用户分数划分冲刺/稳妥/保底三梯度
  const recommendation = useMemo(() => {
    if (!data || recommendScore === "" || !showRecommend) return null;
    const score = Number(recommendScore);
    if (!Number.isFinite(score) || score < 100 || score > 800) return null;

    // 梯度划分规则：
    // 冲刺：录取最低分 = 用户分数 ~ 用户分数+15（高于用户分数 0-15 分）
    // 稳妥：录取最低分 = 用户分数-15 ~ 用户分数（低于用户分数 0-15 分）
    // 保底：录取最低分 = 用户分数-30 ~ 用户分数-15（低于用户分数 15-30 分）
    const range = (rows: BenkeRow[], min: number, max: number) =>
      rows.filter(r => r[10] != null && r[10] >= min && r[10] <= max).slice(0, 20);

    const benke = data.b;
    return {
      rush: range(benke, score, score + 15),      // 冲刺
      stable: range(benke, score - 15, score - 1), // 稳妥
      safe: range(benke, score - 30, score - 16),  // 保底
    };
  }, [data, recommendScore, showRecommend]);

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
    setSchoolTypeFilter(new Set());
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
    schoolTypeFilter.size > 0 ||
    talentFilter !== "all" || onlyAboveUserScore);

  // ============ 渲染 ============
  if (loading) {
    const isSlow = loadTime > 10;
    return (
      <div className="relative flex min-h-screen flex-col bg-[var(--c-bg)]">
        {/* 顶部标题栏（站点介绍） */}
        <header className="border-b border-[var(--c-border)] bg-[var(--c-card)] px-4 py-4 md:px-6">
          <div className="mx-auto max-w-[1200px]">
            <h1 className="font-display text-lg text-[var(--c-title)] sm:text-xl">
              高考志愿 <span className="italic text-[var(--c-primary)]">导览</span>
            </h1>
            <p className="mt-1 text-xs text-[var(--c-secondary)]">
              河南物理类录取数据查询 · 覆盖 2,200+ 院校 · 28,000+ 专业记录
            </p>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 py-6 md:px-6">
          {/* 加载状态卡片 */}
          <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--c-primary)]" />
              <div className="flex-1">
                <p className="text-sm text-[var(--c-title)]">{loadStage}</p>
                <p className="text-xs text-[var(--c-secondary)]">
                  {loadTime > 0 ? `已等待 ${loadTime} 秒` : "正在加载..."}
                  {!isSlow && " · 预计 10-20 秒"}
                  {isSlow && " · 加载较慢，请耐心等待或检查网络"}
                </p>
              </div>
              <span className="font-mono text-sm text-[var(--c-primary)]">{loadProgress}%</span>
            </div>
            {/* 线性进度条 */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--c-block-30)]">
              <div
                className="h-full rounded-full bg-[var(--c-primary)] transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>

          {/* 骨架屏：模拟表格布局 */}
          <div className="mt-4 space-y-2">
            {/* 骨架行 */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-3">
                <div className="h-3 w-10 rounded bg-[var(--c-block-30)]" />
                <div className="h-3 w-24 rounded bg-[var(--c-block-30)]" />
                <div className="h-3 flex-1 rounded bg-[var(--c-block-30)]" />
                <div className="h-3 w-16 rounded bg-[var(--c-block-30)]" />
                <div className="h-3 w-12 rounded bg-[var(--c-block-30)]" />
              </div>
            ))}
          </div>

          {/* 功能亮点 */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: "筛选", title: "多维筛选", desc: "分数/位次/科目/学费/院校类型" },
              { icon: "推荐", title: "冲稳保推荐", desc: "输入分数智能匹配三梯度院校" },
              { icon: "导出", title: "数据导出", desc: "筛选结果一键导出 CSV" },
            ].map((f, i) => (
              <div key={i} className="rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-4">
                <div className="text-sm font-medium text-[var(--c-title)]">{f.title}</div>
                <div className="mt-1 text-xs text-[var(--c-secondary)]">{f.desc}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-4">
        <div className="max-w-md rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--c-primary-15)]">
            <X className="h-6 w-6 text-[var(--c-error)]" />
          </div>
          <h2 className="text-base text-[var(--c-title)]">数据加载失败</h2>
          <p className="mt-2 text-sm text-[var(--c-secondary)]">{error}</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => location.reload()}
              className="w-full rounded-lg bg-[var(--c-primary)] px-4 py-2.5 text-sm text-[var(--c-hover-text)] transition hover:opacity-90"
            >
              重新加载
            </button>
            <button
              onClick={() => { setError(null); setLoading(true); setLoadProgress(0); }}
              className="w-full rounded-lg border border-[var(--c-border)] px-4 py-2.5 text-sm text-[var(--c-secondary)] transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)]"
            >
              重试加载
            </button>
          </div>
          <p className="mt-4 text-xs text-[var(--c-secondary-50)]">
            提示：若多次失败，请检查网络连接或清除浏览器缓存后重试
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 border-b border-[var(--c-border)] bg-[var(--c-bg)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-6">
          <a href="#/" className="flex items-center gap-2 text-[var(--c-body)] transition hover:text-[var(--c-primary)]">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">天赋星图</span>
          </a>
          <h1 className="font-display text-lg text-[var(--c-title)] sm:text-xl">
            高考志愿 <span className="italic text-[var(--c-primary)]">导览</span>
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onChange={setTheme} compact />
            <a
              href="https://kukuk-blip.github.io/-/#/talent"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1 text-xs text-[var(--c-secondary)] transition hover:text-[var(--c-primary)]"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">天赋测试</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-6 md:px-6 md:py-8">
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
          <StatCard icon={<GraduationCap className="h-5 w-5" />} label="本科批专业" value={meta?.benkeCount.toLocaleString() ?? "-"} color="var(--c-primary)" />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="专科批专业组" value={meta?.zhuankeCount.toLocaleString() ?? "-"} color="var(--c-success)" />
          <StatCard icon={<School className="h-5 w-5" />} label="院校总数" value={meta?.schoolCount.toLocaleString() ?? "-"} color="var(--c-warning)" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="数据年份" value="2024-2025" color="var(--c-error)" />
        </section>

        {/* 天赋推荐横幅 */}
        <TalentBanner meta={meta} talentFilter={talentFilter} setTalentFilter={setTalentFilter} />

        {/* 冲稳保智能推荐 */}
        <section className="mb-6 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--c-primary)]" />
              <h2 className="text-sm font-medium text-[var(--c-title)]">冲稳保智能推荐</h2>
            </div>
            <button
              onClick={() => setShowRecommend(s => !s)}
              className="text-xs text-[var(--c-secondary)] transition hover:text-[var(--c-primary)]"
            >
              {showRecommend ? "收起" : "展开"}
            </button>
          </div>
          {showRecommend && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--c-secondary)]">我的分数：</label>
                <input
                  type="number"
                  value={recommendScore}
                  onChange={e => setRecommendScore(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="输入分数"
                  className="w-24 rounded-md border border-[var(--c-border)] bg-[var(--c-card)] px-2 py-1 text-sm text-[var(--c-title)]"
                />
                <span className="text-xs text-[var(--c-secondary-50)]">基于本科批数据推荐</span>
              </div>
              {recommendation && (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {/* 冲刺 */}
                  <div className="rounded-md border border-[var(--c-error)]/30 p-3" style={{ background: "color-mix(in srgb, var(--c-error) 5%, transparent)" }}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--c-error)]">冲刺</span>
                      <span className="text-[10px] text-[var(--c-secondary-50)]">{recommendation.rush.length} 所</span>
                    </div>
                    <div className="space-y-1">
                      {recommendation.rush.slice(0, 8).map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="truncate text-[var(--c-body)]">{r[2]}</span>
                          <span className="ml-2 shrink-0 font-mono text-[var(--c-error)]">{r[10]}</span>
                        </div>
                      ))}
                      {recommendation.rush.length === 0 && <p className="text-xs text-[var(--c-secondary-50)]">该分数段无冲刺院校</p>}
                    </div>
                  </div>
                  {/* 稳妥 */}
                  <div className="rounded-md border border-[var(--c-warning)]/30 p-3" style={{ background: "color-mix(in srgb, var(--c-warning) 5%, transparent)" }}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--c-warning)]">稳妥</span>
                      <span className="text-[10px] text-[var(--c-secondary-50)]">{recommendation.stable.length} 所</span>
                    </div>
                    <div className="space-y-1">
                      {recommendation.stable.slice(0, 8).map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="truncate text-[var(--c-body)]">{r[2]}</span>
                          <span className="ml-2 shrink-0 font-mono text-[var(--c-warning)]">{r[10]}</span>
                        </div>
                      ))}
                      {recommendation.stable.length === 0 && <p className="text-xs text-[var(--c-secondary-50)]">该分数段无稳妥院校</p>}
                    </div>
                  </div>
                  {/* 保底 */}
                  <div className="rounded-md border border-[var(--c-success)]/30 p-3" style={{ background: "color-mix(in srgb, var(--c-success) 5%, transparent)" }}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--c-success)]">保底</span>
                      <span className="text-[10px] text-[var(--c-secondary-50)]">{recommendation.safe.length} 所</span>
                    </div>
                    <div className="space-y-1">
                      {recommendation.safe.slice(0, 8).map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="truncate text-[var(--c-body)]">{r[2]}</span>
                          <span className="ml-2 shrink-0 font-mono text-[var(--c-success)]">{r[10]}</span>
                        </div>
                      ))}
                      {recommendation.safe.length === 0 && <p className="text-xs text-[var(--c-secondary-50)]">该分数段无保底院校</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 筛选面板切换 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(s => !s)}
              className="flex min-h-[48px] items-center gap-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] px-3 py-1.5 text-sm text-[var(--c-body)] shadow-sm transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] md:min-h-[40px]"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "收起筛选" : "展开筛选"}
              {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-primary)]" />}
            </button>
            <button
              onClick={() => exportCSV(tab === "benke" ? filteredB : filteredZ, tab)}
              className="flex min-h-[48px] items-center gap-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] px-3 py-1.5 text-sm text-[var(--c-body)] shadow-sm transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] md:min-h-[40px]"
              title="导出当前筛选结果为 CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">导出</span>
            </button>
          </div>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-[var(--c-secondary)] hover:text-[var(--c-error)]">
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
            schoolTypeFilter={schoolTypeFilter} setSchoolTypeFilter={(v) => { setSchoolTypeFilter(v); setPageB(1); setPageZ(1); }}
            scoreMin={scoreMin} setScoreMin={(v) => { setScoreMin(v); setPageB(1); setPageZ(1); }}
            scoreMax={scoreMax} setScoreMax={(v) => { setScoreMax(v); setPageB(1); setPageZ(1); }}
            userScore={userScore} setUserScore={(v) => { setUserScore(v); setPageB(1); setPageZ(1); }}
            onlyAboveUserScore={onlyAboveUserScore} setOnlyAboveUserScore={(v) => { setOnlyAboveUserScore(v); setPageB(1); setPageZ(1); }}
            talentFilter={talentFilter} setTalentFilter={(v) => { setTalentFilter(v); setPageB(1); setPageZ(1); }}
          />
        )}

        {/* Tab 切换 */}
        <div className="mb-4 flex gap-2 border-b border-[var(--c-border)]">
          <TabButton active={tab === "benke"} onClick={() => setTab("benke")} count={filteredB.length}>
            本科批物理类专业
          </TabButton>
          <TabButton active={tab === "zhuanke"} onClick={() => setTab("zhuanke")} count={filteredZ.length}>
            高职专科批物理类专业组
          </TabButton>
        </div>

        {/* 排序控制 */}
        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-[var(--c-secondary)] shrink-0">排序：</span>
          {([
            { key: "default", label: "默认" },
            { key: "minScore", label: "最低分" },
            { key: "maxScore", label: "最高分" },
            { key: "avgScore", label: "平均分" },
            { key: "minRank", label: "位次" },
          ] as { key: SortField; label: string }[]).map(opt => {
            const active = sortField === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  if (active) {
                    setSortDir(d => d === "desc" ? "asc" : "desc");
                  } else {
                    setSortField(opt.key);
                    setSortDir(opt.key === "minRank" ? "asc" : "desc");
                  }
                }}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition shrink-0 ${
                  active
                    ? "bg-[var(--c-primary)] text-[var(--c-hover-text)]"
                    : "border border-[var(--c-border)] text-[var(--c-secondary)] hover:border-[var(--c-primary)] hover:text-[var(--c-primary)]"
                }`}
              >
                {opt.label}
                {active && opt.key !== "default" && (
                  <span className="text-[10px]">{sortDir === "desc" ? "↓" : "↑"}</span>
                )}
              </button>
            );
          })}
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

      <footer className="relative z-10 border-t border-[var(--c-border)] bg-[var(--c-card)] py-6">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-display text-sm text-[var(--c-title)]">高考志愿导览 · Gaokao Navigator</p>
              <p className="mt-1 text-xs text-[var(--c-secondary)]">
                数据源自《2024-2025 河南物理类录取统计》及《2026 河南招生考试之友》
              </p>
            </div>
            <div className="space-y-1 text-xs text-[var(--c-secondary)]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--c-secondary-50)]">数据年份：</span>
                <span>2024-2025</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--c-secondary-50)]">覆盖范围：</span>
                <span>{meta?.schoolCount.toLocaleString() ?? "-"} 所院校 · {meta?.benkeCount.toLocaleString() ?? "-"} 个本科专业 · {meta?.zhuankeCount.toLocaleString() ?? "-"} 个专科专业组</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--c-secondary-50)]">学费说明：</span>
                <span>学费为基于河南高校通用标准的估算区间，仅供参考</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--c-secondary-50)]">统计口径：</span>
                <span>河南省物理类录取数据，含普通批、专项计划、中外合作等</span>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-[var(--c-border-soft)] pt-4 text-xs text-[var(--c-secondary-50)]">
            <p>⚠️ 本站数据仅供参考，最终录取请以各省教育考试院官方公告为准。如发现数据异常，请以官方原始文件为准。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============ 子组件 ============

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-block-30)] px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-xs text-[var(--c-secondary)]">{label}</span>
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-[var(--c-title)]">{value}</div>
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
    <section className="mb-6 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* 数据来源 */}
        <div className="flex items-center gap-2 rounded-lg bg-[var(--c-primary-10)] px-3 py-1.5">
          <Database className="h-4 w-4 text-[var(--c-primary)]" />
          <span className="text-xs text-[var(--c-body)]">数据来源：</span>
          <span className="text-sm font-medium text-[var(--c-primary)]">
            {province.name}省 · 2024-2025 物理类
          </span>
        </div>

        {/* 省份切换按钮 */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="flex min-h-[48px] items-center gap-2 rounded-lg border border-[var(--c-border)] px-3 py-1.5 text-sm text-[var(--c-body)] shadow-sm transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] md:min-h-[40px]"
        >
          <MapPin className="h-4 w-4" />
          切换省份
          <span className="text-xs text-[var(--c-secondary-70)]">({PROVINCES.filter(p => p.available).length}/{PROVINCES.length} 可用)</span>
        </button>

        {/* 考试模式 */}
        {province.examModel && (
          <span className="rounded-full border border-[var(--c-border)] px-2.5 py-1 text-xs text-[var(--c-secondary)]">
            考试模式：{province.examModel}
          </span>
        )}

        {/* 分数线参考 */}
        {province.scoreLines && (
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--c-primary-10)] px-3 py-1.5">
              <Target className="h-3.5 w-3.5 text-[var(--c-primary)]" />
              <span className="text-xs text-[var(--c-secondary)]">本科批控制线</span>
              <span className="font-display text-sm font-semibold text-[var(--c-primary)]">{province.scoreLines.benke}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ backgroundColor: "color-mix(in srgb, var(--c-warning) 10%, transparent)" }}>
              <Target className="h-3.5 w-3.5 text-[var(--c-warning)]" />
              <span className="text-xs text-[var(--c-secondary)]">专科批控制线</span>
              <span className="font-display text-sm font-semibold text-[var(--c-warning)]">{province.scoreLines.zhuanke}</span>
            </div>
          </div>
        )}
      </div>

      {/* 省份选择面板 */}
      {showPanel && (
        <div className="mt-4 border-t border-[var(--c-border)] pt-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--c-primary)]" />
            <span className="text-xs text-[var(--c-secondary)]">选择省份（含中国地图标注）</span>
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
                    ? "border-[var(--c-primary)] bg-[var(--c-primary-15)] text-[var(--c-primary)]"
                    : p.available
                    ? "border-[var(--c-border)] text-[var(--c-body)] hover:border-[var(--c-primary)] hover:text-[var(--c-primary)]"
                    : "border-[var(--c-border)] text-[var(--c-secondary-50)] cursor-not-allowed"
                }`}
                title={p.available ? `${p.name} · ${p.examModel}` : `${p.name} · 数据整理中`}
              >
                {p.name}
                {!p.available && <span className="ml-1 text-[10px]">·待</span>}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--c-secondary-50)]">
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
    <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {areas.map(area => (
          <div key={area}>
            <div className="mb-1.5 text-[10px] tracking-widest text-[var(--c-secondary-50)]">{area.toUpperCase()}</div>
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
                        ? "bg-[var(--c-primary)] text-white font-medium"
                        : p.available
                        ? "bg-[var(--c-block-30)] text-[var(--c-body)] hover:bg-[var(--c-primary-15)]"
                        : "bg-[var(--c-card)] text-[var(--c-secondary-50)] cursor-not-allowed"
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
    <section className="mb-6 rounded-lg border border-[var(--c-primary-30)] bg-gradient-to-r from-[var(--c-primary-10)] to-transparent p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--c-primary)]" />
        <div className="flex-1">
          <h3 className="font-display text-base text-[var(--c-title)]">天赋匹配 · 专业推荐</h3>
          <p className="mt-0.5 text-xs text-[var(--c-secondary)]">
            选择你的天赋类型，高亮匹配的专业。未测天赋？
            <a href="https://kukuk-blip.github.io/-/#/talent" target="_blank" rel="noopener" className="text-[var(--c-primary)] hover:underline">前往天赋测试 →</a>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setTalentFilter("all")}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                talentFilter === "all"
                  ? "border-[var(--c-primary)] bg-[var(--c-primary-15)] text-[var(--c-primary)]"
                  : "border-[var(--c-border)] text-[var(--c-secondary)] hover:border-[var(--c-primary-30)]"
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
                    : "border-[var(--c-border)] text-[var(--c-secondary)] hover:border-[var(--c-primary-30)]"
                }`}
                style={talentFilter === t.id ? { background: t.color, color: "var(--c-hover-text)" } : {}}
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
  schoolTypeFilter: Set<string>; setSchoolTypeFilter: (v: Set<string>) => void;
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
    <div className="mb-6 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 院校搜索（带下拉建议，可点击精确选择） */}
        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--c-secondary)]">
            <School className="h-3.5 w-3.5" /> 院校名称
            <span className="text-[10px] text-[var(--c-secondary-50)]">（可输入或从下拉选择，共 {schoolList.length} 所）</span>
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--c-secondary-50)]" />
            <input
              value={props.searchSchool}
              onChange={(e) => {
                props.setSearchSchool(e.target.value);
                setSchoolDropdownOpen(true);
              }}
              onFocus={() => setSchoolDropdownOpen(true)}
              onBlur={() => setTimeout(() => setSchoolDropdownOpen(false), 200)}
              placeholder="如：北京大学 / 郑州大学"
              className="w-full min-h-[44px] rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] py-2 pl-8 pr-8 text-sm text-[var(--c-title)] placeholder-[var(--c-secondary-50)] focus:border-[var(--c-primary)] focus:outline-none"
            />
            {props.searchSchool && (
              <button
                onClick={() => props.setSearchSchool("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--c-secondary-50)] hover:text-[var(--c-body)]"
                title="清除"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {schoolDropdownOpen && schoolSuggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl">
              {schoolSuggestions.map(s => (
                <li
                  key={s}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    props.setSearchSchool(s);
                    setSchoolDropdownOpen(false);
                  }}
                  className="cursor-pointer px-3 py-1.5 text-xs text-[var(--c-body)] hover:bg-[var(--c-primary-15)] hover:text-[var(--c-primary)]"
                >
                  {s}
                </li>
              ))}
              {schoolSuggestions.length === 30 && (
                <li className="px-3 py-1 text-[10px] text-[var(--c-secondary-50)]">仅显示前 30 条，继续输入可精确筛选…</li>
              )}
            </ul>
          )}
        </div>

        {/* 专业搜索 */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--c-secondary)]">
            <BookOpen className="h-3.5 w-3.5" /> 专业名称
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--c-secondary-50)]" />
            <input
              value={props.searchMajor}
              onChange={(e) => props.setSearchMajor(e.target.value)}
              placeholder="如：计算机"
              className="w-full min-h-[44px] rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] py-2 pl-8 pr-3 text-sm text-[var(--c-title)] placeholder-[var(--c-secondary-50)] focus:border-[var(--c-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* 当年高考分数参考（用户输入） */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--c-secondary)]">
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
              className="w-full min-h-[44px] rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] px-3 py-2 text-sm text-[var(--c-title)] placeholder-[var(--c-secondary-50)] focus:border-[var(--c-primary)] focus:outline-none"
            />
            {props.userScore !== "" && (
              <label className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-[var(--c-secondary)]">
                <input
                  type="checkbox"
                  checked={props.onlyAboveUserScore}
                  onChange={(e) => props.setOnlyAboveUserScore(e.target.checked)}
                  className="accent-[var(--c-primary)]"
                />
                仅显示可达
              </label>
            )}
          </div>
          {props.userScore !== "" && (
            <p className="mt-1 text-[10px] text-[var(--c-secondary-70)]">
              {props.onlyAboveUserScore
                ? `仅显示录取最低分 ≤ ${props.userScore} 的专业（你可达）`
                : `勾选「仅显示可达」筛选你分数能上的专业`}
            </p>
          )}
        </div>

        {/* 再选科目（多选） */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--c-secondary)]">
            <ClipboardList className="h-3.5 w-3.5" />
            报名条件 · 再选科目要求（多选，任一匹配）
            {props.subjectFilter.size > 0 && (
              <button
                onClick={() => props.setSubjectFilter(new Set())}
                className="ml-2 text-[var(--c-secondary-70)] hover:text-[var(--c-error)]"
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
                      : "border-[var(--c-border)] text-[var(--c-secondary)] hover:border-[var(--c-primary-30)]"
                  }`}
                  style={active ? { background: s.color, color: "var(--c-hover-text)" } : {}}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: active ? "var(--c-hover-text)" : s.color }}
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 特殊类别（多选，源自 2026 招生考试之友分类） */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--c-secondary)]">
            <Filter className="h-3.5 w-3.5" />
            特殊类别筛选（多选，源自 2026 河南招生考试之友）
            {props.categoryFilter.size > 0 && (
              <button
                onClick={() => props.setCategoryFilter(new Set())}
                className="ml-2 text-[var(--c-secondary-70)] hover:text-[var(--c-error)]"
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
                      : "border-[var(--c-border)] text-[var(--c-secondary)] hover:border-[var(--c-primary-30)]"
                  }`}
                  style={active ? { background: c.color, color: "var(--c-hover-text)" } : {}}
                  title={c.desc}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          {props.categoryFilter.size > 0 && (
            <p className="mt-1.5 text-[10px] text-[var(--c-secondary-50)]">
              {Array.from(props.categoryFilter).map(k => CATEGORY_DEFS.find(c => c.key === k)?.desc).filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* 院校类型筛选（985/211/双一流/普通） */}
        <div className="md:col-span-2 lg:col-span-3">
          <div className="mb-2 flex items-center gap-1.5 text-[var(--c-secondary)]">
            <School className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">院校类型</span>
            {props.schoolTypeFilter.size > 0 && (
              <button
                onClick={() => props.setSchoolTypeFilter(new Set())}
                className="ml-2 text-[var(--c-secondary-70)] hover:text-[var(--c-error)]"
              >
                清除
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: "985", label: "985", color: "var(--c-error)" },
              { key: "211", label: "211", color: "var(--c-warning)" },
              { key: "双一流", label: "双一流", color: "var(--c-primary)" },
              { key: "普通", label: "普通", color: "var(--c-secondary)" },
            ] as const).map(t => {
              const active = props.schoolTypeFilter.has(t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    const next = new Set(props.schoolTypeFilter);
                    if (active) next.delete(t.key);
                    else next.add(t.key);
                    props.setSchoolTypeFilter(next);
                  }}
                  className="rounded-md px-2.5 py-1 text-xs transition"
                  style={active ? { background: t.color, color: "var(--c-hover-text)" } : {
                    background: "transparent",
                    border: "1px solid var(--c-border)",
                    color: "var(--c-secondary)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--c-secondary-50)]">
            基于院校名称与已知名单匹配，仅供标识参考。
          </p>
        </div>

        {/* 学费档级 */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--c-secondary)]">
            <Coins className="h-3.5 w-3.5" /> 专业价格 · 学费档级（粗筛）
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => props.setTuitionFilter("all")}
              className={`rounded-md border px-2.5 py-1 text-xs transition ${
                props.tuitionFilter === "all"
                  ? "border-[var(--c-primary)] bg-[var(--c-primary-15)] text-[var(--c-primary)]"
                  : "border-[var(--c-border)] text-[var(--c-secondary)] hover:border-[var(--c-primary-30)]"
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
                    : "border-[var(--c-border)] text-[var(--c-secondary)] hover:border-[var(--c-primary-30)]"
                }`}
                style={props.tuitionFilter === t.tier ? { background: t.color, color: "var(--c-hover-text)" } : {}}
                title={t.range}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 具体学费数值范围筛选（精筛，基于估算学费区间） */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--c-secondary)]">
            <Coins className="h-3.5 w-3.5" />
            专业价格 · 具体学费范围（精筛，元/年）
            <label className="ml-2 flex cursor-pointer items-center gap-1 text-[10px] text-[var(--c-secondary)]">
              <input
                type="checkbox"
                checked={props.tuitionRangeEnabled}
                onChange={(e) => props.setTuitionRangeEnabled(e.target.checked)}
                className="accent-[var(--c-primary)]"
              />
              启用
            </label>
            {props.tuitionRangeEnabled && (
              <span className="text-[var(--c-secondary-50)]">
                当前：<span className="text-[var(--c-primary)]">¥{props.tuitionMin.toLocaleString()}</span>
                <span className="mx-1">~</span>
                <span className="text-[var(--c-primary)]">¥{props.tuitionMax.toLocaleString()}</span>
                <span className="ml-1 text-[var(--c-secondary-50)]">（数据范围：¥{tuitionRange.min.toLocaleString()} - ¥{tuitionRange.max.toLocaleString()}）</span>
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
            <p className="mt-1 text-[10px] text-[var(--c-secondary-50)]">
              注：学费为基于专业类型的估算区间，非院校官方公示数据，仅供参考。实际学费请以院校招生章程为准。
            </p>
          )}
        </div>

        {/* 录取最低分范围（双向） */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--c-secondary)]">
            <TrendingUp className="h-3.5 w-3.5" />
            录取最低分范围：
            <span className="text-[var(--c-primary)]">{props.scoreMin}</span>
            <span className="text-[var(--c-secondary-50)]">~</span>
            <span className="text-[var(--c-primary)]">{props.scoreMax}</span>
            <span className="text-[var(--c-secondary-50)]">（{range.min} - {range.max}）</span>
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
        active ? "text-[var(--c-primary)]" : "text-[var(--c-secondary)] hover:text-[var(--c-title)]"
      }`}
    >
      {children}
      <span className="ml-1.5 rounded-full bg-[var(--c-block-30)] px-1.5 py-0.5 text-xs">{count.toLocaleString()}</span>
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--c-primary)]" />}
    </button>
  );
}

function TalentTags({ talentsStr, meta, highlight }: { talentsStr: string; meta: Meta | null; highlight?: string }) {
  const arr = (talentsStr || "").split(",").filter(Boolean);
  if (arr.length === 0) return <span className="text-[var(--c-secondary-50)]">-</span>;
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
              background: isHL ? t.color : `color-mix(in srgb, ${t.color} 10%, transparent)`,
              color: isHL ? "var(--c-hover-text)" : t.color,
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
  if (!info) return <span className="text-[var(--c-secondary-50)]">-</span>;
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px]"
      style={{ background: `color-mix(in srgb, ${info.color} 10%, transparent)`, color: info.color }}
    >
      {label}
    </span>
  );
}

function BenkeTable({ rows, talentFilter, meta }: { rows: BenkeRow[]; talentFilter: string; meta: Meta | null }) {
  return (
    <>
    <div className="hidden overflow-x-auto rounded-lg border border-[var(--c-border)] md:block">
      <table className="w-full min-w-[1400px] text-left text-xs">
        <thead className="sticky top-[57px] z-10 backdrop-blur-sm" style={{ background: "color-mix(in srgb, var(--c-card-solid) 95%, transparent)" }}>
          <tr className="text-[var(--c-secondary)]">
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
                className={`border-t border-[var(--c-border)] transition hover:bg-[var(--c-primary-8)] ${
                  isHL ? "bg-[var(--c-primary-10)]" : ""
                }`}
              >
                <Td><span className="font-mono text-[var(--c-secondary-70)]">{r[0]}</span></Td>
                <Td><span className="font-mono">{r[1]}</span></Td>
                <Td><span className="text-[var(--c-title)]">{r[2]}</span></Td>
                <Td><span className="font-mono text-[var(--c-body)]">{r[3] || "-"}</span></Td>
                <Td><span className="text-[var(--c-secondary)]">{r[4] || "-"}</span></Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[var(--c-secondary-50)]">{r[5]}</span>
                    <span className="text-[var(--c-title)]">{r[6]}</span>
                  </div>
                </Td>
                <Td right>{r[7] ?? "-"}</Td>
                <Td right>{r[8] ?? "-"}</Td>
                <Td right>{r[9] ?? "-"}</Td>
                <Td right><span className="font-semibold text-[var(--c-primary)]">{r[10]}</span></Td>
                <Td right>{r[11]?.toLocaleString() ?? "-"}</Td>
                <Td right>{r[12] ?? "-"}</Td>
                <Td right>{r[13]?.toLocaleString() ?? "-"}</Td>
                <Td><TalentTags talentsStr={r[14]} meta={meta} highlight={talentFilter} /></Td>
                <Td><TuitionBadge tier={r[15]} label={r[18]} /></Td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={15} className="py-12 text-center text-[var(--c-secondary-50)]">无匹配数据，请调整筛选条件</td></tr>
          )}
        </tbody>
      </table>
    </div>
    {/* 移动端卡片视图 */}
    <div className="space-y-3 md:hidden">
      {rows.map((r, i) => {
        const isHL = talentFilter !== "all" && (r[14] || "").split(",").includes(talentFilter);
        return (
          <div
            key={i}
            className={`rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-3 ${
              isHL ? "ring-1 ring-[var(--c-primary-30)]" : ""
            }`}
          >
            {/* 卡片头部：排名 + 院校名 + 代号 */}
            <div className="flex items-start justify-between gap-2 border-b border-[var(--c-border-soft)] pb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--c-secondary-50)]">#{r[0]}</span>
                  <span className="truncate text-[var(--c-title)] font-medium">{r[2]}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--c-secondary)]">
                  <span className="font-mono">{r[1]}</span>
                  <span>·</span>
                  <span>专业组 {r[3] || "-"}</span>
                  <span>·</span>
                  <span>{r[4] || "不限"}</span>
                </div>
              </div>
            </div>
            {/* 专业名 */}
            <div className="py-2">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-[var(--c-secondary-50)]">{r[5]}</span>
                <span className="text-[var(--c-title)] text-sm">{r[6]}</span>
              </div>
            </div>
            {/* 分数网格 */}
            <div className="grid grid-cols-3 gap-2 border-t border-[var(--c-border-soft)] pt-2 text-xs">
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">最低分</div>
                <div className="text-[var(--c-primary)] font-semibold">{r[10]}</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">位次</div>
                <div className="text-[var(--c-body)]">{r[11]?.toLocaleString() ?? "-"}</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">组投档</div>
                <div className="text-[var(--c-body)]">{r[12] ?? "-"}</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">最高分</div>
                <div className="text-[var(--c-body)]">{r[8] ?? "-"}</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">平均分</div>
                <div className="text-[var(--c-body)]">{r[9] ?? "-"}</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">录取</div>
                <div className="text-[var(--c-body)]">{r[7] ?? "-"}人</div>
              </div>
            </div>
            {/* 天赋 + 学费 */}
            {(r[14] || r[15]) && (
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--c-border-soft)] pt-2">
                <TalentTags talentsStr={r[14]} meta={meta} highlight={talentFilter} />
                <TuitionBadge tier={r[15]} label={r[18]} />
              </div>
            )}
          </div>
        );
      })}
      {rows.length === 0 && (
        <div className="py-12 text-center text-[var(--c-secondary-50)]">无匹配数据，请调整筛选条件</div>
      )}
    </div>
    </>
  );
}

function ZhuankeTable({ rows, talentFilter, meta }: { rows: ZhuankeRow[]; talentFilter: string; meta: Meta | null }) {
  return (
    <>
    <div className="hidden overflow-x-auto rounded-lg border border-[var(--c-border)] md:block">
      <table className="w-full min-w-[1200px] text-left text-xs">
        <thead className="sticky top-[57px] z-10 backdrop-blur-sm" style={{ background: "color-mix(in srgb, var(--c-card-solid) 95%, transparent)" }}>
          <tr className="text-[var(--c-secondary)]">
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
                className={`border-t border-[var(--c-border)] transition hover:bg-[var(--c-primary-8)] ${
                  isHL ? "bg-[var(--c-primary-10)]" : ""
                }`}
              >
                <Td><span className="font-mono text-[var(--c-secondary-70)]">{r[0]}</span></Td>
                <Td><span className="font-mono">{r[1]}</span></Td>
                <Td><span className="text-[var(--c-title)]">{r[2]}</span></Td>
                <Td><span className="font-mono text-[var(--c-body)]">{r[3] || "-"}</span></Td>
                <Td><span className="text-[var(--c-secondary)]">{r[4] || "-"}</span></Td>
                <Td right>{r[5] ?? "-"}</Td>
                <Td right>{r[6] ?? "-"}</Td>
                <Td right>{r[7] ?? "-"}</Td>
                <Td right><span className="font-semibold text-[var(--c-primary)]">{r[8]}</span></Td>
                <Td right>{r[9]?.toLocaleString() ?? "-"}</Td>
                <Td><div className="max-w-md whitespace-pre-wrap text-[var(--c-body)]">{r[10]}</div></Td>
                <Td><TalentTags talentsStr={r[11]} meta={meta} highlight={talentFilter} /></Td>
                <Td><TuitionBadge tier={r[12]} label={r[15]} /></Td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={13} className="py-12 text-center text-[var(--c-secondary-50)]">无匹配数据，请调整筛选条件</td></tr>
          )}
        </tbody>
      </table>
    </div>
    {/* 移动端卡片视图 */}
    <div className="space-y-3 md:hidden">
      {rows.map((r, i) => {
        const isHL = talentFilter !== "all" && (r[11] || "").split(",").includes(talentFilter);
        return (
          <div
            key={i}
            className={`rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-3 ${
              isHL ? "ring-1 ring-[var(--c-primary-30)]" : ""
            }`}
          >
            {/* 卡片头部 */}
            <div className="flex items-start justify-between gap-2 border-b border-[var(--c-border-soft)] pb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--c-secondary-50)]">#{r[0]}</span>
                  <span className="truncate text-[var(--c-title)] font-medium">{r[2]}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--c-secondary)]">
                  <span className="font-mono">{r[1]}</span>
                  <span>·</span>
                  <span>专业组 {r[3] || "-"}</span>
                  <span>·</span>
                  <span>{r[4] || "不限"}</span>
                </div>
              </div>
            </div>
            {/* 分数网格 */}
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-[var(--c-border-soft)] text-xs">
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">最低分</div>
                <div className="text-[var(--c-primary)] font-semibold">{r[8]}</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">位次</div>
                <div className="text-[var(--c-body)]">{r[9]?.toLocaleString() ?? "-"}</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">录取</div>
                <div className="text-[var(--c-body)]">{r[5] ?? "-"}人</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">最高分</div>
                <div className="text-[var(--c-body)]">{r[6] ?? "-"}</div>
              </div>
              <div>
                <div className="text-[var(--c-secondary-50)] text-[10px]">平均分</div>
                <div className="text-[var(--c-body)]">{r[7] ?? "-"}</div>
              </div>
            </div>
            {/* 包含专业 */}
            {r[10] && (
              <div className="py-2 border-b border-[var(--c-border-soft)]">
                <div className="text-[var(--c-secondary-50)] text-[10px] mb-0.5">包含专业</div>
                <div className="text-[var(--c-body)] text-xs leading-relaxed">{r[10]}</div>
              </div>
            )}
            {/* 天赋 + 学费 */}
            {(r[11] || r[12]) && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <TalentTags talentsStr={r[11]} meta={meta} highlight={talentFilter} />
                <TuitionBadge tier={r[12]} label={r[15]} />
              </div>
            )}
          </div>
        );
      })}
      {rows.length === 0 && (
        <div className="py-12 text-center text-[var(--c-secondary-50)]">无匹配数据，请调整筛选条件</div>
      )}
    </div>
    </>
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
      <span className="text-xs text-[var(--c-secondary)]">
        共 <span className="text-[var(--c-primary)]">{total.toLocaleString()}</span> 条记录 · 第 {page}/{totalPages} 页
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="rounded border border-[var(--c-border)] px-2 py-1 text-xs text-[var(--c-secondary)] transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] disabled:opacity-30"
        >
          首页
        </button>
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center gap-1 rounded border border-[var(--c-border)] px-2 py-1 text-xs text-[var(--c-secondary)] transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] disabled:opacity-30"
        >
          <ChevronLeft className="h-3 w-3" /> 上一页
        </button>
        <span className="px-2 text-xs text-[var(--c-secondary)]">{page} / {totalPages}</span>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1 rounded border border-[var(--c-border)] px-2 py-1 text-xs text-[var(--c-secondary)] transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] disabled:opacity-30"
        >
          下一页 <ChevronRight className="h-3 w-3" />
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className="rounded border border-[var(--c-border)] px-2 py-1 text-xs text-[var(--c-secondary)] transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] disabled:opacity-30"
        >
          末页
        </button>
      </div>
    </div>
  );
}
