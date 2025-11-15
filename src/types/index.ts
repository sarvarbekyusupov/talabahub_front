// Type definitions for TalabaHub
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  role: 'student' | 'admin' | 'partner';
  isEmailVerified: boolean;
  university?: University;
  studentIdNumber?: string;
  faculty?: string;
  courseYear?: number;
  graduationYear?: number;
  avatarUrl?: string;
  referralCode?: string;
  createdAt: string;
}

export interface University {
  id: number;
  nameUz: string;
  nameEn?: string;
  logoUrl?: string;
  website?: string;
  city?: string;
  region?: string;
}

export interface Discount {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  promoCode?: string;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount?: number;
  imageUrl?: string;
  brand: Brand;
  category: Category;
  isActive: boolean;
}

export interface Brand {
  id: number;
  name: string;
  logoUrl?: string;
  description?: string;
}

export interface Category {
  id: number;
  nameUz: string;
  nameEn?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  jobType: 'full_time' | 'part_time' | 'internship' | 'contract';
  salary?: string;
  location: string;
  applicationDeadline: string;
  company: Company;
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  id: number;
  name: string;
  logoUrl?: string;
  description?: string;
  industry?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: 'workshop' | 'conference' | 'seminar' | 'webinar' | 'competition' | 'networking';
  eventDate: string;
  location: string;
  imageUrl?: string;
  maxParticipants?: number;
  registeredCount?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration?: string;
  imageUrl?: string;
  partner: Partner;
  createdAt: string;
}

export interface Partner {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
