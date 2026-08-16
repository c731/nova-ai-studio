import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceSidebar from '../components/ServiceSidebar.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { DB } from '../services/db.js';
import { chat } from '../services/gateway.js';
import AdminPanel from '../components/AdminPanel.jsx';

// 充值套餐（点击生成真实订单号，localStorage 存储）
const PLANS = [
  { name: '体验包', credits: 1000, price: '¥1', desc: '适合尝鲜', color: 'from-sky-400 to-blue-500' },
  { name: '标准包', credits: 5000, price: '¥4.5', desc: '日常够用', color: 'from-rose-400 to-pink-500', hot: true },
  { name: '豪华包', credits: 20000, price: '¥15', desc: '重度用户首选', color: 'from-amber-400 to-orange-500' },
];

export default function ServiceCenter() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAdmin, setIsAdmin, refresh } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('overview');
  const [orderModal, setOrderModal] = useState(null); // 待支付订单
  const [adminTaps, setAdminTaps] = useState(0);

  // 我的服务：内嵌 AI 对话（真实走网关扣积分）
  const [chatMsgs, setChatMsgs] = useState([{ role: 'ai', content: '你好，这里是我的服务窗口，直接输入问题即可调用 AI。' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef(null);

  const sendChat = async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    if (!user) {
      toast('请先登录', 'warning');
      navigate('/login');
      return;
    }
    if (user.credits < 2) {
      toast('积分不足，请先充值', 'error');
      setActive('deals');
      return;
    }
    setChatInput('');
    setChatMsgs((m) => [...m, { role: 'user', content: q }]);
    setChatLoading(true);
    try {
      const result = await chat(
        [{ role: 'system', content: '你是 Nova 服务助手，用中文简洁专业地回答。' }, { role: 'user', content: q }],
        {}
      );
      const tokens = Math.ceil((q.length + result.text.length) * 0.75);
      const credits = Math.max(2, Math.ceil(tokens / 1000));
      DB.addCredits(user.id, -credits, `服务调用消耗（${tokens} Token）`);
      DB.logCall({ userId: user.id, service: '我的服务·AI对话', provider: result.provider, tokens, credits, ok: true });
      refresh();
      setChatMsgs((m) => [...m, { role: 'ai', content: result.text }]);
    } catch (e) {
      setChatMsgs((m) => [...m, { role: 'ai', content: '调用失败：' + e.message }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }), 50);
    }
  };

  // 下单：生成订单号
  const buyPlan = (plan) => {
    if (!user) {
      toast('请先登录后购买', 'warning');
      navigate('/login');
      return;
    }
    const order = DB.createOrder(user.id, plan);
    setOrderModal(order);
  };

  const payOrder = () => {
    const r = DB.payOrder(orderModal.id);
    if (r.ok) {
      toast(`支付成功，${r.credits} 积分已到账`, 'success');
      refresh();
    } else {
      toast(r.msg, 'error');
    }
    setOrderModal(null);
  };

  // 账号设置暗门：连点版本号 5 次弹出管理员密钥输入
  const [adminKeyInput, setAdminKeyInput] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const tapVersion = () => {
    const n = adminTaps + 1;
    setAdminTaps(n);
    if (n >= 5) {
      setAdminTaps(0);
      setAdminKeyInput(true);
    }
  };
  const submitAdminKey = () => {
    if (adminKey === 'admin888' || adminKey === 'nova2026') {
      setIsAdmin(true);
      toast('管理员身份已激活，界面已切换', 'success');
    } else {
      toast('密钥错误', 'error');
    }
    setAdminKeyInput(false);
    setAdminKey('');
  };

  // ---------- 各面板 ----------
  const renderPanel = () => {
    switch (active) {
      case 'overview':
        return (
          <div className="space-y-4 animate-fadeUp">
            <div className="rounded-3xl p-6 text-white bg-gradient-to-br from-rose-400 to-orange-400 shadow-lg">
              <p className="text-white/80 text-xs mb-1">可用积分</p>
              <p className="text-4xl font-bold">{user ? user.credits.toLocaleString() : '--'}</p>
              <p className="text-[11px] text-white/70 mt-2">{user ? `${user.username} · 欢迎回来` : '登录后查看积分'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: '今日调用', v: DB.callLogs().filter((c) => new Date().toLocaleDateString() === (c.time || '').split(' ')[0]).length },
                { l: '累计调用', v: DB.callLogs().length },
                { l: '我的订单', v: user ? DB.ordersOf(user.id).length : 0 },
                { l: '站点能力', v: DB.capabilities().length },
              ].map((s) => (
                <div key={s.l} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                  <p className="text-xl font-bold text-slate-800">{s.v}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setActive('deals')} className="press w-full rounded-2xl py-3.5 bg-rose-50 text-rose-500 font-semibold text-sm">
              🎁 去超值特惠充值
            </button>
          </div>
        );

      case 'deals':
        return (
          <div className="space-y-4 animate-fadeUp">
            {PLANS.map((p) => (
              <div key={p.name} className={`relative bg-white rounded-3xl p-5 shadow-sm border ${p.hot ? 'border-rose-200' : 'border-slate-100'}`}>
                {p.hot && <span className="absolute -top-2.5 right-4 text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-full font-bold">HOT</span>}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xl font-bold shrink-0`}>
                    {p.credits >= 10000 ? '2W' : p.credits >= 5000 ? '5K' : '1K'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{p.name} · {p.credits.toLocaleString()} 积分</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-rose-500">{p.price}</p>
                    <button onClick={() => buyPlan(p)} className="press mt-1 bg-gradient-to-r from-rose-400 to-orange-400 text-white text-xs font-semibold rounded-full px-4 py-1.5">
                      立即购买
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-slate-400 text-center">点击购买生成订单号，确认支付后积分实时到账（本地账本可查流水）</p>
          </div>
        );

      case 'services':
        return (
          <div className="animate-fadeUp flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 pb-3">
              {chatMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white' : 'bg-white text-slate-700 border border-slate-100'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && <div className="text-xs text-slate-400 pl-1">AI 响应中…</div>}
            </div>
            <div className="flex gap-2 pt-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="输入问题，真实调用 AI（扣积分）"
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-rose-300"
              />
              <button onClick={sendChat} className="press bg-gradient-to-r from-rose-400 to-orange-400 text-white rounded-2xl px-5 font-semibold text-sm">
                发送
              </button>
            </div>
          </div>
        );

      case 'orders': {
        const orders = user ? DB.ordersOf(user.id) : [];
        return (
          <div className="space-y-3 animate-fadeUp">
            {orders.length === 0 && <p className="text-sm text-slate-400 text-center py-10">暂无订单</p>}
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 text-sm">{o.plan}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${o.status === '已完成' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{o.status}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">订单号 {o.id} · {o.time}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-rose-500">{o.price}</span>
                  <span className="text-xs text-slate-500">{o.credits.toLocaleString()} 积分</span>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'renew':
        return (
          <div className="animate-fadeUp space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <p className="font-bold text-slate-800 mb-2">🔄 老用户续费</p>
              <p className="text-xs text-slate-400 leading-relaxed">老用户续费享 9 折优惠。选择套餐后生成续费订单，支付后立即到账。</p>
            </div>
            {PLANS.map((p) => (
              <button key={p.name} onClick={() => buyPlan(p)} className="press w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-700">{p.name} · {p.credits.toLocaleString()} 积分</span>
                <span className="text-rose-500 font-bold text-sm">{p.price} <span className="text-[10px] text-slate-400 line-through">原价</span></span>
              </button>
            ))}
          </div>
        );

      case 'invite':
        return (
          <div className="animate-fadeUp space-y-4">
            <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-400 to-pink-500 text-white">
              <p className="font-bold mb-1">🤝 邀请好友 各得 500 积分</p>
              <p className="text-[11px] text-white/80">好友注册时填写你的邀请码，双方各得 500 积分</p>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 mb-2">我的邀请码</p>
              <p className="text-2xl font-bold grad-text tracking-widest">{user ? 'INV-' + user.id.slice(0, 6).toUpperCase() : '登录后查看'}</p>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(user ? 'INV-' + user.id.slice(0, 6).toUpperCase() : '');
                  toast('邀请码已复制', 'success');
                }}
                className="press mt-3 bg-rose-50 text-rose-500 rounded-full px-6 py-2 text-sm font-semibold"
              >
                复制邀请码
              </button>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="animate-fadeUp space-y-3">
            {[
              { t: '系统升级通知', d: 'AI 聚合网关已上线，多节点自动故障转移。', time: '今天' },
              { t: '积分到账提醒', d: '您的充值订单已完成，积分已到账。', time: '昨天' },
              { t: '欢迎使用 Nova', d: '感谢注册，赠送的 1000 积分已发放。', time: '注册时' },
            ].map((m) => (
              <button key={m.t} onClick={() => toast('消息详情：' + m.d, 'info')} className="press w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-slate-800">{m.t}</p>
                  <span className="text-[10px] text-slate-300">{m.time}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{m.d}</p>
              </button>
            ))}
          </div>
        );

      case 'settings':
        return (
          <div className="animate-fadeUp space-y-3">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <p className="font-bold text-slate-800 mb-3">⚙️ 账号设置</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">用户名</span><span className="text-slate-700">{user?.username || '未登录'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">积分余额</span><span className="text-slate-700">{user?.credits.toLocaleString() || '--'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">身份</span><span className={isAdmin ? 'text-violet-500 font-semibold' : 'text-slate-700'}>{isAdmin ? '管理员' : '普通用户'}</span></div>
              </div>
            </div>
            {!user && (
              <button onClick={() => navigate('/login')} className="press w-full rounded-2xl py-3.5 bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold text-sm">
                登录 / 注册
              </button>
            )}
            <div className="text-center pt-4">
              <button onClick={tapVersion} className="press text-[11px] text-slate-300">Nova 服务中心 v1.0.0</button>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="animate-fadeUp space-y-3">
            {[
              { q: '积分怎么消耗？', a: 'AI 对话按真实 Token 折算扣积分，绘图每张 50 积分。' },
              { q: '积分怎么充值？', a: '在「超值特惠」选择套餐下单支付，或使用兑换码。' },
              { q: 'AI 回答是真实的吗？', a: '是。全部来自真实 AI 接口，多节点故障转移保证可用。' },
            ].map((h) => (
              <button key={h.q} onClick={() => toast(h.a, 'info')} className="press w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-left">
                <p className="font-semibold text-sm text-slate-800">❓ {h.q}</p>
                <p className="text-xs text-slate-400 mt-1">{h.a}</p>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      {/* 顶栏 */}
      <header className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">{isAdmin ? '管理仪表盘' : '服务中心'}</h1>
          <p className="text-slate-400 text-sm">{isAdmin ? '蓝紫管理面板 · 全站数据' : '积分服务 · AI 调用 · 订单管理'}</p>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="press w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-600">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">2</span>
        </button>
      </header>

      {/* 核心：管理员/普通用户条件渲染 */}
      {isAdmin ? <AdminPanel /> : renderPanel()}

      {/* 滑出侧边栏 */}
      <ServiceSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active={active} onSelect={setActive} />

      {/* 订单支付弹窗 */}
      {orderModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setOrderModal(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm animate-fadeUp">
            <h3 className="font-bold text-slate-800 text-center mb-4">确认订单</h3>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">订单号</span><span className="text-slate-700 font-mono text-xs">{orderModal.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">套餐</span><span className="text-slate-700">{orderModal.plan}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">积分</span><span className="text-slate-700">{orderModal.credits.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">金额</span><span className="text-rose-500 font-bold">{orderModal.price}</span></div>
            </div>
            <button onClick={payOrder} className="press w-full mt-4 rounded-2xl py-3.5 bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold">
              确认支付
            </button>
            <button onClick={() => setOrderModal(null)} className="press w-full mt-2 rounded-2xl py-3 text-slate-400 text-sm">
              取消
            </button>
          </div>
        </div>
      )}

      {/* 管理员暗门弹窗 */}
      {adminKeyInput && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setAdminKeyInput(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm animate-fadeUp">
            <h3 className="font-bold text-slate-800 text-center mb-4">🔐 管理员验证</h3>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAdminKey()}
              placeholder="输入管理员密钥"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
            <button onClick={submitAdminKey} className="press w-full mt-4 rounded-2xl py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold">
              验证并切换
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
