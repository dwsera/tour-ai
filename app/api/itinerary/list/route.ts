import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user.id !== userId) {
      return new Response(
        JSON.stringify({ error: "未登录或无权限访问" }),
        { status: 401 }
      );
    }

    let itineraries;
    try {
      itineraries = await prisma.itinerary.findMany({
        where: { userId },
      });
    } catch (dbError: any) {
      console.error("[ITINERARY LIST] 数据库查询失败:", dbError.message);
      return new Response(
        JSON.stringify({ error: "数据库连接失败", data: [] }),
        { status: 503 }
      );
    }

    return new Response(JSON.stringify(itineraries), {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[ITINERARY LIST] 未知错误:", error);
    return new Response(
      JSON.stringify({ error: error.message || "获取行程列表失败", data: [] }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}