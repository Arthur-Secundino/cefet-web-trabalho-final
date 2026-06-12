// Envio de emails. Sem SMTP configurado no .env, opera em "modo dev":
// registra no console e devolve false (quem chamou decide o fallback).
import nodemailer from "nodemailer";

let transporte = null;
if (process.env.SMTP_HOST) {
    transporte = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
}

export async function enviaEmail(para, assunto, html) {
    if (!transporte) {
        console.log(`[email-dev] Para: ${para} | Assunto: ${assunto}\n${html}\n`);
        return false;
    }
    await transporte.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: para,
        subject: assunto,
        html,
    });
    return true;
}