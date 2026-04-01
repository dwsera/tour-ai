import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }

    console.log("[CONTACT] 收到反馈:", { name, email, subject, message });

    await resend.emails.send({
      from: "no-reply@1367277.xyz",
      to: "2679868038@qq.com",
      subject: `[旅游AI反馈] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">新的用户反馈</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 80px;">姓名</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">邮箱</td>
              <td style="padding: 8px 0; color: #1f2937;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">主题</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${subject}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[CONTACT] 错误:", error.message);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}
