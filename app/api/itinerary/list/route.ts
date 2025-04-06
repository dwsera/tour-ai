import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // 修改为正确的路径

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id || session.user.id !== userId) {
    return new Response(
      JSON.stringify({ message: "未登录或无权限访问" }),
      { status: 401 }
    );
  }

  try {
    const itineraries = await prisma.itinerary.findMany({
      where: { userId },
    });

    return new Response(JSON.stringify(itineraries), {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("获取行程列表失败:", error);
    return new Response(
      JSON.stringify({ message: "获取行程列表失败", error: String(error) }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}