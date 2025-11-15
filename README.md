# TALABA HUB - Frontend

> Modern student platform for Uzbekistan universities

## Overview

TalabaHub is a comprehensive platform connecting students with exclusive discounts, job opportunities, events, and educational courses. Built with Next.js 15, TypeScript, and Tailwind CSS with a minimalistic, modern design.

## Features

- **Student Discounts** - Exclusive deals from partner brands
- **Job Board** - Part-time and full-time opportunities
- **Events** - Conferences, workshops, and networking
- **Courses** - Educational programs and training
- **User Profiles** - Personalized student profiles
- **Authentication** - Secure JWT-based auth

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

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/discounts` - Browse discounts
- `/jobs` - Job listings
- `/events` - Upcoming events
- `/courses` - Available courses
- `/profile` - User profile

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

### Button

```tsx
<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

### Card

```tsx
<Card hover padding="md">
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### Input

```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
/>
```

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
