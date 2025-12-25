

export interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number; // Optional field for discounted price
  description: string;
  category: string;
  image: string; 
  images?: string[]; 
  rating: number;
  reviews: number;
  benefits: string[];
  nutrition: { label: string; value: string }[];
  ingredients: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified?: boolean;
}

export interface ContactInfo {
  id?: number;
  email: string;
  address: string;
  phone: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    area: string;
  };
  order_items: CartItem[];
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// Fixed PageView by adding 'ORDER_SUCCESS' to the union type
export type PageView = 'HOME' | 'SHOP' | 'PRODUCT' | 'ABOUT' | 'CONTACT' | 'BLOG' | 'CART' | 'CHECKOUT' | 'BENEFITS' | 'FAQ' | 'PRIVACY' | 'TERMS' | 'ADMIN' | 'ARTICLE' | 'TRACK_ORDER' | 'ORDER_SUCCESS';
