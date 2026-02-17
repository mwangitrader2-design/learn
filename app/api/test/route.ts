import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'API is working',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENAI_API_KEY
  })
}
