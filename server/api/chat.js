// ============================================================
// Vercel Serverless 函数：POST /api/chat
// 部署到 Vercel 后，前端把网关地址填成 https://<你的项目>.vercel.app
// 密钥在 Vercel 控制台 → Settings → Environment Variables 配置
// ============================================================

const { chatWithFailover } = require('../lib/providers.js');

module.exports = async function handler(req, res) {
  // CORS（GitHub Pages 跨域必需）
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'messages 不能为空' });
  }

  const clean = messages
    .filter((m) => ['system', 'user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

  try {
    const result = await chatWithFailover(clean, {
      temperature: typeof req.body.temperature === 'number' ? req.body.temperature : 0.7,
    });
    return res.status(200).json({
      content: result.text,
      provider: result.provider,
      fallbacks: result.fallbacks,
    });
  } catch (e) {
    return res.status(502).json({ error: e.message, fallbacks: e.fallbacks || [] });
  }
};
