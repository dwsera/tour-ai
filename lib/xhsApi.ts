import axios from "axios";
import { navigateAndExtract } from "./xhsSign";

export interface XhsNoteData {
  title: string;
  body: string;
  images: string[];
  noteId: string;
  type: string;
}

const XHS_COOKIE = process.env.XHS_COOKIE || "";

function extractXhsUrl(text: string): string | null {
  const patterns = [
    /(https?:\/\/www\.xiaohongshu\.com\/explore\/[^\s,，。！]*)/,
    /(https?:\/\/www\.xiaohongshu\.com\/discovery\/item\/[^\s,，。！]*)/,
    /(https?:\/\/www\.xiaohongshu\.com\/note\/[^\s,，。！]*)/,
    /(https?:\/\/xhslink\.com\/[^\s,，。！]*)/,
    /(xhslink\.com\/[^\s,，。！]*)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let url = match[1].replace(/[,，。！\s]/g, "");
      if (url.startsWith("xhslink.com")) {
        url = "https://" + url;
      }
      return url;
    }
  }
  return null;
}

export async function resolveShortUrl(url: string): Promise<string> {
  try {
    const res = await axios.head(url, {
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    return (res.request as any).res?.responseUrl || url;
  } catch (err: any) {
    if (err.response?.headers?.location) {
      return err.response.headers.location;
    }
    return url;
  }
}

export function extractNoteId(url: string): string | null {
  const patterns = [
    /\/note\/([a-zA-Z0-9]{12,24})/,
    /\/explore\/([a-zA-Z0-9]{12,24})/,
    /\/discovery\/item\/([a-zA-Z0-9]{12,24})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function getNoteContent(link: string): Promise<XhsNoteData> {
  const xhsUrl = extractXhsUrl(link);
  if (!xhsUrl) {
    throw new Error("未找到有效的小红书链接");
  }

  let realUrl = xhsUrl;
  if (xhsUrl.includes("xhslink.com")) {
    realUrl = await resolveShortUrl(xhsUrl);
  }

  if (!XHS_COOKIE) {
    throw new Error("未配置 XHS_COOKIE 环境变量，请在 .env.local 中设置");
  }

  const result = await navigateAndExtract(realUrl, XHS_COOKIE);

  if (!result.title && !result.desc) {
    throw new Error("笔记不存在或被风控: 无法获取笔记内容，可能需要更新 cookie");
  }

  return {
    title: result.title,
    body: result.desc,
    images: result.images,
    noteId: result.noteId,
    type: result.type,
  };
}
