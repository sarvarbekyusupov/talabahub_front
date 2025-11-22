import useSWR from 'swr';
import { api } from './api';
import {
  Discount,
  Job,
  Event,
  Course,
  PaginatedResponse,
  DiscountClaim,
  StudentSavingsAnalytics,
  PartnerDiscountAnalytics,
  PlatformAnalytics,
  FraudAlert,
  Article,
  ArticleDraft,
  ArticleResponse,
  ArticleStats,
  ArticleDetailedStats,
  Tag,
  TagWithArticles,
  Bookmark,
  BookmarkCollection,
  BlogNotification,
  StudentPublicProfile,
  StudentWriterAnalytics,
  BlogPlatformAnalytics,
  BlogSearchResult,
  BlogSearchSuggestions,
  Report,
  ArticleAuthor
} from '@/types';
import { getToken as getAuthToken } from './auth';

// Helper to get token from localStorage
const getToken = () => {
  return getAuthToken();
};

// Fetchers for different endpoints
const discountsFetcher = async (params: Record<string, any>) => {
  const response = await api.getDiscounts(params) as any;
  return response?.data || [];
};

const jobsFetcher = async (params: Record<string, any>) => {
  const response = await api.getJobs(params) as any;
  return response?.data || [];
};

const eventsFetcher = async (params: Record<string, any>) => {
  const response = await api.getEvents(params) as any;
  return response?.data || [];
};

const coursesFetcher = async (params: Record<string, any>) => {
  const response = await api.getCourses(params) as any;
  return response?.data || [];
};

