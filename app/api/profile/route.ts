import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  // 把 session 提到最外层，全局都能访问
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, username: true, email: true, bio: true },
      });
    } catch (dbError: any) {
      console.error("[PROFILE GET] 数据库查询失败:", dbError.message);
      return NextResponse.json(
        { username: session.user.username, email: session.user.email, bio: null },
        { status: 200 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[PROFILE GET] 错误:", error.message);
    // 修复：catch 里安全访问 session
    return NextResponse.json(
      { 
        username: session?.user?.username ?? null, 
        email: session?.user?.email ?? null, 
        bio: null 
      },
      { status: 200 }
    );
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

    const body = await req.json();
    const { action } = body;

    if (action === "changePassword") {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "请输入当前密码和新密码" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "新密码至少6位" }, { status: 400 });
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { password: true },
        });

        if (!user) {
          return NextResponse.json({ error: "用户不存在" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
          where: { id: session.user.id },
          data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true });
      } catch (dbError: any) {
        console.error("[PROFILE PUT] 修改密码失败:", dbError.message);
        return NextResponse.json({ error: "数据库连接失败，请检查网络" }, { status: 503 });
      }
    }

    const { username, bio } = body;
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "没有需要更新的字段" }, { status: 400 });
    }

    if (updateData.username && updateData.username.trim().length < 2) {
      return NextResponse.json({ error: "用户名至少2个字符" }, { status: 400 });
    }

    let user;
    try {
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: { id: true, username: true, email: true, bio: true },
      });
    } catch (dbError: any) {
      if (dbError.code === "P2002") {
        return NextResponse.json({ error: "该用户名已被使用" }, { status: 400 });
      }
      console.error("[PROFILE PUT] 数据库更新失败:", dbError.message);
      return NextResponse.json({ error: "数据库连接失败，请检查网络" }, { status: 503 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[PROFILE PUT] 错误:", error.message);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}