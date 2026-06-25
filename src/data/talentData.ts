// 天赋自测表数据 - 提取自「个人天赋自测表.xlsx」

export interface TalentType {
  id: string;
  name: string;
  categoryId: string;
  questions: string[];
  defaultScores: [number, number, number];
}

export interface TalentCategory {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  colorRgb: string;
  types: TalentType[];
}

export const CATEGORIES: TalentCategory[] = [
  {
    id: "thinking",
    name: "思维认知类",
    subtitle: "Cognitive Thinking",
    color: "#4fc3f7",
    colorRgb: "79, 195, 247",
    types: [
      {
        id: "logical",
        name: "逻辑分析型",
        categoryId: "thinking",
        questions: [
          "面对复杂问题时，我能快速拆解成多个小步骤，理清因果关系",
          "我对数据、公式、原理类内容接受快，容易发现其中的规律和漏洞",
          "做决策时，我习惯权衡利弊、推演不同选项的结果，而非凭感觉",
        ],
        defaultScores: [3, 3, 2],
      },
      {
        id: "creative",
        name: "创意发散型",
        categoryId: "thinking",
        questions: [
          "我经常能想到别人想不到的点子，不喜欢按固定套路做事",
          "接触新鲜事物时，我总能联想到其他领域的玩法和可能性",
          "遇到瓶颈时，我能快速切换思路，跳出原有框架找解决方案",
        ],
        defaultScores: [2, 3, 2],
      },
      {
        id: "insight",
        name: "深度洞察型",
        categoryId: "thinking",
        questions: [
          "我能快速看穿一件事的底层逻辑，不被表面信息迷惑",
          "和人相处时，我容易察觉到对方没说出口的真实想法和动机",
          "看完一本书 / 一件事，我能快速提炼出核心本质，而非停留在细节",
        ],
        defaultScores: [3, 2, 2],
      },
    ],
  },
  {
    id: "social",
    name: "人际协作类",
    subtitle: "Interpersonal Collaboration",
    color: "#ff7e9f",
    colorRgb: "255, 126, 159",
    types: [
      {
        id: "empathy",
        name: "共情沟通型",
        categoryId: "social",
        questions: [
          "别人情绪低落时，总愿意找我倾诉，且觉得我能理解他们",
          "我表达观点时，很容易让对方听明白、愿意接受",
          "沟通中我能快速感知对方的情绪变化，及时调整说话方式",
        ],
        defaultScores: [3, 3, 3],
      },
      {
        id: "organize",
        name: "组织协调型",
        categoryId: "social",
        questions: [
          "团队做事混乱时，我能快速理出流程、分工和时间节点",
          "我擅长调度人和资源，把零散的事拼成完整的方案落地",
          "多人出现分歧时，我能协调各方达成共识、推进事情前进",
        ],
        defaultScores: [2, 2, 3],
      },
      {
        id: "connect",
        name: "关系链接型",
        categoryId: "social",
        questions: [
          "我很容易和陌生人拉近距离，认识新朋友的速度很快",
          "我能长期维护好人脉关系，需要帮忙时总能找到对应的人",
          "我擅长把不同圈子的人连接起来，促成合作或交流",
        ],
        defaultScores: [3, 3, 2],
      },
    ],
  },
  {
    id: "sensory",
    name: "感官技艺类",
    subtitle: "Sensory & Craft",
    color: "#66e0a0",
    colorRgb: "102, 224, 160",
    types: [
      {
        id: "visual",
        name: "空间视觉型",
        categoryId: "sensory",
        questions: [
          "我对色彩、构图、排版很敏感，容易觉得画面「好看 / 别扭」",
          "我能在脑海里轻松构建立体画面，想象空间布局和效果",
          "没学过相关技能时，我修图 / 做 PPT / 搭空间也比多数人好看",
        ],
        defaultScores: [4, 3, 2],
      },
      {
        id: "handson",
        name: "动手实操型",
        categoryId: "sensory",
        questions: [
          "我上手工具、器械、手工类技能速度很快，一学就会",
          "我喜欢拆解、组装实物，坏的东西我常能自己修好",
          "做精细操作时，我的手眼协调度高，不容易出错",
        ],
        defaultScores: [3, 2, 3],
      },
      {
        id: "rhythm",
        name: "韵律感知型",
        categoryId: "sensory",
        questions: [
          "我对节奏、旋律、音色很敏感，容易记住一首歌的调子",
          "我对语言的发音、语调模仿能力强，学外语 / 方言更快",
          "我对声音的表现力强，朗读 / 配音时容易带出情绪",
        ],
        defaultScores: [3, 2, 3],
      },
    ],
  },
  {
    id: "drive",
    name: "执行内驱类",
    subtitle: "Execution & Drive",
    color: "#ffa94d",
    colorRgb: "255, 169, 77",
    types: [
      {
        id: "goal",
        name: "目标攻坚型",
        categoryId: "drive",
        questions: [
          "确定一个目标后，我能长期专注深耕，不容易半途而废",
          "面对困难和挫折，我越挫越勇，一定要把事做成",
          "我能忍受长期的枯燥重复，为了最终结果持续投入",
        ],
        defaultScores: [3, 3, 2],
      },
      {
        id: "iterate",
        name: "复盘迭代型",
        categoryId: "drive",
        questions: [
          "做完一件事，我会下意识总结经验，避免下次踩同样的坑",
          "我很擅长从失败里提炼优化方法，每次都比上次做得好",
          "我习惯把经验沉淀成方法、流程，能复制给其他人",
        ],
        defaultScores: [3, 3, 2],
      },
      {
        id: "stable",
        name: "情绪稳定型",
        categoryId: "drive",
        questions: [
          "突发状况发生时，我能保持冷静，快速想应对方案",
          "高压环境下，我的心态和做事质量不会明显下滑",
          "遇到负面评价和冲突，我不容易内耗，能就事论事处理",
        ],
        defaultScores: [3, 3, 2],
      },
    ],
  },
];

