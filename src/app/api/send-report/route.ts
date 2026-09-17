import { NextResponse } from "next/server";
import { Resend } from "resend";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Envia o relatório de horas (PDF) por e-mail para o professor responsável.
 *
 * Protótipo: como não existe (ainda) um cadastro de "professor responsável"
 * por aluno, o e-mail é enviado para o próprio e-mail do usuário logado
 * (`to`), permitindo conferir a mensagem recebida nesta fase — em produção,
 * `to` viria do professor vinculado ao aluno.
 *
 * O corpo chega como multipart/form-data (não JSON): os arquivos podem
 * ficar relativamente grandes (o .zip com os certificados originais, em
 * especial) e mandar isso como base64 dentro de um JSON quase dobra o
 * tamanho do payload, o que já se mostrou instável (corpo chegando
 * corrompido/inválido). Como form-data, os arquivos viajam "crus" e só são
 * convertidos pra base64 aqui, na hora de montar os anexos pro Resend.
 *
 * O PDF ("pdf") é sempre obrigatório; o .zip ("zip") com os certificados
 * originais é opcional (o cliente só manda se houver certificados).
 *
 * Requer a variável de ambiente RESEND_API_KEY (conta grátis em
 * https://resend.com). Sem domínio verificado, o Resend só permite enviar
 * para o e-mail da própria conta Resend — o que já é o comportamento
 * desejado aqui.
 */
export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "RESEND_API_KEY não configurada no servidor. Crie uma conta gratuita em resend.com, gere uma API key e adicione RESEND_API_KEY no .env.local.",
      },
      { status: 500 },
    );
  }

  // Rota de API fica fora do matcher do middleware (ver middleware.ts), já
  // que middleware na frente de uma rota que lê o corpo pode corrompê-lo —
  // então a autenticação é checada aqui, direto na rota.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[send-report] Falha ao interpretar o corpo como form-data:", err);
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const to = formData.get("to");
  const studentEmail = formData.get("studentEmail");
  const studentName = formData.get("studentName");
  const pdfFile = formData.get("pdf");
  const zipFile = formData.get("zip");

  if (typeof to !== "string" || !to || !(pdfFile instanceof Blob)) {
    return NextResponse.json(
      { error: "Dados incompletos para enviar o relatório." },
      { status: 400 },
    );
  }

  // Protótipo: só deixa mandar pro próprio e-mail do usuário logado (é o
  // "professor" simulado nesta fase) — evita que a rota vire um relay de
  // e-mail livre para qualquer destinatário.
  const authenticatedEmail = (
    (user.user_metadata?.email as string | undefined) ??
    user.email ??
    ""
  ).toLowerCase();

  if (!authenticatedEmail || to.toLowerCase() !== authenticatedEmail) {
    return NextResponse.json(
      { error: "Só é possível enviar o relatório para o seu próprio e-mail nesta fase." },
      { status: 403 },
    );
  }

  const displayName =
    (typeof studentName === "string" && studentName.trim()) ||
    (typeof studentEmail === "string" && studentEmail) ||
    "Aluno(a)";
  const emailForSlug = typeof studentEmail === "string" ? studentEmail : "aluno";
  const fileSlug = emailForSlug.split("@")[0].replace(/[^a-z0-9-]/gi, "-");

  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
  const pdfBase64 = pdfBuffer.toString("base64");

  const zipBase64 =
    zipFile instanceof Blob ? Buffer.from(await zipFile.arrayBuffer()).toString("base64") : null;

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "CertiBox <onboarding@resend.dev>",
      to,
      subject: `CertiBox — Relatório de horas de ${displayName}`,
      html: `
        <p>Olá, professor(a),</p>
        <p>
          <strong>${displayName}</strong>${
            typeof studentEmail === "string" && studentEmail !== displayName
              ? ` (${studentEmail})`
              : ""
          }
          enviou, através do CertiBox, o relatório de horas complementares e de extensão para
          acompanhamento e validação.
        </p>
        <p>
          Em anexo está o PDF com o resumo por categoria e a lista dos certificados enviados até
          o momento, com seus respectivos status de aprovação${
            zipBase64 ? ", além de um .zip com os arquivos originais dos certificados" : ""
          }.
        </p>
        <p>Atenciosamente,<br />CertiBox — UFSCar</p>
      `,
      attachments: [
        {
          filename: `relatorio-horas-${fileSlug}.pdf`,
          content: pdfBase64,
        },
        ...(zipBase64
          ? [
              {
                filename: `certificados-${fileSlug}.zip`,
                content: zipBase64,
              },
            ]
          : []),
      ],
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Falha ao enviar o e-mail." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erro inesperado ao enviar o e-mail.",
      },
      { status: 500 },
    );
  }
}
