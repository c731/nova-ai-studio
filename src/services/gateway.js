// AI 聚合网关（前端直连层）
// 故障转移逻辑：按优先级依次调用 provider，任一节点 401/503/超时/网络错误
// 立即记录失败日志并切换下一节点，直到拿到真实文本

import { DB } from './db.js';

const KEY_STORE = 'nova_provider_keys_v1';
const TIMEOUT = 45000;

export function getKeys() {
  try {
    return JSON.parse(localStorage.getItem(KEY_STORE)) || {};
  } catch (e) {
    return {};
  }
}
export function setKeys(keys) {
  localStorage.setItem(KEY_STORE, JSON.stringify(keys));
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('请求超时（' + ms / 1000 + 's）')), ms)),
  ]);
}

async function postJSON(url, body, headers = {}) {
  const res = await withTimeout(
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }),
    TIMEOUT
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- Provider 实现（全部真实调用） ----------

// 1. 自建网关（管理员部署的 server.js，优先级最高）
async function callCustomGateway(messages, opts) {
  const base = DB.getGatewayUrl().replace(/\/$/, '');
  if (!base) throw new Error('未配置自建网关');
  const data = await postJSON(`${base}/api/chat`, { messages, ...opts });
  const text = data?.content || data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('网关返回为空');
  return { text, provider: data?.provider || '自建网关' };
}

// 2. Pollinations（免密钥，实测可用）
async function callPollinations(messages, opts) {
  const data = await postJSON('https://text.pollinations.ai/openai', {
    model: 'openai',
    messages,
    temperature: opts.temperature ?? 0.7,
  });
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('返回内容为空');
  return { text, provider: 'Pollinations' };
}

// 3. OpenRouter 免费层（:free 模型，需管理员密钥）
async function callOpenRouter(messages, opts) {
  const key = getKeys().openrouter;
  if (!key) throw new Error('未配置 OpenRouter 密钥');
  const data = await postJSON(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages,
      temperature: opts.temperature ?? 0.7,
    },
    { Authorization: `Bearer ${key}` }
  );
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('返回内容为空');
  return { text, provider: 'OpenRouter(DeepSeek免费层)' };
}

// 4. DeepSeek 官方
async function callDeepSeek(messages, opts) {
  const key = getKeys().deepseek;
  if (!key) throw new Error('未配置 DeepSeek 密钥');
  const data = await postJSON(
    'https://api.deepseek.com/chat/completions',
    { model: 'deepseek-chat', messages, temperature: opts.temperature ?? 0.7 },
    { Authorization: `Bearer ${key}` }
  );
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('返回内容为空');
  return { text, provider: 'DeepSeek官方' };
}

// 5. 阿里通义千问（DashScope 兼容模式）
async function callQwen(messages, opts) {
  const key = getKeys().qwen;
  if (!key) throw new Error('未配置通义千问密钥');
  const data = await postJSON(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    { model: 'qwen-turbo', messages, temperature: opts.temperature ?? 0.7 },
    { Authorization: `Bearer ${key}` }
  );
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('返回内容为空');
  return { text, provider: '通义千问' };
}

// ---------- 故障转移调度器 ----------
const PROVIDERS = [
  { name: '自建网关', fn: callCustomGateway, needKey: false },
  { name: 'Pollinations', fn: callPollinations, needKey: false },
  { name: 'OpenRouter', fn: callOpenRouter, needKey: true },
  { name: 'DeepSeek', fn: callDeepSeek, needKey: true },
  { name: '通义千问', fn: callQwen, needKey: true },
];

export function providerStatus() {
  const keys = getKeys();
  return [
    { name: '自建网关', enabled: !!DB.getGatewayUrl(), note: DB.getGatewayUrl() ? '已配置' : '未配置' },
    { name: 'Pollinations', enabled: true, note: '免密钥' },
    { name: 'OpenRouter(DeepSeek免费层)', enabled: !!keys.openrouter, note: keys.openrouter ? '密钥已配置' : '未配置密钥' },
    { name: 'DeepSeek官方', enabled: !!keys.deepseek, note: keys.deepseek ? '密钥已配置' : '未配置密钥' },
    { name: '通义千问', enabled: !!keys.qwen, note: keys.qwen ? '密钥已配置' : '未配置密钥' },
  ];
}

// 真实 ping 测速
export async function pingProviders() {
  const results = [];
  const targets = [
    { name: 'Pollinations', url: 'https://text.pollinations.ai/models' },
    { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1/models' },
    { name: 'DeepSeek', url: 'https://api.deepseek.com/models' },
    { name: '通义千问', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/models' },
  ];
  for (const t of targets) {
    const start = Date.now();
    try {
      const res = await withTimeout(fetch(t.url), 8000);
      results.push({ name: t.name, ok: res.ok || res.status === 401, latency: Date.now() - start, status: res.ok || res.status === 401 ? '可达' : `HTTP ${res.status}` });
    } catch (e) {
      results.push({ name: t.name, ok: false, latency: null, status: '不可达' });
    }
  }
  return results;
}

/**
 * 聚合对话入口：自动故障转移
 * @returns {Promise<{text, provider, fallbacks: string[]}>}
 */
export async function chat(messages, opts = {}) {
  const fallbacks = [];
  for (const p of PROVIDERS) {
    try {
      const result = await p.fn(messages, opts);
      return { ...result, fallbacks };
    } catch (e) {
      fallbacks.push(`${p.name}: ${e.message}`);
      DB.logFail(p.name, e.message);
      // 继续下一节点
    }
  }
  throw new Error('所有 AI 节点均不可用：' + fallbacks.join('；'));
}

// AI 绘图（真实调用 Pollinations 图像引擎）
export function imageUrl(prompt) {
  const p = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1e6);
  return `https://image.pollinations.ai/prompt/${p}?width=768&height=768&seed=${seed}&nologo=true`;
}
