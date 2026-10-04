'use client'

import {
  useEffect,
  useRef,
  useState
} from 'react'

export default function QRWithLogo({
  data,
  logo,
  fallback = '/vinculab-logo.png',
  size = 300
}: {
  data: string
  logo: string
  fallback?: string
  size?: number
}) {

  const canvasRef =
    useRef<HTMLCanvasElement>(null)

  const generationRef =
    useRef(0)

  const [status, setStatus] =
    useState('Generando QR...')

  useEffect(() => {

    if (!data) {
      setStatus('Sin información QR')
      return
    }

    /*
    ============================================================
    IDENTIFICADOR DE GENERACIÓN

    Cada vez que cambia data, logo, fallback o size,
    invalidamos cualquier generación anterior.
    ============================================================
    */

    generationRef.current += 1

    const generationId =
      generationRef.current

    let cancelled = false


    /*
    ============================================================
    DIBUJAR LOGO
    ============================================================
    */

    const drawLogo = (
      canvas: HTMLCanvasElement,
      logoUrl: string
    ) => {

      return new Promise<boolean>(
        (resolve) => {

          const img = new Image()

          img.crossOrigin = 'anonymous'

          img.onload = () => {

            /*
            ----------------------------------------------------
            Evitar que una generación antigua modifique
            un QR nuevo.
            ----------------------------------------------------
            */

            if (
              cancelled ||
              generationId !==
                generationRef.current
            ) {
              resolve(false)
              return
            }

            const ctx =
              canvas.getContext('2d')

            if (!ctx) {
              resolve(false)
              return
            }

            const logoSize =
              size * 0.25

            const x =
              (size - logoSize) / 2

            const y =
              (size - logoSize) / 2


            /*
            ----------------------------------------------------
            Fondo blanco detrás del logo
            ----------------------------------------------------
            */

            ctx.fillStyle = '#ffffff'

            ctx.beginPath()

            if (
              typeof (
                ctx as CanvasRenderingContext2D & {
                  roundRect?: (
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    radii?: number
                  ) => void
                }
              ).roundRect === 'function'
            ) {

              ;(
                ctx as CanvasRenderingContext2D & {
                  roundRect: (
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    radii?: number
                  ) => void
                }
              ).roundRect(
                x - 8,
                y - 8,
                logoSize + 16,
                logoSize + 16,
                12
              )

            } else {

              ctx.rect(
                x - 8,
                y - 8,
                logoSize + 16,
                logoSize + 16
              )

            }

            ctx.fill()

            ctx.strokeStyle =
              '#e4e4e7'

            ctx.lineWidth = 1

            ctx.stroke()


            /*
            ----------------------------------------------------
            Logo
            ----------------------------------------------------
            */

            ctx.drawImage(
              img,
              x,
              y,
              logoSize,
              logoSize
            )

            resolve(true)
          }


          img.onerror = () => {
            resolve(false)
          }


          /*
          ------------------------------------------------------
          Evitar caché problemática del navegador para logos
          internos/actualizados.
          ------------------------------------------------------
          */

          img.src = logoUrl
        }
      )
    }


    /*
    ============================================================
    GENERAR QR
    ============================================================
    */

    const generate = async () => {

      try {

        setStatus('Generando QR...')

        const QRCode =
          (await import('qrcode')).default


        if (
          cancelled ||
          generationId !==
            generationRef.current
        ) {
          return
        }


        const canvas =
          canvasRef.current

        if (!canvas) {
          return
        }


        /*
        ========================================================
        LIMPIAR CANVAS

        Importante cuando cambia la URL.
        ========================================================
        */

        const ctx =
          canvas.getContext('2d')

        if (ctx) {

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          )

        }


        /*
        ========================================================
        GENERAR QR EXACTAMENTE CON "data"

        Ejemplo:
        https://vinculab.cl/u/VIN-SSS-0007?origen=qr
        ========================================================
        */

        await QRCode.toCanvas(
          canvas,
          data,
          {
            width: size,
            margin: 2,

            errorCorrectionLevel: 'H',

            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          }
        )


        if (
          cancelled ||
          generationId !==
            generationRef.current
        ) {
          return
        }


        /*
        ========================================================
        INTENTAR LOGO PRINCIPAL
        ========================================================
        */

        let logoOk =
          await drawLogo(
            canvas,
            logo
          )


        if (
          cancelled ||
          generationId !==
            generationRef.current
        ) {
          return
        }


        /*
        ========================================================
        FALLBACK
        ========================================================
        */

        if (
          !logoOk &&
          fallback &&
          fallback !== logo
        ) {

          /*
          ------------------------------------------------------
          Volvemos a generar el QR limpio antes del fallback.
          Así evitamos cualquier dibujo parcial.
          ------------------------------------------------------
          */

          await QRCode.toCanvas(
            canvas,
            data,
            {
              width: size,
              margin: 2,

              errorCorrectionLevel: 'H',

              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            }
          )


          if (
            cancelled ||
            generationId !==
              generationRef.current
          ) {
            return
          }


          logoOk =
            await drawLogo(
              canvas,
              fallback
            )
        }


        if (
          cancelled ||
          generationId !==
            generationRef.current
        ) {
          return
        }


        setStatus(
          logoOk
            ? 'OK'
            : 'OK sin logo'
        )

      } catch (error) {

        if (
          cancelled ||
          generationId !==
            generationRef.current
        ) {
          return
        }

        console.error(
          'Error generando QR:',
          error
        )

        setStatus('Error QR')
      }
    }


    generate()


    /*
    ============================================================
    CLEANUP
    ============================================================
    */

    return () => {
      cancelled = true
    }

  }, [
    data,
    logo,
    fallback,
    size
  ])


  return (
    <div
      style={{
        background: 'white',
        padding: 12,
        borderRadius: 16,
        display: 'inline-block',
        boxShadow:
          '0 4px 20px rgba(0,0,0,0.15)'
      }}
    >

      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          display: 'block',
          borderRadius: 8
        }}
      />

      <div
        style={{
          fontSize: 10,
          color: '#a1a1aa',
          textAlign: 'center',
          marginTop: 6
        }}
      >
        {status}
      </div>

    </div>
  )
}
