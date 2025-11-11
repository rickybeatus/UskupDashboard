import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Login Gagal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Terjadi kesalahan saat proses autentikasi
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Coba Lagi
          </Link>
          
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}