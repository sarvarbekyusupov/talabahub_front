# TalabaHub Frontend Build Documentation

**Date:** November 15, 2024
**Developer:** Claude AI
**Project:** TalabaHub Frontend
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Components Built](#components-built)
5. [Pages Implemented](#pages-implemented)
6. [Features](#features)
7. [Setup and Installation](#setup-and-installation)
8. [Environment Variables](#environment-variables)
9. [Running the Project](#running-the-project)
10. [Build Process](#build-process)
11. [Deployment](#deployment)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

TalabaHub is a comprehensive student platform for Uzbekistan universities that provides:
- **Student Discounts** - Exclusive deals from partner brands
- **Job Opportunities** - Part-time and full-time positions
- **Events** - Conferences, workshops, seminars, and networking events
- **Courses** - Educational courses and training programs

The frontend is built with a minimalistic, modern design focusing on usability and performance.

---

## Technology Stack

### Core Technologies
- **Next.js 15.5.6** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 3.4** - Utility-first CSS framework

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## Project Structure

```
talabahub_front/
├── docs/                          # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── FEATURES_GUIDE.md
│   ├── FRONTEND_INTEGRATION_GUIDE.md
│   └── FRONTEND_BUILD_DOCUMENTATION.md
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── courses/
│   │   │   └── page.tsx          # Courses listing
│   │   ├── discounts/
│   │   │   └── page.tsx          # Discounts listing
│   │   ├── events/
│   │   │   └── page.tsx          # Events listing
│   │   ├── jobs/
│   │   │   └── page.tsx          # Jobs listing
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── profile/
│   │   │   └── page.tsx          # User profile
│   │   ├── register/
│   │   │   └── page.tsx          # Registration page
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Navigation header
│   │   │   └── Footer.tsx         # Footer component
│   │   └── ui/
│   │       ├── Badge.tsx          # Badge component
│   │       ├── Button.tsx         # Button component
│   │       ├── Card.tsx           # Card component
│   │       ├── Container.tsx      # Container wrapper
│   │       └── Input.tsx          # Input component
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   └── auth.ts                # Authentication utilities
│   └── types/
│       └── index.ts               # TypeScript type definitions
├── .eslintrc.json                 # ESLint configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies
├── postcss.config.mjs             # PostCSS configuration
├── tailwind.config.ts             # Tailwind configuration
└── tsconfig.json                  # TypeScript configuration
```

---

## Components Built

### UI Components

#### 1. Button Component (`src/components/ui/Button.tsx`)
- **Variants**: primary, secondary, outline, ghost
- **Sizes**: sm, md, lg
- **Features**: Loading state, full width option, disabled state
- **Usage**:
  ```tsx
  <Button variant="primary" size="md" loading={false}>
    Click Me
  </Button>
  ```

#### 2. Input Component (`src/components/ui/Input.tsx`)
- **Features**: Label, error message, full width option
- **Usage**:
  ```tsx
  <Input
    label="Email"
    type="email"
    error={errors.email}
    value={email}
    onChange={handleChange}
  />
  ```

#### 3. Card Component (`src/components/ui/Card.tsx`)
- **Padding Options**: none, sm, md, lg
- **Features**: Hover effect, shadow
- **Usage**:
  ```tsx
  <Card padding="md" hover>
    <h3>Card Title</h3>
    <p>Card content</p>
  </Card>
  ```

#### 4. Badge Component (`src/components/ui/Badge.tsx`)
- **Variants**: primary, success, warning, danger, info
- **Sizes**: sm, md
- **Usage**:
  ```tsx
  <Badge variant="success">Active</Badge>
  ```

#### 5. Container Component (`src/components/ui/Container.tsx`)
- **Max Widths**: sm, md, lg, xl, 2xl, full
- **Features**: Responsive padding, centered layout
- **Usage**:
  ```tsx
  <Container maxWidth="xl">
    <h1>Content</h1>
  </Container>
  ```

### Layout Components

#### Header (`src/components/layout/Header.tsx`)
- Sticky navigation bar
- Mobile-responsive menu
- Authentication state handling
- Links to all main pages

#### Footer (`src/components/layout/Footer.tsx`)
- Site information
- Quick links
- Contact information
- Copyright notice

---

## Pages Implemented

### 1. Home Page (`src/app/page.tsx`)
- **Sections**:
  - Hero section with call-to-action
  - Features showcase (4 main features)
  - Statistics section
  - Final CTA section
- **Design**: Gradient backgrounds, modern cards, responsive grid

### 2. Login Page (`src/app/login/page.tsx`)
- **Features**:
  - Email and password authentication
  - Remember me checkbox
  - Forgot password link
  - Link to registration
  - Error handling
- **API Integration**: POST `/api/auth/login`

### 3. Registration Page (`src/app/register/page.tsx`)
- **Fields**:
  - First name, last name
  - Email, phone
  - Password, confirm password
- **Validation**: Password matching, required fields
- **API Integration**: POST `/api/auth/register`

### 4. Discounts Page (`src/app/discounts/page.tsx`)
- **Features**:
  - Grid layout (responsive 1-3 columns)
  - Discount percentage badges
  - Brand and category information
  - Promo codes display
  - Valid until dates
- **API Integration**: GET `/api/discounts`

### 5. Jobs Page (`src/app/jobs/page.tsx`)
- **Features**:
  - Job type badges (full-time, part-time, internship, contract)
  - Company logos
  - Salary information
  - Location and deadline
  - Apply button
- **API Integration**: GET `/api/jobs`

### 6. Events Page (`src/app/events/page.tsx`)
- **Features**:
  - Event type badges
  - Date and location with icons
  - Participant count
  - Registration button
- **API Integration**: GET `/api/events`

### 7. Courses Page (`src/app/courses/page.tsx`)
- **Features**:
  - Course images
  - Partner/education center info
  - Duration and price display
  - Enrollment button
- **API Integration**: GET `/api/courses`

### 8. Profile Page (`src/app/profile/page.tsx`)
- **Features**:
  - User avatar with initials
  - Profile information display
  - Edit mode for updating profile
  - University and faculty information
- **API Integration**:
  - GET `/api/users/profile`
  - PATCH `/api/users/profile`

---

## Features

### Authentication
- JWT token-based authentication
- Local storage for token persistence
- Protected routes
- Automatic redirect to login for unauthenticated users

### API Integration
- Centralized API client (`src/lib/api.ts`)
- Type-safe API calls
- Error handling
- Bearer token authentication

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hamburger menu for mobile
- Responsive grids and layouts

### Type Safety
- Full TypeScript coverage
- Comprehensive type definitions
- Interface for all data models

### UI/UX
- Minimalistic design
- Consistent color scheme (Blue primary color)
- Smooth transitions and hover effects
- Loading states
- Error messages

---

## Setup and Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talabahub_front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

---

## Environment Variables

### Required Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# For production
NEXT_PUBLIC_API_URL=https://api.talabahub.com/api
```

---

## Running the Project

### Development Mode
```bash
npm run dev
```
Starts the development server on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## Build Process

### Build Output
```
Route (app)                                 Size  First Load JS
┌ ○ /                                      161 B         105 kB
├ ○ /courses                             2.41 kB         104 kB
├ ○ /discounts                           2.14 kB         104 kB
├ ○ /events                              2.98 kB         105 kB
├ ○ /jobs                                2.67 kB         105 kB
├ ○ /login                               2.78 kB         108 kB
├ ○ /profile                             3.09 kB         105 kB
└ ○ /register                            2.89 kB         108 kB
```

### Optimizations
- Static page generation
- Code splitting
- Tree shaking
- Minification
- Image optimization (when images are added)

---

## Deployment

### Deployment Options

#### 1. Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

#### 2. Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t talabahub-frontend .
docker run -p 3000:3000 talabahub-frontend
```

#### 3. Static Export
```bash
# Add to next.config.ts: output: 'export'
npm run build
# Deploy the 'out' directory to any static hosting
```

---

## Future Enhancements

### Short Term
1. **Search Functionality**
   - Global search bar
   - Filter and sort options
   - Search suggestions/autocomplete

2. **User Dashboard**
   - Saved discounts
   - Job applications tracking
   - Event registrations
   - Course enrollments

3. **Detail Pages**
   - Individual discount details
   - Job detail pages with apply form
   - Event detail pages
   - Course curriculum pages

### Medium Term
4. **Advanced Features**
   - Notifications system
   - Favorites/bookmarks
   - User reviews and ratings
   - Social sharing

5. **Payment Integration**
   - Click.uz integration
   - Payme integration
   - Course payment flow

6. **Admin Panel**
   - Content management
   - User management
   - Analytics dashboard

### Long Term
7. **Mobile App**
   - React Native app
   - Push notifications
   - Offline support

8. **Internationalization**
   - Multi-language support (Uzbek, Russian, English)
   - Currency conversion
   - Locale-specific content

---

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile

### Discounts
- `GET /api/discounts` - List all discounts
- `GET /api/discounts/:id` - Get discount details

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply for job

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/register` - Register for event

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course

### Search
- `GET /api/search?query={query}` - Global search
- `GET /api/search/suggestions?query={query}` - Search suggestions

---

## Development Notes

### Code Style
- **Functional components** with hooks
- **TypeScript strict mode** enabled
- **Tailwind CSS** for styling (no custom CSS modules)
- **Client components** where interactivity is needed

### Best Practices Followed
1. Component reusability
2. Type safety with TypeScript
3. Responsive design mobile-first
4. Consistent naming conventions
5. Error boundary handling
6. Loading states
7. Accessibility considerations

### Known Issues
- Google Fonts (Inter) removed due to network restrictions in build environment
- Using system fonts as fallback
- Can be re-enabled in production with proper network access

---

## Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Test locally
4. Build and verify
5. Create pull request
6. Code review
7. Merge to main

### Commit Message Format
```
feat: Add discount detail page
fix: Resolve login token issue
docs: Update API documentation
style: Improve mobile responsiveness
refactor: Simplify API client
```

---

## Support and Contact

For questions or issues:
- **Email**: info@talabahub.com
- **GitHub**: https://github.com/sarvarbekyusupov/talabahub_front
- **Documentation**: See `/docs` directory

---

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ for Uzbekistan students**