// Custom hooks with SWR
export function useDiscounts(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['discounts', params],
    () => discountsFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    discounts: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useJobs(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['jobs', params],
    () => jobsFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    jobs: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useEvents(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['events', params],
    () => eventsFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    events: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useCourses(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['courses', params],
    () => coursesFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    courses: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook for single item fetching
export function useDiscount(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['discount', id] : null,
    () => api.getDiscount(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    discount: data,
    isLoading,
    error,
  };
}

export function useJob(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['job', id] : null,
    () => api.getJob(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    job: data,
    isLoading,
    error,
  };
}

export function useEvent(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['event', id] : null,
    () => api.getEvent(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    event: data,
    isLoading,
    error,
  };
}

export function useCourse(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? ['course', id] : null,
    () => api.getCourse(id),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    course: data,
    isLoading,
    error,
  };
}

// User-specific hooks (requires authentication)
export function useProfile() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['profile', token] : null,
    () => api.getProfile(token!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    profile: data,
    isLoading,
    error,
    mutate,
  };
}

export function useUserStats() {
  const token = getToken();
  const { data, error, isLoading } = useSWR(
    token ? ['userStats', token] : null,
    () => api.getUserStats(token!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    }
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}

export function useLearningStreak() {
  const token = getToken();
  const { data, error, isLoading } = useSWR(
    token ? ['learningStreak', token] : null,
    () => api.getLearningStreak(token!),
    {
      revalidateOnFocus: true, // Revalidate on focus for fresh streak data
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    streak: data,
    isLoading,
    error,
  };
}

// Analytics hooks
export function usePartnerAnalytics(period: string = 'month') {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['partnerAnalytics', period, token] : null,
    () => api.getPartnerAnalytics(token!, { period }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 180000, // 3 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}

export function useApplicationAnalytics() {
  const token = getToken();
  const { data, error, isLoading } = useSWR(
    token ? ['applicationAnalytics', token] : null,
    () => api.getApplicationAnalytics(token!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
  };
}

// Notifications hook
export function useNotifications() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['notifications', token] : null,
    () => api.getNotifications(token!),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    notifications: data,
    isLoading,
    error,
    mutate,
  };
}

export function useUnreadCount() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['unreadCount', token] : null,
    () => api.getUnreadNotificationCount(token!),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    count: (data as any)?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

// ========== DISCOUNT SYSTEM HOOKS ==========

// Student Claims Hook
export function useMyClaims(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['myClaims', params, token] : null,
    () => api.getMyClaims(token!, params) as Promise<PaginatedResponse<DiscountClaim>>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    claims: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Student Savings Analytics Hook
export function useStudentSavingsAnalytics() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['studentSavingsAnalytics', token] : null,
    () => api.getStudentSavingsAnalytics(token!) as Promise<StudentSavingsAnalytics>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}

// Partner Discount Analytics Hook
export function usePartnerDiscountAnalytics(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['partnerDiscountAnalytics', params, token] : null,
    () => api.getPartnerDiscountAnalytics(token!, params) as Promise<PartnerDiscountAnalytics>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 180000, // 3 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}

// Partner Pending Verifications Hook
export function usePartnerPendingVerifications(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['partnerPendingVerifications', params, token] : null,
    () => api.getPartnerPendingVerifications(token!, params) as Promise<PaginatedResponse<DiscountClaim>>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    claims: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Admin Pending Approvals Hook
export function usePendingApprovalDiscounts(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['pendingApprovalDiscounts', params, token] : null,
    () => api.getPendingApprovalDiscounts(token!, params) as Promise<PaginatedResponse<Discount>>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );

  return {
    discounts: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Platform Analytics Hook
export function usePlatformDiscountAnalytics(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['platformDiscountAnalytics', params, token] : null,
    () => api.getPlatformDiscountAnalytics(token!, params) as Promise<PlatformAnalytics>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 180000, // 3 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}

// Fraud Alerts Hook
export function useFraudAlerts(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['fraudAlerts', params, token] : null,
    () => api.getFraudAlerts(token!, params) as Promise<PaginatedResponse<FraudAlert>>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );

  return {
    alerts: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Recommended Discounts Hook
export function useRecommendedDiscounts(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['recommendedDiscounts', params, token] : null,
    () => api.getRecommendedDiscounts(token!, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    discounts: (data as any)?.data || [],
    isLoading,
    error,
    mutate,
  };
}

// ========== BLOG/CONTENT SYSTEM HOOKS ==========

// === ARTICLES HOOKS ===

// Articles List
export function useArticles(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['articles', params],
    () => api.getArticles(params) as Promise<PaginatedResponse<Article>>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    articles: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Single Article by ID
export function useArticle(articleId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    articleId ? ['article', articleId] : null,
    () => api.getArticle(articleId) as Promise<Article>,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    article: data,
    isLoading,
    error,
    mutate,
  };
}

// Single Article by Slug
export function useArticleBySlug(slug: string) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? ['articleBySlug', slug] : null,
    () => api.getArticleBySlug(slug) as Promise<Article>,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    article: data,
    isLoading,
    error,
    mutate,
  };
}

// Articles by Author
export function useArticlesByAuthor(username: string, params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    username ? ['articlesByAuthor', username, params] : null,
    () => api.getArticlesByAuthor(username, params) as Promise<PaginatedResponse<Article>>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    articles: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Related Articles
export function useRelatedArticles(articleId: string) {
  const { data, error, isLoading } = useSWR(
    articleId ? ['relatedArticles', articleId] : null,
    () => api.getRelatedArticles(articleId) as Promise<Article[]>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    articles: Array.isArray(data) ? data : [],
    isLoading,
    error,
  };
}

// Article Stats
export function useArticleStats(articleId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    articleId ? ['articleStats', articleId] : null,
    () => api.getArticleStats(articleId) as Promise<ArticleStats>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}

// Article Detailed Stats (for authors)
export function useArticleDetailedStats(articleId: string) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token && articleId ? ['articleDetailedStats', articleId, token] : null,
    () => api.getArticleDetailedStats(token!, articleId) as Promise<ArticleDetailedStats>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}

// === DRAFTS HOOKS ===

// My Drafts
export function useMyDrafts() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['myDrafts', token] : null,
    () => api.getMyArticleDrafts(token!) as Promise<ArticleDraft[]>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  return {
    drafts: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Single Draft
export function useDraft(draftId: string) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token && draftId ? ['draft', draftId, token] : null,
    () => api.getArticleDraft(token!, draftId) as Promise<ArticleDraft>,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    draft: data,
    isLoading,
    error,
    mutate,
  };
}

// === RESPONSES HOOKS ===

// Article Responses
export function useArticleResponses(articleId: string, params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    articleId ? ['articleResponses', articleId, params] : null,
    () => api.getArticleResponses(articleId, params) as Promise<{ responses: ArticleResponse[]; total: number }>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    responses: (data as any)?.responses || data || [],
    total: (data as any)?.total || 0,
    isLoading,
    error,
    mutate,
  };
}

// === BOOKMARKS HOOKS ===

// User Bookmarks
export function useBookmarks(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['bookmarks', params, token] : null,
    () => api.getBookmarks(token!, params) as Promise<{ bookmarks: Bookmark[]; collections: BookmarkCollection[] }>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    bookmarks: (data as any)?.bookmarks || [],
    collections: (data as any)?.collections || [],
    isLoading,
    error,
    mutate,
  };
}

// === TAGS HOOKS ===

// Tags List
export function useTags(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['tags', params],
    () => api.getTags(params) as Promise<Tag[]>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    tags: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Tag by Slug (with articles)
export function useTagBySlug(slug: string) {
  const { data, error, isLoading } = useSWR(
    slug ? ['tag', slug] : null,
    () => api.getTagBySlug(slug) as Promise<TagWithArticles>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    tag: data,
    isLoading,
    error,
  };
}

// === STUDENT PROFILE HOOKS ===

// Current Student Profile
export function useStudentProfile() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['studentProfile', token] : null,
    () => api.getStudentProfile(token!) as Promise<StudentPublicProfile>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    profile: data,
    isLoading,
    error,
    mutate,
  };
}

// Student Profile by Username
export function useStudentByUsername(username: string) {
  const { data, error, isLoading, mutate } = useSWR(
    username ? ['student', username] : null,
    () => api.getStudentByUsername(username) as Promise<StudentPublicProfile>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    student: data,
    isLoading,
    error,
    mutate,
  };
}

// Student Writer Analytics
export function useStudentWriterAnalytics() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['studentAnalytics', token] : null,
    () => api.getStudentAnalytics(token!) as Promise<StudentWriterAnalytics>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}

// === FOLLOW HOOKS ===

// Followers
export function useFollowers(username: string, params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    username ? ['followers', username, params] : null,
    () => api.getFollowers(username, params) as Promise<{ followers: ArticleAuthor[]; total: number }>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    followers: (data as any)?.followers || data || [],
    total: (data as any)?.total || 0,
    isLoading,
    error,
    mutate,
  };
}

// Following
export function useFollowing(username: string, params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    username ? ['following', username, params] : null,
    () => api.getFollowing(username, params) as Promise<{ following: ArticleAuthor[]; total: number }>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    following: (data as any)?.following || data || [],
    total: (data as any)?.total || 0,
    isLoading,
    error,
    mutate,
  };
}

// === FEED HOOKS ===

// Personalized Feed
export function useFeed(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['feed', params, token] : null,
    () => api.getFeed(token!, params) as Promise<{ articles: Article[]; nextOffset: number }>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    articles: (data as any)?.articles || data || [],
    nextOffset: (data as any)?.nextOffset,
    isLoading,
    error,
    mutate,
  };
}

