import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json();

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "新密码至少6位" }, { status: 400 });
  }

  try {
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: `reset:${email}`,
        token: code,
        expires: { gt: new Date() },
      },
    });

    if (!token) {
      return NextResponse.json({ error: "验证码无效或已过期" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    return NextResponse.json({ message: "密码重置成功" });
  } catch (error: any) {
    console.error("[RESET PASSWORD] 错误:", error.message);
    return NextResponse.json({ error: "重置失败，请稍后重试" }, { status: 500 });
  }
}
