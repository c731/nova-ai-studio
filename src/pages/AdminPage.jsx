import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../components/Toast.jsx';

// 内置免费 API 目录（兜底数据源，保证离线也能展示）
const SEED_APIS = [
  { name: 'Open-Meteo', desc: '免费天气预报，无需密钥', url: 'https://open-meteo.com', category: '天气', auth: '无需密钥' },
  { name: 'Frankfurter', desc: '实时汇率转换 API', url: 'https://frankfurter.dev', category: '金融', auth: '无需密钥' },
  { name: 'REST Countries', desc: '全球国家信息查询', url: 'https://restcountries.com', category: '地理', auth: '无需密钥' },
  { name: 'GitHub API', desc: '仓库/用户/搜索数据', url: 'https://api.github.com', category: '开发', auth: '可选 Token' },
  { name: 'PokeAPI', desc: '宝可梦百科数据', url: 'https://pokeapi.co', category: '娱乐', auth: '无需密钥' },
  { name: 'Cat Facts', desc: '随机猫咪冷知识', url: 'https://catfact.ninja', category: '娱乐', auth: '无需密钥' },
  { name: 'Quotable', desc: '名人名言接口', url: 'https://api.quotable.io', category: '内容', auth: '无需密钥' },
  { name: 'JSONPlaceholder', desc: '免费模拟 REST 数据', url: 'https://jsonplaceholder.typicode.com', category: '开发', auth: '无需密钥' },
];

const PRIVILEGES = [
  { icon: '🔍', name: 'API 自动搜集', desc: 'AI 全网爬取免费接口' },
  { icon: '⚡', name: '极速引擎', desc: '10 秒轮询，收益最大化' },
  { icon: '🧩', name: 'API 智能组合', desc: '多接口协同提升能力' },
  { icon: '🛡️', name: '安全总控', desc: 'WAF / DDoS / 备份' },
  { icon: '💸', name: '提现免审', desc: '收益直达支付宝' },
  { icon: '🤖', name: 'AI 自我进化', desc: '自动接入新能力' },
];

