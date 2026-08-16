const MODES = {
  short: {
    name: '✍️ 短句文案模式',
    system: '你是一位文案大师，擅长写打动人心的中文短句。直接输出结果，不要解释，不要添加任何前缀。',
    type: 'short'
  },
  novel: {
    name: '📖 小说创作模式',
    system: '你是一位畅销小说作家。根据用户给的主题写一段引人入胜的中文小说内容，直接输出，不要解释。',
    type: 'novel'
  },
  code: {
    name: '💻 代码生成模式',
    system: '你是一位资深软件工程师。根据需求输出高质量、可运行的代码，中文注释，直接输出代码。',
    type: 'code'
  },
  chat: {
    name: '💬 AI聊天模式',
    system: '你是 Nova AI 助手，友好、专业、简洁地用中文回答用户问题。',
    type: 'chat'
  }
};

let currentMode = 'short';
let gallery = JSON.parse(localStorage.getItem('nova_gallery') || '[]');

const $ = id => document.getElementById(id);

function init() {
  initNavigation();
  initModeCards();
  initGenerate();
  initGallery();
  initSettings();
}

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(page).classList.add('active');
    });
  });
}

function initModeCards() {
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentMode = card.dataset.mode;
      $('currentModeLabel').textContent = MODES[currentMode].name;
    });
  });
}

function initGenerate() {
  $('generateBtn').addEventListener('click', generate);
  $('clearBtn').addEventListener('click', () => {
    $('promptInput').value = '';
    $('outputCard').style.display = 'none';
  });
  $('copyBtn').addEventListener('click', () => {
    const text = $('outputContent').textContent;
    navigator.clipboard.writeText(text).then(() => {
      $('copyBtn').textContent = '✅ 已复制';
      setTimeout(() => $('copyBtn').textContent = '📋 复制', 1500);
    });
  });
  $('saveBtn').addEventListener('click', saveToGallery);
}

async function generate() {
  const prompt = $('promptInput').value.trim();
  if (!prompt) {
    alert('请先输入内容');
    return;
  }

  const mode = MODES[currentMode];
  const loading = $('loading');
  const outputCard = $('outputCard');
  const outputContent = $('outputContent');
  const btn = $('generateBtn');

  loading.style.display = 'flex';
  outputCard.style.display = 'none';
  btn.disabled = true;

  try {
    const result = await callAI(mode, prompt);
    outputContent.textContent = result;
    outputCard.style.display = 'block';
    loading.style.display = 'none';
    btn.disabled = false;
  } catch (e) {
    loading.style.display = 'none';
    btn.disabled = false;
    outputContent.textContent = '❌ 生成失败: ' + e.message + '\n\n请稍后重试，或检查网络连接。';
    outputCard.style.display = 'block';
  }
}

async function callAI(mode, prompt) {
  const API_BASE = 'https://text.pollinations.ai/openai';
  const MODEL = 'openai-fast';

  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: mode.system },
      { role: 'user', content: prompt }
    ],
    max_tokens: mode.type === 'novel' ? 1500 : 800,
    temperature: mode.type === 'code' ? 0.3 : 0.8
  };

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`服务器返回 ${res.status}`);
  }

  const data = await res.json();
  const output = data?.choices?.[0]?.message?.content || '';
  if (!output) throw new Error('AI返回内容为空');
  return output;
}

function saveToGallery() {
  const text = $('outputContent').textContent;
  if (!text) return;

  const item = {
    id: Date.now(),
    type: currentMode,
    typeLabel: MODES[currentMode].name,
    prompt: $('promptInput').value.trim(),
    content: text,
    date: new Date().toLocaleString('zh-CN')
  };

  gallery.unshift(item);
  if (gallery.length > 100) gallery = gallery.slice(0, 100);
  localStorage.setItem('nova_gallery', JSON.stringify(gallery));

  $('saveBtn').textContent = '✅ 已保存';
  setTimeout(() => $('saveBtn').textContent = '💾 保存', 1500);

  renderGallery();
}

function initGallery() {
  renderGallery();
}

function renderGallery() {
  const list = $('galleryList');
  const empty = $('galleryEmpty');

  if (!gallery.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = gallery.map(item => `
    <div class="gallery-item" onclick="viewItem(${item.id})">
      <div class="gi-type">${item.typeLabel}</div>
      <div class="gi-preview">${escapeHtml(item.content).slice(0, 100)}...</div>
      <div class="gi-date">${item.date}</div>
    </div>
  `).join('');
}

window.viewItem = function(id) {
  const item = gallery.find(g => g.id === id);
  if (!item) return;

  $('promptInput').value = item.prompt;
  const modeKey = item.type;
  document.querySelectorAll('.mode-card').forEach(c => {
    c.classList.toggle('active', c.dataset.mode === modeKey);
  });
  currentMode = modeKey;
  $('currentModeLabel').textContent = MODES[modeKey].name;
  $('outputContent').textContent = item.content;
  $('outputCard').style.display = 'block';

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="studio"]').classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $('studio').classList.add('active');
};

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function initSettings() {
  $('clearAllBtn').addEventListener('click', () => {
    if (confirm('确定要清除所有作品吗？此操作无法撤销。')) {
      gallery = [];
      localStorage.setItem('nova_gallery', '[]');
      renderGallery();
    }
  });
}

init();
