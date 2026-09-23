import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get('data')
  if (!data) return new NextResponse('Falta ?data=', {status: 400})

  const pngBuffer = await QRCode.toBuffer(data, {
    width: 300,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  })

  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
