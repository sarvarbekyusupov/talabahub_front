import { z } from 'zod';

// Common field validations
export const emailSchema = z.string().email('Email manzil noto\'g\'ri formatda');
export const passwordSchema = z.string().min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
export const phoneSchema = z.string().regex(
  /^(\+998)?[\s-]?\(?[0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
  'Telefon raqami noto\'g\'ri formatda'
);
export const urlSchema = z.string().url('URL manzil noto\'g\'ri formatda');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'To\'liq ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phoneNumber: phoneSchema.optional(),
  universityId: z.string().optional(),
  role: z.enum(['student', 'partner', 'admin']).default('student'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parollar mos kelmaydi',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Parollar mos kelmaydi',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Parollar mos kelmaydi',
  path: ['confirmPassword'],
});

// Profile schemas
export const profileSchema = z.object({
  fullName: z.string().min(2, 'To\'liq ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  email: emailSchema,
  phoneNumber: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio maksimal 500 ta belgidan iborat bo\'lishi mumkin').optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  universityId: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.number().min(2000).max(2050).optional(),
});

// Content creation schemas
export const jobSchema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().min(50, 'Tavsif kamida 50 ta belgidan iborat bo\'lishi kerak'),
  companyId: z.string().min(1, 'Kompaniyani tanlang'),
  categoryId: z.string().min(1, 'Kategoriyani tanlang'),
  location: z.string().min(2, 'Manzilni kiriting'),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior']),
  salary: z.object({
    min: z.number().min(0, 'Minimal maosh musbat son bo\'lishi kerak'),
    max: z.number().min(0, 'Maksimal maosh musbat son bo\'lishi kerak'),
    currency: z.string().default('UZS'),
  }).optional(),
  requirements: z.array(z.string()).min(1, 'Kamida bitta talab kiriting'),
  responsibilities: z.array(z.string()).min(1, 'Kamida bitta mas\'uliyat kiriting'),
  benefits: z.array(z.string()).optional(),
  applicationDeadline: z.string().optional(),
  imageUrl: urlSchema.optional(),
});

export const courseSchema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().min(50, 'Tavsif kamida 50 ta belgidan iborat bo\'lishi kerak'),
  categoryId: z.string().min(1, 'Kategoriyani tanlang'),
  educationPartnerId: z.string().min(1, 'Ta\'lim hamkorini tanlang'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(1, 'Davomiylik musbat son bo\'lishi kerak'), // in hours
  price: z.number().min(0, 'Narx musbat son bo\'lishi kerak'),
  discount: z.number().min(0).max(100).optional(),
  maxStudents: z.number().min(1, 'Maksimal talabalar soni musbat son bo\'lishi kerak').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  schedule: z.string().optional(),
  learningObjectives: z.array(z.string()).min(1, 'Kamida bitta o\'quv maqsadini kiriting'),
  prerequisites: z.array(z.string()).optional(),
  syllabus: z.string().optional(),
  imageUrl: urlSchema.optional(),
  certificateOffered: z.boolean().default(false),
});

export const eventSchema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().min(50, 'Tavsif kamida 50 ta belgidan iborat bo\'lishi kerak'),
  categoryId: z.string().min(1, 'Kategoriyani tanlang'),
  organizerId: z.string().min(1, 'Tashkilotchini tanlang'),
  eventDate: z.string().min(1, 'Tadbirning sanasini kiriting'),
  startTime: z.string().min(1, 'Boshlanish vaqtini kiriting'),
  endTime: z.string().min(1, 'Tugash vaqtini kiriting'),
  location: z.string().min(2, 'Manzilni kiriting'),
  format: z.enum(['online', 'offline', 'hybrid']),
  maxAttendees: z.number().min(1, 'Maksimal ishtirokchilar soni musbat son bo\'lishi kerak').optional(),
  registrationDeadline: z.string().optional(),
  fee: z.number().min(0, 'To\'lov musbat son bo\'lishi kerak').optional(),
  imageUrl: urlSchema.optional(),
  agenda: z.string().optional(),
  speakers: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const discountSchema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().min(20, 'Tavsif kamida 20 ta belgidan iborat bo\'lishi kerak'),
  brandId: z.string().min(1, 'Brendni tanlang'),
  categoryId: z.string().min(1, 'Kategoriyani tanlang'),
  discountPercent: z.number().min(1, 'Chegirma foizi 1 dan kichik bo\'lmasligi kerak')
    .max(100, 'Chegirma foizi 100 dan oshmasligi kerak'),
  code: z.string().optional(),
  startDate: z.string().min(1, 'Boshlanish sanasini kiriting'),
  endDate: z.string().min(1, 'Tugash sanasini kiriting'),
  termsAndConditions: z.string().optional(),
  maxUsage: z.number().min(1, 'Maksimal foydalanish soni musbat son bo\'lishi kerak').optional(),
  imageUrl: urlSchema.optional(),
  link: urlSchema.optional(),
});

