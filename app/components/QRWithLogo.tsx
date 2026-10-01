'use client'
import { useEffect, useRef, useState } from 'react'

export default function QRWithLogo({
  data,
  logo,
  fallback = '/vinculab-logo.png',
  size = 300
}: {
  data: string,
  logo: string,
  fallback?: string,
  size?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Generando QR...')

  useEffect(() => {
    const generate = async (logoUrl: string, triedFallback = false) => {
      try {
        const QRCode = (await import('qrcode')).default
        const canvas = canvasRef.current
        if (!canvas) return

        await QRCode.toCanvas(canvas, data, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#000000', light: '#ffffff' }
        })

        const ctx = canvas.getContext('2d')!
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = logoUrl

        img.onload = () => {
          const logoSize = size * 0.25
          const x = (size - logoSize) / 2
          const y = (size - logoSize) / 2

          ctx.fillStyle = 'white'
          ctx.beginPath()
          // @ts-ignore
          if (ctx.roundRect) ctx.roundRect(x - 8, y - 8, logoSize + 16, logoSize + 16, 12)
          else ctx.rect(x - 8, y - 8, logoSize + 16, logoSize + 16)
          ctx.fill()
          ctx.strokeStyle = '#e4e4e7'
          ctx.lineWidth = 1
          ctx.stroke()

          ctx.drawImage(img, x, y, logoSize, logoSize)
          setStatus('OK')
        }

        img.onerror = () => {
          if (!triedFallback && fallback) {
            generate(fallback, true)
          } else {
            setStatus('OK sin logo')
          }
        }
      } catch (e) {
        setStatus('Error QR')
        console.error(e)
      }
    }
    if (data) generate(logo)
  }, [data, logo, fallback, size])

  return (
    <div style={{ background: 'white', padding: 12, borderRadius: 16, display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block', borderRadius: 8 }} />
      <div style={{ fontSize: 10, color: '#a1a1aa', textAlign: 'center', marginTop: 6 }}>{status}</div>
    </div>
  )
}
