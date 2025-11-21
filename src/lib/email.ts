import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'CleanUp Connect <notifications@cleanup-connect.com>',
      ...options,
    });
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email send error:', message);
    return { success: false, error: message };
  }
}
