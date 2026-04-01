import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const QWEN_API_KEY = process.env.QWEN_API_KEY;

export async function POST(req: Request) {
  try {
    const { title, body, images, ocrTexts, userId } = await req.json();

    if (!QWEN_API_KEY) {
      return NextResponse.json({ error: "千问API密钥未配置" }, { status: 500 });
    }

    const combinedOcrText = ocrTexts?.join("\n") || "";

    const systemPrompt = `你是一个旅游行程解析助手。用户会提供小红书笔记的标题、正文和OCR识别的图片文字。
请从中提取旅游行程信息，按天整理景点，返回严格的JSON格式。

重要规则：
1. city：提取目的地城市名称
2. summary：用30字以内总结这趟旅行（一句话亮点）
3. data：按天分组，每天包含 places 数组
4. 每个景点包含以下字段：
   - name：景点名称
   - description：简短介绍，25字以内
   - type：景点类型，从以下选择一个：["观光","美食","购物","文化","自然","休闲","住宿","交通"]
   - duration：建议游玩时长，如"1小时"、"2-3小时"、"半天"
   - tips：游玩小贴士，15字以内（如"建议早上去人少"、"需提前预约"等），如果没有就写null
5. 如果内容没有明确分天，根据景点数量合理分配天数（每天3-6个景点）
6. 只提取实际提到的景点/地点，不要编造
7. 如果正文中有Day 1、第X天等明确标记，严格按其分组
8. 直接返回JSON，不要加任何解释文字

关于图片OCR文字的处理：
- 很多小红书笔记的行程路线画在图片里（如手绘地图、流程图、路线图），OCR文字是提取行程的关键来源
- 如果OCR文字中包含景点名称、箭头(→/➡️)、序号(①②③/1.2.3.)、路线描述等，优先从中提取行程
- OCR文字可能包含乱码或识别错误，请智能纠正（如"宽窄卷子"→"宽窄巷子"）
- 正文和OCR文字可能包含重复信息，去重后合并提取
- 如果OCR文字中有明确的路线顺序（如A→B→C），严格按照该顺序排列景点

示例格式：
{
  "city": "成都",
  "summary": "成都一日暴走，打卡9大热门景点",
  "data": [
    {
      "day": 1,
      "places": [
        {
          "name": "宽窄巷子",
          "description": "成都三大历史文化保护区之一",
          "type": "文化",
          "duration": "2-3小时",
          "tips": "建议早上去人少"
        }
      ]
    }
  ]
}`;

    const userContent = `标题：${title}\n正文：${body}${combinedOcrText ? `\n图片OCR文字：${combinedOcrText}` : ""}`;

    const response = await fetch(
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${QWEN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3.5-plus",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`千问API请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let jsonBody = data.choices?.[0]?.message?.content || "";

    jsonBody = jsonBody.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = jsonBody.match(/{[\s\S]*}/);
    if (!match) throw new Error("AI返回的数据格式无效，无法解析为JSON");

    const parsedJson = JSON.parse(match[0]);

    if (!parsedJson.city || !Array.isArray(parsedJson.data)) {
      throw new Error("AI返回的数据缺少必要字段（city或data）");
    }

    let savedNote: any = null;

    try {
      const noteCount = await prisma.xhsNote.count({ where: { userId } });
      if (noteCount >= 6) {
        return NextResponse.json({ error: "小红书笔记数量已达上限 (6)，请先删除几个再继续解析" }, { status: 400 });
      }

      savedNote = await prisma.xhsNote.create({
        data: {
          userId,
          title,
          body,
          images,
          ocrTexts,
          jsonBody: parsedJson,
        },
      });
    } catch (dbError: any) {
      console.error("[XHS ANALYZE] 数据库保存失败，仅返回解析结果:", dbError.message);
    }

    const result = savedNote || {
      id: `temp_${Date.now()}`,
      title,
      body,
      images,
      ocrTexts,
      jsonBody: parsedJson,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[XHS ANALYZE ERROR]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
