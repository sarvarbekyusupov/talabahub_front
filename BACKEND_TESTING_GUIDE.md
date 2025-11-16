# Backend Integration Testing Guide

This guide provides step-by-step instructions for testing the TALABA HUB frontend with the backend API.

## Prerequisites

- Backend API running at: `http://3.121.174.54:3030/api`
- Frontend development server running: `npm run dev`
- Browser with DevTools (Chrome/Firefox recommended)

## Environment Setup

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_API_URL=http://3.121.174.54:3030/api
```

## Testing Checklist

### 1. Authentication Flow

#### Registration
**Endpoint:** `POST /auth/register`

**Test Steps:**
1. Navigate to `/register`
2. Fill in the registration form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Phone: `+998901234567`
   - Password: `Test1234!` (must meet requirements)
   - Confirm Password: `Test1234!`
3. Click "Ro'yxatdan o'tish"

**Expected Result:**
- ✅ Redirect to `/login?registered=true`
- ✅ Success message displayed
- ✅ No console errors

**Validation Tests:**
- ❌ Short password: "Parol kamida 8 ta belgidan iborat bo'lishi kerak"
- ❌ Password mismatch: "Parollar mos kelmadi"
- ❌ Invalid email: "Email manzil noto'g'ri formatda"
- ❌ Short name: "Ism kamida 2 ta belgidan iborat bo'lishi kerak"

#### Login
**Endpoint:** `POST /auth/login`

**Test Steps:**
1. Navigate to `/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test1234!`
3. Click "Kirish"

**Expected Result:**
- ✅ Token stored in localStorage
- ✅ Redirect to `/dashboard`
- ✅ User info displayed in header

**Error Cases:**
- ❌ Wrong password: Error message displayed
- ❌ Non-existent email: Error message displayed
- ❌ Empty fields: Validation errors

#### Logout
**Endpoint:** `POST /auth/logout`

**Test Steps:**
1. Click logout button in header
2. Confirm logout

**Expected Result:**
- ✅ Token removed from localStorage
- ✅ Redirect to homepage
- ✅ Header shows "Kirish" button

---

### 2. Jobs & Applications

#### Browse Jobs
**Endpoint:** `GET /jobs`

**Test Steps:**
1. Navigate to `/jobs`
2. Wait for jobs to load
3. Try filters:
   - Search: "developer"
   - Location: Select a location
   - Job Type: "Full-time"

**Expected Result:**
- ✅ Jobs list displayed
- ✅ Skeleton loaders shown while loading
- ✅ Filters work correctly
- ✅ Pagination works

#### View Job Details
**Endpoint:** `GET /jobs/:id`

**Test Steps:**
1. Click on any job card
2. Review job details page

**Expected Result:**
- ✅ Full job description displayed
- ✅ Company info shown
- ✅ Application deadline visible
- ✅ Apply button present (if logged in)

#### Apply for Job
**Endpoint:** `POST /jobs/:id/apply`

**Test Steps:**
1. Login first
2. Navigate to a job details page
3. Click "Ariza topshirish"
4. Fill cover letter
5. Submit application

**Expected Result:**
- ✅ Application submitted successfully
- ✅ Success message shown
- ✅ Button changes to "Ariza topshirilgan"
- ✅ Application appears in `/dashboard` applications list

#### View My Applications
**Endpoint:** `GET /jobs/me/applications`

**Test Steps:**
1. Login
2. Navigate to `/dashboard`
3. Check "Mening arizalarim" section

**Expected Result:**
- ✅ All submitted applications listed
- ✅ Status badges shown correctly
- ✅ Application details accessible

---

### 3. Courses

#### Browse Courses
**Endpoint:** `GET /courses`

**Test Steps:**
1. Navigate to `/courses`
2. Search for courses
3. Check course cards display

**Expected Result:**
- ✅ Courses grid displayed
- ✅ Search works
- ✅ Price formatting correct
- ✅ Partner names shown

#### View Course Details
**Endpoint:** `GET /courses/:id`

**Test Steps:**
1. Click on a course
2. Review course details

**Expected Result:**
- ✅ Course content displayed
- ✅ Enrollment button shown
- ✅ Reviews/ratings visible

#### Enroll in Course
**Endpoint:** `POST /courses/:id/enroll`

**Test Steps:**
1. Login
2. Navigate to course details
3. Click "Yozilish"
4. Confirm enrollment

**Expected Result:**
- ✅ Enrollment successful
- ✅ Course appears in dashboard
- ✅ Access to course content

---

### 4. Events

#### Browse Events
**Endpoint:** `GET /events`

**Test Steps:**
1. Navigate to `/events`
2. Filter by date range
3. Filter by event type

**Expected Result:**
- ✅ Events displayed
- ✅ Filters work
- ✅ Event dates formatted correctly

#### Register for Event
**Endpoint:** `POST /events/:id/register`

**Test Steps:**
1. Login
2. Click on an event
3. Click "Ro'yxatdan o'tish"

**Expected Result:**
- ✅ Registration successful
- ✅ Confirmation shown
- ✅ Attendee count updated

---

### 5. Discounts

#### Browse Discounts
**Endpoint:** `GET /discounts`

**Test Steps:**
1. Navigate to `/discounts`
2. Filter by category
3. Sort by discount percentage

**Expected Result:**
- ✅ Discounts grid shown
- ✅ Discount percentages visible
- ✅ Brand logos displayed
- ✅ Promo codes shown

#### View Discount Details
**Endpoint:** `GET /discounts/:id`

**Test Steps:**
1. Click on a discount
2. Review discount details
3. Check QR code generation

**Expected Result:**
- ✅ Full discount info displayed
- ✅ QR code generated (if available)
- ✅ Terms and conditions shown
- ✅ Expiry date visible

#### Claim Discount
**Endpoint:** `POST /discounts/:id/claim`

**Test Steps:**
1. Login
2. Click "Chegirmadan foydalanish"
3. Confirm claim

**Expected Result:**
- ✅ Discount claimed
- ✅ Usage tracked
- ✅ Appears in user's saved discounts

---

### 6. User Dashboard

#### View Dashboard
**Endpoint:** `GET /users/me/dashboard`

**Test Steps:**
1. Login
2. Navigate to `/dashboard`

**Expected Result:**
- ✅ User stats displayed
- ✅ Recent applications shown
- ✅ Upcoming events listed
- ✅ Enrolled courses shown
- ✅ Saved items count

#### Analytics
**Endpoint:** `GET /jobs/me/applications/analytics`

**Test Steps:**
1. Login
2. Navigate to `/dashboard/applications/analytics`

**Expected Result:**
- ✅ Application stats shown
- ✅ Charts rendered
- ✅ Success rate calculated
- ✅ Monthly trends displayed

#### Profile Management
**Endpoint:** `GET /users/me`, `PUT /users/me`

**Test Steps:**
1. Navigate to `/profile`
2. Update profile information
3. Save changes

**Expected Result:**
- ✅ Current profile loaded
- ✅ Changes saved successfully
- ✅ Updated info reflected immediately

---

### 7. Partner Features

#### Partner Dashboard
**Endpoint:** `GET /partners/me/dashboard`

**Test Steps:**
1. Login as partner
2. Navigate to `/partner`

**Expected Result:**
- ✅ Partner stats displayed
- ✅ Active listings shown
- ✅ Analytics overview

#### Create Job Posting
**Endpoint:** `POST /jobs`

**Test Steps:**
1. Login as partner
2. Navigate to `/partner/jobs/create`
3. Fill job form
4. Submit

**Expected Result:**
- ✅ Job created successfully
- ✅ Appears in partner's listings
- ✅ Visible on public jobs page

#### Manage Applications
**Endpoint:** `GET /jobs/:id/applications`

**Test Steps:**
1. Login as partner
2. Navigate to `/partner/jobs/:id/applications`
3. Review applications
4. Update application status

**Expected Result:**
- ✅ All applications listed
- ✅ Applicant details shown
- ✅ Status updates work
- ✅ Filters functional

---

### 8. Admin Features

#### Admin Dashboard
**Endpoint:** `GET /admin/stats`

**Test Steps:**
1. Login as admin
2. Navigate to `/admin`

**Expected Result:**
- ✅ System stats displayed
- ✅ User metrics shown
- ✅ Recent activity listed

#### User Management
**Endpoint:** `GET /admin/users`, `PUT /admin/users/:id`

**Test Steps:**
1. Navigate to `/admin/users`
2. View user list
3. Edit a user
4. Ban/unban user

**Expected Result:**
- ✅ Users list loaded
- ✅ Filters work
- ✅ Edit successful
- ✅ Status changes reflected

#### Content Moderation
**Endpoint:** `GET /admin/content`, `PUT /admin/content/:id/status`

**Test Steps:**
1. Navigate to various admin content sections
2. Approve/reject content
3. Edit content

**Expected Result:**
- ✅ Pending content shown
- ✅ Approval/rejection works
- ✅ Changes reflected immediately

---

## Error Handling Tests

### Network Errors
**Test:**
1. Disconnect internet
2. Try to load any page
3. Try to submit a form

**Expected:**
- ✅ Error message displayed
- ✅ Retry option available
- ✅ No app crash

### API Errors
**Test:**
1. Submit invalid data
2. Access unauthorized resource
3. Request non-existent resource

**Expected:**
- ✅ 400: Validation errors shown
- ✅ 401: Redirect to login
- ✅ 404: "Not found" message
- ✅ 500: Generic error message

### Rate Limiting
**Test:**
1. Make 60+ rapid requests
2. Check for rate limit response

**Expected:**
- ✅ Rate limit message shown
- ✅ Retry after countdown
- ✅ Requests resume after cooldown

---

## Performance Tests

### Page Load
**Test:**
1. Open DevTools Network tab
2. Navigate to various pages
3. Check load times

**Expected:**
- ✅ Initial load < 3s
- ✅ Navigation < 1s
- ✅ API calls < 500ms

### Search Debouncing
**Test:**
1. Type rapidly in search box
2. Check Network tab

**Expected:**
- ✅ API calls delayed 500ms
- ✅ Only final query sent
- ✅ No excessive requests

---

## Browser Console Checks

Throughout testing, monitor the console for:
- ❌ JavaScript errors
- ❌ Network failures
- ❌ React warnings
- ✅ Clean console output

---

## Testing Tools

### Manual Testing
- Browser DevTools
- Network tab for API calls
- Application tab for localStorage
- Console for errors

### Automated Testing (Optional)
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

---

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Screenshots/videos
4. Console errors
5. Network tab screenshot
6. Browser and OS version

---

## Testing Completion Checklist

- [ ] Authentication (Register, Login, Logout)
- [ ] Jobs (Browse, View, Apply)
- [ ] Courses (Browse, Enroll, Access)
- [ ] Events (Browse, Register)
- [ ] Discounts (Browse, Claim)
- [ ] User Dashboard (Stats, Profile)
- [ ] Partner Features (Create, Manage)
- [ ] Admin Features (Users, Content)
- [ ] Error Handling (Network, API, Validation)
- [ ] Performance (Load times, Debouncing)
- [ ] Mobile Responsiveness
- [ ] Cross-browser Compatibility

---

## Success Criteria

✅ **Ready for Production:**
- All features work as expected
- No critical bugs
- Error handling works
- Performance acceptable
- Mobile-friendly
- No console errors

---

## Next Steps After Testing

1. Document any bugs found
2. Fix critical issues
3. Deploy to staging environment
4. User acceptance testing
5. Deploy to production
