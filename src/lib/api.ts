// API Client for TalabaHub Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
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
    return this.request('/users/profile', { token });
  }

  async updateProfile(token: string, data: any) {
    return this.request('/users/profile', {
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
}

export const api = new ApiClient(API_BASE_URL);
