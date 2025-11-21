// API Client for TalabaHub Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.69.242.100:3030/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw error;
    }

    return response.json();
  }

  private async uploadRequest<T>(
    endpoint: string,
    formData: FormData,
    token?: string
  ): Promise<T> {
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw error;
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(token: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      token,
    });
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerificationEmail(email: string) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async changePassword(token: string, oldPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      token,
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // User endpoints
  async getProfile(token: string) {
    return this.request('/users/me/profile', { token });
  }

  async updateProfile(token: string, data: any) {
    return this.request('/users/me/profile', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  // Discounts
  async getDiscounts(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/discounts${query}`);
  }

  async getDiscount(id: string) {
    return this.request(`/discounts/${id}`);
  }

  // Jobs
  async getJobs(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/jobs${query}`);
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async applyForJob(token: string, jobId: string, data: any) {
    return this.request(`/jobs/${jobId}/apply`, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  // Events
  async getEvents(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/events${query}`);
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  async registerForEvent(token: string, eventId: string) {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
      token,
    });
  }

  // Courses
  async getCourses(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/courses${query}`);
  }

  async getCourse(id: string) {
    return this.request(`/courses/${id}`);
  }

  async enrollInCourse(token: string, courseId: string) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: 'POST',
      token,
    });
  }

  // Search
  async search(query: string, limit: number = 20) {
    return this.request(`/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async searchSuggestions(query: string, limit: number = 5) {
    return this.request(
      `/search/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  // Universities
  async getUniversities(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/universities${query}`);
  }

  // Dashboard endpoints
  async getMyApplications(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/jobs/me/applications${query}`, { token });
  }

  async getMyRegistrations(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/events/me/registrations${query}`, { token });
  }

  async getMyEnrollments(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/courses/me/enrollments${query}`, { token });
  }

  async getUserStats(token: string) {
    return this.request('/users/me/stats', { token });
  }

  // Saved items endpoints
  async getSavedItems(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/saved${query}`, { token });
  }

  async saveItem(token: string, itemType: string, itemId: string) {
    return this.request('/saved', {
      method: 'POST',
      token,
      body: JSON.stringify({ itemType, itemId }),
    });
  }

  async unsaveItem(token: string, savedItemId: string) {
    return this.request(`/saved/${savedItemId}`, {
      method: 'DELETE',
      token,
    });
  }

  async checkIfSaved(token: string, itemType: string, itemId: string) {
    return this.request(
      `/saved/check?itemType=${itemType}&itemId=${itemId}`,
      { token }
    );
  }

  // Reviews endpoints
  async getReviews(itemType: string, itemId: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/${itemType}/${itemId}/reviews${query}`);
  }

  async createReview(token: string, itemType: string, itemId: string, data: { rating: number; comment: string }) {
    return this.request(`/${itemType}/${itemId}/reviews`, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateReview(token: string, itemType: string, itemId: string, reviewId: string, data: { rating: number; comment: string }) {
    return this.request(`/${itemType}/${itemId}/reviews/${reviewId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteReview(token: string, itemType: string, itemId: string, reviewId: string) {
    return this.request(`/${itemType}/${itemId}/reviews/${reviewId}`, {
      method: 'DELETE',
      token,
    });
  }

  async getRating(itemType: string, itemId: string) {
    return this.request(`/${itemType}/${itemId}/rating`);
  }

  // Notifications endpoints
  async getNotifications(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/notifications${query}`, { token });
  }

  async markNotificationAsRead(token: string, notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
      token,
    });
  }

  async markAllNotificationsAsRead(token: string) {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
      token,
    });
  }

  async getUnreadNotificationCount(token: string) {
    return this.request('/notifications/unread-count', { token });
  }

  async deleteNotification(token: string, notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
      token,
    });
  }

  // File Upload endpoints
  async uploadImage(file: File, token?: string) {
    const formData = new FormData();
    formData.append('image', file);
    return this.uploadRequest('/upload/image', formData, token);
  }

  async uploadAvatar(file: File, token: string) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.uploadRequest('/upload/avatar', formData, token);
  }

  async uploadDocument(file: File, token: string) {
    const formData = new FormData();
    formData.append('document', file);
    return this.uploadRequest('/upload/document', formData, token);
  }

  async uploadLogo(file: File, token: string) {
    const formData = new FormData();
    formData.append('logo', file);
    return this.uploadRequest('/upload/logo', formData, token);
  }

  async uploadBanner(file: File, token: string) {
    const formData = new FormData();
    formData.append('banner', file);
    return this.uploadRequest('/upload/banner', formData, token);
  }

  // Payment endpoints
  async prepareClickPayment(token: string, data: { amount: number; itemType: string; itemId: string }) {
    return this.request('/payment/click/prepare', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async completeClickPayment(token: string, data: { click_trans_id: string; merchant_trans_id: string }) {
    return this.request('/payment/click/complete', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async preparePaymePayment(token: string, data: { amount: number; itemType: string; itemId: string }) {
    return this.request('/payment/payme/prepare', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async completePaymePayment(token: string, data: { id: string }) {
    return this.request('/payment/payme/complete', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async getPayments(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/payment${query}`, { token });
  }

  // Course Progress tracking
  async updateCourseProgress(token: string, enrollmentId: string, data: { progress: number; completedLessons?: string[] }) {
    return this.request(`/courses/enrollments/${enrollmentId}/progress`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  // Discount view tracking
  async trackDiscountView(discountId: string) {
    return this.request(`/discounts/${discountId}/view`, {
      method: 'POST',
    });
  }

  // Admin - User Management
  async getAllUsers(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users${query}`, { token });
  }

  async getUserById(token: string, userId: string) {
    return this.request(`/users/${userId}`, { token });
  }

  async updateUser(token: string, userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteUser(token: string, userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
      token,
    });
  }

  // Admin - Discount Management
  async createDiscount(token: string, data: any) {
    return this.request('/discounts', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateDiscount(token: string, discountId: string, data: any) {
    return this.request(`/discounts/${discountId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteDiscount(token: string, discountId: string) {
    return this.request(`/discounts/${discountId}`, {
      method: 'DELETE',
      token,
    });
  }

  // Admin - Job Management
  async createJob(token: string, data: any) {
    return this.request('/jobs', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateJob(token: string, jobId: string, data: any) {
    return this.request(`/jobs/${jobId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteJob(token: string, jobId: string) {
    return this.request(`/jobs/${jobId}`, {
      method: 'DELETE',
      token,
    });
  }

  async getJobApplications(token: string, jobId: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/jobs/${jobId}/applications${query}`, { token });
  }

  async updateApplicationStatus(token: string, jobId: string, applicationId: string, status: string) {
    return this.request(`/jobs/${jobId}/applications/${applicationId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    });
  }

  // Admin - Event Management
  async createEvent(token: string, data: any) {
    return this.request('/events', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateEvent(token: string, eventId: string, data: any) {
    return this.request(`/events/${eventId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(token: string, eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
      token,
    });
  }

  async getEventRegistrations(token: string, eventId: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/events/${eventId}/registrations${query}`, { token });
  }

  // Admin - Course Management
  async createCourse(token: string, data: any) {
    return this.request('/courses', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateCourse(token: string, courseId: string, data: any) {
    return this.request(`/courses/${courseId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(token: string, courseId: string) {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE',
      token,
    });
  }

  async getCourseEnrollments(token: string, courseId: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/courses/${courseId}/enrollments${query}`, { token });
  }

  // Partner endpoints
  async getPartnerStats(token: string) {
    return this.request('/partners/me/stats', { token });
  }

  async getPartnerContent(token: string, contentType: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/partners/me/${contentType}${query}`, { token });
  }

  // Blog Posts endpoints
  async getBlogPosts(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/blog-posts${query}`);
  }

  async getBlogPostBySlug(slug: string) {
    return this.request(`/blog-posts/${slug}`);
  }

  async createBlogPost(token: string, data: any) {
    return this.request('/blog-posts', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateBlogPost(token: string, postId: string, data: any) {
    return this.request(`/blog-posts/${postId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteBlogPost(token: string, postId: string) {
    return this.request(`/blog-posts/${postId}`, {
      method: 'DELETE',
      token,
    });
  }

  // Categories endpoints
  async getCategories(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/categories${query}`);
  }

  async getCategory(categoryId: string) {
    return this.request(`/categories/${categoryId}`);
  }

  async createCategory(token: string, data: any) {
    return this.request('/categories', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateCategory(token: string, categoryId: string, data: any) {
    return this.request(`/categories/${categoryId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(token: string, categoryId: string) {
    return this.request(`/categories/${categoryId}`, {
      method: 'DELETE',
      token,
    });
  }

  // Universities CRUD (full)
  async getUniversity(universityId: string) {
    return this.request(`/universities/${universityId}`);
  }

  async createUniversity(token: string, data: any) {
    return this.request('/universities', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateUniversity(token: string, universityId: string, data: any) {
    return this.request(`/universities/${universityId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteUniversity(token: string, universityId: string) {
    return this.request(`/universities/${universityId}`, {
      method: 'DELETE',
      token,
    });
  }

  // Companies endpoints
  async getCompanies(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/companies${query}`);
  }

  async getCompany(companyId: string) {
    return this.request(`/companies/${companyId}`);
  }

  async createCompany(token: string, data: any) {
    return this.request('/companies', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateCompany(token: string, companyId: string, data: any) {
    return this.request(`/companies/${companyId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(token: string, companyId: string) {
    return this.request(`/companies/${companyId}`, {
      method: 'DELETE',
      token,
    });
  }

  // Brands endpoints
  async getBrands(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/brands${query}`);
  }

  async getBrand(brandId: string) {
    return this.request(`/brands/${brandId}`);
  }

  async createBrand(token: string, data: any) {
    return this.request('/brands', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateBrand(token: string, brandId: string, data: any) {
    return this.request(`/brands/${brandId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteBrand(token: string, brandId: string) {
    return this.request(`/brands/${brandId}`, {
      method: 'DELETE',
      token,
    });
  }

  // Education Partners endpoints
  async getEducationPartners(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/education-partners${query}`);
  }

  async getEducationPartner(partnerId: string) {
    return this.request(`/education-partners/${partnerId}`);
  }

  async createEducationPartner(token: string, data: any) {
    return this.request('/education-partners', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updateEducationPartner(token: string, partnerId: string, data: any) {
    return this.request(`/education-partners/${partnerId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  async deleteEducationPartner(token: string, partnerId: string) {
    return this.request(`/education-partners/${partnerId}`, {
      method: 'DELETE',
      token,
    });
  }

  // Health Check endpoints
  async getHealth() {
    return this.request('/health');
  }

  async getHealthReady() {
    return this.request('/health/ready');
  }

  async getHealthLive() {
    return this.request('/health/live');
  }

  async getHealthMetrics() {
    return this.request('/health/metrics');
  }

  async getHealthServices(token: string) {
    return this.request('/health/services', { token });
  }

  async getHealthErrors(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/health/errors${query}`, { token });
  }

  // Audit Logs endpoints (Admin)
  async getAuditLogs(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/audit-logs${query}`, { token });
  }

  // Partner Analytics endpoints
  async getPartnerAnalytics(token: string, params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/partners/me/analytics${query}`, { token });
  }

  // Learning Streak endpoint
  async getLearningStreak(token: string) {
    return this.request('/users/me/learning-streak', { token });
  }

  // Course Content Details endpoint
  async getCourseContent(courseId: string) {
    return this.request(`/courses/${courseId}/content`);
  }

  // Application Analytics endpoint
  async getApplicationAnalytics(token: string) {
    return this.request('/jobs/me/applications/analytics', { token });
  }
}

export const api = new ApiClient(API_BASE_URL);
