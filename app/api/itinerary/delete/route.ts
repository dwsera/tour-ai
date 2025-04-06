import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // 修改为正确的路径

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  const { id } = await req.json();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new Response(
      JSON.stringify({ message: "未登录或无权限访问" }),
      { status: 401 }
    );
  }

  if (!id) {
    return new Response(
      JSON.stringify({ message: "缺少行程ID" }),
      { status: 400 }
    );
  }

  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary || itinerary.userId !== session.user.id) {
      return new Response(
        JSON.stringify({ message: "行程不存在或无权限删除" }),
        { status: 403 }
      );
    }

    await prisma.itinerary.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "行程删除成功" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("删除行程失败:", error);
    return new Response(
      JSON.stringify({ message: "删除行程失败", error: String(error) }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}