import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'الاسم الكامل يجب أن يحتوي على حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(9, 'رقم الهاتف غير صالح').max(15, 'رقم الهاتف غير صالح'),
  companyName: z.string().optional().default(''),
  wilaya: z.string().min(1, 'يرجى تحديد الولاية'),
  address: z.string().min(3, 'يرجى كتابة العنوان بالتفصيل'),
  password: z.string().min(8, 'كلمة المرور يجب أن لا تقل عن 8 أحرف'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'يرجى إدخال كلمة المرور'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'رمز التحقق مطلوب'),
  password: z.string().min(8, 'كلمة المرور يجب أن لا تقل عن 8 أحرف'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export const contactSchema = z.object({
  name: z.string().optional(),
  fullName: z.string().optional(),
  companyName: z.string().optional().default(''),
  phone: z.string().min(9, 'يرجى إدخال رقم هاتف صحيح'),
  wilaya: z.string().min(1, 'يرجى اختيار الولاية'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  subject: z.string().optional().default('استفسار مبيعات جملة'),
  message: z.string().min(3, 'يرجى كتابة الرسالة بشكل واضح'),
  botField: z.string().optional(), // Honeypot
}).refine((data) => Boolean((data.fullName && data.fullName.trim().length >= 2) || (data.name && data.name.trim().length >= 2)), {
  message: 'يرجى إدخال الاسم الكامل بشكل صحيح',
  path: ['name'],
});

export const orderCreateSchema = z.object({
  customerName: z.string().min(2, 'يرجى إدخال الاسم'),
  phone: z.string().min(9, 'يرجى إدخال رقم الهاتف'),
  wilaya: z.string().min(1, 'يرجى تحديد الولاية'),
  address: z.string().min(3, 'يرجى كتابة العنوان'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      flavorId: z.string().optional().nullable(),
      productFlavorId: z.string().optional().nullable(),
      cartonsCount: z.number().int().min(1, 'الكمية يجب أن تكون كرتوناً واحداً على الأقل'),
    })
  ).min(1, 'السلة فارغة، يرجى إضافة منتج واحد على الأقل'),
});

export const merchantVerificationSchema = z.object({
  merchantType: z.enum(['RETAIL', 'WHOLESALE', 'SUPER_WHOLESALE']),
  companyName: z.string().min(2, 'اسم المحل أو المؤسسة مطلوب'),
  wilaya: z.string().min(1, 'يرجى تحديد الولاية'),
  address: z.string().min(3, 'يرجى كتابة عنوان المحل أو المستودع'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج بالفرنسية/الإنجليزية مطلوب'),
  arabicName: z.string().min(2, 'اسم المنتج بالعربية مطلوب'),
  slug: z.string().min(2),
  brandId: z.string().min(1, 'يرجى تحديد العلامة التجارية'),
  flavorId: z.string().optional().nullable(),
  flavorIds: z.array(z.string()).optional(),
  categoryId: z.string().optional().nullable(),
  category: z.string().default('chips'),
  description: z.string().optional().nullable(),
  arabicDescription: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  unitPrice: z.number().positive('سعر الحبة يجب أن يكون موجباً'),
  cartonQuantity: z.number().int().positive('عدد الحبات في الكرتون يجب أن يكون أكبر من 0'),
  cartonPrice: z.number().positive('سعر الكرتون الأساسي يجب أن يكون موجباً'),
  retailPrice: z.number().positive('سعر التجزئة يجب أن يكون موجباً').optional().nullable(),
  wholesalePrice: z.number().positive('سعر الجملة يجب أن يكون موجباً').optional().nullable(),
  superWholesalePrice: z.number().positive('سعر سوبر جملة يجب أن يكون موجباً').optional().nullable(),
  stock: z.number().int().nonnegative('المخزون لا يمكن أن يكون سالباً'),
  lowStockThreshold: z.number().int().nonnegative().optional().default(10),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});
