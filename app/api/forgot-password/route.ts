import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "请输入邮箱" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "该邮箱未注册" }, { status: 404 });
    }

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: `reset:${email}`,
        expires: { lt: new Date() },
      },
    });

    const code = randomBytes(3).toString("hex");
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    console.log("[FORGOT PASSWORD] 验证码:", code, "邮箱:", email);

    await prisma.verificationToken.create({
      data: { identifier: `reset:${email}`, token: code, expires },
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "no-reply@1367277.xyz",
      to: email,
      subject: "重置密码验证码",
      html: `<p>您正在重置密码，验证码是：<strong>${code}</strong>，10分钟内有效。</p>`,
    });

    return NextResponse.json({ message: "验证码已发送" });
  } catch (error: any) {
    console.error("[FORGOT PASSWORD] 错误:", error.message);
    return NextResponse.json({ error: "发送失败，请稍后重试" }, { status: 500 });
  }
}