// Review schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Baho 1 dan kichik bo\'lmasligi kerak')
    .max(5, 'Baho 5 dan oshmasligi kerak'),
  comment: z.string().min(10, 'Izoh kamida 10 ta belgidan iborat bo\'lishi kerak')
    .max(500, 'Izoh maksimal 500 ta belgidan iborat bo\'lishi mumkin'),
});

// Application schema
export const jobApplicationSchema = z.object({
  coverLetter: z.string().min(50, 'Qo\'shimcha ma\'lumot kamida 50 ta belgidan iborat bo\'lishi kerak')
    .max(1000, 'Qo\'shimcha ma\'lumot maksimal 1000 ta belgidan iborat bo\'lishi mumkin'),
  resumeUrl: urlSchema.optional(),
  portfolioUrl: urlSchema.optional(),
});

// Company schema
export const companySchema = z.object({
  name: z.string().min(2, 'Kompaniya nomi kamida 2 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().min(50, 'Tavsif kamida 50 ta belgidan iborat bo\'lishi kerak'),
  website: urlSchema.optional(),
  industry: z.string().min(2, 'Sohani kiriting'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  location: z.string().min(2, 'Manzilni kiriting'),
  logoUrl: urlSchema.optional(),
  founded: z.number().min(1900).max(new Date().getFullYear()).optional(),
});

// Brand schema
export const brandSchema = z.object({
  name: z.string().min(2, 'Brend nomi kamida 2 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().min(20, 'Tavsif kamida 20 ta belgidan iborat bo\'lishi kerak'),
  website: urlSchema.optional(),
  logoUrl: urlSchema.optional(),
  categoryId: z.string().min(1, 'Kategoriyani tanlang'),
});

// University schema
export const universitySchema = z.object({
  name: z.string().min(2, 'Universitet nomi kamida 2 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().optional(),
  website: urlSchema.optional(),
  location: z.string().min(2, 'Manzilni kiriting'),
  logoUrl: urlSchema.optional(),
  established: z.number().min(1900).max(new Date().getFullYear()).optional(),
});

// Search/Filter schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Qidiruv so\'rovini kiriting'),
  category: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export const jobFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  companyId: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior']).optional(),
  location: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const courseFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  educationPartnerId: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  certificateOffered: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Helper function to validate data
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: 'Validatsiya xatosi' } };
  }
}

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type UniversityInput = z.infer<typeof universitySchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type JobFilterInput = z.infer<typeof jobFilterSchema>;
export type CourseFilterInput = z.infer<typeof courseFilterSchema>;

// ========== JOBS MODULE EXTENDED SCHEMAS ==========

export const createJobSchema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().min(50, 'Tavsif kamida 50 ta belgidan iborat bo\'lishi kerak'),
  companyName: z.string().min(2, 'Kompaniya nomini kiriting'),
  location: z.string().min(2, 'Manzilni kiriting'),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead']),
  salaryMin: z.number().min(0, 'Minimal maosh musbat son bo\'lishi kerak').optional(),
  salaryMax: z.number().min(0, 'Maksimal maosh musbat son bo\'lishi kerak').optional(),
  skills: z.array(z.string()).min(1, 'Kamida bitta ko\'nikma kiriting'),
  isPremium: z.boolean().optional(),
  featuredUntil: z.string().optional(),
});

export const jobApplySchema = z.object({
  resumeId: z.number().min(1, 'Rezyumeni tanlang'),
  coverLetter: z.string().max(2000, 'Qo\'shimcha ma\'lumot maksimal 2000 ta belgidan iborat bo\'lishi mumkin').optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['reviewed', 'shortlisted', 'rejected', 'hired']),
  feedback: z.string().max(1000, 'Fikr-mulohaza maksimal 1000 ta belgidan iborat bo\'lishi mumkin').optional(),
});

// ========== EVENTS MODULE EXTENDED SCHEMAS ==========

export const createEventExtendedSchema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 ta belgidan iborat bo\'lishi kerak'),
  description: z.string().min(50, 'Tavsif kamida 50 ta belgidan iborat bo\'lishi kerak'),
  startDate: z.string().min(1, 'Boshlanish sanasini kiriting'),
  endDate: z.string().min(1, 'Tugash sanasini kiriting'),
  location: z.string().min(2, 'Manzilni kiriting'),
  isVirtual: z.boolean().optional(),
  virtualLink: z.string().url('Virtual havola noto\'g\'ri formatda').optional(),
  capacity: z.number().min(1, 'Sig\'im musbat son bo\'lishi kerak'),
  registrationDeadline: z.string().optional(),
  isPublic: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const ticketTypeSchema = z.object({
  name: z.string().min(2, 'Chipta turi nomini kiriting'),
  price: z.number().min(0, 'Narx musbat son bo\'lishi kerak'),
  quantity: z.number().min(1, 'Miqdor musbat son bo\'lishi kerak'),
  description: z.string().max(500).optional(),
  salesStartDate: z.string().optional(),
  salesEndDate: z.string().optional(),
  maxPerUser: z.number().min(1).max(10).optional(),
});

