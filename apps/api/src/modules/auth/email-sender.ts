export interface EmailSender {
  sendVerification(to: string, link: string): Promise<void>;
}

class LogEmailSender implements EmailSender {
  async sendVerification(to: string, link: string) {
    console.log(`[patrocino] verification link for ${to}: ${link}`);
  }
}

class ResendEmailSender implements EmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async sendVerification(to: string, link: string) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [to],
        subject: "Confirme seu e-mail no Patrocino",
        html: `<p>Confirme seu e-mail para usar o Patrocino.</p><p><a href="${link}">${link}</a></p>`,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Resend failed (${response.status}): ${detail}`);
    }
  }
}

export function createEmailSender(
  env: NodeJS.ProcessEnv = process.env,
): EmailSender {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return new LogEmailSender();
  const from = env.EMAIL_FROM?.trim();
  if (!from) {
    console.warn("[patrocino] RESEND_API_KEY is set without EMAIL_FROM; logging the verification link instead.");
    return new LogEmailSender();
  }
  return new ResendEmailSender(apiKey, from);
}
