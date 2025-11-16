# Deployment Guide - TALABA HUB Frontend

Complete guide for deploying the TALABA HUB frontend to production.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Vercel Deployment](#vercel-deployment-recommended)
5. [Netlify Deployment](#netlify-deployment)
6. [Custom Server Deployment](#custom-server-deployment)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required
- Node.js 18.x or higher
- npm or yarn package manager
- Backend API deployed and accessible
- Domain name (optional but recommended)
- SSL certificate (usually automatic with hosting platforms)

### Recommended
- GitHub account (for CI/CD)
- Vercel/Netlify account
- Sentry account (for error monitoring)
- Google Analytics account

---

## Environment Setup

### 1. Create Production Environment File

Create `.env.production` in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.talabahub.uz/api

# App Configuration
NEXT_PUBLIC_APP_NAME=TALABA HUB
NEXT_PUBLIC_APP_URL=https://talabahub.uz
NEXT_PUBLIC_APP_DESCRIPTION=Talabalar uchun ish, kurs, tadbir va chegirmalar platformasi

# Environment
NODE_ENV=production

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_MIXPANEL_TOKEN=your_token

# Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
# SENTRY_AUTH_TOKEN=your_auth_token

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx

# Security
NEXT_PUBLIC_ENABLE_RATE_LIMITING=true
NEXT_PUBLIC_MAX_REQUESTS_PER_MINUTE=60

# SEO
NEXT_PUBLIC_SITE_NAME=TALABA HUB
NEXT_PUBLIC_SITE_LOCALE=uz_UZ
NEXT_PUBLIC_TWITTER_HANDLE=@talabahub
```

### 2. Update Configuration

Ensure `next.config.ts` has correct settings for production.

---

## Deployment Options

### Option 1: Vercel (Recommended)
- ✅ Automatic deployments from Git
- ✅ Built-in CDN
- ✅ Automatic SSL
- ✅ Preview deployments
- ✅ Zero configuration
- ✅ Serverless functions support

### Option 2: Netlify
- ✅ Automatic deployments
- ✅ CDN included
- ✅ SSL certificates
- ✅ Form handling
- ✅ Edge functions

### Option 3: Custom Server
- ✅ Full control
- ✅ Custom infrastructure
- ❌ Manual configuration
- ❌ Requires DevOps knowledge

---

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "feat: Ready for production deployment"
git push origin main
```

### Step 2: Connect to Vercel

#### Via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Via Web Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_API_URL=https://api.talabahub.uz/api
NEXT_PUBLIC_APP_URL=https://talabahub.uz
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
... (all other variables from .env.production)
```

### Step 4: Configure Custom Domain

1. Go to Project → Settings → Domains
2. Add your domain: `talabahub.uz`
3. Follow DNS configuration instructions
4. SSL will be automatically provisioned

### Step 5: Deploy

```bash
# Deploy to production
git push origin main

# Or via CLI
vercel --prod
```

---

## Netlify Deployment

### Step 1: Create `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Step 2: Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### Step 3: Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables

---

## Custom Server Deployment

### Step 1: Build the Application

```bash
# Install dependencies
npm ci --production

# Build for production
npm run build
```

### Step 2: Setup PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'talabahub-frontend',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### Step 3: Configure Nginx

```nginx
server {
    listen 80;
    server_name talabahub.uz www.talabahub.uz;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name talabahub.uz www.talabahub.uz;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 4: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d talabahub.uz -d www.talabahub.uz

# Auto-renewal is set up automatically
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check if site is accessible
curl https://talabahub.uz

# Check API connectivity
curl https://talabahub.uz/api-test
```

### 2. Run Lighthouse Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://talabahub.uz --view
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

### 3. Test Core Features

- [ ] Homepage loads correctly
- [ ] User can register
- [ ] User can login
- [ ] Jobs page loads
- [ ] Search works
- [ ] Application submission works
- [ ] Dashboard loads
- [ ] All API calls succeed

### 4. Configure DNS

```
A Record: talabahub.uz → Your server IP or Vercel IP
CNAME: www.talabahub.uz → talabahub.uz
```

### 5. Setup Monitoring

#### Sentry (Error Tracking)
```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

#### Google Analytics
Already configured in layout.tsx. Just add your measurement ID to environment variables.

#### Uptime Monitoring
Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## CI/CD Setup

### GitHub Actions (Automatic Deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Site is accessible
- [ ] No errors in Sentry
- [ ] API is responding

### Weekly Checks
- [ ] Review Sentry errors
- [ ] Check analytics data
- [ ] Review performance metrics

### Monthly Tasks
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup review

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Restart (if using PM2)
pm2 restart talabahub-frontend

# Or redeploy (if using Vercel)
vercel --prod
```

---

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Custom Server
```bash
# Checkout previous version
git checkout [previous-commit-hash]

# Rebuild
npm run build

# Restart
pm2 restart talabahub-frontend
```

---

## Environment-Specific URLs

### Development
- Local: `http://localhost:3000`
- API: `http://localhost:3030/api`

### Staging (Recommended)
- Frontend: `https://staging.talabahub.uz`
- API: `https://api-staging.talabahub.uz/api`

### Production
- Frontend: `https://talabahub.uz`
- API: `https://api.talabahub.uz/api`

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] API keys not exposed in client code
- [ ] CORS configured on backend
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] XSS protection enabled
- [ ] CSRF protection (if applicable)

---

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Enable AVIF/WebP formats
- Implement lazy loading

### Code Splitting
- Already configured in Next.js
- Use dynamic imports for heavy components

### Caching
- Static assets cached by CDN
- API responses cached with SWR
- Browser caching headers set

### Bundle Optimization
```bash
# Analyze bundle
npm run build && npx @next/bundle-analyzer
```

---

## Troubleshooting

### Issue: Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Environment Variables Not Working
- Check they're prefixed with `NEXT_PUBLIC_`
- Rebuild after adding variables
- Verify in hosting platform dashboard

### Issue: API Calls Fail
- Check CORS settings on backend
- Verify API URL in environment variables
- Test API directly with curl/Postman

### Issue: Slow Performance
- Run Lighthouse audit
- Check bundle size
- Enable caching
- Use CDN

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com

### Getting Help
- GitHub Issues: https://github.com/sarvarbekyusupov/talabahub_front/issues
- Email: support@talabahub.uz

---

## Deployment Success Checklist

- [ ] Application builds successfully
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Domain configured with SSL
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Performance benchmarks met
- [ ] Security headers active
- [ ] Backup strategy in place

---

**Congratulations! Your TALABA HUB frontend is now deployed! 🎉**

For ongoing maintenance, refer to the Monitoring & Maintenance section.
