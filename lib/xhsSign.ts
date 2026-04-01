import crypto from "crypto";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const S_BOX = [
  108, 71, 200, 252, 102, 41, 228, 110, 198, 188, 243, 68, 179, 10, 96, 53,
  237, 46, 115, 61, 74, 185, 19, 217, 133, 212, 167, 205, 55, 111, 146, 116,
  201, 67, 151, 202, 229, 25, 178, 135, 235, 69, 112, 52, 195, 144, 78, 203,
  0, 83, 33, 231, 181, 140, 43, 175, 142, 248, 148, 145, 162, 187, 76, 88,
  2, 22, 77, 105, 16, 164, 139, 147, 124, 246, 121, 120, 176, 224, 44, 251,
  194, 31, 169, 218, 189, 95, 253, 155, 45, 223, 24, 150, 106, 249, 186, 126,
  23, 209, 191, 250, 92, 4, 90, 51, 21, 193, 196, 226, 183, 3, 210, 34, 114,
  129, 168, 99, 79, 15, 127, 40, 208, 32, 30, 27, 190, 1, 29, 220, 14, 156,
  119, 100, 60, 138, 214, 58, 234, 173, 87, 131, 104, 93, 221, 233, 57, 9,
  240, 75, 117, 177, 215, 152, 98, 232, 89, 174, 122, 38, 85, 8, 206, 94,
  70, 6, 109, 128, 5, 80, 18, 160, 182, 26, 101, 149, 28, 171, 72, 227, 64,
  137, 222, 199, 244, 219, 13, 225, 97, 184, 103, 241, 180, 165, 132, 161, 7,
  107, 39, 73, 170, 17, 130, 192, 236, 66, 118, 134, 211, 81, 153, 207, 20,
  197, 82, 48, 154, 254, 247, 56, 113, 143, 62, 172, 125, 49, 245, 230, 242,
  12, 65, 11, 36, 37, 63, 84, 238, 50, 86, 35, 141, 159, 47, 239, 204, 216,
  91, 59, 123, 54, 157, 158, 166, 255, 42, 163, 213, 136,
];

const XS_B64_ALPHABET = "MfgqrsbcyzPQRStuvC7mn501HIJBo2DEFTKdeNOwxWXYZap89+/A4UVLhijkl63G";

const SIGN_SOURCE = [115, 248, 83, 102, 103, 201, 181, 131, 99, 94, 4, 68, 250, 132, 21];
const SIGN_KEYS = [0, 1, 18, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0];

function intToLeBytes(val: number, length = 4): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < length; i++) {
    bytes.push((val >> (8 * i)) & 0xff);
  }
  return bytes;
}

function rotl32(value: number, shift: number): number {
  value &= 0xffffffff;
  return ((value << shift) | (value >>> (32 - shift))) & 0xffffffff;
}

function xhsCustomHash128(data: Buffer): Buffer {
  const length = data.length;
  const c1 = 1831565813;
  const c2 = 461845907;
  const c3 = 2246822507;
  const c4 = 3266489909;

  let h1 = (c1 ^ length) >>> 0;
  let h2 = (c2 ^ (length << 8)) >>> 0;
  let h3 = (c3 ^ (length << 16)) >>> 0;
  let h4 = (c4 ^ (length << 24)) >>> 0;

  const rounded = length - (length % 8);
  for (let i = 0; i < rounded; i += 8) {
    const k1 = data.readUInt32LE(i);
    const k2 = data.readUInt32LE(i + 4);

    h1 = (h1 + k1) >>> 0;
    h1 = (h1 ^ h3) >>> 0;
    h1 = rotl32(h1, 7);

    h2 = (h2 ^ k1) >>> 0;
    h2 = (h2 + h4) >>> 0;
    h2 = rotl32(h2, 11);

    h3 = (h3 + k2) >>> 0;
    h3 = (h3 ^ h1) >>> 0;
    h3 = rotl32(h3, 13);

    h4 = (h4 ^ k2) >>> 0;
    h4 = (h4 + h2) >>> 0;
    h4 = rotl32(h4, 17);
  }

  const f1 = (h1 ^ length) >>> 0;
  const f2 = (h2 ^ f1) >>> 0;
  const f3 = (h3 + f2) >>> 0;
  const f4 = (h4 ^ f3) >>> 0;

  const r1 = rotl32(f1, 9);
  const r2 = rotl32(f2, 13);
  const r3 = rotl32(f3, 17);
  const r4 = rotl32(f4, 19);

  const o1 = (r1 + r3) >>> 0;
  const o2 = (r2 ^ r4) >>> 0;
  const o3 = (r3 + o1) >>> 0;
  const o4 = (r4 ^ o2) >>> 0;

  const result = Buffer.alloc(16);
  result.writeUInt32LE(o1, 0);
  result.writeUInt32LE(o2, 4);
  result.writeUInt32LE(o3, 8);
  result.writeUInt32LE(o4, 12);
  return result;
}