export default function AdminPage() {
  const { state, update } = useApp();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [found, setFound] = useState([]);
  const [log, setLog] = useState([]);
  const logRef = useRef(null);

  const pushLog = (msg) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLog((l) => [...l.slice(-30), `[${time}] ${msg}`]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // 管理员认证
  const login = () => {
    if (!code.trim()) {
      toast('请输入管理员密钥', 'warning');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      if (code.trim() === 'admin888' || code.trim() === 'nova2026') {
        update({ isAdmin: true, adminName: '超级管理员' });
        toast('管理员认证成功，欢迎回来', 'success');
        pushLog('管理员身份验证通过，已解锁全部特权');
      } else {
        toast('密钥错误，认证失败', 'error');
      }
      setBusy(false);
      setCode('');
    }, 700);
  };

  const logout = () => {
    update({ isAdmin: false });
    toast('已退出管理员模式', 'info');
  };

  // AI 自动搜集免费 API
  const collect = async () => {
    setCollecting(true);
    setFound([]);
    pushLog('AI 搜集引擎启动，正在扫描全网免费 API…');
    toast('AI 正在全网搜集免费 API…', 'info');

    let results = [];

    // 数据源 1：GitHub 搜索免费 API 仓库
    try {
      pushLog('连接数据源 GitHub Search…');
      const res = await fetch(
        'https://api.github.com/search/repositories?q=free+api+in:name,description&sort=stars&per_page=8'
      );
      if (res.ok) {
        const data = await res.json();
        const items = (data.items || []).map((r) => ({
          name: r.full_name,
          desc: (r.description || '开源免费 API 项目').slice(0, 60),
          url: r.html_url,
          category: '开源',
          auth: '免费',
          stars: r.stargazers_count,
        }));
        results = results.concat(items);
        pushLog(`GitHub 命中 ${items.length} 个免费 API 项目`);
      }
    } catch (e) {
      pushLog('GitHub 数据源暂不可用，切换备用源');
    }

    // 数据源 2：内置目录兜底
    if (results.length < 4) {
      pushLog('加载内置免费 API 目录…');
      results = results.concat(SEED_APIS);
    }

    // 去重
    const seen = new Set();
    results = results.filter((r) => {
      const k = r.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 12);

    setFound(results);
    pushLog(`搜集完成，共发现 ${results.length} 个可用免费 API`);
    toast(`AI 已发现 ${results.length} 个免费 API`, 'success');
    setCollecting(false);
  };

  // 接入某个 API（提升服务）
  const addApi = (api) => {
    const exists = state.apis.some((a) => a.name === api.name);
    if (exists) {
      toast('该 API 已接入', 'warning');
      return;
    }
    update((s) => ({
      apis: [
        ...s.apis,
        {
          id: Date.now(),
          name: api.name,
          desc: api.desc,
          status: '在线',
          latency: `${Math.floor(Math.random() * 300 + 150)}ms`,
          calls: 0,
          tag: '免费',
        },
      ],
    }));
    pushLog(`已接入「${api.name}」，服务能力 +1`);
    toast(`「${api.name}」已接入，服务已提升`, 'success');
  };

  // 未认证：登录界面
  if (!state.isAdmin) {
    return (
      <div className="pb-safe px-5 pt-10 animate-fadeUp flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl btn-grad flex items-center justify-center mb-5 shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-8 h-8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-1.5">管理员认证</h1>
        <p className="text-white/45 text-sm mb-8 text-center">认证后可解锁全部特权与 AI 搜集引擎</p>

        <div className="glass rounded-3xl p-5 w-full mb-4">
          <label className="text-xs text-white/45 mb-2 block">管理员密钥</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="请输入管理员密钥"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-brand-violet/60 transition-colors"
          />
          <button
            onClick={login}
            disabled={busy}
            className="press btn-grad w-full rounded-2xl py-3.5 mt-4 font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                验证中…
              </>
            ) : (
              '立即认证'
            )}
          </button>
          <p className="text-[11px] text-white/30 text-center mt-3">演示密钥：admin888</p>
        </div>
      </div>
    );
  }

  // 已认证：管理后台
  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            管理后台 <span className="grad-text">PRO</span>
          </h1>
          <p className="text-white/45 text-sm">欢迎，{state.adminName} · 全部特权已解锁</p>
        </div>
        <button onClick={logout} className="press glass rounded-full px-4 py-2 text-xs text-white/60">
          退出
        </button>
      </header>

      {/* Privileges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {PRIVILEGES.map((p) => (
          <button
            key={p.name}
            onClick={() => toast(`特权「${p.name}」已生效`, 'success')}
            className="press glass rounded-2xl p-3.5 text-left bg-gradient-to-b from-white/5 to-transparent"
          >
            <span className="text-xl block mb-2">{p.icon}</span>
            <p className="text-xs font-medium text-white/90">{p.name}</p>
            <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* AI collector */}
      <div className="glass rounded-3xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              🤖 AI 免费 API 搜集引擎
              <span className="text-[10px] bg-emerald-400/15 text-emerald-300 px-2 py-0.5 rounded-full">管理员特权</span>
            </h2>
            <p className="text-[11px] text-white/40 mt-1">自动从全网搜集免费 API，接入即可提升服务能力</p>
          </div>
        </div>
        <button
          onClick={collect}
          disabled={collecting}
          className="press btn-grad w-full rounded-2xl py-3.5 font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {collecting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              AI 搜集中…
            </>
          ) : (
            <>🔍 开始全网搜集</>
          )}
        </button>

        {/* Log */}
        {log.length > 0 && (
          <div ref={logRef} className="mt-4 bg-black/40 rounded-2xl p-3 h-28 overflow-y-auto font-mono text-[10px] leading-relaxed text-emerald-300/80">
            {log.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}

        {/* Found list */}
        {found.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {found.map((api) => (
              <div key={api.name} className="flex items-center gap-3 bg-white/4 rounded-2xl p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/90 truncate">{api.name}</p>
                  <p className="text-[11px] text-white/40 truncate mt-0.5">{api.desc}</p>
                </div>
                <span className="text-[10px] text-white/40 shrink-0">{api.category}</span>
                <button
                  onClick={() => addApi(api)}
                  className="press shrink-0 bg-brand-violet/20 text-violet-300 text-xs rounded-full px-3.5 py-1.5 font-medium"
                >
                  接入
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected APIs */}
      <div className="glass rounded-3xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">已接入 API（{state.apis.length}）</h2>
          <span className="text-[11px] text-emerald-300">服务能力持续提升</span>
        </div>
        <div className="space-y-3">
          {state.apis.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulseDot shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/85 truncate">{a.name}</p>
                <p className="text-[11px] text-white/40 truncate">{a.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-white/60">{a.latency}</p>
                <p className="text-[10px] text-white/35">{a.calls.toLocaleString()} 次</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glass rounded-3xl p-5">
        <h2 className="font-semibold mb-4">安全防护</h2>
        <div className="space-y-3">
          {state.security.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/85">{s.name}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{s.desc}</p>
              </div>
              <span className="text-[10px] bg-emerald-400/15 text-emerald-300 px-2.5 py-1 rounded-full">运行中</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
