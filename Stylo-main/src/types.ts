export interface Shop {
  id: string;
  name: string;
  description: string;
  type: 'barberia' | 'salon';
  photo: string;
  rating: number;
  address: string;
  priceRange: 1 | 2 | 3;
  categories: string[];
  phone?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

export interface UserProfile {
  uid: string;
  nombre: string;
  email: string;
  tipo: 'cliente' | 'barbero' | 'salonera';
  foto?: string;
  telefono?: string;
  shopId?: string;
  services?: string[];
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  providerId: string;
  shopId: string;
  shopName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  createdAt: string;
}

export interface Review {
  id: string;
  shopId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: any;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}
