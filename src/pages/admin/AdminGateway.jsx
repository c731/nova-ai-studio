import React, { useState } from 'react';
import { DB } from '../../services/db.js';
import { providerStatus, pingProviders, getKeys, setKeys } from '../../services/gateway.js';
import { useToast } from '../../components/Toast.jsx';

export default function AdminGateway() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [keys, setKeysState] = useState(getKeys());
  const [gatewayUrl, setGatewayUrl] = useState(DB.getGatewayUrl());

  const providers = providerStatus();

  const doPing = async () => {
    setPinging(true);
    toast('正在真实 ping 全部节点…', 'info');
    const r = await pingProviders();
    setPingResult(r);
    setPinging(false);
    toast('健康检查完成', 'success');
  };

  const saveKeys = () => {
    setKeys(keys);
    DB.setGatewayUrl(gatewayUrl.trim());
    toast('网关配置已保存，故障转移链已更新', 'success');
    setTick(tick + 1);
  };

  return (
    <div className="animate-fadeUp">
      <h2 className="text-xl font-bold mb-1">网关 API 健康状态</h2>
      <p className="text-white/40 text-sm mb-6">故障转移链：自建网关 → Pollinations → OpenRouter → DeepSeek → 通义千问</p>

      {/* 节点状态 */}
      <div className="glass-dark rounded-3xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">节点配置状态</h3>
          <button onClick={doPing} disabled={pinging} className="press bg-white/8 rounded-full px-4 py-1.5 text-xs text-white/70 disabled:opacity-50">
            {pinging ? '检测中…' : '🔍 实时探活'}
          </button>
        </div>
        <div className="space-y-3">
          {providers.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.enabled ? 'bg-emerald-400 animate-pulseDot' : 'bg-white/15'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/85">{p.name}</p>
                <p className="text-[11px] text-white/35">{p.note}</p>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full ${p.enabled ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/5 text-white/35'}`}>
                {p.enabled ? '已启用' : '未启用'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 实时探活结果 */}
      {pingResult && (
        <div className="glass-dark rounded-3xl p-5 mb-5 animate-fadeUp">
          <h3 className="font-semibold mb-4">实时探活结果</h3>
          <div className="space-y-3">
            {pingResult.map((r) => (
              <div key={r.name} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{r.name}</span>
                <span className={r.ok ? 'text-emerald-300' : 'text-rose-300'}>
                  {r.status}{r.latency ? ` · ${r.latency}ms` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 密钥与网关配置 */}
      <div className="glass-dark rounded-3xl p-5">
        <h3 className="font-semibold mb-1">密钥与自建网关配置</h3>
        <p className="text-[11px] text-white/35 mb-4">密钥仅保存在本机浏览器，调用时自动启用对应节点参与故障转移</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/45 block mb-1.5">自建网关地址（部署 server/server.js 后填写）</label>
            <input
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              placeholder="https://your-gateway.vercel.app"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-violet-400/60"
            />
          </div>
          {[
            { k: 'openrouter', label: 'OpenRouter 密钥（免费层 :free 模型）' },
            { k: 'deepseek', label: 'DeepSeek 官方密钥' },
            { k: 'qwen', label: '通义千问 DashScope 密钥' },
          ].map((f) => (
            <div key={f.k}>
              <label className="text-xs text-white/45 block mb-1.5">{f.label}</label>
              <input
                type="password"
                value={keys[f.k] || ''}
                onChange={(e) => setKeysState({ ...keys, [f.k]: e.target.value })}
                placeholder="sk-…"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-violet-400/60"
              />
            </div>
          ))}
          <button onClick={saveKeys} className="press btn-grad w-full rounded-2xl py-3.5 font-semibold">
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
