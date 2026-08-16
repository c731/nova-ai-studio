// ============================================================
// Nova AI 网关 —— Provider 层（CommonJS，Node 本地 / Vercel 通用）
// 职责：封装各家免费/低价模型 API，统一输入输出格式
// 密钥一律从环境变量读取，绝不硬编码、绝不下发到前端
// ============================================================

const TIMEOUT = 45000;

// 带超时的 fetch（Node 18+ 内置 fetch 与 AbortController）
async function postJSON(url, body, headers = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${text.slice(0, 120)}`);
    }
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('请求超时（45s）');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// 从 OpenAI 兼容响应中提取文本
function pickText(data) {
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('返回内容为空');
  return text.trim();
}

// ---------- 1. Pollinations（完全免费、免密钥，兜底节点） ----------
async function callPollinations(messages, opts) {
  const data = await postJSON('https://text.pollinations.ai/openai', {
    model: 'openai',
    messages,
    temperature: opts.temperature ?? 0.7,
  });
  return { text: pickText(data), provider: 'Pollinations' };
}

// ---------- 2. OpenRouter 免费层（deepseek :free 模型） ----------
async function callOpenRouter(messages, opts) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('未配置 OPENROUTER_API_KEY');
  const data = await postJSON(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free',
      messages,
      temperature: opts.temperature ?? 0.7,
    },
    {
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://c731.github.io',
      'X-Title': 'Nova AI Studio',
    }
  );
  return { text: pickText(data), provider: 'OpenRouter(DeepSeek免费层)' };
}

// ---------- 3. DeepSeek 官方 ----------
async function callDeepSeek(messages, opts) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('未配置 DEEPSEEK_API_KEY');
  const data = await postJSON(
    'https://api.deepseek.com/chat/completions',
    { model: 'deepseek-chat', messages, temperature: opts.temperature ?? 0.7 },
    { Authorization: `Bearer ${key}` }
  );
  return { text: pickText(data), provider: 'DeepSeek官方' };
}

// ---------- 4. 阿里通义千问（DashScope OpenAI 兼容模式） ----------
async function callQwen(messages, opts) {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error('未配置 DASHSCOPE_API_KEY');
  const data = await postJSON(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    { model: process.env.QWEN_MODEL || 'qwen-turbo', messages, temperature: opts.temperature ?? 0.7 },
    { Authorization: `Bearer ${key}` }
  );
  return { text: pickText(data), provider: '通义千问' };
}

// ---------- Provider 注册表（顺序即故障转移优先级） ----------
const PROVIDERS = [
  { name: 'OpenRouter', fn: callOpenRouter, needKey: 'OPENROUTER_API_KEY' },
  { name: 'DeepSeek官方', fn: callDeepSeek, needKey: 'DEEPSEEK_API_KEY' },
  { name: '通义千问', fn: callQwen, needKey: 'DASHSCOPE_API_KEY' },
  { name: 'Pollinations', fn: callPollinations, needKey: null },
];

/**
 * 故障转移调度器：按优先级依次尝试，失败记录原因并切换下一节点
 * @returns {Promise<{text, provider, fallbacks: string[]}>}
 */
async function chatWithFailover(messages, opts = {}) {
  const fallbacks = [];
  for (const p of PROVIDERS) {
    // 未配置密钥的付费节点直接跳过（Pollinations 免密钥永远参与兜底）
    if (p.needKey && !process.env[p.needKey]) {
      fallbacks.push(`${p.name}: 未配置密钥，跳过`);
      continue;
    }
    try {
      const result = await p.fn(messages, opts);
      return { ...result, fallbacks };
    } catch (e) {
      fallbacks.push(`${p.name}: ${e.message}`);
    }
  }
  const err = new Error('所有 AI 节点均不可用：' + fallbacks.join('；'));
  err.fallbacks = fallbacks;
  throw err;
}

// 各节点配置状态（供 /api/health 使用）
function providerStatus() {
  return PROVIDERS.map((p) => ({
    name: p.name,
    enabled: p.needKey ? !!process.env[p.needKey] : true,
    note: p.needKey ? (process.env[p.needKey] ? '密钥已配置' : '未配置密钥') : '免密钥',
  }));
}

module.exports = { chatWithFailover, providerStatus, PROVIDERS };
