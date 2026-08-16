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
  if (existing) {
    // 旧数据兼容：补齐邀请与收款配置字段
    if (!existing.invites) existing.invites = [];
    if (!existing.payConfig) existing.payConfig = { alipayImage: '', payee: '白鸟(**林)' };
    save(existing);
    return existing;
  }
  const db = {
    users: [],
    sessions: { currentUserId: null },
    creditsLedger: [], // 积分流水：{ id, userId, delta, reason, time }
    callLogs: [], // AI 调用记录：{ id, userId, service, provider, tokens, credits, ok, time }
    failLogs: [], // 失败日志：{ id, provider, error, time }
    redeemCodes: [], // 兑换码：{ code, credits, used, usedBy, time }
    orders: [], // 订单：{ id, userId, plan, credits, price, status, time }
    invites: [], // 邀请记录：{ inviterId, inviteeId, reward, time }
    payConfig: { alipayImage: '', payee: '白鸟(**林)' }, // 收款配置（管理员上传收款码）
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
  register(username, password, inviteCode) {
    if (db.users.some((u) => u.username === username)) {
      return { ok: false, msg: '该用户名已被注册' };
    }
    const user = { id: uid(), username, password, credits: 1000, isAdmin: false, createdAt: now() };
    db.users.push(user);
    db.creditsLedger.push({ id: uid(), userId: user.id, delta: 1000, reason: '新用户注册赠送', time: now() });
    db.sessions.currentUserId = user.id;
    save(db);
    // 注册成功后自动结算邀请奖励（双方各 +500）
    let inviteReward = null;
    if (inviteCode) {
      const r = DB.applyInviteCode(user.id, inviteCode);
      if (r.ok) inviteReward = r.reward;
    }
    return { ok: true, user, inviteReward };
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

  // ---------- 邀请活动（双方各得 500 积分） ----------
  inviteCodeOf(userId) {
    return 'INV-' + userId.slice(0, 6).toUpperCase();
  },
  applyInviteCode(newUserId, code) {
    const c = code.trim().toUpperCase();
    if (!c.startsWith('INV-')) return { ok: false, msg: '邀请码格式不正确' };
    const inviter = db.users.find((u) => DB.inviteCodeOf(u.id) === c);
    if (!inviter) return { ok: false, msg: '邀请码不存在' };
    if (inviter.id === newUserId) return { ok: false, msg: '不能使用自己的邀请码' };
    if (db.invites.some((i) => i.inviteeId === newUserId)) return { ok: false, msg: '已填写过邀请码' };
    const REWARD = 500;
    db.invites.push({ inviterId: inviter.id, inviteeId: newUserId, reward: REWARD, time: now() });
    DB.addCredits(inviter.id, REWARD, '邀请活动奖励（成功邀请新用户）');
    DB.addCredits(newUserId, REWARD, '邀请活动奖励（填写邀请码）');
    save(db);
    return { ok: true, reward: REWARD };
  },
  invitesOf(userId) {
    return db.invites.filter((i) => i.inviterId === userId).reverse();
  },

  // ---------- 收款配置（站点全部收入进该账户） ----------
  payConfig() {
    return db.payConfig;
  },
  setPayConfig(cfg) {
    db.payConfig = { ...db.payConfig, ...cfg };
    save(db);
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
