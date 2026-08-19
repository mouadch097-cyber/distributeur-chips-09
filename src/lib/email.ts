import { BUSINESS_INFO } from './constants';

/**
 * Escapes HTML special characters to prevent XSS / HTML Injection in email templates.
 * All user-supplied values MUST pass through this function before insertion into HTML.
 */
export function escapeHtml(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  response?: string;
  error?: string;
}

/**
 * Helper function to send transactional emails via Brevo REST API v3.
 * Works for any recipient worldwide without requiring a custom domain.
 */
async function sendViaBrevo(payload: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent: string;
  replyTo?: { email: string };
}): Promise<EmailSendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'depotchips81@gmail.com';

  if (!apiKey) {
    console.error('[BREVO] Missing BREVO_API_KEY: Environment variable is not configured.');
    return {
      success: false,
      error: 'تعذر الاتصال بخدمة البريد الإلكتروني. يرجى التأكد من إعدادات Brevo API Key.',
    };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'Distributeur Chips 09',
          email: emailFrom,
        },
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        textContent: payload.textContent,
        replyTo: payload.replyTo,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[BREVO Error] Status: ${res.status} | Code: ${data?.code} | Message: ${data?.message}`);
      return {
        success: false,
        error: data?.message || 'فشل تسليم البريد الإلكتروني عبر خادم Brevo.',
      };
    }

    console.log(`[BREVO] Email delivered successfully (MessageId: ${data?.messageId})`);
    return { success: true, messageId: data?.messageId };
  } catch (err: any) {
    console.error(`[BREVO Exception] Message: ${err.message || err}`);
    return {
      success: false,
      error: err.message || 'حدث خطأ غير متوقع أثناء إرسال البريد الإلكتروني.',
    };
  }
}

/**
 * Sends a 6-digit OTP verification code for password reset via Brevo.
 */
export async function sendPasswordResetOtpEmail(
  to: string,
  userName: string,
  otpCode: string
): Promise<EmailSendResult> {
  const safeUserName = escapeHtml(userName || 'عميلنا العزيز');
  const safeOtp = escapeHtml(otpCode);

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>رمز التحقق لإعادة تعيين كلمة المرور - Distributeur Chips 09</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0e; color: #f4f4f5; margin: 0; padding: 20px; direction: rtl; }
        .container { max-width: 540px; margin: 0 auto; background-color: #141418; border: 1px solid #272730; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #18181f 0%, #0d0d10 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #e5b842; }
        .logo-title { font-size: 24px; font-weight: 900; color: #e5b842; letter-spacing: 1px; margin: 0; }
        .content { padding: 32px 24px; line-height: 1.7; text-align: center; }
        .otp-box { display: inline-block; background-color: #09090b; border: 2px dashed #e5b842; border-radius: 12px; padding: 16px 32px; margin: 24px 0; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #e5b842; font-family: monospace; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #23232c; }
        .note { font-size: 13px; color: #a1a1aa; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">DISTRIBUTEUR CHIPS 09</h1>
          <p style="color: #a1a1aa; margin: 5px 0 0 0; font-size: 13px;">منصة توزيع الشيبس بالجملة</p>
        </div>
        <div class="content">
          <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">مرحباً ${safeUserName}،</h2>
          <p style="color: #d4d4d8; font-size: 14px;">رمز التحقق الخاص بك لإعادة تعيين كلمة المرور هو:</p>
          
          <div class="otp-box">${safeOtp}</div>

          <p class="note">هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط، ويستخدم لمرة واحدة.</p>
          <p style="font-size: 12px; color: #71717a; margin-top: 20px;">إذا لم تقم بطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان وستظل حسابك محمياً.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Distributeur Chips 09. جميع الحقوق محفوظة.</p>
          <p>${BUSINESS_INFO.location} | هاتف: ${BUSINESS_INFO.phone}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaBrevo({
    to: [{ email: to, name: userName }],
    subject: 'رمز التحقق لإعادة تعيين كلمة المرور - Distributeur Chips 09',
    htmlContent,
    textContent: `مرحباً ${userName || 'عميلنا العزيز'},\nرمز التحقق لإعادة تعيين كلمة المرور هو: ${otpCode}\nصالح لمدة 10 دقائق فقط.`,
  });
}

/**
 * Sends a notification email to CONTACT_EMAIL when a customer submits the contact form.
 */
export async function sendContactNotificationEmail(payload: {
  fullName: string;
  companyName: string;
  phone: string;
  wilaya: string;
  message: string;
  email?: string;
  subject?: string;
}): Promise<EmailSendResult> {
  const safe = {
    fullName: escapeHtml(payload.fullName),
    companyName: escapeHtml(payload.companyName || 'غير محدد'),
    phone: escapeHtml(payload.phone),
    wilaya: escapeHtml(payload.wilaya),
    message: escapeHtml(payload.message),
    email: payload.email ? escapeHtml(payload.email) : null,
  };

  const contactEmail = process.env.CONTACT_EMAIL || BUSINESS_INFO.email;

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>رسالة تواصل جديدة - منصة مبيعات الشيبس</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0e; color: #f4f4f5; margin: 0; padding: 20px; direction: rtl; }
        .container { max-width: 580px; margin: 0 auto; background-color: #141418; border: 1px solid #272730; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #18181f 0%, #0d0d10 100%); padding: 24px; text-align: center; border-bottom: 2px solid #e5b842; }
        .content { padding: 24px; line-height: 1.7; }
        .item { background-color: #1c1c24; padding: 12px 16px; border-radius: 6px; margin-bottom: 12px; }
        .label { font-size: 12px; color: #e5b842; font-weight: bold; margin-bottom: 4px; }
        .value { font-size: 15px; color: #ffffff; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: #e5b842; margin: 0;">رسالة اتصال جديدة من زبون تجاري</h2>
        </div>
        <div class="content">
          <div class="item">
            <div class="label">اسم الزبون / التاجر:</div>
            <div class="value">${safe.fullName}</div>
          </div>
          <div class="item">
            <div class="label">اسم المحل / الشركة:</div>
            <div class="value">${safe.companyName}</div>
          </div>
          <div class="item">
            <div class="label">رقم الهاتف:</div>
            <div class="value">${safe.phone}</div>
          </div>
          ${safe.email ? `
          <div class="item">
            <div class="label">البريد الإلكتروني:</div>
            <div class="value">${safe.email}</div>
          </div>
          ` : ''}
          <div class="item">
            <div class="label">الولاية:</div>
            <div class="value">${safe.wilaya}</div>
          </div>
          <div class="item">
            <div class="label">نص الرسالة:</div>
            <div class="value" style="white-space: pre-wrap;">${safe.message}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const safeReplyTo =
    payload.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) &&
      !payload.email.includes('\n') &&
      !payload.email.includes('\r')
      ? { email: payload.email.trim() }
      : undefined;

  return sendViaBrevo({
    to: [{ email: contactEmail, name: 'إدارة مبيعات الشيبس' }],
    replyTo: safeReplyTo,
    subject: `رسالة تواصل جديدة من ${safe.fullName} (${safe.wilaya})`,
    htmlContent,
    textContent: `رسالة تواصل من: ${payload.fullName}\nالمحل: ${payload.companyName}\nالهاتف: ${payload.phone}\nالولاية: ${payload.wilaya}\nالبريد: ${payload.email || 'غير محدد'}\nالرسالة:\n${payload.message}`,
  });
}