// 扁平化所有天赋类型，便于查找
export const ALL_TYPES: TalentType[] = CATEGORIES.flatMap((c) => c.types);

export function getTypeById(id: string): TalentType | undefined {
  return ALL_TYPES.find((t) => t.id === id);
}

export function getCategoryById(id: string): TalentCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

// 发展方向建议映射
export const DIRECTION_ADVICE: Record<string, { fields: string[]; careers: string }> = {
  logical: {
    fields: ["数据分析", "算法工程", "战略咨询", "科研论证"],
    careers: "适合需要严密推理与数据驱动的领域，如数据科学、投资分析、系统工程。",
  },
  creative: {
    fields: ["产品设计", "广告创意", "内容创作", "创新研发"],
    careers: "适合需要打破常规、跨界融合的领域，如创意设计、品牌策划、产品创新。",
  },
  insight: {
    fields: ["商业咨询", "心理学", "投资研究", "深度报道"],
    careers: "适合需要看透本质、把握趋势的领域，如战略咨询、研究分析、心理咨询。",
  },
  empathy: {
    fields: ["心理咨询", "用户体验", "教育培训", "客户成功"],
    careers: "适合需要深度理解他人、传递价值的领域，如心理服务、UX 研究、教育 coaching。",
  },
  organize: {
    fields: ["项目管理", "运营管理", "活动策划", "供应链"],
    careers: "适合需要统筹资源、推动落地的领域，如 PMO、运营负责、活动统筹。",
  },
  connect: {
    fields: ["商务拓展", "社群运营", "公关传播", "猎头招聘"],
    careers: "适合需要经营人脉、促成合作的领域，如 BD、公关、社群生态建设。",
  },
  visual: {
    fields: ["视觉设计", "建筑设计", "摄影影像", "UI/UX"],
    careers: "适合需要审美与空间想象的领域，如平面/空间设计、影像创作、前端视觉。",
  },
  handson: {
    fields: ["工程制造", "手工创作", "硬件研发", "医疗操作"],
    careers: "适合需要动手实操与精细控制的领域，如工程制造、手工艺术、硬件开发。",
  },
  rhythm: {
    fields: ["音乐创作", "配音播音", "语言教学", "舞蹈编排"],
    careers: "适合需要节奏与声音表现的领域，如音乐制作、播客播音、语言培训。",
  },
  goal: {
    fields: ["创业", "科研攻关", "专业深耕", "竞技体育"],
    careers: "适合需要长期专注、攻坚克难的领域，如创业、科研、专业技术专家路线。",
  },
  iterate: {
    fields: ["增长运营", "质量管理", "教练顾问", "流程优化"],
    careers: "适合需要持续优化的领域，如增长运营、精益管理、方法论沉淀与教练。",
  },
  stable: {
    fields: ["危机管理", "高压交易", "应急响应", "高端服务"],
    careers: "适合高压稳定输出的领域，如危机公关、金融交易、应急管理、高端客户服务。",
  },
};

export const TIPS: string[] = [
  "天赋是「天然优势倾向」，不是能力上限；高分项是你的省力赛道，优先投入会事半功倍。",
  "若多个维度得分接近，说明你是复合型天赋，适合需要交叉能力的领域。",
  "低分项不必强行补短，除非是职业刚需；多数场景下，用天赋补短板比硬磕短板效率更高。",
];
