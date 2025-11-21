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

// Extended discount types
export type DiscountTypeExtended = 'percentage' | 'fixed' | 'bogo' | 'free_item' | 'cashback';
export type UsageLimitType = 'one_time' | 'daily' | 'weekly' | 'monthly' | 'unlimited';
export type ClaimStatus = 'pending' | 'active' | 'used' | 'expired' | 'cancelled';
export type VerificationLevel = 'university' | 'specific_university' | 'location';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Discount {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: DiscountTypeExtended;
  promoCode?: string;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount?: number;
  imageUrl?: string;
  brand: Brand;
  category: Category;
  isActive: boolean;
  views?: number;
  savedCount?: number;
  averageRating?: number;
  createdAt?: string;
  // Extended fields
  approvalStatus?: ApprovalStatus;
  minimumPurchase?: number;
  specificProducts?: string[];
  timeRestriction?: {
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
  };
  firstTimeOnly?: boolean;
  referralBonus?: number;
  verificationLevel?: VerificationLevel;
  allowedUniversities?: number[];
  allowedLocations?: string[];
  usageLimitType?: UsageLimitType;
  dailyCap?: number;
  totalClaimsLimit?: number;
  claimsCount?: number;
  termsAndConditions?: string;
  cashbackPercentage?: number;
  freeItemDescription?: string;
}

// Discount Claim
export interface DiscountClaim {
  id: string;
  discount: Discount;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    university?: University;
  };
  claimCode: string;
  qrCode?: string;
  status: ClaimStatus;
  claimedAt: string;
  expiresAt: string;
  usedAt?: string;
  verifiedBy?: string;
  verificationNote?: string;
  savedAmount?: number;
}

// Fraud Alert
export interface FraudAlert {
  id: string;
  type: 'multiple_accounts' | 'unusual_pattern' | 'location_mismatch' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  description: string;
  details: Record<string, any>;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Analytics Types
export interface StudentSavingsAnalytics {
  totalSavings: number;
  totalClaims: number;
  claimsByCategory: { category: string; count: number; savings: number }[];
  claimsByMonth: { month: string; count: number; savings: number }[];
  favoriteCategories: { id: number; name: string; count: number }[];
  favoriteBrands: { id: number; name: string; count: number }[];
  recentClaims: DiscountClaim[];
}

export interface PartnerDiscountAnalytics {
  totalDiscounts: number;
  activeDiscounts: number;
  totalViews: number;
  totalClaims: number;
  totalRedemptions: number;
  claimRate: number;
  redemptionRate: number;
  viewsByDay: { date: string; views: number }[];
  claimsByDay: { date: string; claims: number }[];
  topDiscounts: {
    id: string;
    title: string;
    views: number;
    claims: number;
    redemptions: number;
  }[];
  demographics: {
    universities: { name: string; count: number }[];
    genders: { gender: string; count: number }[];
    ageGroups: { range: string; count: number }[];
  };
  peakTimes: { hour: number; claims: number }[];
  roi: number;
}

export interface PlatformAnalytics {
  overview: {
    totalDiscounts: number;
    activeDiscounts: number;
    pendingApproval: number;
    totalClaims: number;
    totalRedemptions: number;
    totalSavings: number;
  };
  trends: {
    claimsByDay: { date: string; claims: number }[];
    redemptionsByDay: { date: string; redemptions: number }[];
    newDiscountsByDay: { date: string; count: number }[];
  };
  topBrands: { id: number; name: string; claims: number; redemptions: number }[];
  topCategories: { id: number; name: string; claims: number; redemptions: number }[];
  topDiscounts: {
    id: string;
    title: string;
    brand: string;
    claims: number;
    redemptions: number;
  }[];
  userEngagement: {
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    averageClaimsPerUser: number;
  };
  fraudMetrics: {
    totalAlerts: number;
    newAlerts: number;
    resolvedAlerts: number;
    alertsBySeverity: { severity: string; count: number }[];
  };
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
  type?: string;
  salary?: string;
  location: string;
  applicationDeadline: string;
  deadline?: string;
  company: Company;
  companyName?: string;
  companyLogo?: string;
  isActive: boolean;
  views?: number;
  savedCount?: number;
  applicationsCount?: number;
  averageRating?: number;
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
  level?: string;
  imageUrl?: string;
  partner: Partner;
  category?: Category;
  isActive: boolean;
  enrolledCount?: number;
  rating?: number;
  averageRating?: number;
  totalLessons?: number;
  views?: number;
  savedCount?: number;
  applicationsCount?: number;
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
