// 本地数据库层（localStorage 持久化）
// 用户、积分账本、调用流水、失败日志、站点能力全部真实读写

const DB_KEY = 'nova_saas_db_v1';

function now() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function save(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {}
}

function initDB() {
  const existing = load();
  if (existing) return existing;
  const db = {
    users: [],
    sessions: { currentUserId: null },
    creditsLedger: [], // 积分流水：{ id, userId, delta, reason, time }
    callLogs: [], // AI 调用记录：{ id, userId, service, provider, tokens, credits, ok, time }
    failLogs: [], // 失败日志：{ id, provider, error, time }
    redeemCodes: [], // 兑换码：{ code, credits, used, usedBy, time }
    orders: [], // 订单：{ id, userId, plan, credits, price, status, time }
    capabilities: [
      // 站点 AI 能力（智能 AI 可自动扩充）
      { id: 'chat', name: 'AI 对话', cost: 2, builtin: true },
      { id: 'image', name: 'AI 绘图', cost: 50, builtin: true },
      { id: 'translate', name: '智能翻译', cost: 2, builtin: true },
      { id: 'writing', name: 'AI 写作', cost: 3, builtin: true },
    ],
    gatewayUrl: '', // 管理员配置的自建网关地址
    settings: { adminKey: 'admin888' },
  };
  save(db);
  return db;
}

const db = initDB();

export const DB = {
  // ---------- 用户 ----------
  register(username, password) {
    if (db.users.some((u) => u.username === username)) {
      return { ok: false, msg: '该用户名已被注册' };
    }
    const user = { id: uid(), username, password, credits: 1000, isAdmin: false, createdAt: now() };
    db.users.push(user);
    db.creditsLedger.push({ id: uid(), userId: user.id, delta: 1000, reason: '新用户注册赠送', time: now() });
    db.sessions.currentUserId = user.id;
    save(db);
    return { ok: true, user };
  },
  login(username, password) {
    const user = db.users.find((u) => u.username === username && u.password === password);
    if (!user) return { ok: false, msg: '用户名或密码错误' };
    db.sessions.currentUserId = user.id;
    save(db);
    return { ok: true, user };
  },
  logout() {
    db.sessions.currentUserId = null;
    save(db);
  },
  currentUser() {
    return db.users.find((u) => u.id === db.sessions.currentUserId) || null;
  },
  allUsers() {
    return [...db.users].sort((a, b) => b.credits - a.credits);
  },

  // ---------- 积分 ----------
  addCredits(userId, delta, reason) {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return { ok: false, msg: '用户不存在' };
    if (user.credits + delta < 0) return { ok: false, msg: '积分不足，无法扣除' };
    user.credits += delta;
    db.creditsLedger.push({ id: uid(), userId, delta, reason, time: now() });
    save(db);
    return { ok: true, credits: user.credits };
  },
  ledgerOf(userId) {
    return db.creditsLedger.filter((l) => l.userId === userId).reverse();
  },

  // ---------- 兑换码 ----------
  createRedeemCode(credits) {
    const code = 'NOVA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    db.redeemCodes.push({ code, credits, used: false, usedBy: null, time: now() });
    save(db);
    return code;
  },
  redeem(userId, code) {
    const c = db.redeemCodes.find((x) => x.code === code.trim().toUpperCase());
    if (!c) return { ok: false, msg: '兑换码不存在' };
    if (c.used) return { ok: false, msg: '该兑换码已被使用' };
    c.used = true;
    c.usedBy = userId;
    const r = DB.addCredits(userId, c.credits, `兑换码 ${c.code} 充值`);
    save(db);
    return r.ok ? { ok: true, msg: `成功兑换 ${c.credits} 积分` } : r;
  },
  allCodes() {
    return [...db.redeemCodes].reverse();
  },

  // ---------- 订单 ----------
  createOrder(userId, plan) {
    const order = {
      id: 'ORD' + Date.now().toString().slice(-10),
      userId,
      plan: plan.name,
      credits: plan.credits,
      price: plan.price,
      status: '待支付',
      time: now(),
    };
    db.orders.push(order);
    save(db);
    return order;
  },
  payOrder(orderId) {
    const o = db.orders.find((x) => x.id === orderId);
    if (!o || o.status !== '待支付') return { ok: false, msg: '订单不存在或已处理' };
    o.status = '已完成';
    DB.addCredits(o.userId, o.credits, `订单 ${o.id} 充值（${o.plan}）`);
    save(db);
    return { ok: true, credits: o.credits };
  },
  ordersOf(userId) {
    return db.orders.filter((o) => o.userId === userId).reverse();
  },
  allOrders() {
    return [...db.orders].reverse();
  },

  // ---------- 调用与失败日志 ----------
  logCall(entry) {
    db.callLogs.push({ id: uid(), time: now(), ...entry });
    if (db.callLogs.length > 200) db.callLogs = db.callLogs.slice(-200);
    save(db);
  },
  logFail(provider, error) {
    db.failLogs.push({ id: uid(), provider, error, time: now() });
    if (db.failLogs.length > 100) db.failLogs = db.failLogs.slice(-100);
    save(db);
  },
  callLogs() {
    return [...db.callLogs].reverse();
  },
  failLogs() {
    return [...db.failLogs].reverse();
  },

  // ---------- 站点能力（智能 AI 自我提升写入） ----------
  capabilities() {
    return db.capabilities;
  },
  addCapability(cap) {
    if (db.capabilities.some((c) => c.name === cap.name)) return false;
    db.capabilities.push({ id: uid(), builtin: false, cost: 2, ...cap });
    save(db);
    return true;
  },

  // ---------- 网关配置 ----------
  getGatewayUrl() {
    return db.gatewayUrl || '';
  },
  setGatewayUrl(url) {
    db.gatewayUrl = url;
    save(db);
  },
};

// 积分换算：1 积分 = 1000 Token
export const CREDITS_PER_TOKEN = 1000;
export function tokensToCredits(tokens) {
  return Math.max(1, Math.ceil(tokens / CREDITS_PER_TOKEN));
}
export function estimateTokens(text) {
  // 中文约 1 字符 ≈ 0.75 token，英文约 4 字符 ≈ 1 token
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return Math.ceil(cjk * 0.75 + (text.length - cjk) / 4);
}
