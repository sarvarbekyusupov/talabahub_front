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

export interface JobApplication {
  id: string;
  job: Job;
  cvUrl: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface EventRegistration {
  id: string;
  event: Event;
  registeredAt: string;
  attended?: boolean;
}

export interface CourseEnrollment {
  id: string;
  course: Course;
  enrolledAt: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  completedAt?: string;
}

export interface UserStats {
  applications: number;
  saved: number;
  registrations: number;
  courses: number;
}

export interface SavedItem {
  id: string;
  itemType: 'discount' | 'job' | 'event' | 'course';
  itemId: string;
  item: Discount | Job | Event | Course;
  savedAt: string;
}

export interface Review {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Rating {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface Notification {
  id: string;
  type: 'application' | 'registration' | 'enrollment' | 'review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: 'job' | 'event' | 'course' | 'discount';
}
