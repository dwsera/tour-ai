import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface XhsNoteResponse {
  id: string;
  title: string;
  body: string;
  images: string[];
  ocrTexts: string[] | null;
  jsonBody: any;
  createdAt: string;
  updatedAt: string | null;
}
//获取某个用户（userId）的所有小红书笔记列表，按照创建时间降序排列。
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "用户未登录" }, { status: 401 });
    }

    const xhsNotes = await prisma.xhsNote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        images: true,
        ocrTexts: true,
        jsonBody: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const responseData: XhsNoteResponse[] = xhsNotes.map((note) => ({
      id: note.id,
      title: note.title,
      body: note.body,
      images: note.images as string[],
      ocrTexts: note.ocrTexts as string[] | null,
      jsonBody: note.jsonBody,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt?.toISOString() || null,
    }));

    return NextResponse.json(responseData, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    console.error("获取小红书笔记列表时出错:", error);
    return NextResponse.json({ error: error.message || "服务器内部错误" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}