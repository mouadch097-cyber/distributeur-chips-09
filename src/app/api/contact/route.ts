import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendContactNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`contact_${ip}`, 5, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'لقد قمت بإرسال عدة رسائل. يرجى الانتظار دقيقة واحدة.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check for bots
    if (body.botField) {
      // Quietly return success without sending
      return NextResponse.json({
        success: true,
        message: 'تم إرسال رسالتك بنجاح، ستتواصل معك إدارة المبيعات قريباً.',
      });
    }

    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg =
        validation.error.errors[0]?.message || 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, fullName, companyName, phone, wilaya, email, subject, message } =
      validation.data;
    const finalName = (fullName || name || 'عميل تجاري').trim();

    // Send email to admin via Gmail SMTP
    const emailResult = await sendContactNotificationEmail({
      fullName: finalName,
      companyName: companyName?.trim() || '',
      phone: phone.trim(),
      wilaya: wilaya.trim(),
      email: email?.trim() || undefined,
      subject: subject?.trim() || undefined,
      message: message.trim(),
    });

    if (!emailResult.success) {
      console.error('[Contact API] Failed to deliver contact email:', emailResult.error);
      return NextResponse.json(
        {
          error:
            'تعذر إرسال رسالتك عبر البريد الإلكتروني حالياً بسبب خطأ في الخادم. يرجى التواصل هاتفياً أو المحاولة لاحقاً.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح، ستتواصل معك إدارة المبيعات قريباً.',
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
