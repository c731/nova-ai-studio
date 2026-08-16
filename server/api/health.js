// ============================================================
// Vercel Serverless 函数：GET /api/health
// 返回网关在线状态与各节点密钥配置情况
// ============================================================

const { providerStatus } = require('../lib/providers.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const providers = providerStatus();
  return res.status(200).json({
    ok: true,
    platform: 'vercel',
    providers,
    online: providers.filter((p) => p.enabled).length,
  });
};
