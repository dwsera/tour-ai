import { NextResponse } from "next/server";
import fetch from "node-fetch";

function extractXhsUrl(text: string): string | null {
  const patterns = [
    /(https:\/\/www\.xiaohongshu\.com\/explore\/[a-zA-Z0-9]+[^\s,，。！]*)/,
    /(https:\/\/www\.xiaohongshu\.com\/discovery\/item\/[a-zA-Z0-9]+[^\s,，。！]*)/,
    /(https?:\/\/xhslink\.com\/[a-zA-Z0-9]+[^\s,，。！]*)/,
    /(xhslink.com\/[a-zA-Z0-9]+[^\s,，。！]*)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]
        .replace(/[,，。！]/g, "")
        .replace(/^xhslink\.com/, "http://xhslink.com");
    }
  }
  return null;
}

function shouldPerformOcr(body: string): boolean {
  const MAX_LENGTH = 250;
  const itineraryPatterns = [
    /day \d+/i,
    /第[一二三四五六七八九十]+天/,
    /[➡️→]/,
    /[①②③④⑤⑥⑦⑧⑨⑩]/,
    /\d+[:：]\s*[^\s]+/,
  ];
  console.log(
    body.length,
    "changdu",
    !(body.length > MAX_LENGTH || itineraryPatterns.some((p) => p.test(body)))
  );

  return !(
    body.length > MAX_LENGTH || itineraryPatterns.some((p) => p.test(body))
  );
}

export async function POST(req: Request) {
  try {
    const { link, forceOcr } = await req.json();

    const xhsUrl = extractXhsUrl(link);
    if (!xhsUrl) {
      return NextResponse.json(
        { error: "未找到有效的小红书链接" },
        { status: 400 }
      );
    }

    const imageRes = await fetch(
      "https://tools.mgtv100.com/external/v1/pear/xhsImg",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ xhs_url: xhsUrl }),
      }
    );

    const imgData: any = await imageRes.json();
    if (!imageRes.ok || imgData.status !== "success") {
      throw new Error(imgData?.message || "获取笔记失败");
    }

    const { title, desc: body, images } = imgData.data;
    const shouldOcr = forceOcr || (images?.length && shouldPerformOcr(body));
    const ocrTexts: string[] = [];

    if (shouldOcr && images?.length) {
      const ocrLimit = images.slice(0, 5); // 最多识别前五张图
      const ocrResults = await Promise.all(
        ocrLimit.map((url: string) =>
          fetch("https://tools.mgtv100.com/external/v1/pear/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ ocr_url: url }),
          }).then((res) => res.json())
        )
      );

      ocrTexts.push(
        ...ocrResults.map((ocrData: any) =>
          ocrData.status === "success" && ocrData.code === 200
            ? ocrData.data.ParsedText || "OCR 未能识别文本"
            : "OCR 失败"
        )
      );
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
