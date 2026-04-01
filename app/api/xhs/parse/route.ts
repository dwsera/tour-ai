import { NextResponse } from "next/server";
import { getNoteContent } from "@/lib/xhsApi";

export const runtime = "nodejs";

const BAIDU_OCR_API_KEY = process.env.BAIDU_OCR_API_KEY;
const BAIDU_OCR_SECRET_KEY = process.env.BAIDU_OCR_SECRET_KEY;

let cachedAccessToken: string | null = null;
let tokenExpireTime = 0;

async function getBaiduAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpireTime) {
    return cachedAccessToken;
  }

  const res = await fetch(
    "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials" +
      `&client_id=${BAIDU_OCR_API_KEY}` +
      `&client_secret=${BAIDU_OCR_SECRET_KEY}`,
    { method: "POST" }
  );

  const data: any = await res.json();
  if (!data.access_token) {
    throw new Error("百度OCR获取access_token失败: " + (data.error_description || data.error || "未知错误"));
  }

  cachedAccessToken = data.access_token;
  tokenExpireTime = Date.now() + (data.expires_in - 600) * 1000;
  return cachedAccessToken;
}

async function ocrImage(imageUrl: string): Promise<string> {
  try {
    const accessToken = await getBaiduAccessToken();
    const res = await fetch(
      `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `url=${encodeURIComponent(imageUrl)}&detect_direction=true&paragraph=true`,
      }
    );

    const data: any = await res.json();
    if (data.words_result && data.words_result.length > 0) {
      return data.words_result.map((item: any) => item.words).join("\n");
    }
    return "";
  } catch (err: any) {
    console.error("[BAIDU OCR] 识别失败:", err.message);
    return "";
  }
}

function needsOcr(body: string): boolean {
  if (!body || body.trim().length < 30) return true;

  const itineraryPatterns = [
    /day\s*\d+/i,
    /第[一二三四五六七八九十\d]+天/,
    /[➡️→⇨]/,
    /[①②③④⑤⑥⑦⑧⑨⑩]/,
    /\d+[.、)\]）]\s*[^\s]{2,}/,
    /景点|路线|行程|攻略|打卡|推荐|必去/,
  ];

  const matchCount = itineraryPatterns.filter((p) => p.test(body)).length;
  if (matchCount >= 3) return false;

  const placeMentions = (body.match(/[\u4e00-\u9fa5]{2,6}(?:景区|公园|古镇|街区|广场|寺庙|博物馆|美术馆|商业街|夜市|海滩|山峰|湖泊|瀑布|古城|塔|桥|寺|庙|楼|阁)/g) || []).length;
  if (placeMentions >= 3) return false;

  return true;
}

export async function POST(req: Request) {
  try {
    const { link, forceOcr } = await req.json();
    if (!link) return NextResponse.json({ error: "请输入小红书分享内容" }, { status: 400 });

    if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
      console.error("[XHS PARSE] 百度OCR密钥未配置");
    }

    const noteData = await getNoteContent(link);
    const { title, body, images } = noteData;

    const ocrTexts: string[] = [];
    const shouldOcr = Boolean(forceOcr) || needsOcr(body);

    if (shouldOcr && images?.length > 0 && BAIDU_OCR_API_KEY && BAIDU_OCR_SECRET_KEY) {
      const uniqueImages = Array.from(new Set(images));
      const ocrImages = forceOcr ? uniqueImages : uniqueImages.slice(0, 9);
      const batchSize = 3;

      for (let i = 0; i < ocrImages.length; i += batchSize) {
        const batch = ocrImages.slice(i, i + batchSize);
        const results = await Promise.all(batch.map((url) => ocrImage(url)));
        results.forEach((text) => {
          if (text && text.trim().length > 2) {
            ocrTexts.push(text.trim());
          }
        });
      }
    }

    return NextResponse.json(
      { title, body, images, ocrTexts },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("解析错误", err);
    return NextResponse.json(
      { error: err.message || "解析错误" },
      { status: 500 }
    );
  }
}
