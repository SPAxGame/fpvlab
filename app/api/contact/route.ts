import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const OVH_HOST = process.env.SMTP_HOST || "ssl0.ovh.net";
const OVH_PORT = parseInt(process.env.SMTP_PORT || "465");
const OVH_SECURE = OVH_PORT === 465;
const OVH_USER = process.env.SMTP_USER || "mail@fpvlab.pl";
const OVH_PASS = process.env.SMTP_PASS || "";

const TO_EMAIL = process.env.MAIL_TO || "beniugalaxy@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name: string; email: string; subject: string; message: string };
    const { name, email, subject, message } = body;

    // basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Wypełnij wszystkie pola." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: OVH_HOST,
      port: OVH_PORT,
      secure: OVH_SECURE,
      auth: {
        user: OVH_USER,
        pass: OVH_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#f97316;">Nowa wiadomość z FPV LAB</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;font-weight:700;color:#555;">Imię:</td><td style="padding:8px;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px;font-weight:700;color:#555;">E-mail:</td><td style="padding:8px;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:8px;font-weight:700;color:#555;">Temat:</td><td style="padding:8px;">${escapeHtml(subject)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
        <p style="font-size:14px;line-height:1.6;color:#333;">${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
        <p style="font-size:12px;color:#999;">Wiadomość wysłana z formularza kontaktowego fpvlab.pl</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FPV LAB Kontakt" <${OVH_USER}>`,
      replyTo: email,
      to: TO_EMAIL,
      subject: `[FPV LAB] ${subject}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd wysyłki maila:", error);
    return NextResponse.json(
      { error: "Nie udało się wysłać wiadomości. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
