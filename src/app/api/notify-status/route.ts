import { NextResponse } from "next/server";
import { Resend } from "resend";

import { resolveRoleFromEmail } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Avisa o aluno por e-mail quando o professor aprova ou rejeita um dos
 * certificados dele — fecha o loop que hoje depende do aluno entrar no site
 * pra descobrir que algo mudou. Reaproveita o mesmo Resend já usado em
 * "enviar relatório" (mesma limitação de sandbox: sem domínio verificado no
 * Resend, só é possível entregar pro e-mail da própria conta Resend — os
 * demais destinatários retornam erro aqui, o que é esperado nesta fase).
 *
 * Diferente de "enviar relatório", aqui o destinatário nunca vem do corpo
 * da requisição controlado pelo cliente: quem chama essa rota (a página do
 * link compartilhável) já resolveu o aluno pelo próprio banco antes de
 * disparar a chamada, e quem pode chamar é sempre validado aqui como
 * professor a partir do e-mail da sessão — não de um campo enviado pelo
 * cliente.
 *
 * É "melhor esforço": uma falha de envio nunca deve impedir a
 * aprovação/rejeição em si (que já foi salva no banco antes desta chamada).
 */
export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY não configurada no servidor." },
      { status: 500 },
    );
  }

  // Assim como em send-report: fora do matcher do middleware, autenticação
  // checada diretamente aqui.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }

  const actingEmail = (
    (user.user_metadata?.email as string | undefined) ??
    user.email ??
    ""
  ).toLowerCase();

  if (!actingEmail || resolveRoleFromEmail(actingEmail) !== "professor") {
    return NextResponse.json(
      { error: "Só professores podem disparar essa notificação." },
      { status: 403 },
    );
  }

  let body: {
    studentEmail?: string;
    certificateTitle?: string;
    status?: string;
    reason?: string;
  };
  try {
    body = await request.json();
  } catch (err) {
    console.error("[notify-status] Corpo da requisição inválido:", err);
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { studentEmail, certificateTitle, status, reason } = body;

  if (
    typeof studentEmail !== "string" ||
    !studentEmail ||
    typeof certificateTitle !== "string" ||
    !certificateTitle ||
    (status !== "aprovado" && status !== "rejeitado")
  ) {
    return NextResponse.json({ error: "Dados incompletos para notificar o aluno." }, { status: 400 });
  }

  const isApproved = status === "aprovado";
  const safeCertificateTitle = escapeHtml(certificateTitle);
  const safeReason = typeof reason === "string" && reason.trim() ? escapeHtml(reason.trim()) : null;

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "CertiBox <onboarding@resend.dev>",
      to: studentEmail,
      subject: isApproved
        ? `CertiBox — certificado aprovado: ${certificateTitle}`
        : `CertiBox — certificado rejeitado: ${certificateTitle}`,
      html: `
        <p>Olá,</p>
        <p>
          Seu certificado <strong>${safeCertificateTitle}</strong> foi
          ${isApproved ? "<strong>aprovado</strong>" : "<strong>rejeitado</strong>"} pelo
          professor responsável no CertiBox.
        </p>
        ${safeReason ? `<p><strong>Motivo da rejeição:</strong> ${safeReason}</p>` : ""}
        <p>Acesse o CertiBox para ver os detalhes e o histórico completo.</p>
        <p>Atenciosamente,<br />CertiBox — UFSCar</p>
      `,
    });

    if (error) {
      console.error("[notify-status] Falha ao enviar e-mail via Resend:", error.message);
      return NextResponse.json({ error: error.message ?? "Falha ao enviar o e-mail." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-status] Erro inesperado ao enviar e-mail:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro inesperado ao enviar o e-mail." },
      { status: 500 },
    );
  }
}
