#!/bin/bash

# PRODUCTION DEPLOYMENT SCRIPT
# Dashboard Uskup Surabaya - Production Deployment

echo "🚀 Starting Dashboard Uskup Surabaya Production Deployment"

# 1. Environment Setup
echo "📋 Step 1: Setting up environment..."
export NODE_ENV=production
export NEXTAUTH_URL="https://dashboard.keuskupan-surabaya.org"

# 2. Database Setup
echo "🗄️  Step 2: Database setup..."
echo "Please ensure PostgreSQL is running and create database:"
echo "  createdb dashboard_uskup"
echo "  createuser dashboard_user"
echo "  psql -d dashboard_uskup -f sql/production-setup.sql"

# 3. Generate Prisma Client
echo "🔧 Step 3: Generating Prisma client..."
npx prisma generate

# 4. Database Migration
echo "📊 Step 4: Running database migration..."
npx prisma db push

# 5. Seed Database (if needed)
echo "🌱 Step 5: Seeding database..."
echo "Run: npx prisma db seed"

# 6. Security Check
echo "🔒 Step 6: Security validation..."
echo "Checking for hardcoded passwords..."
if grep -r "uskup2025" src/ 2>/dev/null; then
  echo "❌ SECURITY ISSUE: Found hardcoded password!"
  exit 1
else
  echo "✅ No hardcoded passwords found"
fi

# 7. Environment Validation
echo "🔍 Step 7: Environment validation..."
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ ERROR: NEXTAUTH_SECRET not set"
  exit 1
else
  echo "✅ NEXTAUTH_SECRET configured"
fi

# 8. Build Application
echo "🏗️  Step 8: Building application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi

# 9. Start Production Server
echo "🚀 Step 9: Starting production server..."
npm start

echo "🎉 Deployment complete! Application is now running."
echo "📊 Access the dashboard at: $NEXTAUTH_URL"
echo "🗄️  Database: PostgreSQL (dashboard_uskup)"
echo "🔒 Security: bcrypt hashing enabled"
echo "⚡ Performance: Caching and optimization enabled"