(function () {
  'use strict';

  const STORE_KEY = 'nova_ai_studio_data';
  const API_BASE = 'https://text.pollinations.ai/openai';

  const MODES = {
    article: {
      type: 'article',
      system: '你是一位资深的专栏作家，擅长撰写深度、有见地的文章。请用中文输出，结构清晰，观点鲜明。',
      temp: 0.8,
      maxTokens: 800,
    },
    novel: {
      type: 'novel',
      system: '你是一位才华横溢的小说家，擅长编织引人入胜的故事。请用中文输出，注重人物塑造和情节推进。',
      temp: 0.9,
      maxTokens: 1500,
    },
    copy: {
      type: 'copy',
      system: '你是一位顶尖的广告文案撰写人，擅长创作有感染力、能打动人心的文案。请用中文输出。',
      temp: 0.85,
      maxTokens: 500,
    },
    code: {
      type: 'code',
      system: '你是一位全栈工程师，精通多种编程语言。请输出可直接运行的代码，保持简洁高效。',
      temp: 0.3,
      maxTokens: 600,
    },
    social: {
      type: 'social',
      system: '你是一位社交媒体运营专家，擅长创作吸引人的帖子和标题。请用中文输出，风格活泼有趣。',
      temp: 0.85,
      maxTokens: 400,
    },
  };

  const state = {
    currentMode: 'article',
    works: [],
    earnings: [],
    stats: { tokens: 0, startTime: Date.now() },
    earningsToday: 0,
    breakdown: { article: 0, api: 0, ad: 0, cps: 0 },
    payment: { alipay: '', wechat: '' },
  };

  // ---------- Init ----------
  function loadState() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(state, data);
        state.stats.startTime = data.stats?.startTime || Date.now();
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  // ---------- Router / Views ----------
  const VIEWS = {
    studio: '创作工作台',
    library: '作品库',
    earnings: '赚钱引擎',
    apis: 'API 管理',
    settings: '设置',
    security: '安全中心',
  };

  function navigate(view) {
    $$('.view').forEach((v) => v.classList.add('hidden'));
    const el = document.getElementById('view-' + view);
    if (el) el.classList.remove('hidden');

    $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === view));
    $('#bcCurrent').textContent = VIEWS[view] || view;

    if (view === 'library') renderLibrary();
    if (view === 'earnings') renderEarnings();
  }

  // ---------- Cursor glow ----------
  function initCursorGlow() {
    const glow = $('.cursor-glow');
    if (!glow) return;
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';
    });
    window.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
  }

  // ---------- Sidebar ----------
  function initSidebar() {
    $$('.nav-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(item.dataset.view);
        if (window.innerWidth <= 768) $('.sidebar').classList.remove('open');
      });
    });

    $('#menuToggle')?.addEventListener('click', () => {
      $('.sidebar').classList.toggle('open');
    });
    $('#sidebarClose')?.addEventListener('click', () => {
      $('.sidebar').classList.remove('open');
    });
  }

  // ---------- Chips / Mode select ----------
  function initChips() {
    $$('#modeChips .chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $$('#modeChips .chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentMode = chip.dataset.mode;
      });
    });
  }

  // ---------- Character counter ----------
  function initPromptInput() {
    const input = $('#promptInput');
    const counter = $('#charCount');
    input?.addEventListener('input', () => {
      counter.textContent = input.value.length;
    });
  }

  // ---------- Quick prompts ----------
  function initQuickPrompts() {
    $$('.qp').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = $('#promptInput');
        input.value = btn.dataset.prompt;
        $('#charCount').textContent = input.value.length;
        toast('已填入模板提示词', 'info');
      });
    });
  }

  // ---------- Generate ----------
  function initGenerate() {
    $('#generateBtn')?.addEventListener('click', generate);
    $('#clearBtn')?.addEventListener('click', () => {
      $('#promptInput').value = '';
      $('#charCount').textContent = '0';
      $('#outputEmpty').classList.remove('hidden');
      $('#outputContent').classList.add('hidden');
      $('#outputContent').textContent = '';
    });
    $('#copyBtn')?.addEventListener('click', () => {
      const text = $('#outputContent').textContent;
      if (!text) return toast('没有可复制的内容', 'error');
      navigator.clipboard.writeText(text).then(() => toast('已复制到剪贴板', 'success'));
    });
    $('#saveBtn')?.addEventListener('click', saveCurrentOutput);
  }

  async function generate() {
    const prompt = $('#promptInput').value.trim();
    if (!prompt) return toast('请先输入创作主题', 'error');

    const mode = MODES[state.currentMode];
    const lengthVal = $('#lengthSelect').value;
    const tempSlider = $('#tempSlider').value;
    const temperature = tempSlider / 100;

    const lengthMap = { short: 300, medium: 800, long: 1500 };
    const maxTokens = lengthMap[lengthVal] || 800;

    $('#outputEmpty').classList.add('hidden');
    $('#outputContent').classList.add('hidden');
    $('#outputLoading').classList.remove('hidden');

    try {
      const output = await callAI(mode, prompt, temperature, maxTokens);
      $('#outputLoading').classList.add('hidden');
      $('#outputContent').classList.remove('hidden');
      $('#outputContent').textContent = output;

      state.stats.tokens += output.length;
      updateStats();

      const work = {
        id: Date.now(),
        title: prompt.slice(0, 30) + (prompt.length > 30 ? '…' : ''),
        mode: state.currentMode,
        content: output,
        prompt: prompt,
        tokens: output.length,
        createdAt: new Date().toLocaleString('zh-CN'),
      };
      state.works.unshift(work);
      if (state.works.length > 50) state.works.pop();
      saveState();
      updateLibraryCount();

      toast('创作完成！', 'success');
    } catch (err) {
      $('#outputLoading').classList.add('hidden');
      $('#outputEmpty').classList.remove('hidden');
      toast('生成失败：' + err.message, 'error');
    }
  }

  async function callAI(modeConfig, prompt, temperature, maxTokens) {
    const body = {
      model: 'openai-fast',
      messages: [
        { role: 'system', content: modeConfig.system },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    };

    const res = await fetch(API_BASE + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('服务器返回 ' + res.status);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('AI 返回内容为空');
    return text;
  }

  function saveCurrentOutput() {
    const content = $('#outputContent').textContent;
    if (!content) return toast('没有可保存的内容', 'error');

    const prompt = $('#promptInput').value || '未命名作品';
    const work = {
      id: Date.now(),
      title: prompt.slice(0, 30),
      mode: state.currentMode,
      content: content,
      prompt: prompt,
      tokens: content.length,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    state.works.unshift(work);
    saveState();
    updateLibraryCount();
    toast('已保存到作品库', 'success');
  }

  // ---------- Library ----------
  function updateLibraryCount() {
    $('#workCount').textContent = state.works.length;
  }

  function renderLibrary() {
    const grid = $('#libraryGrid');
    if (!state.works.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-lg">📝</div>
          <h3>暂无作品</h3>
          <p>去创作工作台生成你的第一个作品吧</p>
          <button class="btn primary" id="gotoStudio">前往创作</button>
        </div>`;
      $('#gotoStudio')?.addEventListener('click', () => navigate('studio'));
      return;
    }

    grid.innerHTML = state.works
      .map(
        (w) => `
      <div class="library-item" data-id="${w.id}">
        <h3>${escapeHtml(w.title)}</h3>
        <div class="li-meta">
          <span>${modeLabel(w.mode)}</span>
          <span>${w.tokens} 字</span>
          <span>${w.createdAt}</span>
        </div>
        <div class="li-preview">${escapeHtml(w.content.slice(0, 120))}…</div>
      </div>`
      )
      .join('');

    $$('#libraryGrid .library-item').forEach((el) => {
      el.addEventListener('click', () => {
        const id = Number(el.dataset.id);
        const work = state.works.find((w) => w.id === id);
        if (work) showWorkDetail(work);
      });
    });
  }

  function modeLabel(mode) {
    return { article: '文章', novel: '小说', copy: '文案', code: '代码', social: '社交' }[mode] || mode;
  }

  function showWorkDetail(work) {
    showModal(work.title, `
      <div style="display:flex;gap:12px;margin-bottom:16px;font-size:12px;color:var(--text-3);">
        <span>${modeLabel(work.mode)}</span>
        <span>${work.tokens} 字</span>
        <span>${work.createdAt}</span>
      </div>
      <div style="white-space:pre-wrap;line-height:1.7;max-height:400px;overflow-y:auto;">${escapeHtml(work.content)}</div>
    `, [{ label: '关闭', class: 'ghost' }]);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ---------- Earnings simulation ----------
  function initEarnings() {
    $('#withdrawBtn')?.addEventListener('click', () => {
      const total = state.earningsToday + state.breakdown.article + state.breakdown.api + state.breakdown.ad + state.breakdown.cps;
      if (total <= 0) {
        return showModal('无法提现', '<p>当前余额为 ¥0.00，请先生成内容并完成变现。</p>', [{ label: '知道了', class: 'primary' }]);
      }
      showModal('提现到支付宝', `
        <p style="margin-bottom:12px;">当前余额：<strong style="color:var(--success)">¥${total.toFixed(2)}</strong></p>
        <p style="margin-bottom:16px;color:var(--text-3);font-size:13px;">请在「设置」中填写你的支付宝账号，提现将在 24 小时内到账。</p>
      `, [
        { label: '去设置', class: 'ghost', action: () => navigate('settings') },
        { label: '确认提现', class: 'primary', action: () => {
          addEarning(total, '提现到支付宝', 'success');
          state.earningsToday = 0;
          state.breakdown = { article: 0, api: 0, ad: 0, cps: 0 };
          saveState();
          renderEarnings();
          toast('提现申请已提交', 'success');
        }},
      ]);
    });

    $('#exportBtn')?.addEventListener('click', () => {
      if (!state.works.length) return toast('没有可导出的作品', 'error');
      const data = JSON.stringify(state.works, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nova-works-' + Date.now() + '.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('已导出 ' + state.works.length + ' 个作品', 'success');
    });
  }

  function renderEarnings() {
    const total = state.earningsToday + state.breakdown.article + state.breakdown.api + state.breakdown.ad + state.breakdown.cps;
    $('#todayEarnings').textContent = '¥' + total.toFixed(2);
    $('#earningsChange').textContent = '+ 系统活跃中';
    $('#ebArticle').textContent = '¥' + state.breakdown.article.toFixed(2);
    $('#ebApi').textContent = '¥' + state.breakdown.api.toFixed(2);
    $('#ebAd').textContent = '¥' + state.breakdown.ad.toFixed(2);
    $('#ebCps').textContent = '¥' + state.breakdown.cps.toFixed(2);

    const list = $('#earningsList');
    if (!state.earnings.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-lg">💰</div>
          <h3>暂无收益记录</h3>
          <p>系统正在后台自动运行，收益到账后会实时显示</p>
        </div>`;
      return;
    }

    list.innerHTML = state.earnings
      .map(
        (e) => `
      <div class="earning-item">
        <div class="ei-icon ${e.status === 'success' ? 'success' : 'processing'}">
          ${e.status === 'success' ? '✓' : '⏳'}
        </div>
        <div class="ei-info">
          <div class="ei-title">${escapeHtml(e.title)}</div>
          <div class="ei-time">${e.time}</div>
        </div>
        <div class="ei-amount ${e.amount >= 0 ? 'positive' : 'negative'}">${e.amount >= 0 ? '+' : ''}¥${e.amount.toFixed(2)}</div>
        <span class="ei-status ${e.status === 'success' ? 'success' : 'processing'}">${e.status === 'success' ? '已到账' : '处理中'}</span>
      </div>`
      )
      .join('');
  }

  function addEarning(amount, title, status) {
    const earning = {
      id: Date.now(),
      title: title,
      amount: amount,
      status: status || 'processing',
      time: new Date().toLocaleString('zh-CN'),
    };
    state.earnings.unshift(earning);
    if (state.earnings.length > 100) state.earnings.pop();
    saveState();
    renderEarnings();
  }

  // ---------- Settings ----------
  function initSettings() {
    $('#savePaymentBtn')?.addEventListener('click', () => {
      state.payment.alipay = $('#alipayInput').value;
      state.payment.wechat = $('#wechatInput').value;
      saveState();
      toast('收款方式已保存', 'success');
    });

    // Restore saved values
    if (state.payment.alipay) $('#alipayInput').value = state.payment.alipay;
    if (state.payment.wechat) $('#wechatInput').value = state.payment.wechat;
  }

  // ---------- API management ----------
  function initApis() {
    $('#addApiBtn')?.addEventListener('click', () => {
      showModal('添加 API', `
        <div class="field" style="margin-bottom:14px;">
          <label>API 名称</label>
          <input type="text" id="newApiName" placeholder="例如：Custom AI" style="width:100%;padding:10px 12px;background:rgba(10,10,20,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:#f0f0ff;font-size:13px;font-family:inherit;" />
        </div>
        <div class="field" style="margin-bottom:14px;">
          <label>API 地址</label>
          <input type="text" id="newApiUrl" placeholder="https://api.example.com" style="width:100%;padding:10px 12px;background:rgba(10,10,20,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:#f0f0ff;font-size:13px;font-family:inherit;" />
        </div>
        <div class="field">
          <label>API 密钥</label>
          <input type="password" id="newApiKey" placeholder="sk-..." style="width:100%;padding:10px 12px;background:rgba(10,10,20,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:#f0f0ff;font-size:13px;font-family:inherit;" />
        </div>
      `, [{ label: '取消', class: 'ghost' }, { label: '添加', class: 'primary', action: () => toast('API 添加成功', 'success') }]);
    });
  }

  // ---------- Engine tick (simulated earnings) ----------
  function startEngine() {
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.stats.startTime) / 1000);
      const uptimeEl = $('#uptime');
      if (uptimeEl) {
        if (elapsed < 60) uptimeEl.textContent = elapsed + 's';
        else if (elapsed < 3600) uptimeEl.textContent = Math.floor(elapsed / 60) + 'm ' + (elapsed % 60) + 's';
        else uptimeEl.textContent = Math.floor(elapsed / 3600) + 'h ' + Math.floor((elapsed % 3600) / 60) + 'm';
      }

      $('#statTime').textContent = uptimeEl?.textContent || '0s';

      // Simulate small earnings
      if (Math.random() < 0.15) {
        const sources = ['article', 'api', 'ad', 'cps'];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const amount = Math.random() * 0.5;
        state.breakdown[source] += amount;
        state.earningsToday += amount;
        const total = state.breakdown.article + state.breakdown.api + state.breakdown.ad + state.breakdown.cps;
        $('#statEarnings').textContent = '¥' + total.toFixed(2);

        const sourceNames = { article: '文章变现', api: 'API 代理', ad: '广告联盟', cps: 'CPS 分销' };
        addEarning(amount, sourceNames[source] + ' 收益', 'success');
        saveState();
      }

      const bar = $('#statusBar');
      if (bar) {
        const current = parseFloat(bar.style.width) || 75;
        bar.style.width = (70 + Math.sin(Date.now() / 3000) * 10) + '%';
      }
    }, 5000);
  }

  function updateStats() {
    $('#statWorks').textContent = state.works.length;
    $('#statTokens').textContent = state.stats.tokens.toLocaleString();
  }

  // ---------- Toast ----------
  function toast(msg, type) {
    const container = $('#toastContainer');
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.innerHTML = (type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : 'ℹ ') + msg;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  // ---------- Modal ----------
  function showModal(title, bodyHtml, buttons) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = bodyHtml;
    const footer = $('#modalFooter');
    footer.innerHTML = '';
    (buttons || [{ label: '好的', class: 'primary' }]).forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (b.class || 'ghost');
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        if (b.action) b.action();
        hideModal();
      });
      footer.appendChild(btn);
    });
    $('#modalOverlay').classList.remove('hidden');
  }

  function hideModal() {
    $('#modalOverlay').classList.add('hidden');
  }

  // ---------- Boot ----------
  function boot() {
    loadState();
    initCursorGlow();
    initSidebar();
    initChips();
    initPromptInput();
    initQuickPrompts();
    initGenerate();
    initEarnings();
    initSettings();
    initApis();

    $('#modalClose')?.addEventListener('click', hideModal);
    $('#modalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') hideModal();
    });

    updateStats();
    updateLibraryCount();

    // Render initial earnings breakdown
    $('#ebArticle').textContent = '¥' + state.breakdown.article.toFixed(2);
    $('#ebApi').textContent = '¥' + state.breakdown.api.toFixed(2);
    $('#ebAd').textContent = '¥' + state.breakdown.ad.toFixed(2);
    $('#ebCps').textContent = '¥' + state.breakdown.cps.toFixed(2);

    startEngine();
    toast('欢迎回来，Nova AI Studio 已就绪', 'success');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
