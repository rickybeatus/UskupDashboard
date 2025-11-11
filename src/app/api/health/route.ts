import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Dashboard Uskup Surabaya API is running',
    timestamp: new Date().toISOString()
  })
}