export const eventRegisterSchema = z.object({
  ticketTypeId: z.number().min(1, 'Chipta turini tanlang'),
  quantity: z.number().min(1).max(10).optional(),
  joinWaitlist: z.boolean().optional(),
});

export const eventFeedbackSchema = z.object({
  rating: z.number().min(1, 'Baho 1 dan kichik bo\'lmasligi kerak').max(5, 'Baho 5 dan oshmasligi kerak'),
  comment: z.string().max(1000, 'Izoh maksimal 1000 ta belgidan iborat bo\'lishi mumkin').optional(),
  isAnonymous: z.boolean().optional(),
  categories: z.object({
    content: z.number().min(1).max(5).optional(),
    organization: z.number().min(1).max(5).optional(),
    venue: z.number().min(1).max(5).optional(),
    networking: z.number().min(1).max(5).optional(),
  }).optional(),
});

export const checkInSchema = z.object({
  confirmationCode: z.string().min(1, 'Tasdiqlash kodini kiriting'),
  method: z.enum(['qr', 'manual']).optional(),
});

// ========== RESUMES MODULE SCHEMAS ==========

export const resumeEducationSchema = z.object({
  institution: z.string().min(2, 'Ta\'lim muassasasi nomini kiriting'),
  degree: z.string().min(2, 'Darajani kiriting'),
  field: z.string().min(2, 'Yo\'nalishni kiriting'),
  startDate: z.string().min(1, 'Boshlanish sanasini kiriting'),
  endDate: z.string().optional(),
  gpa: z.number().min(0).max(5).optional(),
});

export const resumeExperienceSchema = z.object({
  company: z.string().min(2, 'Kompaniya nomini kiriting'),
  title: z.string().min(2, 'Lavozimni kiriting'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Boshlanish sanasini kiriting'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(1000).optional(),
});

export const resumeSkillSchema = z.object({
  name: z.string().min(1, 'Ko\'nikma nomini kiriting'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  yearsOfExperience: z.number().min(0).optional(),
});

export const resumeLanguageSchema = z.object({
  name: z.string().min(1, 'Til nomini kiriting'),
  proficiency: z.enum(['basic', 'conversational', 'fluent', 'native']),
});

export const resumeCertificationSchema = z.object({
  name: z.string().min(2, 'Sertifikat nomini kiriting'),
  issuer: z.string().min(2, 'Beruvchi tashkilotni kiriting'),
  issueDate: z.string().min(1, 'Berilgan sanani kiriting'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url('URL noto\'g\'ri formatda').optional().or(z.literal('')),
});

export const resumeProjectSchema = z.object({
  name: z.string().min(2, 'Loyiha nomini kiriting'),
  description: z.string().max(1000).optional(),
  url: z.string().url('URL noto\'g\'ri formatda').optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  technologies: z.array(z.string()),
});

export const resumeSchema = z.object({
  title: z.string().min(3, 'Rezyume sarlavhasi kamida 3 ta belgidan iborat bo\'lishi kerak'),
  summary: z.string().max(2000, 'Qisqacha ma\'lumot maksimal 2000 ta belgidan iborat bo\'lishi mumkin').optional(),
  isPrimary: z.boolean().optional(),
  educations: z.array(resumeEducationSchema).optional(),
  experiences: z.array(resumeExperienceSchema).optional(),
  skills: z.array(resumeSkillSchema).optional(),
  languages: z.array(resumeLanguageSchema).optional(),
  certifications: z.array(resumeCertificationSchema).optional(),
  projects: z.array(resumeProjectSchema).optional(),
});

// Type exports for new schemas
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type JobApplyInput = z.infer<typeof jobApplySchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type CreateEventExtendedInput = z.infer<typeof createEventExtendedSchema>;
export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;
export type EventRegisterInput = z.infer<typeof eventRegisterSchema>;
export type EventFeedbackInput = z.infer<typeof eventFeedbackSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
export type ResumeEducationInput = z.infer<typeof resumeEducationSchema>;
export type ResumeExperienceInput = z.infer<typeof resumeExperienceSchema>;
export type ResumeSkillInput = z.infer<typeof resumeSkillSchema>;
export type ResumeLanguageInput = z.infer<typeof resumeLanguageSchema>;
export type ResumeCertificationInput = z.infer<typeof resumeCertificationSchema>;
export type ResumeProjectInput = z.infer<typeof resumeProjectSchema>;
