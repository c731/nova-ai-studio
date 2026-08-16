// AI 生成引擎：OpenAI 兼容格式（Chat Completions API）
// 支持任意 OpenAI 兼容端点：OpenAI 官方 / OpenRouter / 硅基流动 / DeepSeek / 本地 Ollama 等
// 通过环境变量配置，不写死任何密钥。

export interface GenResult {
  output: string;
  engine: string;
}

const OPENAI_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// 有密钥，或配置了免费开放端点（如 Pollinations，无需密钥）时走真实模型
function hasRemoteModel(): boolean {
  return Boolean(OPENAI_KEY) || OPENAI_BASE !== "https://api.openai.com/v1";
}

// ---------- 离线兜底引擎（无密钥时仍可演示全部功能，部署后配置密钥即切换为真实模型） ----------
function localFallback(type: string, prompt: string): string {
  const t = prompt.trim();
  switch (type) {
    case "short":
      return `【短句生成】\n围绕「${t}」：\n1. ${t}，是平凡日子里最亮的一束光。\n2. 把「${t}」写进生活，答案会慢慢浮现。\n3. 关于${t}，最好的开始就是现在。`;
    case "novel":
      return `《${t}》\n\n第一章 起点\n\n夜色像一块深蓝的绒布，盖住了城市的喧嚣。主角的故事，从「${t}」这个念头开始……\n\n（配置 OPENAI_API_KEY 后，此处将由真实大模型生成长篇内容。当前为离线示例引擎。）`;
    case "code":
      return `// 需求：${t}\n// 示例骨架（配置 OPENAI_API_KEY 后由真实模型生成完整代码）\nfunction solve(input) {\n  // TODO: 实现「${t}」\n  return input;\n}\n\nconsole.log(solve("demo"));`;
    case "chat":
    default:
      return `你好！我是 Nova AI。你问的是「${t}」。\n当前运行在离线示例模式；在 .env 中配置 OPENAI_API_KEY 后，我将由真实大模型回答。`;
  }
}

async function callOpenAICompatible(
  type: string,
  prompt: string
): Promise<GenResult> {
  const systemMap: Record<string, string> = {
    short: "你是一位文案大师，擅长写打动人心的短句。直接输出结果，不要解释。",
    novel: "你是一位畅销小说作家。根据用户给的主题写一段引人入胜的小说内容，中文输出。",
    code: "你是一位资深软件工程师。根据需求输出高质量、可运行的代码，并附简短注释。",
    chat: "你是 Nova AI 助手，友好、专业、简洁地用中文回答用户问题。",
  };

  const body = JSON.stringify({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: systemMap[type] || systemMap.chat },
      { role: "user", content: prompt },
    ],
    max_tokens: type === "novel" ? 1500 : 800,
    temperature: type === "code" ? 0.3 : 0.8,
  });

  // 免费端点会间歇性限流(402/429)，做最多 3 次重试，每次间隔递增
  const MAX_RETRIES = 3;
  let lastErr = "";
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 免费开放端点（如 Pollinations）无需密钥，不发送空 Authorization 头
          ...(OPENAI_KEY ? { Authorization: `Bearer ${OPENAI_KEY}` } : {}),
          // 注意：不要发送 Referer 头 —— 免费端点会据此关联账户并触发预算限制(402)，
          // 保持匿名请求才能稳定使用免费额度
        },
        body,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        lastErr = `模型服务返回 ${res.status}: ${errText.slice(0, 200)}`;
        // 限流类错误才重试
        if (res.status === 402 || res.status === 429 || res.status >= 500) {
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, attempt * 1500));
            continue;
          }
        }
        throw new Error(lastErr);
      }

      const data = await res.json();
      const output = data?.choices?.[0]?.message?.content || "";
      if (!output) throw new Error("模型返回内容为空");
      return { output, engine: OPENAI_MODEL };
    } catch (e) {
      lastErr = (e as Error).message;
      // 网络错误也重试一次
      if (attempt < MAX_RETRIES && !lastErr.includes("返回")) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
        continue;
      }
      throw new Error(lastErr);
    }
  }
  throw new Error(lastErr || "模型调用失败");
}

export async function generate(
  type: string,
  prompt: string
): Promise<GenResult> {
  if (!prompt || !prompt.trim()) throw new Error("请输入内容");
  if (prompt.length > 4000) throw new Error("输入过长（上限 4000 字）");

  if (hasRemoteModel()) {
    try {
      return await callOpenAICompatible(type, prompt);
    } catch (e) {
      // 远程失败时降级到本地引擎，保证功能可用
      console.error("[generate] 远程模型失败，降级离线引擎:", (e as Error).message);
      return { output: localFallback(type, prompt), engine: "fallback-local" };
    }
  }
  return { output: localFallback(type, prompt), engine: "offline-demo" };
}
