'use client'
import { useEffect, useRef, useState } from 'react'

export default function QRWithLogo({ data, logo, size=280 }: { data: string, logo: string, size?: number }){
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(()=>{
    const loadQR = async () => {
      try {
        const QRCode = (await import('qrcode')).default
        const canvas = canvasRef.current
        if(!canvas) return

        await QRCode.toCanvas(canvas, data, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#000000', light: '#ffffff' }
        })

        const ctx = canvas.getContext('2d')!
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = logo
        img.onload = () => {
          const logoSize = size * 0.26
          const x = (size - logoSize)/2
          const y = (size - logoSize)/2
          ctx.fillStyle = 'white'
          ctx.beginPath()
          // @ts-ignore
          if(ctx.roundRect) ctx.roundRect(x-8, y-8, logoSize+16, logoSize+16, 12)
          else ctx.rect(x-8, y-8, logoSize+16, logoSize+16)
          ctx.fill()
          ctx.strokeStyle = '#e4e4e7'
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.drawImage(img, x, y, logoSize, logoSize)
          setReady(true)
        }
        img.onerror = () => setReady(true)
      } catch(e){ console.error(e) }
    }
    loadQR()
  },[data, logo, size])

  return (
    <div style={{background:'white', padding:12, borderRadius:16, display:'inline-block', boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
      <canvas ref={canvasRef} width={size} height={size} style={{display:'block', borderRadius:8}} />
      {!ready && <p style={{fontSize:10, color:'#71717a', textAlign:'center', marginTop:6}}>Generando QR...</p>}
    </div>
  )
}
