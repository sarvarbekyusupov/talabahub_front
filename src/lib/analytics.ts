// Google Analytics and Conversion Tracking

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;

  // Load gtag.js script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
interface EventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const event = ({ action, category, label, value }: EventParams) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Conversion Tracking
export const trackConversion = {
  // Track job application
  jobApplication: (jobId: string, jobTitle: string) => {
    event({
      action: 'job_application',
      category: 'conversion',
      label: jobTitle,
      value: 1,
    });

    // Send custom event for detailed tracking
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${GA_TRACKING_ID}/job_application`,
        job_id: jobId,
        job_title: jobTitle,
      });
    }
  },

  // Track course enrollment
  courseEnrollment: (courseId: string, courseTitle: string, price: number) => {
    event({
      action: 'course_enrollment',
      category: 'conversion',
      label: courseTitle,
      value: price,
    });

    // Enhanced ecommerce tracking
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: `enrollment_${Date.now()}`,
        value: price,
        currency: 'UZS',
        items: [
          {
            item_id: courseId,
            item_name: courseTitle,
            item_category: 'Course',
            price: price,
            quantity: 1,
          },
        ],
      });
    }
  },

  // Track event registration
  eventRegistration: (eventId: string, eventTitle: string) => {
    event({
      action: 'event_registration',
      category: 'conversion',
      label: eventTitle,
      value: 1,
    });

    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${GA_TRACKING_ID}/event_registration`,
        event_id: eventId,
        event_title: eventTitle,
      });
    }
  },

  // Track discount usage
  discountUsage: (discountId: string, discountTitle: string) => {
    event({
      action: 'discount_usage',
      category: 'conversion',
      label: discountTitle,
      value: 1,
    });
  },

  // Track sign up
  signUp: (method: string) => {
    event({
      action: 'sign_up',
      category: 'user',
      label: method,
      value: 1,
    });

    if (window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method,
      });
    }
  },

  // Track login
  login: (method: string) => {
    event({
      action: 'login',
      category: 'user',
      label: method,
      value: 1,
    });

    if (window.gtag) {
      window.gtag('event', 'login', {
        method: method,
      });
    }
  },
};

// Track user engagement
export const trackEngagement = {
  // Track content view
  contentView: (contentType: string, contentId: string, contentTitle: string) => {
    event({
      action: 'view_content',
      category: 'engagement',
      label: `${contentType}: ${contentTitle}`,
      value: 1,
    });

    if (window.gtag) {
      window.gtag('event', 'view_item', {
        items: [
          {
            item_id: contentId,
            item_name: contentTitle,
            item_category: contentType,
          },
        ],
      });
    }
  },

  // Track search
  search: (searchTerm: string, resultsCount: number) => {
    event({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
      value: resultsCount,
    });

    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm,
        results_count: resultsCount,
      });
    }
  },

  // Track save/bookmark
  saveContent: (contentType: string, contentId: string) => {
    event({
      action: 'save_content',
      category: 'engagement',
      label: contentType,
      value: 1,
    });
  },

  // Track share
  share: (contentType: string, contentId: string, method: string) => {
    event({
      action: 'share',
      category: 'engagement',
      label: `${contentType} via ${method}`,
      value: 1,
    });

    if (window.gtag) {
      window.gtag('event', 'share', {
        method: method,
        content_type: contentType,
        content_id: contentId,
      });
    }
  },

  // Track review submission
  submitReview: (contentType: string, rating: number) => {
    event({
      action: 'submit_review',
      category: 'engagement',
      label: contentType,
      value: rating,
    });
  },
};

// Track Core Web Vitals
export const trackWebVitals = (metric: {
  id: string;
  name: string;
  label: string;
  value: number;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
  });
};

// Track errors
export const trackError = (error: Error, errorInfo?: any) => {
  event({
    action: 'error',
    category: 'error',
    label: error.message,
    value: 1,
  });

  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
    });
  }
};