function rc4Encrypt(data: number[]): number[] {
  const s = [...S_BOX];
  let i = 0;
  let j = 0;
  const res: number[] = [];
  for (const byte of data) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    [s[i], s[j]] = [s[j], s[i]];
    res.push(byte ^ s[(s[i] + s[j]) % 256]);
  }
  return res;
}

function xsBase64(inputBytes: number[]): string {
  const result: string[] = [];
  const length = inputBytes.length;
  for (let i = 0; i < length; i += 3) {
    const b1 = inputBytes[i];
    const b2 = i + 1 < length ? inputBytes[i + 1] : 0;
    const b3 = i + 2 < length ? inputBytes[i + 2] : 0;
    const triple = (b1 << 16) | (b2 << 8) | b3;
    result.push(XS_B64_ALPHABET[(triple >> 18) & 0x3f]);
    result.push(XS_B64_ALPHABET[(triple >> 12) & 0x3f]);
    result.push(i + 1 < length ? XS_B64_ALPHABET[(triple >> 6) & 0x3f] : "=");
    result.push(i + 2 < length ? XS_B64_ALPHABET[triple & 0x3f] : "=");
  }
  return result.join("");
}

function makePayload(
  uri: string,
  a1: string,
  a3: string,
  loadts: number,
  sequence: number,
  newTimestamp: number
): number[] {
  const randomSeed = crypto.randomBytes(4).readUInt32LE(0);
  const seedBytes = intToLeBytes(randomSeed, 4);
  const tsByte0 = seedBytes[0];

  const payload: number[] = [];

  payload.push(121, 104, 96, 41);
  payload.push(...seedBytes);

  const tsBuf = Buffer.alloc(8);
  tsBuf.writeBigUInt64LE(BigInt(newTimestamp));
  payload.push(...Array.from(tsBuf));

  const loadtsBuf = Buffer.alloc(8);
  loadtsBuf.writeBigUInt64LE(BigInt(loadts));
  payload.push(...Array.from(loadtsBuf));

  payload.push(...intToLeBytes(sequence, 4));
  payload.push(...intToLeBytes(1331, 4));

  const uriBytes = Buffer.from(uri, "utf-8");
  payload.push(...intToLeBytes(uriBytes.length, 4));
  const uriMd5 = crypto.createHash("md5").update(uriBytes).digest();
  for (let i = 0; i < 8; i++) {
    payload.push(uriMd5[i] ^ tsByte0);
  }

  const a1Bytes = Buffer.from(a1, "utf-8");
  payload.push(a1Bytes.length);
  payload.push(...Array.from(a1Bytes));

  const appId = Buffer.from("xhs-pc-web", "utf-8");
  payload.push(appId.length);
  payload.push(...Array.from(appId));

  payload.push(1);
  const keys = [tsByte0, ...SIGN_KEYS.slice(1)];
  for (let i = 0; i < SIGN_SOURCE.length; i++) {
    payload.push(SIGN_SOURCE[i] ^ keys[i]);
  }

  payload.push(2, 97, 51, 16);

  const ts8 = Buffer.alloc(8);
  ts8.writeBigUInt64LE(BigInt(newTimestamp));
  const a3Bytes = Buffer.from(a3, "hex");
  const hashInput = Buffer.concat([ts8, a3Bytes]);
  const hash16 = xhsCustomHash128(hashInput);

  for (const b of hash16) {
    payload.push(b ^ tsByte0);
  }

  return payload;
}

