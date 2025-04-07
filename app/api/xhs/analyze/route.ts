import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APIPassword = process.env.APIPassword;

export async function POST(req: Request) {
  try {
    const { title, body, images, ocrTexts, userId } = await req.json();

    const combinedOcrText = ocrTexts?.join(" ") || "";

    const sparkRes = await fetch("https://spark-api-open.xf-yun.com/v1/chat/completions", {
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
            content: `${body} ${combinedOcrText} 读取内容，提取景点，整理后，直接返回以下格式的 JSON 字符串：
            {
              "city": "城市名称",
              "data": [
                {
                  "day": 1,
                  "places": [
                    {
                      "name": "景点A",
                      "description": "景点A的介绍"
                    },...
                  ]
                },...
              ]
            }`,
          },
        ],
        max_tokens: 2048,
      }),
    });

    const sparkData = await sparkRes.json();
    let jsonBody = sparkData.choices?.[0]?.message?.content || "";

    jsonBody = jsonBody.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = jsonBody.match(/{[\s\S]*}/);
    if (!match) throw new Error("无效的 JSON 响应");

    const parsedJson = JSON.parse(match[0]);

    const noteCount = await prisma.xhsNote.count({ where: { userId } });
    if (noteCount >= 6) {
      return NextResponse.json({ error: "小红书笔记数量已达上限 (6)，请先删除几个再继续解析" }, { status: 400 });
    }

    const xhsNote = await prisma.xhsNote.create({
      data: {
        userId,
        title,
        body,
        images,
        ocrTexts,
        jsonBody: parsedJson,
      },
    });

    return NextResponse.json(xhsNote, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
