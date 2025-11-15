# TalabaHub Frontend - Deployment Guide

This guide covers deploying the TalabaHub frontend to production.

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Backend API deployed and accessible
- Vercel account (for Vercel deployment) or Docker (for containerized deployment)

---

## Option 1: Vercel Deployment (Recommended)

Vercel is the recommended platform for Next.js applications, offering zero-config deployment with automatic SSL, CDN, and preview deployments.

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Configure Environment Variables

Before deploying, you need to set the production API URL. You have two options:

#### Option A: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Create a new project or select existing project
3. Go to Settings → Environment Variables
4. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-api.com`

#### Option B: Using Vercel CLI
```bash
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://your-backend-api.com
```

### Step 3: Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

The CLI will:
- Build your application
- Optimize assets
- Deploy to Vercel's global CDN
- Provide you with a production URL

### Step 4: Configure Custom Domain (Optional)

```bash
vercel domains add talabahub.com
```

Or configure via Vercel Dashboard:
1. Go to your project Settings
2. Navigate to Domains
3. Add your custom domain
4. Update DNS records as instructed

### Automatic Deployments

Connect your GitHub repository to Vercel for automatic deployments:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure environment variables
4. Deploy

Every push to `main` will trigger a production deployment. Pull requests get preview deployments automatically.

---

## Option 2: Docker Deployment

For self-hosted deployments using Docker.

### Step 1: Create Dockerfile

A Dockerfile is already configured in the project root. Review it:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

### Step 2: Update next.config.ts for Standalone

The config is already set up, but verify:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // For Docker deployment
  // ... other config
};
```

### Step 3: Build Docker Image

```bash
# Build with API URL
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://your-backend-api.com \
  -t talabahub-frontend:latest \
  .
```

### Step 4: Run Docker Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-backend-api.com \
  talabahub-frontend:latest
```

### Step 5: Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    restart: unless-stopped
```

Then run:

```bash
# Create .env file
echo "NEXT_PUBLIC_API_URL=https://your-backend-api.com" > .env

# Start with docker-compose
docker-compose up -d
```

---

## Option 3: Traditional VPS Deployment

For deploying to a VPS (Ubuntu/Debian).

### Step 1: Prepare Server

```bash
# SSH into your server
ssh user@your-server.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo apt install -y nginx
```

### Step 2: Clone and Build

```bash
# Clone repository
git clone https://github.com/sarvarbekyusupov/talabahub_front.git
cd talabahub_front

# Install dependencies
npm ci

# Create .env.local
echo "NEXT_PUBLIC_API_URL=https://your-backend-api.com" > .env.local

# Build
npm run build
```

### Step 3: Start with PM2

```bash
# Start application
pm2 start npm --name "talabahub-frontend" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/talabahub
```

Add configuration:

```nginx
server {
    listen 80;
    server_name talabahub.com www.talabahub.com;

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
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/talabahub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d talabahub.com -d www.talabahub.com

# Auto-renewal is set up automatically
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `https://api.talabahub.com` |

**Important Notes:**
- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never store secrets in `NEXT_PUBLIC_*` variables
- For production, always use HTTPS URLs

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] Backend API is deployed and accessible
- [ ] Environment variables are configured correctly
- [ ] `npm run build` completes without errors
- [ ] All tests pass (if implemented)
- [ ] Images and assets are optimized
- [ ] CORS is configured on backend for your frontend domain
- [ ] DNS records are configured (for custom domain)
- [ ] SSL certificate is set up (for HTTPS)

---

## Testing Production Build Locally

Before deploying, test the production build locally:

```bash
# Build
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

Verify:
- All pages load correctly
- API calls work with your backend
- Images display properly
- Authentication flows work
- Responsive design on mobile/tablet/desktop

---

## Deployment Verification

After deployment, verify:

1. **Homepage**: Check hero section, features, and stats display correctly
2. **Authentication**: Test login and registration flows
3. **Discounts**: Browse discounts with filters and view details
4. **Jobs**: Search jobs, apply with resume upload
5. **Events**: View events and test registration
6. **Courses**: Browse courses and enroll
7. **Dashboard**: Check applications, registrations, enrollments load
8. **Profile**: Test profile editing and avatar upload
9. **Search**: Test global search functionality
10. **Mobile**: Test on mobile devices

---

## Monitoring and Logs

### Vercel
- View logs in Vercel Dashboard → Your Project → Deployments → Click deployment
- Real-time logs available during build and runtime
- Analytics available in Vercel Dashboard

### Docker
```bash
# View logs
docker logs -f <container-id>

# Or with docker-compose
docker-compose logs -f frontend
```

### VPS (PM2)
```bash
# View logs
pm2 logs talabahub-frontend

# Monitor
pm2 monit
```

---

## Rollback Procedure

### Vercel
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click menu → Promote to Production

### Docker
```bash
# Pull previous image version
docker pull talabahub-frontend:previous-tag

# Stop current container
docker stop <container-id>

# Run previous version
docker run -p 3000:3000 talabahub-frontend:previous-tag
```

### VPS
```bash
# Go to project directory
cd talabahub_front

# Checkout previous commit
git log --oneline # Find commit hash
git checkout <commit-hash>

# Rebuild and restart
npm run build
pm2 restart talabahub-frontend
```

---

## Performance Optimization

After deployment, consider:

1. **CDN**: Vercel includes CDN. For others, use Cloudflare
2. **Image Optimization**: Next.js handles this automatically
3. **Caching**: Configure in next.config.ts or nginx
4. **Bundle Analysis**:
   ```bash
   npm run build
   # Review .next/analyze/client.html
   ```

---

## Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Clear cache: `rm -rf .next node_modules && npm install`
- Check environment variables are set

### API Calls Fail
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Verify backend is accessible from frontend domain

### Images Don't Load
- Check `next.config.ts` image domains configuration
- Verify image URLs are accessible
- Check CORS for external images

### Slow Performance
- Enable compression in next.config.ts (already enabled)
- Use Vercel or CDN for static assets
- Optimize images (use next/image component)

---

## Support

For deployment issues:
- GitHub: [sarvarbekyusupov/talabahub_front](https://github.com/sarvarbekyusupov/talabahub_front)
- Email: info@talabahub.com
- Next.js Docs: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**Last Updated**: November 2025
**Next.js Version**: 15.0.3
**Node.js Version**: 18+
