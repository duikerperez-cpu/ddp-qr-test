import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get('data')
  if (!data) return new NextResponse('Falta ?data=', { status: 400 })
  
  const png = await QRCode.toBuffer(data, { 
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M'
  })
  
  return new NextResponse(png, {
    headers: { 
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000'
    }
  })
}
