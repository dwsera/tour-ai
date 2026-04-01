import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const diaries = await prisma.travelDiary.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(diaries);
  } catch (error: any) {
    console.error("[DIARY GET]", error.message);
    return NextResponse.json({ error: "获取日记失败" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { title, content, city, date, mood } = await req.json();

    if (!title?.trim() || !content?.trim() || !city?.trim() || !date) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    const diary = await prisma.travelDiary.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        content: content.trim(),
        city: city.trim(),
        date: new Date(date),
        mood: mood || "开心",
      },
    });

    return NextResponse.json(diary, { status: 201 });
  } catch (error: any) {
    console.error("[DIARY POST]", error.message);
    return NextResponse.json({ error: "创建日记失败" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id, title, content, city, date, mood } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "缺少日记ID" }, { status: 400 });
    }

    const existing = await prisma.travelDiary.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "日记不存在" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (date !== undefined) updateData.date = new Date(date);
    if (mood !== undefined) updateData.mood = mood;

    const diary = await prisma.travelDiary.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(diary);
  } catch (error: any) {
    console.error("[DIARY PUT]", error.message);
    return NextResponse.json({ error: "更新日记失败" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少日记ID" }, { status: 400 });
    }

    const existing = await prisma.travelDiary.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "日记不存在" }, { status: 404 });
    }

    await prisma.travelDiary.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DIARY DELETE]", error.message);
    return NextResponse.json({ error: "删除日记失败" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
