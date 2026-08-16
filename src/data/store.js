// 共享模拟数据与本地状态管理

const KEY = 'nova_studio_v3';

export const defaultState = {
  isAdmin: false,
  adminName: '管理员',
  works: [
    { id: 1, type: '文章', title: 'AI 改变未来 5 年的工作方式', time: '今天 09:12', words: 1286, earning: 3.2 },
    { id: 2, type: '文案', title: '夏季新品上市推广文案', time: '今天 08:40', words: 420, earning: 1.8 },
    { id: 3, type: '小说', title: '《星港夜航》第一章', time: '昨天 22:05', words: 2100, earning: 5.6 },
    { id: 4, type: '社交媒体', title: '小红书爆款笔记 ×3', time: '昨天 19:30', words: 360, earning: 2.4 },
    { id: 5, type: '代码', title: 'React 数据看板组件', time: '昨天 15:11', words: 540, earning: 1.2 },
  ],
  earnings: {
    total: 328.66,
    today: 26.8,
    breakdown: [
      { name: '文章变现', value: 142.3, color: 'bg-violet-400' },
      { name: 'API 代理', value: 86.2, color: 'bg-cyan-400' },
      { name: '广告联盟', value: 64.16, color: 'bg-amber-400' },
      { name: 'CPS 分销', value: 36.0, color: 'bg-pink-400' },
    ],
    records: [
      { id: 1, source: '今日头条 · 文章分成', amount: 8.6, time: '今天 09:30', status: '已到账' },
      { id: 2, source: 'API 代理 · 文本生成', amount: 4.2, time: '今天 08:12', status: '已到账' },
      { id: 3, source: '广告联盟 · 展示收益', amount: 6.4, time: '今天 07:00', status: '已到账' },
      { id: 4, source: '百家号 · 内容分成', amount: 7.6, time: '昨天 21:40', status: '已到账' },
      { id: 5, source: 'CPS · 电商分销', amount: 12.0, time: '昨天 18:22', status: '结算中' },
    ],
  },
  apis: [
    { id: 1, name: 'Pollinations AI', desc: '免费文本/图像生成引擎', status: '在线', latency: '480ms', calls: 12860, tag: '免费' },
    { id: 2, name: 'GitHub Public APIs', desc: '免费 API 目录数据源', status: '在线', latency: '320ms', calls: 862, tag: '免费' },
    { id: 3, name: 'Open-Meteo', desc: '免费天气预报接口', status: '在线', latency: '210ms', calls: 3420, tag: '免费' },
    { id: 4, name: '汇率 API (frankfurter)', desc: '实时汇率转换', status: '在线', latency: '260ms', calls: 1204, tag: '免费' },
  ],
  tasks: [
    { id: 1, name: '自动生成科技领域文章 ×6', status: '运行中', progress: 72 },
    { id: 2, name: 'API 健康巡检（每 10 分钟）', status: '运行中', progress: 100 },
    { id: 3, name: '内容分发 · 今日头条/百家号', status: '排队中', progress: 15 },
    { id: 4, name: '免费 API 目录爬取', status: '已完成', progress: 100 },
  ],
  security: [
    { name: 'WAF 防火墙', desc: '实时监控 · 已拦截 1,284 次攻击', ok: true },
    { name: 'DDoS 防护', desc: '流量清洗已启用', ok: true },
    { name: '自动备份', desc: '最近备份 1 小时前', ok: true },
    { name: 'SSL 证书', desc: '自动续期已开启', ok: true },
  ],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...defaultState, ...saved, earnings: { ...defaultState.earnings, ...(saved.earnings || {}) } };
    }
  } catch (e) {}
  return defaultState;
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {}
}
