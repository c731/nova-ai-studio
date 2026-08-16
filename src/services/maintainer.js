// 智能维护 AI（仅管理员后台使用）
// 全部真实执行：真实 ping 网关节点、真实搜集免费 API、真实探活、真实注册新能力

import { DB } from './db.js';
import { chat, pingProviders } from './gateway.js';

// 内置免费 API 候选池（兜底，保证离线也能工作）
const SEED_APIS = [
  { name: 'Open-Meteo', desc: '免费天气预报，无需密钥', url: 'https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current_weather=true', category: '天气' },
  { name: 'Frankfurter汇率', desc: '实时汇率转换', url: 'https://api.frankfurter.dev/v1/latest', category: '金融' },
  { name: 'REST Countries', desc: '全球国家信息', url: 'https://restcountries.com/v3.1/name/china', category: '地理' },
  { name: 'Cat Facts', desc: '随机冷知识', url: 'https://catfact.ninja/fact', category: '内容' },
  { name: 'Advice Slip', desc: '建议生成接口', url: 'https://api.adviceslip.com/advice', category: '内容' },
  { name: 'Bored API', desc: '活动建议接口', url: 'https://www.boredapi.com/api/activity', category: '生活' },
];

/**
 * 执行一轮完整维护巡检
 * @param {Function} onProgress 进度回调 (step, detail)
 * @returns 巡检报告对象
 */
export async function runMaintenance(onProgress = () => {}) {
  const report = { health: [], discovered: [], verified: [], registered: [], aiSummary: '', errors: [] };

  // 1. 真实健康检查：ping 所有网关节点
  onProgress('健康检查', '正在 ping 全部网关节点…');
  try {
    report.health = await pingProviders();
    const okCount = report.health.filter((h) => h.ok).length;
    onProgress('健康检查', `完成：${okCount}/${report.health.length} 个节点可达`);
  } catch (e) {
    report.errors.push('健康检查失败：' + e.message);
  }

  // 2. 真实搜集：从 GitHub Search 找免费 API 项目
  onProgress('API 搜集', '连接 GitHub Search 数据源…');
  let candidates = [];
  try {
    const res = await fetch(
      'https://api.github.com/search/repositories?q=free+api+in:name,description&sort=stars&per_page=6'
    );
    if (res.ok) {
      const data = await res.json();
      candidates = (data.items || []).map((r) => ({
        name: r.full_name,
        desc: (r.description || '开源免费 API').slice(0, 50),
        url: r.html_url,
        category: '开源项目',
        notDirect: true, // 目录型项目，不做 HTTP 探活
      }));
      onProgress('API 搜集', `GitHub 命中 ${candidates.length} 个项目`);
    }
  } catch (e) {
    onProgress('API 搜集', 'GitHub 暂不可用，切换内置候选池');
  }
  if (candidates.length < 3) {
    candidates = candidates.concat(SEED_APIS);
  }
  report.discovered = candidates.slice(0, 10);

  // 3. 真实探活：对可直连的候选 API 逐个发真实请求
  onProgress('探活验证', '对候选 API 逐个发送真实请求…');
  for (const api of report.discovered) {
    if (api.notDirect) continue;
    try {
      const start = Date.now();
      const res = await fetch(api.url, { signal: AbortSignal.timeout(8000) });
      const latency = Date.now() - start;
      if (res.ok) {
        report.verified.push({ ...api, latency: latency + 'ms' });
        onProgress('探活验证', `✓ ${api.name} 可用（${latency}ms）`);
      } else {
        onProgress('探活验证', `✕ ${api.name} 返回 HTTP ${res.status}`);
      }
    } catch (e) {
      onProgress('探活验证', `✕ ${api.name} 不可达`);
    }
  }

  // 4. 自我提升：把验证通过的 API 注册为站点新能力
  onProgress('能力升级', '注册验证通过的新能力…');
  for (const api of report.verified) {
    const added = DB.addCapability({
      name: `${api.name}查询`,
      desc: `由维护AI自动接入 · ${api.desc}`,
      source: api.url,
      cost: 1,
    });
    if (added) {
      report.registered.push(api.name);
      onProgress('能力升级', `已注册新能力：${api.name}查询`);
    }
  }
  if (report.registered.length === 0) {
    onProgress('能力升级', '本轮无新增能力（已注册过或无新可用API）');
  }

  // 5. AI 生成维护报告（真实调用 AI 总结诊断数据）
  onProgress('生成报告', 'AI 正在分析巡检数据…');
  try {
    const diag = `健康检查：${report.health.map((h) => `${h.name}${h.ok ? '可达' + (h.latency ? h.latency + 'ms' : '') : '不可达'}`).join('；')}。
新发现API ${report.discovered.length} 个，验证通过 ${report.verified.length} 个，新注册能力 ${report.registered.length} 个。
失败日志条数：${DB.failLogs().length}。`;
    const { text } = await chat(
      [
        { role: 'system', content: '你是网站运维专家，用中文给出不超过120字的简明维护结论和建议。' },
        { role: 'user', content: '根据以下巡检数据写维护报告：\n' + diag },
      ],
      { temperature: 0.4 }
    );
    report.aiSummary = text;
    onProgress('生成报告', '维护报告已生成');
  } catch (e) {
    report.aiSummary = '（AI 报告生成失败：' + e.message + '）';
  }

  return report;
}