function getXysSign(x3sValue: string, x4Type = "object", version = "6.2.0", platform = "Windows"): string {
  const lObj = {
    x0: version,
    x1: "xhs-pc-web",
    x2: platform,
    x3: x3sValue,
    x4: x4Type,
  };
  const jsonStr = JSON.stringify(lObj);
  const stdB64 = Buffer.from(jsonStr, "utf-8").toString("base64");

  const stdTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const customTable = "ZmserbBoHQtNP+wOcza/LpngG8yJq42KWYj0DSfdikx3VT16IlUAFM97hECvuRX5";

  let result = "";
  for (const ch of stdB64) {
    const idx = stdTable.indexOf(ch);
    if (idx >= 0) {
      result += customTable[idx];
    } else {
      result += ch;
    }
  }
  return "XYS_" + result;
}

let signSequence = 1;

export function sign(
  uri: string,
  a1: string,
  a3: string,
  loadts: number
): { xS: string; xT: string } {
  const newTimestamp = Date.now();
  const payload = makePayload(uri, a1, a3, loadts, signSequence, newTimestamp);
  signSequence++;

  const encrypted = rc4Encrypt(payload);
  const sValue = "mns0301_" + xsBase64(encrypted);
  const xysValue = getXysSign(sValue);

  return { xS: sValue, xT: xysValue };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
let _browser: any = null;
let _page: any = null;
let _initPromise: Promise<void> | null = null;

async function initBrowser() {
  if (_browser && _page) return;

  _browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-web-security",
    ],
  });

  _page = await _browser.newPage();

  await _page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
  );

  await _page.goto("https://www.xiaohongshu.com/explore", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  const jsPath = path.join(process.cwd(), "lib", "xhsvm_v2.js");
  const jsContent = fs.readFileSync(jsPath, "utf-8");

  await _page.evaluate((code: string) => {
    const script = document.createElement("script");
    script.textContent = code;
    document.head.appendChild(script);
  }, jsContent);
}

