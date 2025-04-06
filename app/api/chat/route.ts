import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.some(msg => !msg.role || !msg.content)) {
      return NextResponse.json({ error: "无效的消息格式" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;

    if (!apiKey || !apiUrl) {
      console.error("环境变量未正确配置");
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    const systemMessage = {
      role: "system",
      content: `你是一个专业的旅行规划师，专门为用户提供旅行建议。请判断用户输入是否与旅行相关。
                如果是，则提供详细的旅行建议，包括推荐景点、行程规划、住宿、交通等。
                如果不是，回答：'抱歉，我只能回答与旅行相关的问题。'`,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // ⏳ 20s 超时

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        messages: [systemMessage, ...messages],
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.7"),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API 请求失败，错误详情:", errorText);
      return NextResponse.json({ error: `API 请求失败: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("AI API 返回数据:", data); // ✅ 确保格式正确

    const aiResponse = data.choices?.[0]?.message?.content || "AI 无法生成回复";

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("AI API 请求超时");
      return NextResponse.json({ error: "AI 响应超时，请稍后再试。" }, { status: 500 });
    }

    console.error("AI API 请求错误:", error.message);
    return NextResponse.json({ error: "AI 响应失败，请稍后再试。" }, { status: 500 });
  }
}
