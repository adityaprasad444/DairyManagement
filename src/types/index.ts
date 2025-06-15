export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'delivery' | 'consumer';
  phone: string;
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Delivery {
  id: string;
  deliveryPersonId: string;
  consumerId: string;
  status: 'pending' | 'in-progress' | 'delivered';
  products: Product[];
  deliveryDate: Date;
  address: string;
}

export interface Billing {
  id: string;
  consumerId: string;
  subscriptionId: string;
  amount: number;
  status: 'pending' | 'paid';
  dueDate: Date;
  paidDate?: Date;
} 