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

// ========== BLOG/CONTENT SYSTEM TYPES ==========

// Article status
export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected';

// Tag categories
export type TagCategory = 'study' | 'career' | 'life' | 'tech' | 'personal';

// Share platforms
export type SharePlatform = 'telegram' | 'whatsapp' | 'facebook' | 'twitter' | 'copy_link' | 'instagram';

// Report types
export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'plagiarism' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ReportEntityType = 'article' | 'response';
export type ReportAction = 'removed' | 'warned' | 'dismissed';

// Blog Notification types
export type BlogNotificationType = 'new_follower' | 'article_clapped' | 'new_response' | 'response_clapped' | 'milestone' | 'featured';

// Student Profile for blog system
export interface StudentProfile {
  userId: string;
  bio?: string;
  graduationYear?: number;
  fieldOfStudy?: string;
  socialLinks?: {
    telegram?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  totalArticles: number;
  totalClapsReceived: number;
  totalFollowers: number;
  totalFollowing: number;
  reputationScore: number;
  createdAt: string;
  updatedAt: string;
}

// Article author
export interface ArticleAuthor {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  university?: University;
  isFollowing?: boolean;
}

// Content block for rich text
export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'code' | 'quote' | 'list' | 'embed';
  content: {
    text?: string;
    level?: number; // For headings (1-6)
    url?: string; // For images/embeds
    caption?: string;
    language?: string; // For code blocks
    items?: string[]; // For lists
    ordered?: boolean; // For lists
    formatting?: {
      bold?: [number, number][];
      italic?: [number, number][];
      link?: { start: number; end: number; url: string }[];
    };
  };
  position: number;
}

// Article
export interface Article {
  id: string;
  authorId: string;
  author: ArticleAuthor;
  title: string;
  subtitle?: string;
  slug: string;
  content: ContentBlock[];
  featuredImageUrl?: string;
  readingTimeMinutes: number;
  wordCount: number;
  status: ArticleStatus;
  rejectionReason?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  stats?: ArticleStats;
  isBookmarked?: boolean;
  yourClaps?: number;
}

// Article stats
export interface ArticleStats {
  viewsCount: number;
  uniqueViewsCount: number;
  clapsCount: number;
  uniqueClappers: number;
  responsesCount: number;
  bookmarksCount: number;
  sharesCount: number;
  readRatio: number;
  avgReadTimeSeconds: number;
}

// Detailed article analytics (for authors)
export interface ArticleDetailedStats extends ArticleStats {
  viewsOverTime: { date: string; views: number }[];
  topReferrers: { source: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  engagementRate: number;
}

// Draft
export interface ArticleDraft {
  id: string;
  authorId: string;
  title?: string;
  subtitle?: string;
  content?: ContentBlock[];
  featuredImageUrl?: string;
  tags?: string[];
  lastSavedAt: string;
  createdAt: string;
}

// Tag
export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
  articleCount: number;
  createdAt: string;
}

// Tag with articles
export interface TagWithArticles extends Tag {
  topArticles: Article[];
  latestArticles: Article[];
  topWriters: ArticleAuthor[];
}

// Clap
export interface Clap {
  id: string;
  articleId: string;
  userId: string;
  clapCount: number;
  createdAt: string;
  updatedAt: string;
}

// Response (Comment)
export interface ArticleResponse {
  id: string;
  articleId: string;
  author: ArticleAuthor;
  parentResponseId?: string;
  content: {
    text: string;
    formatting?: ContentBlock['content']['formatting'];
  };
  highlightedText?: string;
  highlightPositionStart?: number;
  highlightPositionEnd?: number;
  isEdited: boolean;
  clapsCount: number;
  repliesCount: number;
  isReported: boolean;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  replies?: ArticleResponse[];
  yourClaps?: number;
}

// Bookmark
export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  article: Article;
  collectionId?: string;
  createdAt: string;
}

// Bookmark Collection
export interface BookmarkCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

// Follow relationship
export interface Follow {
  followerId: string;
  followingId: string;
  follower?: ArticleAuthor;
  following?: ArticleAuthor;
  createdAt: string;
}

// Share tracking
export interface Share {
  id: string;
  articleId: string;
  userId: string;
  platform: SharePlatform;
  createdAt: string;
}

// Blog Notification
export interface BlogNotification {
  id: string;
  userId: string;
  type: BlogNotificationType;
  actorId: string;
  actor?: ArticleAuthor;
  entityType: 'article' | 'response' | 'user';
  entityId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Report
export interface Report {
  id: string;
  reporterId: string;
  reporter?: ArticleAuthor;
  entityType: ReportEntityType;
  entityId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reviewedBy?: string;
  actionTaken?: string;
  createdAt: string;
  reviewedAt?: string;
}

// Student public profile
export interface StudentPublicProfile {
  user: ArticleAuthor;
  profile: StudentProfile;
  stats: {
    totalArticles: number;
    totalViews: number;
    totalClaps: number;
    totalFollowers: number;
    totalFollowing: number;
  };
  recentArticles: Article[];
  topArticles: Article[];
  isFollowing?: boolean;
}

// Student analytics (for personal dashboard)
export interface StudentWriterAnalytics {
  totalViews: number;
  totalClaps: number;
  totalFollowers: number;
  articlesPublished: number;
  avgClapsPerArticle: number;
  readRatio: number;
  viewsOverTime: { date: string; views: number }[];
  topArticles: Article[];
  followerGrowth: { date: string; count: number }[];
}

// Platform analytics (for admin)
export interface BlogPlatformAnalytics {
  totalArticles: number;
  totalStudentWriters: number;
  totalViews: number;
  totalClaps: number;
  activeWritersThisMonth: number;
  articlesPending: number;
  reportsPending: number;
  topUniversities: { id: number; name: string; articleCount: number }[];
  topCategories: { category: string; count: number }[];
  growthMetrics: { date: string; articles: number; users: number }[];
}

// Search result
export interface BlogSearchResult {
  results: (Article | ArticleAuthor | Tag)[];
  total: number;
  facets: {
    types: {
      articles: number;
      students: number;
      tags: number;
    };
  };
}

// Search suggestions
export interface BlogSearchSuggestions {
  articles: { title: string; slug: string }[];
  students: { username: string; name: string }[];
  tags: { name: string; slug: string }[];
}

// Feed types
export type FeedTimeframe = 'today' | 'week' | 'month';

// Create/Update article request
export interface CreateArticleRequest {
  title: string;
  subtitle?: string;
  content: ContentBlock[];
  featuredImageUrl?: string;
  tags: string[];
}

// Update profile request
export interface UpdateStudentProfileRequest {
  bio?: string;
  fieldOfStudy?: string;
  socialLinks?: StudentProfile['socialLinks'];
}

// Create response request
export interface CreateResponseRequest {
  content: { text: string };
  parentResponseId?: string;
  highlightedText?: string;
  highlightStart?: number;
  highlightEnd?: number;
}

// Admin resolve report request
export interface ResolveReportRequest {
  action: ReportAction;
  notes?: string;
}

// Admin suspend user request
export interface SuspendUserRequest {
  duration: '7d' | '30d' | 'permanent';
  reason: string;
}
