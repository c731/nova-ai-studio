import React, { useRef, useState } from 'react';
import { DB } from '../../services/db.js';
import { providerStatus } from '../../services/gateway.js';
import { useToast } from '../../components/Toast.jsx';

export default function AdminDashboard() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [payCfg, setPayCfg] = useState(DB.payConfig());
  const users = DB.allUsers();
  const calls = DB.callLogs();
  const orders = DB.allOrders();
  const providers = providerStatus();
  const online = providers.filter((p) => p.enabled).length;
  const totalCredits = users.reduce((s, u) => s + u.credits, 0);
  const revenue = orders.filter((o) => o.status === '已完成').length;

  // 上传收款码图片（存入本地账本，订单弹窗即时展示）
  const onPickImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      toast('请选择图片文件', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      DB.setPayConfig({ alipayImage: reader.result });
      setPayCfg(DB.payConfig());
      toast('收款码已保存，用户下单时将展示该收款码', 'success');
    };
    reader.readAsDataURL(f);
  };

  const stats = [
    { label: '注册用户', value: users.length, color: 'from-violet-500/20 to-violet-500/5' },
    { label: '今日调用', value: calls.length, color: 'from-cyan-500/20 to-cyan-500/5' },
    { label: 'API 在线', value: `${online}/${providers.length}`, color: 'from-emerald-500/20 to-emerald-500/5' },
    { label: '流通积分', value: totalCredits.toLocaleString(), color: 'from-amber-500/20 to-amber-500/5' },
    { label: '完成订单', value: revenue, color: 'from-rose-500/20 to-rose-500/5' },
    { label: '失败日志', value: DB.failLogs().length, color: 'from-red-500/20 to-red-500/5' },
  ];

  return (
    <div className="animate-fadeUp">
      <h2 className="text-xl font-bold mb-1">管理仪表盘</h2>
      <p className="text-white/40 text-sm mb-6">全站运行状态总览</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`glass-dark rounded-3xl p-5 bg-gradient-to-b ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-white/45 mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 收款设置（站点全部收入进该账户） */}
      <div className="glass-dark rounded-3xl p-5 mb-6">
        <h3 className="font-semibold mb-1">💰 收款设置</h3>
        <p className="text-[11px] text-white/40 mb-4">站点售卖积分的全部收入将进入以下收款账户，用户上传订单时展示该收款码</p>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {payCfg.alipayImage ? (
              <img src={payCfg.alipayImage} alt="收款码" className="w-full h-full object-contain" />
            ) : (
              <span className="text-[10px] text-white/30 text-center px-2">未上传收款码</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 mb-1">
              收款账户：支付宝 <span className="font-semibold text-emerald-300">{payCfg.payee}</span>
            </p>
            <p className="text-[11px] text-white/40 mb-3">上传你的支付宝收款码图片，保存后立即生效</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
            <button onClick={() => fileRef.current?.click()} className="press rounded-xl px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
              上传 / 更换收款码
            </button>
          </div>
        </div>
      </div>

      {/* 最近调用 */}
      <div className="glass-dark rounded-3xl p-5">
        <h3 className="font-semibold mb-4">最近 AI 调用</h3>
        {calls.length === 0 ? (
          <p className="text-sm text-white/40">暂无调用记录</p>
        ) : (
          <div className="space-y-3">
            {calls.slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-white/85 truncate">{c.service}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{c.time} · {c.provider}</p>
                </div>
                <span className="text-rose-300 shrink-0 ml-3">-{c.credits} 积分</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
