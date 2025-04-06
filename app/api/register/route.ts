import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, username, password } = await req.json();

  // 检查必填字段
  if (!email || !username || !password) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  try {
    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    // 如果邮箱或用户名已存在，返回对应错误信息
    if (existingEmail) {
      return NextResponse.json({ error: "邮箱已存在" }, { status: 409 });
    }

    if (existingUsername) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }

    // 加密用户密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 删除过期的验证码
    await prisma.verificationToken.deleteMany({
      where: {
        expires: { lt: new Date() }, // 删除过期的验证码
      },
    });

    // 生成验证码
    const verificationCode = randomBytes(3).toString("hex"); // 生成 6 位验证码
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 验证码有效期10分钟
    console.log("收到请求:", { email, username, password });
    console.log("生成的验证码:", verificationCode);

    // 保存验证码到数据库
    await prisma.verificationToken.create({
      data: { identifier: email, token: verificationCode, expires },
    });

    // 使用 Resend 发送验证码邮件
    const emailHtml = `<p>您的验证码是：<strong>${verificationCode}</strong></p>`;
    const sendResult = await resend.emails.send({
      from: "no-reply@1367277.xyz",
      to: email,
      subject: "注册验证码",
      html: emailHtml,
    });
    console.log("邮件发送结果:", sendResult);

    return NextResponse.json({ message: "验证码已发送" }, { status: 200 });
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
