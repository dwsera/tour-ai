import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    console.log("[ITINERARY DELETE] 尝试删除行程, id:", id);

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response(
        JSON.stringify({ error: "未登录或无权限访问" }),
        { status: 401 }
      );
    }

    if (!id) {
      return new Response(
        JSON.stringify({ error: "缺少行程ID" }),
        { status: 400 }
      );
    }

    let itinerary;
    try {
      itinerary = await prisma.itinerary.findUnique({
        where: { id },
      });
    } catch (dbError: any) {
      console.error("[ITINERARY DELETE] 数据库查询失败:", dbError.message);
      return new Response(
        JSON.stringify({ error: "数据库连接失败，请检查网络或稍后重试" }),
        { status: 503 }
      );
    }

    if (!itinerary || itinerary.userId !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "行程不存在或无权限删除" }),
        { status: 403 }
      );
    }

    try {
      await prisma.itinerary.delete({
        where: { id },
      });
    } catch (dbError: any) {
      console.error("[ITINERARY DELETE] 数据库删除失败:", dbError.message);
      return new Response(
        JSON.stringify({ error: "数据库连接失败，请检查网络或稍后重试" }),
        { status: 503 }
      );
    }

    console.log("[ITINERARY DELETE] 删除成功, id:", id);
    return new Response(
      JSON.stringify({ message: "行程删除成功" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[ITINERARY DELETE] 未知错误:", error);
    return new Response(
      JSON.stringify({ error: error.message || "删除行程失败" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}