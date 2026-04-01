import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.some(msg => !msg.role || !msg.content)) {
      return NextResponse.json({ error: "无效的消息格式" }, { status: 400 });
    }

    if (messages.length > 50) {
      return NextResponse.json({ error: "消息数量超出限制" }, { status: 400 });
    }

    const apiKey = process.env.QWEN_API_KEY;

    if (!apiKey) {
      console.error("千问API密钥未配置");
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    const systemMessage = {
      role: "system",
      content: `你是一位资深的旅行规划师，拥有丰富的全球旅游经验。你熟悉各国的历史文化、自然风光、美食特色和现代地标。你的任务是为用户提供个性化、实用且有趣的旅行建议。

回答要求：
1. 旅行相关问题：提供详细的旅行建议，包括：
   - 景点推荐（必须是当地最热门、最知名的景点，参考各大旅游平台热门榜单，如携程、马蜂窝、大众点评等）
   - 行程规划（考虑地理位置、时间安排、路线合理性）
   - 住宿建议（不同预算和偏好，推荐当地知名酒店）
   - 交通方式（性价比高、便捷）
   - 美食推荐（必须是当地最有名、最受欢迎的餐厅，参考大众点评、美团等平台的高分热门餐厅）
   - 实用小贴士（文化礼仪、安全事项、最佳游览时间）

2. 非旅行问题：礼貌拒绝，说明只能回答旅行相关问题

3. 回答风格：
   - 专业友好，信息准确
   - 结构清晰，使用emoji图标增强可读性
   - 根据用户需求调整详细程度
   - 提供具体、可操作的建议
   - 景点名称要具体，推荐当地必去的热门景点，如故宫、长城、西湖、外滩等
   - 餐厅推荐要当地知名、口碑好、人气旺的餐厅，避免推荐小众、冷门的地方
   - 优先推荐游客必打卡的经典景点和当地人常去的网红餐厅`,
    };

    const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-max",
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("千问API请求失败，错误详情:", errorText);
      return NextResponse.json({ error: `API请求失败: ${errorText}` }, { status: response.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("无法获取响应流");
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const data = trimmed.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                break;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // JSON 不完整，等待下一个 chunk 拼接
              }
            }
          }
        } catch (error: any) {
          if (error.name === "TimeoutError") {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } else {
            console.error("流式响应错误:", error);
            controller.error(error);
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("千问API请求错误:", error.message);
    return NextResponse.json({ error: "AI响应失败，请稍后再试。" }, { status: 500 });
  }
}