// Trending Feed
export function useTrendingArticles(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['trendingArticles', params],
    async () => {
      const response = await api.getTrendingArticles(params) as any;
      return response?.data || response || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    articles: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

// Latest Feed
export function useLatestArticles(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['latestArticles', params],
    async () => {
      const response = await api.getLatestArticles(params) as any;
      return response?.data || response || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    articles: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

// Popular Feed
export function usePopularArticles(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['popularArticles', params],
    async () => {
      const response = await api.getPopularArticles(params) as any;
      return response?.data || response || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    articles: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

// Featured Feed
export function useFeaturedArticles(params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['featuredArticles', params],
    async () => {
      const response = await api.getFeaturedArticles(params) as any;
      return response?.data || response || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    articles: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

// Following Feed
export function useFollowingFeed(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['followingFeed', params, token] : null,
    () => api.getFollowingFeed(token!, params) as Promise<Article[]>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    articles: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

// University Feed
export function useUniversityFeed(universityId: string, params: Record<string, any> = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    universityId ? ['universityFeed', universityId, params] : null,
    () => api.getUniversityFeed(universityId, params) as Promise<Article[]>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    articles: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}

// === BLOG NOTIFICATIONS HOOKS ===

// Blog Notifications
export function useBlogNotifications(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['blogNotifications', params, token] : null,
    () => api.getBlogNotifications(token!, params) as Promise<{ notifications: BlogNotification[]; unreadCount: number }>,
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    notifications: (data as any)?.notifications || data || [],
    unreadCount: (data as any)?.unreadCount || 0,
    isLoading,
    error,
    mutate,
  };
}

// Blog Unread Count
export function useBlogUnreadCount() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['blogUnreadCount', token] : null,
    () => api.getBlogUnreadCount(token!),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    count: (data as any)?.count || 0,
    isLoading,
    error,
    mutate,
  };
}

// === SEARCH HOOKS ===

// Blog Search
export function useBlogSearch(params: Record<string, any>) {
  const { data, error, isLoading, mutate } = useSWR(
    params.q && params.q.length >= 2 ? ['blogSearch', params] : null,
    () => api.searchBlog(params) as Promise<BlogSearchResult>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    results: data?.results || [],
    total: data?.total || 0,
    facets: data?.facets,
    isLoading,
    error,
    mutate,
  };
}

// Blog Search Suggestions
export function useBlogSearchSuggestions(q: string) {
  const { data, error, isLoading } = useSWR(
    q && q.length >= 2 ? ['blogSuggestions', q] : null,
    () => api.getBlogSearchSuggestions(q) as Promise<BlogSearchSuggestions>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    suggestions: data,
    isLoading,
    error,
  };
}

// === ADMIN HOOKS ===

// Pending Articles
export function usePendingArticles(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['pendingArticles', params, token] : null,
    () => api.getPendingArticles(token!, params) as Promise<PaginatedResponse<Article>>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );

  return {
    articles: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Reports
export function useReports(params: Record<string, any> = {}) {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['reports', params, token] : null,
    () => api.getReports(token!, params) as Promise<PaginatedResponse<Report>>,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
    }
  );

  return {
    reports: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

// Blog Platform Analytics (Admin)
export function useBlogPlatformAnalytics() {
  const token = getToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['blogPlatformAnalytics', token] : null,
    () => api.getBlogPlatformAnalytics(token!) as Promise<BlogPlatformAnalytics>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 180000, // 3 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  };
}
