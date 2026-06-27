// 院校档案：主管单位 + 王牌专业 + 行业地位
// 仅对双一流/985/211 重点院校内置权威信息
// 普通院校通过 getSchoolLinks() 生成跳转查询链接

export interface AceMajor {
  name: string;
  level: string; // 国家级特色专业 / 双一流建设学科 / A+学科 等
}

export interface SchoolProfile {
  name: string;
  adminType: string;   // 主管类型：教育部直属 / 工信部直属 / 中央军委 / 省属 / 部省合建 等
  admin: string;       // 具体主管单位
  tags: string[];      // ["985","211","双一流"] 等
  aceMajors: AceMajor[];
}

// 重点院校档案（按名称索引）
const PROFILES: Record<string, SchoolProfile> = {
  "北京大学": {
    name: "北京大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "数学与应用数学", level: "双一流建设学科 / A+学科" },
      { name: "物理学", level: "双一流建设学科 / A+学科" },
      { name: "化学", level: "双一流建设学科 / A+学科" },
      { name: "法学", level: "双一流建设学科 / A+学科" },
      { name: "汉语言文学", level: "国家级特色专业" },
    ],
  },
  "清华大学": {
    name: "清华大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "计算机科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "电气工程及其自动化", level: "双一流建设学科 / A+学科" },
      { name: "建筑学", level: "双一流建设学科 / A+学科" },
      { name: "土木工程", level: "双一流建设学科 / A+学科" },
      { name: "水利工程", level: "双一流建设学科 / A+学科" },
    ],
  },
  "复旦大学": {
    name: "复旦大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "哲学", level: "双一流建设学科 / A+学科" },
      { name: "理论经济学", level: "双一流建设学科 / A+学科" },
      { name: "政治学", level: "双一流建设学科 / A+学科" },
      { name: "临床医学", level: "双一流建设学科 / A+学科" },
      { name: "汉语言文学", level: "国家级特色专业" },
    ],
  },
  "上海交通大学": {
    name: "上海交通大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "机械工程", level: "双一流建设学科 / A+学科" },
      { name: "船舶与海洋工程", level: "双一流建设学科 / A+学科" },
      { name: "生物医学工程", level: "双一流建设学科 / A+学科" },
      { name: "临床医学", level: "双一流建设学科 / A+学科" },
      { name: "计算机科学与技术", level: "A+学科" },
    ],
  },
  "浙江大学": {
    name: "浙江大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "光学工程", level: "双一流建设学科 / A+学科" },
      { name: "控制科学与工程", level: "双一流建设学科 / A+学科" },
      { name: "计算机科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "农业工程", level: "双一流建设学科 / A+学科" },
      { name: "植物保护", level: "双一流建设学科 / A+学科" },
    ],
  },
  "中国科学技术大学": {
    name: "中国科学技术大学", adminType: "中科院直属", admin: "中国科学院", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "物理学", level: "双一流建设学科 / A+学科" },
      { name: "化学", level: "双一流建设学科 / A+学科" },
      { name: "天文学", level: "双一流建设学科 / A+学科" },
      { name: "地球物理学", level: "双一流建设学科 / A+学科" },
      { name: "核科学与技术", level: "双一流建设学科 / A+学科" },
    ],
  },
  "南京大学": {
    name: "南京大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "天文学", level: "双一流建设学科 / A+学科" },
      { name: "地质学", level: "双一流建设学科 / A+学科" },
      { name: "图书情报与档案管理", level: "双一流建设学科 / A+学科" },
      { name: "物理学", level: "双一流建设学科 / A+学科" },
      { name: "汉语言文学", level: "国家级特色专业" },
    ],
  },
  "西安交通大学": {
    name: "西安交通大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "动力工程及工程热物理", level: "双一流建设学科 / A+学科" },
      { name: "电气工程", level: "双一流建设学科 / A+学科" },
      { name: "机械工程", level: "双一流建设学科" },
      { name: "工商管理", level: "双一流建设学科" },
    ],
  },
  "武汉大学": {
    name: "武汉大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "地球物理学", level: "双一流建设学科 / A+学科" },
      { name: "测绘科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "图书情报与档案管理", level: "双一流建设学科 / A+学科" },
      { name: "马克思主义理论", level: "双一流建设学科 / A+学科" },
      { name: "法学", level: "双一流建设学科" },
    ],
  },
  "华中科技大学": {
    name: "华中科技大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "机械工程", level: "双一流建设学科 / A+学科" },
      { name: "光学工程", level: "双一流建设学科 / A+学科" },
      { name: "生物医学工程", level: "双一流建设学科 / A+学科" },
      { name: "公共卫生与预防医学", level: "双一流建设学科 / A+学科" },
      { name: "电气工程", level: "双一流建设学科" },
    ],
  },
  "哈尔滨工业大学": {
    name: "哈尔滨工业大学", adminType: "工信部直属", admin: "中华人民共和国工业和信息化部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "力学", level: "双一流建设学科 / A+学科" },
      { name: "机械工程", level: "双一流建设学科 / A+学科" },
      { name: "控制科学与工程", level: "双一流建设学科 / A+学科" },
      { name: "航空宇航科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "计算机科学与技术", level: "双一流建设学科" },
    ],
  },
  "中山大学": {
    name: "中山大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "工商管理", level: "双一流建设学科 / A+学科" },
      { name: "生态学", level: "双一流建设学科 / A+学科" },
      { name: "公共管理", level: "双一流建设学科" },
      { name: "临床医学", level: "双一流建设学科" },
      { name: "哲学", level: "双一流建设学科" },
    ],
  },
  "北京航空航天大学": {
    name: "北京航空航天大学", adminType: "工信部直属", admin: "中华人民共和国工业和信息化部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "航空宇航科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "仪器科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "软件工程", level: "双一流建设学科 / A+学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "控制科学与工程", level: "双一流建设学科" },
    ],
  },
  "四川大学": {
    name: "四川大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "口腔医学", level: "双一流建设学科 / A+学科" },
      { name: "数学", level: "双一流建设学科" },
      { name: "化学", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "中国语言文学", level: "双一流建设学科" },
    ],
  },
  "同济大学": {
    name: "同济大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "土木工程", level: "双一流建设学科 / A+学科" },
      { name: "建筑学", level: "双一流建设学科" },
      { name: "城乡规划学", level: "双一流建设学科" },
      { name: "环境科学与工程", level: "双一流建设学科" },
      { name: "测绘科学与技术", level: "双一流建设学科" },
    ],
  },
  "东南大学": {
    name: "东南大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "建筑学", level: "双一流建设学科 / A+学科" },
      { name: "土木工程", level: "双一流建设学科 / A+学科" },
      { name: "交通运输工程", level: "双一流建设学科 / A+学科" },
      { name: "生物医学工程", level: "双一流建设学科 / A+学科" },
      { name: "艺术学理论", level: "双一流建设学科 / A+学科" },
    ],
  },
  "北京理工大学": {
    name: "北京理工大学", adminType: "工信部直属", admin: "中华人民共和国工业和信息化部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "兵器科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "控制科学与工程", level: "双一流建设学科" },
      { name: "机械工程", level: "双一流建设学科" },
      { name: "信息与通信工程", level: "双一流建设学科" },
    ],
  },
  "中国人民大学": {
    name: "中国人民大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "应用经济学", level: "双一流建设学科 / A+学科" },
      { name: "法学", level: "双一流建设学科 / A+学科" },
      { name: "社会学", level: "双一流建设学科 / A+学科" },
      { name: "新闻传播学", level: "双一流建设学科 / A+学科" },
      { name: "马克思主义理论", level: "双一流建设学科 / A+学科" },
    ],
  },
  "南开大学": {
    name: "南开大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "数学", level: "双一流建设学科" },
      { name: "化学", level: "双一流建设学科" },
      { name: "统计学", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "世界史", level: "双一流建设学科" },
    ],
  },
  "天津大学": {
    name: "天津大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "化学工程与技术", level: "双一流建设学科 / A+学科" },
      { name: "仪器科学与技术", level: "双一流建设学科" },
      { name: "光学工程", level: "双一流建设学科" },
      { name: "建筑学", level: "双一流建设学科" },
      { name: "水利工程", level: "双一流建设学科" },
    ],
  },
  "吉林大学": {
    name: "吉林大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "考古学", level: "双一流建设学科 / A+学科" },
      { name: "化学", level: "双一流建设学科" },
      { name: "法学", level: "双一流建设学科" },
      { name: "机械工程", level: "双一流建设学科" },
      { name: "地质资源与地质工程", level: "双一流建设学科" },
    ],
  },
  "山东大学": {
    name: "山东大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "数学", level: "双一流建设学科" },
      { name: "化学", level: "双一流建设学科" },
      { name: "中国语言文学", level: "双一流建设学科" },
      { name: "临床医学", level: "双一流建设学科" },
    ],
  },
  "大连理工大学": {
    name: "大连理工大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "化学工程与技术", level: "双一流建设学科" },
      { name: "机械工程", level: "双一流建设学科" },
      { name: "力学", level: "双一流建设学科" },
      { name: "土木工程", level: "双一流建设学科" },
    ],
  },
  "中南大学": {
    name: "中南大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "冶金工程", level: "双一流建设学科 / A+学科" },
      { name: "矿业工程", level: "双一流建设学科 / A+学科" },
      { name: "护理学", level: "双一流建设学科 / A+学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "土木工程", level: "双一流建设学科" },
    ],
  },
  "厦门大学": {
    name: "厦门大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "海洋科学", level: "双一流建设学科 / A+学科" },
      { name: "应用经济学", level: "双一流建设学科" },
      { name: "化学", level: "双一流建设学科" },
      { name: "统计学", level: "双一流建设学科" },
      { name: "法学", level: "双一流建设学科" },
    ],
  },
  "电子科技大学": {
    name: "电子科技大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "电子科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "信息与通信工程", level: "双一流建设学科 / A+学科" },
      { name: "计算机科学与技术", level: "双一流建设学科" },
    ],
  },
  "湖南大学": {
    name: "湖南大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "化学", level: "双一流建设学科" },
      { name: "机械工程", level: "双一流建设学科" },
      { name: "电气工程", level: "双一流建设学科" },
      { name: "土木工程", level: "双一流建设学科" },
    ],
  },
  "重庆大学": {
    name: "重庆大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "机械工程", level: "双一流建设学科" },
      { name: "电气工程", level: "双一流建设学科" },
      { name: "土木工程", level: "双一流建设学科" },
      { name: "仪器科学与技术", level: "双一流建设学科" },
    ],
  },
  "东北大学": {
    name: "东北大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "控制科学与工程", level: "双一流建设学科" },
      { name: "冶金工程", level: "双一流建设学科" },
      { name: "软件工程", level: "双一流建设学科" },
    ],
  },
  "兰州大学": {
    name: "兰州大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "化学", level: "双一流建设学科" },
      { name: "生态学", level: "双一流建设学科" },
      { name: "草学", level: "双一流建设学科 / A+学科" },
      { name: "大气科学", level: "双一流建设学科" },
    ],
  },
  "西北农林科技大学": {
    name: "西北农林科技大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "植物保护", level: "双一流建设学科" },
      { name: "畜牧学", level: "双一流建设学科" },
      { name: "园艺学", level: "双一流建设学科" },
      { name: "农业工程", level: "双一流建设学科" },
    ],
  },
  "中国海洋大学": {
    name: "中国海洋大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "海洋科学", level: "双一流建设学科 / A+学科" },
      { name: "水产", level: "双一流建设学科 / A+学科" },
      { name: "食品科学与工程", level: "双一流建设学科" },
    ],
  },
  "国防科技大学": {
    name: "国防科技大学", adminType: "中央军委直属", admin: "中央军事委员会", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "信息与通信工程", level: "双一流建设学科 / A+学科" },
      { name: "计算机科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "航空宇航科学与技术", level: "双一流建设学科" },
      { name: "软件工程", level: "双一流建设学科" },
    ],
  },
  "中央民族大学": {
    name: "中央民族大学", adminType: "国家民委直属", admin: "国家民族事务委员会", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "民族学", level: "双一流建设学科 / A+学科" },
      { name: "中国少数民族语言文学", level: "国家级特色专业" },
    ],
  },
  "华南理工大学": {
    name: "华南理工大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "轻工技术与工程", level: "双一流建设学科 / A+学科" },
      { name: "机械工程", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "建筑学", level: "双一流建设学科" },
      { name: "化学工程与技术", level: "双一流建设学科" },
    ],
  },
  "华东师范大学": {
    name: "华东师范大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "教育学", level: "双一流建设学科 / A+学科" },
      { name: "世界史", level: "双一流建设学科 / A+学科" },
      { name: "地理学", level: "双一流建设学科" },
      { name: "心理学", level: "双一流建设学科" },
      { name: "统计学", level: "双一流建设学科" },
    ],
  },
  "中国农业大学": {
    name: "中国农业大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "作物学", level: "双一流建设学科 / A+学科" },
      { name: "农业工程", level: "双一流建设学科 / A+学科" },
      { name: "兽医学", level: "双一流建设学科 / A+学科" },
      { name: "食品科学与工程", level: "双一流建设学科" },
      { name: "畜牧学", level: "双一流建设学科" },
    ],
  },
  "北京师范大学": {
    name: "北京师范大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "教育学", level: "双一流建设学科 / A+学科" },
      { name: "心理学", level: "双一流建设学科 / A+学科" },
      { name: "中国语言文学", level: "双一流建设学科 / A+学科" },
      { name: "中国史", level: "双一流建设学科 / A+学科" },
      { name: "地理学", level: "双一流建设学科" },
    ],
  },
  "西北工业大学": {
    name: "西北工业大学", adminType: "工信部直属", admin: "中华人民共和国工业和信息化部", tags: ["985", "211", "双一流"],
    aceMajors: [
      { name: "航空宇航科学与技术", level: "双一流建设学科 / A+学科" },
      { name: "机械工程", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "兵器科学与技术", level: "双一流建设学科" },
    ],
  },
  "北京交通大学": {
    name: "北京交通大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "交通运输工程", level: "双一流建设学科" },
      { name: "系统科学", level: "双一流建设学科" },
      { name: "信息与通信工程", level: "国家级特色专业" },
    ],
  },
  "北京工业大学": {
    name: "北京工业大学", adminType: "北京市属", admin: "北京市教育委员会", tags: ["211", "双一流"],
    aceMajors: [
      { name: "土木工程", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "环境科学与工程", level: "国家级特色专业" },
    ],
  },
  "北京科技大学": {
    name: "北京科技大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "冶金工程", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "矿业工程", level: "国家级特色专业" },
      { name: "科学技术史", level: "双一流建设学科" },
    ],
  },
  "北京化工大学": {
    name: "北京化工大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "化学工程与技术", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
    ],
  },
  "北京邮电大学": {
    name: "北京邮电大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "信息与通信工程", level: "双一流建设学科 / A+学科" },
      { name: "计算机科学与技术", level: "双一流建设学科" },
      { name: "电子科学与技术", level: "国家级特色专业" },
    ],
  },
  "北京林业大学": {
    name: "北京林业大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "风景园林学", level: "双一流建设学科 / A+学科" },
      { name: "林学", level: "双一流建设学科 / A+学科" },
      { name: "生物学", level: "双一流建设学科" },
    ],
  },
  "北京中医药大学": {
    name: "北京中医药大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "中医学", level: "双一流建设学科 / A+学科" },
      { name: "中西医结合", level: "双一流建设学科" },
      { name: "中药学", level: "双一流建设学科" },
    ],
  },
  "北京外国语大学": {
    name: "北京外国语大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "外国语言文学", level: "双一流建设学科 / A+学科" },
      { name: "英语", level: "国家级特色专业" },
      { name: "翻译学", level: "国家级特色专业" },
    ],
  },
  "中国传媒大学": {
    name: "中国传媒大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "新闻传播学", level: "双一流建设学科 / A+学科" },
      { name: "戏剧与影视学", level: "双一流建设学科 / A+学科" },
      { name: "播音与主持艺术", level: "国家级特色专业" },
      { name: "广播电视编导", level: "国家级特色专业" },
    ],
  },
  "中央财经大学": {
    name: "中央财经大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "应用经济学", level: "双一流建设学科 / A+学科" },
      { name: "金融学", level: "国家级特色专业" },
      { name: "会计学", level: "国家级特色专业" },
    ],
  },
  "对外经济贸易大学": {
    name: "对外经济贸易大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "应用经济学", level: "双一流建设学科" },
      { name: "国际经济与贸易", level: "国家级特色专业" },
      { name: "法学", level: "国家级特色专业" },
    ],
  },
  "中国政法大学": {
    name: "中国政法大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "法学", level: "双一流建设学科 / A+学科" },
      { name: "政治学", level: "双一流建设学科" },
    ],
  },
  "华北电力大学": {
    name: "华北电力大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "电气工程", level: "双一流建设学科" },
      { name: "动力工程及工程热物理", level: "双一流建设学科" },
    ],
  },
  "上海大学": {
    name: "上海大学", adminType: "上海市属", admin: "上海市教育委员会", tags: ["211", "双一流"],
    aceMajors: [
      { name: "机械工程", level: "双一流建设学科" },
      { name: "美术学", level: "双一流建设学科" },
      { name: "社会学", level: "国家级特色专业" },
    ],
  },
  "上海财经大学": {
    name: "上海财经大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "应用经济学", level: "双一流建设学科" },
      { name: "会计学", level: "国家级特色专业" },
      { name: "金融学", level: "国家级特色专业" },
    ],
  },
  "华东理工大学": {
    name: "华东理工大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "化学工程与技术", level: "双一流建设学科" },
      { name: "化学", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
    ],
  },
  "东华大学": {
    name: "东华大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "纺织科学与工程", level: "双一流建设学科 / A+学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
    ],
  },
  "苏州大学": {
    name: "苏州大学", adminType: "江苏省属", admin: "江苏省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "纺织科学与工程", level: "双一流建设学科" },
      { name: "放射医学", level: "国家级特色专业" },
    ],
  },
  "南京航空航天大学": {
    name: "南京航空航天大学", adminType: "工信部直属", admin: "中华人民共和国工业和信息化部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "航空宇航科学与技术", level: "双一流建设学科" },
      { name: "力学", level: "双一流建设学科" },
      { name: "控制科学与工程", level: "国家级特色专业" },
    ],
  },
  "南京理工大学": {
    name: "南京理工大学", adminType: "工信部直属", admin: "中华人民共和国工业和信息化部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "兵器科学与技术", level: "双一流建设学科" },
      { name: "化学工程与技术", level: "双一流建设学科" },
      { name: "光学工程", level: "国家级特色专业" },
    ],
  },
  "中国矿业大学": {
    name: "中国矿业大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "矿业工程", level: "双一流建设学科 / A+学科" },
      { name: "安全科学与工程", level: "双一流建设学科 / A+学科" },
      { name: "测绘科学与技术", level: "双一流建设学科" },
    ],
  },
  "河海大学": {
    name: "河海大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "水利工程", level: "双一流建设学科 / A+学科" },
      { name: "土木工程", level: "双一流建设学科" },
      { name: "环境科学与工程", level: "双一流建设学科" },
    ],
  },
  "江南大学": {
    name: "江南大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "轻工技术与工程", level: "双一流建设学科 / A+学科" },
      { name: "食品科学与工程", level: "双一流建设学科 / A+学科" },
      { name: "设计学", level: "国家级特色专业" },
    ],
  },
  "南京农业大学": {
    name: "南京农业大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "作物学", level: "双一流建设学科 / A+学科" },
      { name: "农业资源与环境", level: "双一流建设学科 / A+学科" },
      { name: "植物保护", level: "双一流建设学科" },
      { name: "兽医学", level: "双一流建设学科" },
    ],
  },
  "中国药科大学": {
    name: "中国药科大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "中药学", level: "双一流建设学科" },
      { name: "药学", level: "双一流建设学科" },
    ],
  },
  "南京师范大学": {
    name: "南京师范大学", adminType: "江苏省属", admin: "江苏省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "地理学", level: "双一流建设学科" },
      { name: "教育学", level: "双一流建设学科" },
      { name: "马克思主义理论", level: "双一流建设学科" },
    ],
  },
  "合肥工业大学": {
    name: "合肥工业大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "管理科学与工程", level: "双一流建设学科" },
      { name: "机械工程", level: "国家级特色专业" },
      { name: "电气工程", level: "国家级特色专业" },
    ],
  },
  "南昌大学": {
    name: "南昌大学", adminType: "江西省属", admin: "江西省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "食品科学与工程", level: "双一流建设学科" },
    ],
  },
  "福州大学": {
    name: "福州大学", adminType: "福建省属", admin: "福建省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "化学", level: "双一流建设学科" },
      { name: "化学工程与技术", level: "国家级特色专业" },
    ],
  },
  "郑州大学": {
    name: "郑州大学", adminType: "河南省属", admin: "河南省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "化学", level: "双一流建设学科" },
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "临床医学", level: "双一流建设学科" },
    ],
  },
  "武汉理工大学": {
    name: "武汉理工大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "材料科学与工程", level: "双一流建设学科" },
      { name: "机械工程", level: "双一流建设学科" },
      { name: "船舶与海洋工程", level: "双一流建设学科" },
      { name: "设计学", level: "国家级特色专业" },
    ],
  },
  "中国地质大学": {
    name: "中国地质大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "地质学", level: "双一流建设学科 / A+学科" },
      { name: "地质资源与地质工程", level: "双一流建设学科 / A+学科" },
    ],
  },
  "华中农业大学": {
    name: "华中农业大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "园艺学", level: "双一流建设学科 / A+学科" },
      { name: "畜牧学", level: "双一流建设学科 / A+学科" },
      { name: "兽医学", level: "双一流建设学科 / A+学科" },
      { name: "生物学", level: "双一流建设学科" },
      { name: "食品科学与工程", level: "双一流建设学科" },
    ],
  },
  "华中师范大学": {
    name: "华中师范大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "政治学", level: "双一流建设学科" },
      { name: "教育学", level: "双一流建设学科" },
      { name: "中国语言文学", level: "双一流建设学科" },
    ],
  },
  "中南财经政法大学": {
    name: "中南财经政法大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "法学", level: "双一流建设学科" },
      { name: "应用经济学", level: "双一流建设学科" },
    ],
  },
  "湖南师范大学": {
    name: "湖南师范大学", adminType: "湖南省属", admin: "湖南省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "外国语言文学", level: "双一流建设学科" },
      { name: "教育学", level: "国家级特色专业" },
    ],
  },
  "暨南大学": {
    name: "暨南大学", adminType: "统战部直属", admin: "中央统战部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "药学", level: "双一流建设学科" },
      { name: "新闻传播学", level: "国家级特色专业" },
      { name: "汉语言文学", level: "国家级特色专业" },
    ],
  },
  "华南师范大学": {
    name: "华南师范大学", adminType: "广东省属", admin: "广东省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "物理学", level: "双一流建设学科" },
      { name: "教育学", level: "双一流建设学科" },
      { name: "心理学", level: "双一流建设学科" },
    ],
  },
  "海南大学": {
    name: "海南大学", adminType: "海南省属", admin: "海南省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "作物学", level: "双一流建设学科" },
      { name: "法学", level: "国家级特色专业" },
    ],
  },
  "广西大学": {
    name: "广西大学", adminType: "广西区属", admin: "广西壮族自治区教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "土木工程", level: "双一流建设学科" },
      { name: "轻工技术与工程", level: "双一流建设学科" },
    ],
  },
  "西南交通大学": {
    name: "西南交通大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "交通运输工程", level: "双一流建设学科 / A+学科" },
      { name: "机械工程", level: "国家级特色专业" },
      { name: "土木工程", level: "国家级特色专业" },
    ],
  },
  "西南大学": {
    name: "西南大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "教育学", level: "双一流建设学科" },
      { name: "生物学", level: "双一流建设学科" },
      { name: "心理学", level: "双一流建设学科" },
      { name: "蚕学", level: "国家级特色专业" },
    ],
  },
  "西南财经大学": {
    name: "西南财经大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "应用经济学", level: "双一流建设学科" },
      { name: "金融学", level: "国家级特色专业" },
    ],
  },
  "贵州大学": {
    name: "贵州大学", adminType: "贵州省属", admin: "贵州省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "植物保护", level: "双一流建设学科" },
    ],
  },
  "云南大学": {
    name: "云南大学", adminType: "云南省属", admin: "云南省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "民族学", level: "双一流建设学科 / A+学科" },
      { name: "生态学", level: "双一流建设学科" },
    ],
  },
  "西藏大学": {
    name: "西藏大学", adminType: "西藏区属", admin: "西藏自治区教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "生态学", level: "双一流建设学科" },
    ],
  },
  "西北大学": {
    name: "西北大学", adminType: "陕西省属", admin: "陕西省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "考古学", level: "双一流建设学科" },
      { name: "地质学", level: "双一流建设学科" },
      { name: "理论经济学", level: "双一流建设学科" },
    ],
  },
  "长安大学": {
    name: "长安大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "交通运输工程", level: "双一流建设学科" },
      { name: "土木工程", level: "国家级特色专业" },
      { name: "地质资源与地质工程", level: "国家级特色专业" },
    ],
  },
  "陕西师范大学": {
    name: "陕西师范大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "中国语言文学", level: "双一流建设学科" },
      { name: "教育学", level: "国家级特色专业" },
      { name: "心理学", level: "国家级特色专业" },
    ],
  },
  "宁夏大学": {
    name: "宁夏大学", adminType: "宁夏区属", admin: "宁夏回族自治区教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "化学工程与技术", level: "双一流建设学科" },
    ],
  },
  "青海大学": {
    name: "青海大学", adminType: "青海省属", admin: "青海省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "生态学", level: "双一流建设学科" },
    ],
  },
  "新疆大学": {
    name: "新疆大学", adminType: "新疆区属", admin: "新疆维吾尔自治区教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "马克思主义理论", level: "双一流建设学科" },
      { name: "化学", level: "双一流建设学科" },
      { name: "计算机科学与技术", level: "双一流建设学科" },
    ],
  },
  "石河子大学": {
    name: "石河子大学", adminType: "新疆区属", admin: "新疆生产建设兵团教育局", tags: ["211", "双一流"],
    aceMajors: [
      { name: "化学工程与技术", level: "双一流建设学科" },
    ],
  },
  "延边大学": {
    name: "延边大学", adminType: "吉林省属", admin: "吉林省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "外国语言文学", level: "双一流建设学科" },
    ],
  },
  "东北师范大学": {
    name: "东北师范大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "马克思主义理论", level: "双一流建设学科 / A+学科" },
      { name: "教育学", level: "双一流建设学科" },
      { name: "世界史", level: "双一流建设学科" },
      { name: "统计学", level: "双一流建设学科" },
    ],
  },
  "东北农业大学": {
    name: "东北农业大学", adminType: "黑龙江省属", admin: "黑龙江省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "畜牧学", level: "双一流建设学科" },
    ],
  },
  "东北林业大学": {
    name: "东北林业大学", adminType: "教育部直属", admin: "中华人民共和国教育部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "林业工程", level: "双一流建设学科 / A+学科" },
      { name: "林学", level: "双一流建设学科" },
    ],
  },
  "哈尔滨工程大学": {
    name: "哈尔滨工程大学", adminType: "工信部直属", admin: "中华人民共和国工业和信息化部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "船舶与海洋工程", level: "双一流建设学科" },
      { name: "核科学与技术", level: "双一流建设学科" },
    ],
  },
  "辽宁大学": {
    name: "辽宁大学", adminType: "辽宁省属", admin: "辽宁省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "应用经济学", level: "双一流建设学科" },
    ],
  },
  "大连海事大学": {
    name: "大连海事大学", adminType: "交通运输部直属", admin: "中华人民共和国交通运输部", tags: ["211", "双一流"],
    aceMajors: [
      { name: "交通运输工程", level: "双一流建设学科" },
      { name: "法学", level: "国家级特色专业" },
    ],
  },
  "内蒙古大学": {
    name: "内蒙古大学", adminType: "内蒙古区属", admin: "内蒙古自治区教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "生物学", level: "双一流建设学科" },
      { name: "生态学", level: "双一流建设学科" },
    ],
  },
  "太原理工大学": {
    name: "太原理工大学", adminType: "山西省属", admin: "山西省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "化学工程与技术", level: "双一流建设学科" },
      { name: "机械工程", level: "国家级特色专业" },
    ],
  },
  "山西大学": {
    name: "山西大学", adminType: "山西省属", admin: "山西省教育厅", tags: ["双一流"],
    aceMajors: [
      { name: "物理学", level: "双一流建设学科" },
      { name: "哲学", level: "双一流建设学科" },
    ],
  },
  "天津医科大学": {
    name: "天津医科大学", adminType: "天津市属", admin: "天津市教育委员会", tags: ["211", "双一流"],
    aceMajors: [
      { name: "临床医学", level: "双一流建设学科" },
    ],
  },
  "河北工业大学": {
    name: "河北工业大学", adminType: "河北省属", admin: "河北省教育厅", tags: ["211", "双一流"],
    aceMajors: [
      { name: "电气工程", level: "双一流建设学科" },
    ],
  },
};

