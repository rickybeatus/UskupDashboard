#!/bin/bash

# Dashboard Uskup Surabaya - Setup Script
echo "🚀 Memulai setup Dashboard Uskup Surabaya..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak ditemukan. Harap install Node.js terlebih dahulu."
    exit 1
fi

echo "✅ Node.js ditemukan: $(node --version)"

# Install dependencies
echo "📦 Menginstall dependencies..."
npm install --no-fund --no-audit

if [ $? -ne 0 ]; then
    echo "❌ Gagal menginstall dependencies"
    exit 1
fi

echo "✅ Dependencies berhasil diinstall"

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Gagal generate Prisma client"
    exit 1
fi

echo "✅ Prisma client berhasil digenerate"

# Setup database
echo "🗄️  Setting up database..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Gagal setup database"
    exit 1
fi

echo "✅ Database berhasil disetup"

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Gagal seeding database"
    exit 1
fi

echo "✅ Database berhasil di-seed"

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Dashboard Uskup Surabaya..."
npm run dev
EOF

chmod +x start.sh

echo ""
echo "🎉 Setup berhasil diselesaikan!"
echo ""
echo "📋 Informasi Penting:"
echo "   - Database: SQLite (file: ./dev.db)"
echo "   - Port: 3000"
echo "   - Environment: Development"
echo ""
echo "🚀 Untuk menjalankan aplikasi:"
echo "   ./start.sh"
echo "   atau"
echo "   npm run dev"
echo ""
echo "🌐 Aplikasi akan dapat diakses di: http://localhost:3000"
echo ""
echo "📁 Struktur Database:"
echo "   - User (Pengguna)"
echo "   - Agenda (Agenda Pertemuan)"
echo "   - Task (Tugas)"
echo "   - Notulensi (Notulen Rapat)"
echo "   - Surat (Surat Menyurat)"
echo "   - Decision (Keputusan/Timeline)"
echo "   - Imam (Database Imam)"
echo "   - Notification (Notifikasi)"
echo ""
