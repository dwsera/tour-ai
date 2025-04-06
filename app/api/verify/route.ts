import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// 用于生成验证码
function generateVerificationCode() {
  return Math.random().toString(36).substring(2, 8);
}

export async function POST(req: NextRequest) {
  const { email, username, password, code } = await req.json();

  if (!email || !password || !username || !code) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  try {
    // 1. 验证验证码是否正确
    const existingToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: code,
        },
      },
    });

    if (!existingToken || existingToken.expires < new Date()) {
      return NextResponse.json({ error: "验证码无效或已过期" }, { status: 400 });
    }

    // 2. 删除已验证的验证码记录
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: code,
        },
      },
    });

    // 3. 创建用户，首先需要加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "注册成功！" });

  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