// 学校名规范化：去除括号后缀（如"中国矿业大学(北京)"、"三门峡职业技术学院(中外合作办学)"）
function normalizeSchoolName(raw: string): string {
  // 去除括号及括号内内容
  return raw.replace(/[（(].*?[)）]/g, "").trim();
}

// 获取院校档案（含内置信息）
export function getSchoolProfile(rawName: string): SchoolProfile | null {
  const normalized = normalizeSchoolName(rawName);
  return PROFILES[normalized] || PROFILES[rawName] || null;
}

// ============ 基于院校名称推断主力专业（普通院校用） ============
// 名称关键词 → 主力专业方向 + 行业地位描述 + 主管单位推断
interface InferRule {
  keywords: string[];        // 命中任一关键词即适用
  majors: AceMajor[];
  category: string;           // 院校类型标签
  adminType: string;          // 推断主管类型
  admin: string;              // 推断直属单位
}

const INFER_RULES: InferRule[] = [
  {
    keywords: ["医学院", "医科大学", "医学高等专科"],
    category: "医药类",
    adminType: "省属/市属",
    admin: "各省/市卫生健康委员会或教育厅",
    majors: [
      { name: "临床医学", level: "主力专业" },
      { name: "口腔医学", level: "主力专业" },
      { name: "护理学", level: "主力专业" },
      { name: "医学影像学", level: "特色专业" },
    ],
  },
  {
    keywords: ["中医药", "中医学院"],
    category: "中医药类",
    adminType: "省属",
    admin: "各省教育厅 / 国家中医药管理局",
    majors: [
      { name: "中医学", level: "主力专业" },
      { name: "中药学", level: "主力专业" },
      { name: "针灸推拿学", level: "特色专业" },
    ],
  },
  {
    keywords: ["药科大学", "药学院", "制药"],
    category: "药学类",
    adminType: "省属",
    admin: "各省教育厅",
    majors: [
      { name: "药学", level: "主力专业" },
      { name: "药物制剂", level: "特色专业" },
      { name: "中药学", level: "特色专业" },
    ],
  },
  {
    keywords: ["师范", "教育学院", "高等师范"],
    category: "师范类",
    adminType: "省属/市属",
    admin: "各省/市教育局",
    majors: [
      { name: "汉语言文学", level: "主力专业" },
      { name: "数学与应用数学", level: "主力专业" },
      { name: "英语", level: "主力专业" },
      { name: "小学教育", level: "特色专业" },
    ],
  },
  {
    keywords: ["农业大学", "农业学院", "农牧", "农学院"],
    category: "农林类",
    adminType: "省属",
    admin: "各省教育厅 / 农业农村厅",
    majors: [
      { name: "农学", level: "主力专业" },
      { name: "动物医学", level: "主力专业" },
      { name: "食品科学与工程", level: "特色专业" },
      { name: "园艺", level: "特色专业" },
    ],
  },
  {
    keywords: ["林业大学", "林业学院"],
    category: "林业类",
    adminType: "省属",
    admin: "各省教育厅 / 林业和草原局",
    majors: [
      { name: "林学", level: "主力专业" },
      { name: "木材科学与工程", level: "特色专业" },
      { name: "园林", level: "特色专业" },
    ],
  },
  {
    keywords: ["理工大学", "工业学院", "工程学院", "理工", "工业"],
    category: "理工类",
    adminType: "省属/市属",
    admin: "各省/市教育局",
    majors: [
      { name: "机械工程", level: "主力专业" },
      { name: "电气工程及其自动化", level: "主力专业" },
      { name: "计算机科学与技术", level: "主力专业" },
      { name: "土木工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["财经大学", "经济学院", "经贸", "商学院", "工商学院", "经济贸易"],
    category: "财经类",
    adminType: "省属",
    admin: "各省教育厅",
    majors: [
      { name: "会计学", level: "主力专业" },
      { name: "金融学", level: "主力专业" },
      { name: "财务管理", level: "特色专业" },
      { name: "国际经济与贸易", level: "特色专业" },
    ],
  },
  {
    keywords: ["政法", "法学院", "法律"],
    category: "政法类",
    adminType: "省属",
    admin: "各省教育厅 / 司法厅",
    majors: [
      { name: "法学", level: "主力专业" },
      { name: "社会工作", level: "特色专业" },
      { name: "政治学与行政学", level: "特色专业" },
    ],
  },
  {
    keywords: ["外国语", "外语", "语言大学"],
    category: "外语类",
    adminType: "省属/教育部直属",
    admin: "各省教育厅 / 教育部",
    majors: [
      { name: "英语", level: "主力专业" },
      { name: "翻译", level: "主力专业" },
      { name: "商务英语", level: "特色专业" },
    ],
  },
  {
    keywords: ["建筑大学", "建筑学院", "建筑工程"],
    category: "建筑类",
    adminType: "省属/住建部共建",
    admin: "各省教育厅 / 住房和城乡建设厅",
    majors: [
      { name: "建筑学", level: "主力专业" },
      { name: "土木工程", level: "主力专业" },
      { name: "城乡规划", level: "特色专业" },
      { name: "工程管理", level: "特色专业" },
    ],
  },
  {
    keywords: ["交通", "铁道", "铁路"],
    category: "交通类",
    adminType: "省属/交通运输部共建",
    admin: "各省教育厅 / 交通运输厅",
    majors: [
      { name: "交通运输", level: "主力专业" },
      { name: "交通工程", level: "主力专业" },
      { name: "车辆工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["航空", "航天", "民航"],
    category: "航空类",
    adminType: "省属/民航局共建",
    admin: "各省教育厅 / 中国民用航空局",
    majors: [
      { name: "飞行器动力工程", level: "主力专业" },
      { name: "交通运输（空中管制）", level: "特色专业" },
      { name: "飞行器制造工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["电力", "电气"],
    category: "电力类",
    adminType: "省属/电力企业共建",
    admin: "各省教育厅 / 国家电网/南方电网",
    majors: [
      { name: "电气工程及其自动化", level: "主力专业" },
      { name: "能源与动力工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["邮电", "信息工程"],
    category: "信息类",
    adminType: "省属/工信部共建",
    admin: "各省教育厅 / 工业和信息化厅",
    majors: [
      { name: "通信工程", level: "主力专业" },
      { name: "计算机科学与技术", level: "主力专业" },
      { name: "电子信息工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["水利水电", "水电", "水利"],
    category: "水利类",
    adminType: "省属/水利部共建",
    admin: "各省教育厅 / 水利厅",
    majors: [
      { name: "水利水电工程", level: "主力专业" },
      { name: "水文与水资源工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["矿业", "煤炭", "资源"],
    category: "矿业类",
    adminType: "省属/应急管理部共建",
    admin: "各省教育厅 / 应急管理厅",
    majors: [
      { name: "采矿工程", level: "主力专业" },
      { name: "安全工程", level: "主力专业" },
      { name: "矿物加工工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["石油", "石化"],
    category: "石化类",
    adminType: "省属/中石油等共建",
    admin: "各省教育厅 / 中国石油天然气集团",
    majors: [
      { name: "石油工程", level: "主力专业" },
      { name: "化学工程与工艺", level: "主力专业" },
    ],
  },
  {
    keywords: ["冶金", "材料"],
    category: "材料类",
    adminType: "省属/钢铁企业共建",
    admin: "各省教育厅 / 中国钢铁工业协会",
    majors: [
      { name: "冶金工程", level: "主力专业" },
      { name: "材料科学与工程", level: "主力专业" },
    ],
  },
  {
    keywords: ["化工", "化学工程"],
    category: "化工类",
    adminType: "省属",
    admin: "各省教育厅",
    majors: [
      { name: "化学工程与工艺", level: "主力专业" },
      { name: "应用化学", level: "特色专业" },
    ],
  },
  {
    keywords: ["纺织", "服装"],
    category: "纺织类",
    adminType: "省属",
    admin: "各省教育厅 / 中国纺织工业联合会",
    majors: [
      { name: "纺织工程", level: "主力专业" },
      { name: "服装设计与工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["海洋大学", "海洋学院", "海事"],
    category: "海洋类",
    adminType: "省属/自然资源部共建",
    admin: "各省教育厅 / 自然资源厅",
    majors: [
      { name: "海洋科学", level: "主力专业" },
      { name: "水产养殖学", level: "主力专业" },
      { name: "航海技术", level: "特色专业" },
    ],
  },
  {
    keywords: ["体育", "运动"],
    category: "体育类",
    adminType: "省属/国家体育总局共建",
    admin: "各省教育厅 / 体育局",
    majors: [
      { name: "体育教育", level: "主力专业" },
      { name: "运动训练", level: "主力专业" },
      { name: "社会体育指导与管理", level: "特色专业" },
    ],
  },
  {
    keywords: ["美术", "艺术", "设计", "工艺美"],
    category: "艺术类",
    adminType: "省属/文旅部共建",
    admin: "各省教育厅 / 文化和旅游厅",
    majors: [
      { name: "视觉传达设计", level: "主力专业" },
      { name: "环境设计", level: "主力专业" },
      { name: "美术学", level: "特色专业" },
    ],
  },
  {
    keywords: ["音乐", "戏剧", "舞蹈", "戏曲"],
    category: "艺术类",
    adminType: "省属",
    admin: "各省教育厅 / 文化和旅游厅",
    majors: [
      { name: "音乐表演", level: "主力专业" },
      { name: "音乐学", level: "特色专业" },
    ],
  },
  {
    keywords: ["传媒", "新闻", "广播电视"],
    category: "传媒类",
    adminType: "省属/广电总局共建",
    admin: "各省教育厅 / 广播电视局",
    majors: [
      { name: "新闻学", level: "主力专业" },
      { name: "广播电视学", level: "特色专业" },
      { name: "网络与新媒体", level: "特色专业" },
    ],
  },
  {
    keywords: ["警察", "公安", "警官", "司法"],
    category: "公安类",
    adminType: "省属/公安部共建",
    admin: "各省公安厅 / 司法厅",
    majors: [
      { name: "治安学", level: "主力专业" },
      { name: "侦查学", level: "主力专业" },
      { name: "刑事科学技术", level: "特色专业" },
    ],
  },
  {
    keywords: ["旅游", "酒店"],
    category: "旅游类",
    adminType: "省属/文旅部共建",
    admin: "各省教育厅 / 文化和旅游厅",
    majors: [
      { name: "旅游管理", level: "主力专业" },
      { name: "酒店管理", level: "特色专业" },
    ],
  },
  {
    keywords: ["中医药", "民族医学院"],
    category: "民族医学类",
    adminType: "省属/国家民委共建",
    admin: "各省教育厅 / 民族宗教事务委员会",
    majors: [
      { name: "中医学", level: "主力专业" },
      { name: "民族医学", level: "特色专业" },
    ],
  },
  {
    keywords: ["职业技术", "职业大学", "应用技术"],
    category: "应用型",
    adminType: "省属/市属",
    admin: "各省/市教育局",
    majors: [
      { name: "机械电子工程", level: "主力专业" },
      { name: "计算机应用技术", level: "主力专业" },
      { name: "电气自动化技术", level: "特色专业" },
    ],
  },
  {
    keywords: ["城市", "市政", "城管"],
    category: "城市管理类",
    adminType: "市属",
    admin: "市城市管理综合执法局 / 教育局",
    majors: [
      { name: "城市管理", level: "主力专业" },
      { name: "工程管理", level: "特色专业" },
    ],
  },
  {
    keywords: ["电子科技", "电子信息", "光电"],
    category: "电子信息类",
    adminType: "省属/工信部共建",
    admin: "各省教育厅 / 工业和信息化厅",
    majors: [
      { name: "电子信息工程", level: "主力专业" },
      { name: "通信工程", level: "主力专业" },
      { name: "计算机科学与技术", level: "特色专业" },
    ],
  },
  {
    keywords: ["地质", "矿产", "测绘"],
    category: "地矿类",
    adminType: "省属/自然资源部共建",
    admin: "各省教育厅 / 自然资源厅 / 地质矿产勘查开发局",
    majors: [
      { name: "地质工程", level: "主力专业" },
      { name: "测绘工程", level: "特色专业" },
    ],
  },
  {
    keywords: ["气象", "大气"],
    category: "气象类",
    adminType: "省属/中国气象局共建",
    admin: "各省教育厅 / 中国气象局",
    majors: [
      { name: "大气科学", level: "主力专业" },
      { name: "应用气象学", level: "特色专业" },
    ],
  },
  {
    keywords: ["民族"],
    category: "民族类",
    adminType: "省属/国家民委共建",
    admin: "各省教育厅 / 民族宗教事务委员会",
    majors: [
      { name: "民族学", level: "主力专业" },
      { name: "中国少数民族语言文学", level: "特色专业" },
    ],
  },
  {
    keywords: ["联合大学", "学院", "大学"],
    category: "综合类",
    adminType: "省属/市属",
    admin: "各省/市教育局",
    majors: [
      { name: "计算机科学与技术", level: "主力专业" },
      { name: "会计学", level: "主力专业" },
      { name: "汉语言文学", level: "特色专业" },
      { name: "国际经济与贸易", level: "特色专业" },
    ],
  },
];

// 推断院校主力专业与主管单位（普通院校用）
export interface InferredInfo {
  majors: AceMajor[];
  category: string;
  adminType: string;
  admin: string;
}

export function inferAceMajors(rawName: string): InferredInfo | null {
  const name = normalizeSchoolName(rawName);
  for (const rule of INFER_RULES) {
    if (rule.keywords.some(kw => name.includes(kw))) {
      return {
        majors: rule.majors,
        category: rule.category,
        adminType: rule.adminType,
        admin: rule.admin,
      };
    }
  }
  return null;
}

// 多方认证信息来源声明
export const VERIFICATION_SOURCES = {
  official: "教育部官方数据（阳光高考平台）",
  moeList: "教育部公布的《全国普通高等学校名单》",
  doubleFirst: "教育部公布的《双一流建设高校及建设学科名单》",
  subjectEval: "教育部第四轮学科评估结果",
  infer: "基于院校名称与类型的合理推断",
};

// 判断信息是否为官方权威数据（用于显示认证状态）
export function isOfficialData(rawName: string): boolean {
  return getSchoolProfile(rawName) !== null;
}

// 生成跳转链接（所有院校可用）
export interface SchoolLinks {
  gaokao: string;     // 阳光高考平台
  baike: string;      // 百度百科
  official: string;   // 必应搜索官网
}

export function getSchoolLinks(rawName: string): SchoolLinks {
  const name = normalizeSchoolName(rawName) || rawName;
  const encoded = encodeURIComponent(name);
  return {
    gaokao: `https://gaokao.chsi.com.cn/sch/?searchName=${encoded}`,
    baike: `https://baike.baidu.com/item/${encoded}`,
    official: `https://www.bing.com/search?q=${encoded}+官网`,
  };
}

// 判断是否为重点院校（有内置档案）
export function hasProfile(rawName: string): boolean {
  return getSchoolProfile(rawName) !== null;
}
