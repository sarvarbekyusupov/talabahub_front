# TALABA HUB - Frontend

> Modern student platform for Uzbekistan universities

## Overview

TalabaHub is a comprehensive platform connecting students with exclusive discounts, job opportunities, events, and educational courses. Built with Next.js 15, TypeScript, and Tailwind CSS with a minimalistic, modern design.

## Features

### Core Features
- **Student Discounts** - Exclusive deals from partner brands with filtering and sorting
- **Job Board** - Part-time and full-time opportunities with advanced search
- **Events** - Conferences, workshops, and networking with registration
- **Courses** - Educational programs and training with enrollment
- **User Profiles** - Personalized student profiles with avatar upload
- **Authentication** - Secure JWT-based auth with email verification

### Enhanced Features
- **Global Search** - Search across all content types with autocomplete suggestions
- **Advanced Filtering** - Filter discounts by category, jobs by type/location, etc.
- **Sorting Options** - Sort by newest, highest discount, deadline, and more
- **User Dashboard** - Track applications, saved items, and enrollments
- **File Uploads** - Upload profile avatars and resume files
- **Toast Notifications** - Real-time feedback for user actions
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Detail Pages** - Comprehensive views for discounts, jobs, events, and courses

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **API**: RESTful API integration

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sarvarbekyusupov/talabahub_front.git

# Navigate to project
cd talabahub_front

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # Reusable components
│   ├── layout/      # Header, Footer
│   └── ui/          # Button, Card, Input, etc.
├── lib/             # Utilities and API client
└── types/           # TypeScript definitions
```

## Pages

- `/` - Home page with hero, features, stats, and call-to-action
- `/login` - User login with JWT authentication
- `/register` - User registration with student verification
- `/discounts` - Browse discounts with filtering, sorting, and search
- `/discounts/[id]` - Discount detail page with promo code copy
- `/jobs` - Job listings with advanced filters (type, location)
- `/jobs/[id]` - Job detail page with application form and resume upload
- `/events` - Upcoming events with filtering
- `/events/[id]` - Event detail page with registration
- `/courses` - Available courses with filtering
- `/courses/[id]` - Course detail page with enrollment
- `/dashboard` - User dashboard with applications, saved items, and stats
- `/profile` - User profile with avatar upload and edit functionality
- `/search` - Global search results across all content types

## API Integration

The frontend connects to the TalabaHub backend API. See [API Documentation](./docs/API_DOCUMENTATION.md) for details.

### Example API Call

```typescript
import { api } from '@/lib/api';

// Get discounts
const discounts = await api.getDiscounts({ limit: 20 });

// Login
const { accessToken } = await api.login(email, password);
```

## Components

### UI Components

#### Button
```tsx
<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

#### Card
```tsx
<Card hover padding="md">
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

#### Input
```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
/>
```

#### Badge
```tsx
<Badge variant="success" size="md">
  -25%
</Badge>
```

#### ImageUpload
```tsx
<ImageUpload
  currentImage={avatarUrl}
  onUpload={handleUpload}
  onRemove={handleRemove}
  maxSizeMB={5}
/>
```

#### FileUpload
```tsx
<FileUpload
  currentFile={resumeUrl}
  onUpload={handleUpload}
  onRemove={handleRemove}
  maxSizeMB={10}
  acceptedTypes={['.pdf', '.doc', '.docx']}
  label="Upload Resume"
/>
```

#### Toast
```tsx
import { useToast } from '@/components/ui/Toast';

const { showToast } = useToast();
showToast('Success!', 'success');
```

#### SearchBar
```tsx
<SearchBar placeholder="Qidirish..." />
```

### Layout Components

- **Header** - Navigation with search bar and user menu
- **Footer** - Site footer with links and information
- **Container** - Responsive container wrapper

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Docker

```bash
docker build -t talabahub-frontend .
docker run -p 3000:3000 talabahub-frontend
```

## Documentation

- [Frontend Build Documentation](./docs/FRONTEND_BUILD_DOCUMENTATION.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Frontend Integration Guide](./docs/FRONTEND_INTEGRATION_GUIDE.md)
- [Features Guide](./docs/FEATURES_GUIDE.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contact

- Website: [talabahub.com](https://talabahub.com)
- Email: info@talabahub.com
- GitHub: [@sarvarbekyusupov](https://github.com/sarvarbekyusupov)

---

Built with ❤️ for Uzbekistan students
