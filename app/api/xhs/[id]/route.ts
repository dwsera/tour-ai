import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 定义响应数据接口
interface XhsApiResponse {
  id: string;
  title: string;
  body: string;
  images: string[];
  ocrTexts: string[] | null;
  jsonBody: any; // 可以根据实际 JSON 结构定义更具体的类型
  createdAt: string;
  updatedAt: string | null;
}

// GET 请求：获取特定 XhsNote 数据
// export async function GET(req: Request, { params }: { params: { id: any } }) {
//   try {
//     const { id } = params;
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: any }> }
) {
  try {
    const { id } = await params;
    // 从数据库中查找 XhsNote
    const xhsNote = await prisma.xhsNote.findUnique({
      where: { id },
    });

    if (!xhsNote) {
      return NextResponse.json({ error: "小红书笔记不存在" }, { status: 404 });
    }

    // 构造响应数据
    const responseData: XhsApiResponse = {
      id: xhsNote.id,
      title: xhsNote.title,
      body: xhsNote.body,
      images: xhsNote.images as string[],
      ocrTexts: xhsNote.ocrTexts as string[] | null,
      jsonBody: xhsNote.jsonBody,
      createdAt: xhsNote.createdAt.toISOString(),
      updatedAt: xhsNote.updatedAt?.toISOString() || null,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("获取小红书笔记时出错:", error);
    return NextResponse.json(
      { error: error.message || "服务器内部错误" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE 请求：删除特定 XhsNote 数据
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查笔记是否存在
    const xhsNote = await prisma.xhsNote.findUnique({
      where: { id },
    });

    if (!xhsNote) {
      return NextResponse.json({ error: "小红书笔记不存在" }, { status: 404 });
    }

    // 删除笔记
    await prisma.xhsNote.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "小红书笔记已成功删除" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("删除小红书笔记时出错:", error);
    return NextResponse.json(
      { error: error.message || "服务器内部错误" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
