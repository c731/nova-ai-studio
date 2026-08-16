// ============================================================
// Nova AI 网关 —— 本地开发服务器（零依赖，Node 18+ 直接运行）
//
// 启动：node server.js          （默认端口 8787）
//       PORT=3000 node server.js
//
// 闭环流程：
//   前端消耗积分 → POST /api/chat → 网关拦截 → 网关带密钥调免费 API → 返回前端
//   密钥只存在于服务器环境变量，前端永远看不到
// ============================================================

const http = require('http');
const { chatWithFailover, providerStatus } = require('./lib/providers.js');

const PORT = process.env.PORT || 8787;
// 允许的前端来源（GitHub Pages 域名 + 本地开发），* 表示全放开
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';

// ---------- 极简内存统计（供 /api/health 展示今日调用量） ----------
const stats = { total: 0, today: 0, todayDate: '', fails: 0 };
function bumpStats(ok) {
  const d = new Date().toISOString().slice(0, 10);
  if (stats.todayDate !== d) {
    stats.todayDate = d;
    stats.today = 0;
  }
  stats.today += 1;
  stats.total += 1;
  if (!ok) stats.fails += 1;
}

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) {
        reject(new Error('请求体过大'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error('JSON 解析失败'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // ---------- GET /api/health 网关健康状态 ----------
  if (req.method === 'GET' && url === '/api/health') {
    return sendJSON(res, 200, {
      ok: true,
      uptime: Math.round(process.uptime()),
      stats,
      providers: providerStatus(),
      online: providerStatus().filter((p) => p.enabled).length,
    });
  }

  // ---------- POST /api/chat 核心对话接口 ----------
  if (req.method === 'POST' && url === '/api/chat') {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return sendJSON(res, 400, { error: e.message });
    }

    const messages = Array.isArray(body.messages) ? body.messages : null;
    if (!messages || messages.length === 0) {
      return sendJSON(res, 400, { error: 'messages 不能为空' });
    }
    // 只保留合法字段，防止注入奇怪内容
    const clean = messages
      .filter((m) => ['system', 'user', 'assistant'].includes(m.role) && typeof m.content === 'string')
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

    try {
      const result = await chatWithFailover(clean, {
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
      });
      bumpStats(true);
      return sendJSON(res, 200, {
        content: result.text,
        provider: result.provider,
        fallbacks: result.fallbacks,
      });
    } catch (e) {
      bumpStats(false);
      return sendJSON(res, 502, { error: e.message, fallbacks: e.fallbacks || [] });
    }
  }

  sendJSON(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log('==============================================');
  console.log('  Nova AI 网关已启动');
  console.log(`  地址: http://localhost:${PORT}`);
  console.log('  接口: POST /api/chat | GET /api/health');
  console.log('  已配置密钥的节点:');
  providerStatus().forEach((p) => console.log(`    - ${p.name}: ${p.note}`));
  console.log('==============================================');
});
