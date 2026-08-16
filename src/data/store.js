// 共享状态管理（管理员数据）

const KEY = 'nova_studio_v3';

export const defaultState = {
  isAdmin: false,
  adminName: '超级管理员',
  apis: [
    { id: 1, name: 'Pollinations AI', desc: '免费文本生成引擎（对话/创作真实可用）', status: '在线', latency: '480ms', calls: 12860, tag: '免费' },
    { id: 2, name: 'GitHub Public APIs', desc: '免费 API 目录数据源', status: '在线', latency: '320ms', calls: 862, tag: '免费' },
    { id: 3, name: 'Open-Meteo', desc: '免费天气预报接口', status: '在线', latency: '210ms', calls: 3420, tag: '免费' },
    { id: 4, name: 'Frankfurter 汇率', desc: '实时汇率转换', status: '在线', latency: '260ms', calls: 1204, tag: '免费' },
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
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch (e) {}
  return defaultState;
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {}
}
