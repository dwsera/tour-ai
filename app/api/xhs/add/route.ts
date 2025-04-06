import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APIPassword = process.env.APIPassword;

function extractXhsUrl(text: string): string | null {
  const exploreUrlPattern = /(https:\/\/www\.xiaohongshu\.com\/explore\/[a-zA-Z0-9]+[^\s,，。！]*)/;
  let match = text.match(exploreUrlPattern);
  if (match) return match[1].replace(/[,，。！]/g, "");

  const fullUrlPattern = /(https:\/\/www\.xiaohongshu\.com\/discovery\/item\/[a-zA-Z0-9]+[^\s,，。！]*)/;
  match = text.match(fullUrlPattern);
  if (match) return match[1].replace(/[,，。！]/g, "");

  const shortUrlPatternWithProtocol = /(https?:\/\/xhslink\.com\/[a-zA-Z0-9]+[^\s,，。！]*)/;
  match = text.match(shortUrlPatternWithProtocol);
  if (match) return match[1].replace(/[,，。！]/g, "");

  const shortUrlPatternWithoutProtocol = /(xhslink.com\/[a-zA-Z0-9]+[^\s,，。！]*)/;
  match = text.match(shortUrlPatternWithoutProtocol);
  if (match) return `http://${match[1]}`;

  return null;
}

function shouldPerformOcr(body: string): boolean {
  const MAX_LENGTH = 250;
  const itineraryPatterns = [/day \d+/i, /第[一二三四五六七八九十]+天/, /[➡️→]/, /[①②③④⑤⑥⑦⑧⑨⑩]/, /\d+[:：]\s*[^\s]+/];
  const hasItinerary = itineraryPatterns.some((pattern) => pattern.test(body));
  const isLong = body.length > MAX_LENGTH;
  console.log(body.length, "长度", !(hasItinerary || isLong));
  return !(hasItinerary || isLong);
}

interface XhsApiResponse {
  id: string;
  title: string;
  body: string;
  images: string[];
  ocrTexts: string[];
  jsonBody: any; // 可以根据实际 JSON 结构定义更具体的类型
}

export async function POST(req: Request) {
  try {
    const { link, userId, forceOcr } = await req.json();
    if (!link) return NextResponse.json({ error: "请输入小红书分享内容" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "用户未登录" }, { status: 401 });

    const noteCount = await prisma.xhsNote.count({
      where: { userId },
    });
    if (noteCount >= 6) {
      return NextResponse.json(
        { error: "小红书笔记数量已达上限 (6)，请先删除几个再继续解析" },
        { status: 400 }
      );
    }

    const isDirectExploreUrl = /https:\/\/www\.xiaohongshu\.com\/explore\//.test(link.trim());
    let xhsUrl = isDirectExploreUrl ? link.trim().replace(/[,，。！]/g, "") : extractXhsUrl(link);
    if (!xhsUrl) return NextResponse.json({ error: "未找到有效的小红书链接" }, { status: 400 });

    const imageApiResponse = await fetch("https://tools.mgtv100.com/external/v1/pear/xhsImg", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ xhs_url: xhsUrl }).toString(),
    });
    const imageData: any = await imageApiResponse.json();
    if (!imageApiResponse.ok || imageData.status !== "success" || imageData.code !== 200) {
      throw new Error(imageData?.message || "芒果 TV API 请求失败");
    }

    const { title, desc: body, images } = imageData.data;

    const ocrTexts: string[] = [];
    // 根据 forceOcr 决定是否执行 OCR
    const shouldOcr = forceOcr || (images && images.length > 0 && shouldPerformOcr(body));
    if (shouldOcr) {
      for (const imageUrl of images) {
        const ocrApiResponse = await fetch("https://tools.mgtv100.com/external/v1/pear/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ ocr_url: imageUrl }).toString(),
        });
        const ocrData: any = await ocrApiResponse.json();
        ocrTexts.push(ocrData.status === "success" && ocrData.code === 200 ? ocrData.data.ParsedText || "OCR 未能识别文本" : "OCR 失败");
      }
    }

    const combinedOcrText = ocrTexts.join(" ");

    const sparkResponse = await fetch("https://spark-api-open.xf-yun.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${APIPassword}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "generalv3",
        messages: [
          {
            role: "user",
            content: `${body} ${combinedOcrText} 读取内容，提取景点，直接返回以下格式的 JSON 字符串，不要包含任何多余的文本、Markdown 标记或其他内容：
            {
              "city": "城市名称",
              "data": [
                {
                  "day": 1,
                  "places": [
                    {
                      "name": "景点A",
                      "description": "景点A的介绍"
                    }
                  ]
                }
              ]
            }`,
          },
        ],
        max_tokens: 2048,
      }),
    });

    const sparkData: any = await sparkResponse.json();
    if (!sparkResponse.ok) throw new Error(sparkData?.message || "Spark API 请求失败");

    let jsonBody = sparkData.choices[0].message.content;
    console.log("Raw jsonBody:", jsonBody);
    jsonBody = jsonBody.replace(/```json/g, "").replace(/```/g, "").trim();

    const jsonMatch = jsonBody.match(/{[\s\S]*}/);
    if (jsonMatch) {
      jsonBody = jsonMatch[0];
    } else {
      throw new Error("无法从 Spark API 响应中提取有效的 JSON 格式");
    }

    console.log("Cleaned jsonBody:", jsonBody);

    let parsedJsonBody;
    try {
      parsedJsonBody = JSON.parse(jsonBody);
    } catch (parseError: any) {
      console.error("JSON 解析失败:", parseError);
      throw new Error(`JSON 解析失败: ${parseError.message}`);
    }

    const xhsNote = await prisma.xhsNote.create({
      data: {
        userId,
        title: title || "无标题",
        body: body || "无正文",
        images: images || [],
        ocrTexts: ocrTexts.length > 0 ? ocrTexts : undefined,
        jsonBody: parsedJsonBody,
      },
    });

    const responseData: XhsApiResponse = {
      id: xhsNote.id,
      title: xhsNote.title,
      body: xhsNote.body,
      images: xhsNote.images as string[],
      ocrTexts: (xhsNote.ocrTexts as string[]) || [],
      jsonBody,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("服务器错误:", error);
    return NextResponse.json({ error: error.message || "服务器内部错误" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}