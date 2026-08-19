export type Role = 'customer' | 'driver' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type MerchantType = 'RETAIL' | 'WHOLESALE' | 'SUPER_WHOLESALE';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  wilaya?: string | null;
  address?: string | null;
  role: Role;
  merchantType?: MerchantType | null;
  verificationStatus?: VerificationStatus;
  commercialRegisterUrl?: string | null;
  commercialRegisterName?: string | null;
  rejectionReason?: string | null;
  reviewedAt?: string | Date | null;
  reviewedBy?: string | null;
  active: boolean;
  createdAt: string | Date;
}

export interface Brand {
  id: string;
  name: string;
  arabicName: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  active: boolean;
}

export interface Flavor {
  id: string;
  name: string;
  arabicName: string;
  slug: string;
  color?: string | null;
  active: boolean;
  _count?: { products?: number; productFlavors?: number };
}

export interface ProductFlavor {
  id: string;
  productId: string;
  flavorId: string;
  flavor?: Flavor;
  stock: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  arabicName: string;
  slug: string;
  brandId: string;
  brand?: Brand;
  flavorId?: string | null;
  flavor?: Flavor | null;
  flavors?: ProductFlavor[];
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  cartonQuantity: number;
  cartonPrice: number;
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  superWholesalePrice?: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  createdAt?: string | Date;
}

export interface CartItem {
  id?: string;
  product: Product;
  flavorId?: string | null;
  flavor?: Flavor | null;
  productFlavorId?: string | null;
  productFlavor?: ProductFlavor | null;
  cartonsCount: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productFlavorId?: string | null;
  productName: string;
  brandName: string;
  flavorName?: string | null;
  merchantType?: string | null;
  cartonQuantity: number;
  cartonsCount: number;
  unitPrice: number;
  cartonPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  order?: Order;
  userId: string;
  amount: number;
  status: string;
  issuedAt: string | Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  customerName: string;
  phone: string;
  wilaya: string;
  address: string;
  notes?: string | null;
  status: OrderStatus;
  paymentMethod?: string;
  totalAmount: number;
  driverId?: string | null;
  driver?: Driver | null;
  invoice?: Invoice | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  items?: OrderItem[];
}

export interface Driver {
  id: string;
  userId: string;
  user?: User;
  name: string;
  phone: string;
  vehicle?: string | null;
  active: boolean;
  createdAt: string | Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string | Date;
}

export interface News {
  id: string;
  title: string;
  arabicTitle: string;
  content: string;
  arabicContent: string;
  published: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Offer {
  id: string;
  title: string;
  arabicTitle: string;
  description?: string | null;
  discountPercent?: number | null;
  bundlePrice?: number | null;
  active: boolean;
  validUntil?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}
