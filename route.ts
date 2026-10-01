import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get('data')
  if (!data) return new NextResponse('Falta ?data=', {status:400})
  const buf = await QRCode.toBuffer(data, {width:300, margin:1})
  return new NextResponse(new Uint8Array(buf), {
    headers: {'Content-Type':'image/png','Cache-Control':'public, max-age=31536000'}
  })
}
