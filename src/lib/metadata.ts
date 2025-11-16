import { Metadata } from 'next';

// Default site metadata
export const DEFAULT_SITE_NAME = 'TalabaHub';
export const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://talabahub.uz';
export const DEFAULT_SITE_DESCRIPTION =
  "O'zbekistondagi talabalar uchun ish o'rinlari, kurslar, tadbirlar va chegirmalar platformasi";

// Default Open Graph image
export const DEFAULT_OG_IMAGE = `${DEFAULT_SITE_URL}/og-image.png`;

// Base metadata for all pages
export const baseMetadata: Metadata = {
  metadataBase: new URL(DEFAULT_SITE_URL),
  applicationName: DEFAULT_SITE_NAME,
  creator: 'TalabaHub',
  publisher: 'TalabaHub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

interface GenerateMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  imageUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}

/**
 * Generate metadata for a page
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  imageUrl,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  section,
}: GenerateMetadataParams): Metadata {
  const fullTitle = `${title} - ${DEFAULT_SITE_NAME}`;
  const ogImage = imageUrl || DEFAULT_OG_IMAGE;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    openGraph: {
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      siteName: DEFAULT_SITE_NAME,
      locale: 'uz_UZ',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@talabahub',
      site: '@talabahub',
    },
  };

  return metadata;
}

/**
 * Generate metadata for job detail page
 */
export function generateJobMetadata(job: {
  title: string;
  description: string;
  company: { name: string; logoUrl?: string };
  location: string;
  jobType: string;
  salary?: string;
}) {
  const keywords = [
    'ish o\'rinlari',
    'talabalar uchun ish',
    job.company.name,
    job.location,
    job.jobType,
    'part-time',
    'full-time',
    'amaliyot',
    'O\'zbekiston',
  ];

  return generateMetadata({
    title: `${job.title} - ${job.company.name}`,
    description: `${job.description.slice(0, 155)}...`,
    keywords,
    imageUrl: job.company.logoUrl,
    type: 'website',
  });
}

/**
 * Generate metadata for course detail page
 */
export function generateCourseMetadata(course: {
  title: string;
  description: string;
  partner: { name: string; logoUrl?: string };
  price: number;
  duration?: string;
  imageUrl?: string;
}) {
  const keywords = [
    'kurslar',
    'o\'quv kurslari',
    'talabalar uchun kurslar',
    course.partner.name,
    'treninglar',
    'ta\'lim',
    'O\'zbekiston',
  ];

  return generateMetadata({
    title: course.title,
    description: `${course.description.slice(0, 155)}... | ${course.partner.name} - ${new Intl.NumberFormat('uz-UZ').format(course.price)} so'm`,
    keywords,
    imageUrl: course.imageUrl,
    type: 'website',
  });
}

/**
 * Generate metadata for event detail page
 */
export function generateEventMetadata(event: {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  eventType: string;
  imageUrl?: string;
}) {
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const keywords = [
    'tadbirlar',
    'talabalar uchun tadbirlar',
    event.eventType,
    event.location,
    'konferensiya',
    'seminar',
    'networking',
    'O\'zbekiston',
  ];

  return generateMetadata({
    title: event.title,
    description: `${event.description.slice(0, 155)}... | ${formattedDate}, ${event.location}`,
    keywords,
    imageUrl: event.imageUrl,
    type: 'website',
  });
}

/**
 * Generate metadata for discount detail page
 */
export function generateDiscountMetadata(discount: {
  title: string;
  description: string;
  brand: { name: string; logoUrl?: string };
  discount: number;
  validUntil: string;
  imageUrl?: string;
}) {
  const validUntil = new Date(discount.validUntil).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const keywords = [
    'chegirmalar',
    'talabalar uchun chegirmalar',
    discount.brand.name,
    'aksiyalar',
    'arzon narxlar',
    'student discount',
    'O\'zbekiston',
  ];

  return generateMetadata({
    title: `${discount.title} - ${discount.discount}% chegirma`,
    description: `${discount.description.slice(0, 140)}... | ${discount.brand.name} - ${validUntil} gacha`,
    keywords,
    imageUrl: discount.imageUrl || discount.brand.logoUrl,
    type: 'website',
  });
}

/**
 * Static metadata for list pages
 */
export const jobsPageMetadata = generateMetadata({
  title: "Ish o'rinlari",
  description:
    "Talabalar uchun part-time va full-time ish imkoniyatlari. O'zbekistondagi eng yaxshi kompaniyalarda ishlash imkoniyati.",
  keywords: [
    'ish o\'rinlari',
    'talabalar uchun ish',
    'part-time ish',
    'full-time ish',
    'amaliyot',
    'stajyorovka',
    'O\'zbekiston',
    'Toshkent',
  ],
  type: 'website',
});

export const coursesPageMetadata = generateMetadata({
  title: 'Kurslar',
  description:
    "Kasbiy rivojlanish uchun o'quv kurslari va treninglar. O'zbekistondagi eng yaxshi ta'lim markazlari va mutaxassislar bilan.",
  keywords: [
    'kurslar',
    'o\'quv kurslari',
    'treninglar',
    'talabalar uchun kurslar',
    'kasbiy rivojlanish',
    'ta\'lim',
    'O\'zbekiston',
    'online kurslar',
  ],
  type: 'website',
});

export const eventsPageMetadata = generateMetadata({
  title: 'Tadbirlar',
  description:
    "Konferensiyalar, seminarlar va networking tadbirlari. O'zbekistondagi eng qiziqarli talabalar tadbirlari bir joyda.",
  keywords: [
    'tadbirlar',
    'talabalar uchun tadbirlar',
    'konferensiya',
    'seminar',
    'workshop',
    'networking',
    'musobaqa',
    'O\'zbekiston',
    'Toshkent',
  ],
  type: 'website',
});

export const discountsPageMetadata = generateMetadata({
  title: 'Chegirmalar',
  description:
    "Talabalar uchun maxsus chegirmalar va takliflar. O'zbekistondagi eng mashhur brendlar va do'konlardan eksklyuziv chegirmalar.",
  keywords: [
    'chegirmalar',
    'talabalar uchun chegirmalar',
    'aksiyalar',
    'arzon narxlar',
    'student discount',
    'promo kod',
    'O\'zbekiston',
    'chegirma kartasi',
  ],
  type: 'website',
});

export const blogPageMetadata = generateMetadata({
  title: 'Blog',
  description:
    "Yangiliklar, maslahatlar va foydali maqolalar. Talabalar uchun karera, ta'lim va hayot haqida qiziqarli kontentlar.",
  keywords: [
    'blog',
    'maqolalar',
    'talabalar uchun blog',
    'yangiliklar',
    'maslahatlar',
    'karera',
    'ta\'lim',
    'student life',
    'O\'zbekiston',
  ],
  type: 'website',
});
