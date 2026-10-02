'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ImprimirQRPage() {
  const params = useParams()
  const loteId = params?.id as string

  const [lote, setLote] = useState<any>(null)
  const [unidades, setUnidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loteId) return

    const cargar = async () => {
      setLoading(true)
      setError('')

      const { data: loteData, error: loteError } = await supabase
        .from('lotes')
        .select('*')
        .eq('id', loteId)
        .maybeSingle()

      if (loteError || !loteData) {
        console.error(loteError)
        setError('No fue posible encontrar el lote.')
        setLoading(false)
        return
      }

      const { data: unidadesData, error: unidadesError } = await supabase
        .from('unidades')
        .select('*')
        .eq('lote_id', loteId)
        .order('numero_unidad', { ascending: true })

      if (unidadesError) {
        console.error(unidadesError)
        setError('No fue posible cargar las unidades.')
        setLoading(false)
        return
      }

      setLote(loteData)
      setUnidades(unidadesData || [])
      setLoading(false)
    }

    cargar()
  }, [loteId])

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center' }}>
        Cargando identidades digitales...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center' }}>
        {error}
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #eeeeee;
        }

        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .pagina {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: none !important;
          }

          .etiqueta {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <main
        style={{
          minHeight: '100vh',
          padding: 24,
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}
      >
        <div
          className="no-print"
          style={{
            maxWidth: 900,
            margin: '0 auto 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: '#71717a',
                fontWeight: 700
              }}
            >
              VINCULAB
            </div>

            <h1
              style={{
                margin: '4px 0 0',
                fontSize: 24
              }}
            >
              QR del lote {lote?.codigo}
            </h1>
          </div>

          <button
            onClick={() => window.print()}
            style={{
              background: '#ff6a00',
              color: 'white',
              border: 0,
              borderRadius: 8,
              padding: '12px 18px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Imprimir / Guardar PDF
          </button>
        </div>

        <section
          className="pagina"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            background: 'white',
            padding: 24,
            boxShadow: '0 8px 30px rgba(0,0,0,.10)'
          }}
        >
          <div
            style={{
              borderBottom: '3px solid #ff6a00',
              paddingBottom: 14,
              marginBottom: 20
            }}
          >
            <div
              style={{
                fontWeight: 900,
                letterSpacing: 2,
                color: '#ff6a00',
                fontSize: 14
              }}
            >
              VINCULAB
            </div>

            <h2
              style={{
                margin: '5px 0',
                fontSize: 22,
                color: '#09090b'
              }}
            >
              Identidades Digitales
            </h2>

            <div
              style={{
                color: '#52525b',
                fontSize: 13
              }}
            >
              Lote: <strong>{lote?.codigo}</strong>
              {' · '}
              Unidades: <strong>{unidades.length}</strong>
            </div>
          </div>

          {unidades.length === 0 ? (
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                color: '#71717a'
              }}
            >
              Este lote no contiene unidades individuales.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12
              }}
            >
              {unidades.map((u) => {
                const url =
                  `https://vinculab.cl/u/${encodeURIComponent(u.codigo)}`

                const qr =
                  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

                return (
                  <div
                    key={u.id}
                    className="etiqueta"
                    style={{
                      border: '1.5px solid #18181b',
                      borderRadius: 10,
                      padding: 12,
                      textAlign: 'center',
                      color: '#09090b'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: 1.5,
                        marginBottom: 8
                      }}
                    >
                      VINCULAB
                    </div>

                    <img
                      src={qr}
                      alt={`QR ${u.codigo}`}
                      style={{
                        width: 150,
                        height: 150,
                        maxWidth: '100%',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        marginTop: 9,
                        wordBreak: 'break-word'
                      }}
                    >
                      {u.codigo}
                    </div>

                    <div
                      style={{
                        fontSize: 9,
                        color: '#71717a',
                        marginTop: 5
                      }}
                    >
                      Unidad Nº {u.numero_unidad}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 7,
                        borderTop: '1px solid #e4e4e7',
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#52525b'
                      }}
                    >
                      IDENTIDAD DIGITAL VERIFICABLE
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div
            style={{
              marginTop: 22,
              borderTop: '1px solid #e4e4e7',
              paddingTop: 12,
              textAlign: 'center',
              fontSize: 9,
              color: '#a1a1aa'
            }}
          >
            Identidades digitales gestionadas por VINCULAB.CL
          </div>
        </section>
      </main>
    </>
  )
}
