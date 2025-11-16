/**
 * Export utilities for converting data to CSV and Excel formats
 */

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) {
    return '';
  }

  // If headers are not provided, use keys from the first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.map(escapeCSVValue).join(',');

  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      return escapeCSVValue(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV values to handle special characters
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  let stringValue = String(value);

  // Handle dates
  if (value instanceof Date) {
    stringValue = value.toISOString();
  }

  // Handle objects (convert to JSON)
  if (typeof value === 'object' && !(value instanceof Date)) {
    stringValue = JSON.stringify(value);
  }

  // Escape quotes and wrap in quotes if contains special characters
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    stringValue = `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Download CSV file
 */
export function downloadCSV(data: any[], filename: string, headers?: string[]): void {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Format data for export (flatten nested objects, format dates, etc.)
 */
export function formatDataForExport<T extends Record<string, any>>(
  data: T[],
  fieldMap?: Record<keyof T, string>
): any[] {
  return data.map(item => {
    const formatted: Record<string, any> = {};

    Object.keys(item).forEach(key => {
      const value = item[key];
      const exportKey = fieldMap?.[key as keyof T] || key;

      // Format dates
      if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        formatted[exportKey] = new Date(value).toLocaleString('uz-UZ');
      }
      // Handle booleans
      else if (typeof value === 'boolean') {
        formatted[exportKey] = value ? 'Ha' : 'Yo\'q';
      }
      // Handle nested objects (flatten)
      else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        formatted[exportKey] = JSON.stringify(value);
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        formatted[exportKey] = value.join(', ');
      }
      // Handle other values
      else {
        formatted[exportKey] = value;
      }
    });

    return formatted;
  });
}

/**
 * Export Jobs data to CSV
 */
export function exportJobsToCSV(jobs: any[]): void {
  const formatted = jobs.map(job => ({
    'Sarlavha': job.title,
    'Kompaniya': job.company?.name || '',
    'Joylashuv': job.location,
    'Ish turi': job.jobType,
    'Maosh': job.salary || 'Kelishiladi',
    'Holat': job.isActive ? 'Faol' : 'Nofaol',
    'Ko\'rishlar': job.viewCount || 0,
    'Yaratilgan': new Date(job.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `jobs-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Events data to CSV
 */
export function exportEventsToCSV(events: any[]): void {
  const formatted = events.map(event => ({
    'Sarlavha': event.title,
    'Turi': event.eventType,
    'Sana': new Date(event.eventDate).toLocaleDateString('uz-UZ'),
    'Joylashuv': event.location,
    'Qatnashchilar': event.attendeesCount || 0,
    'Holat': event.isActive ? 'Faol' : 'Nofaol',
    'Yaratilgan': new Date(event.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `events-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Courses data to CSV
 */
export function exportCoursesToCSV(courses: any[]): void {
  const formatted = courses.map(course => ({
    'Sarlavha': course.title,
    'Hamkor': course.partner?.name || '',
    'Daraja': course.level,
    'Davomiyligi': course.duration,
    'Narx': course.price || 'Bepul',
    'Holat': course.isActive ? 'Faol' : 'Nofaol',
    'O\'quvchilar': course.enrollmentsCount || 0,
    'Yaratilgan': new Date(course.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `courses-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Users data to CSV
 */
export function exportUsersToCSV(users: any[]): void {
  const formatted = users.map(user => ({
    'Ism': `${user.firstName} ${user.lastName}`,
    'Email': user.email,
    'Telefon': user.phone || '',
    'Universitet': user.university?.nameUz || '',
    'Rol': user.role,
    'Tasdiqlangan': user.isEmailVerified ? 'Ha' : 'Yo\'q',
    'Ro\'yxatdan o\'tgan': new Date(user.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `users-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Discounts data to CSV
 */
export function exportDiscountsToCSV(discounts: any[]): void {
  const formatted = discounts.map(discount => ({
    'Sarlavha': discount.title,
    'Brend': discount.brand?.name || '',
    'Chegirma': discount.discountType === 'percentage'
      ? `${discount.discountValue}%`
      : `${discount.discountValue} so'm`,
    'Boshlanish': new Date(discount.validFrom).toLocaleDateString('uz-UZ'),
    'Tugash': new Date(discount.validUntil).toLocaleDateString('uz-UZ'),
    'Holat': discount.isActive ? 'Faol' : 'Nofaol',
    'Yaratilgan': new Date(discount.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `discounts-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Companies data to CSV
 */
export function exportCompaniesToCSV(companies: any[]): void {
  const formatted = companies.map(company => ({
    'Nom': company.name,
    'Soha': company.industry || '',
    'Joylashuv': company.location || '',
    'Website': company.website || '',
    'Email': company.email || '',
    'Holat': company.isActive ? 'Faol' : 'Nofaol',
    'Yaratilgan': new Date(company.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `companies-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Brands data to CSV
 */
export function exportBrandsToCSV(brands: any[]): void {
  const formatted = brands.map(brand => ({
    'Nom': brand.name,
    'Website': brand.website || '',
    'Email': brand.email || '',
    'Telefon': brand.phone || '',
    'Holat': brand.isActive ? 'Faol' : 'Nofaol',
    'Yaratilgan': new Date(brand.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `brands-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Categories data to CSV
 */
export function exportCategoriesToCSV(categories: any[]): void {
  const formatted = categories.map(category => ({
    'Nom': category.name,
    'Slug': category.slug,
    'Turi': category.type,
    'Holat': category.isActive ? 'Faol' : 'Nofaol',
    'Yaratilgan': new Date(category.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `categories-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Universities data to CSV
 */
export function exportUniversitiesToCSV(universities: any[]): void {
  const formatted = universities.map(university => ({
    'Nom': university.name,
    'Qisqa nom': university.shortName || '',
    'Joylashuv': university.location || '',
    'Website': university.website || '',
    'Holat': university.isActive ? 'Faol' : 'Nofaol',
    'Yaratilgan': new Date(university.createdAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `universities-${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export Blog Posts data to CSV
 */
export function exportBlogPostsToCSV(posts: any[]): void {
  const formatted = posts.map(post => ({
    'Sarlavha': post.title,
    'Muallif': `${post.author?.firstName} ${post.author?.lastName}`,
    'Teglar': Array.isArray(post.tags) ? post.tags.join(', ') : '',
    'Holat': post.isPublished ? 'Nashr qilingan' : 'Qoralama',
    'Ko\'rishlar': post.viewCount || 0,
    'Yaratilgan': new Date(post.createdAt).toLocaleDateString('uz-UZ'),
    'Yangilangan': new Date(post.updatedAt).toLocaleDateString('uz-UZ'),
  }));

  downloadCSV(formatted, `blog-posts-${new Date().toISOString().split('T')[0]}`);
}