export async function navigateAndExtract(noteUrl: string, cookie: string): Promise<{
  title: string;
  desc: string;
  images: string[];
  type: string;
  noteId: string;
}> {
  if (!_initPromise) {
    _initPromise = initBrowser();
  }
  await _initPromise;

  if (!_page) {
    throw new Error("浏览器页面未初始化");
  }

  const cookiePairs = cookie.split(";").map((s) => s.trim()).filter(Boolean);
  for (const pair of cookiePairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx > 0) {
      const name = pair.substring(0, eqIdx).trim();
      const value = pair.substring(eqIdx + 1).trim();
      await _page.setCookie({
        name,
        value,
        domain: ".xiaohongshu.com",
        path: "/",
      });
    }
  }

  let apiImages: string[] = [];
  let apiType = "normal";

  await _page.goto(noteUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  try {
    await _page.waitForSelector("#detail-title, #detail-desc, .note-container, .content", {
      timeout: 15000,
    });
  } catch {
    await _page.waitForTimeout(3000);
  }

  try {
    const stateData = await _page.evaluate(() => {
      const state = (window as any).__INITIAL_STATE__;
      if (!state) return null;
      const note = state?.note?.noteDetailMap;
      if (!note) return null;
      const firstKey = Object.keys(note)[0];
      const noteData = note[firstKey]?.note;
      if (!noteData) return null;
      const images = noteData.imageList
        ? noteData.imageList.map((img: any) =>
            img.urlDefault || img.urlPre || img.infoList?.[0]?.url || img.url || ""
          ).filter(Boolean)
        : [];
      const type = noteData.type || "normal";
      return { images, type };
    });
    if (stateData) {
      apiImages = stateData.images;
      apiType = stateData.type;
    }
  } catch (e: any) {
    console.log("[XHS INITIAL_STATE] error:", e.message);
  }

  const result = await _page.evaluate(() => {
    const title =
      (document.querySelector("#detail-title") as HTMLElement)?.innerText?.trim() ||
      document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
      "";
    const desc =
      (document.querySelector("#detail-desc") as HTMLElement)?.innerText?.trim() ||
      document.querySelector("meta[property='og:description']")?.getAttribute("content") ||
      "";
    const type =
      document.querySelector(".video-container") ? "video" : "normal";

    const images: string[] = [];
    const imgElements = document.querySelectorAll(".slide-item img, .note-image img, .swiper-slide img, .content img, .note-image-mask img, .image-container img, [class*='image'] img, [class*='slide'] img, [class*='carousel'] img");
    for (const img of imgElements) {
      const src = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("data-original") || "";
      if (src && !src.startsWith("data:") && !images.includes(src)) {
        images.push(src);
      }
    }

    if (images.length === 0) {
      const ogImages = document.querySelectorAll("meta[property='og:image']");
      for (const meta of ogImages) {
        const content = meta.getAttribute("content");
        if (content) images.push(content);
      }
    }

    const noteIdMatch = window.location.pathname.match(/\/(?:explore|note|discovery\/item)\/([a-zA-Z0-9]+)/);
    const noteId = noteIdMatch ? noteIdMatch[1] : "";

    return { title, desc, images, type, noteId };
  });

  if (apiImages.length > 0) {
    result.images = apiImages;
  }
  if (apiType !== "normal") {
    result.type = apiType;
  }

  console.log("[XHS DOM EXTRACT]", JSON.stringify(result).slice(0, 2000));

  if (!result.title && !result.desc) {
    const pageContent = await _page.evaluate(() => {
      return document.body?.innerText?.slice(0, 500) || "";
    });
    console.log("[XHS DOM FALLBACK] page content:", pageContent);
  }

  return result;
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = null;
    _page = null;
    _initPromise = null;
  }
}

export function getPage(): any {
  return _page;
}

export async function signV2(uriData: string, md5: string, cookie: string): Promise<{ xS: string; xT: number }> {
  if (!_initPromise) {
    _initPromise = initBrowser();
  }
  await _initPromise;

  if (!_page) {
    throw new Error("浏览器页面未初始化");
  }

  const cookiePairs = cookie.split(";").map((s) => s.trim()).filter(Boolean);
  for (const pair of cookiePairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx > 0) {
      const name = pair.substring(0, eqIdx).trim();
      const value = pair.substring(eqIdx + 1).trim();
      await _page.setCookie({
        name,
        value,
        domain: ".xiaohongshu.com",
        path: "/",
      });
    }
  }

  const result = await _page.evaluate(
    ([data, md5Val]: [string, string]) => {
      const hasMns = typeof (window as any).mnsv2 === "function";
      const hasGetXs = typeof (window as any).GetXs === "function";
      const cookies = document.cookie;
      let xs = null;
      let err = null;
      try {
        xs = (window as any).GetXs(data, md5Val, md5Val);
      } catch (e: any) {
        err = e.message || String(e);
      }
      return { xs, hasMns, hasGetXs, cookies: cookies.slice(0, 500), err };
    },
    [uriData, md5] as [string, string]
  );

  console.log("[XHS SIGN DEBUG]", JSON.stringify(result).slice(0, 1000));

  const xT = Date.now();
  return { xS: String(result.xs), xT };
}
