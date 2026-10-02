'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PublicDPP() {

  const params = useParams()
  const codigo = decodeURIComponent(params?.codigo as string || '')

  const [registro, setRegistro] = useState<any>(null)
  const [tipo, setTipo] = useState<'lote' | 'dpp' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    if (!codigo) return

    const cargar = async () => {

      setLoading(true)
      setError('')

      try {

        // ============================================================
        // 1. PRIMERO BUSCAMOS EN LOTES
        // ============================================================

        const { data: lote, error: loteError } = await supabase
          .from('lotes')
          .select('*')
          .eq('codigo', codigo)
          .maybeSingle()

        if (loteError) {
          console.error('Error buscando lote:', loteError)
        }

        if (lote) {

          // ============================================================
          // 2. BUSCAMOS EMPRESA
          // ============================================================

          let empresa = null

          if (lote.empresa_id) {

            const { data } = await supabase
              .from('empresas')
              .select('*')
              .eq('id', lote.empresa_id)
              .maybeSingle()

            empresa = data
          }

          // ============================================================
          // 3. BUSCAMOS PRODUCTO
          // ============================================================

          let producto = null

          if (lote.producto_id) {

            const { data } = await supabase
              .from('productos')
              .select('*')
              .eq('id', lote.producto_id)
              .maybeSingle()

            producto = data
          }

          // ============================================================
          // 4. BUSCAMOS MODELO
          // ============================================================

          let modelo = null

          if (lote.modelo_id) {

            const { data } = await supabase
              .from('modelos')
              .select('*')
              .eq('id', lote.modelo_id)
              .maybeSingle()

            modelo = data
          }

          setRegistro({
            ...lote,
            empresa,
            producto,
            modelo
          })

          setTipo('lote')
          setLoading(false)

          return
        }

        // ============================================================
        // 5. SI NO ES LOTE, BUSCAMOS EN LOS DPP ANTIGUOS
        // ============================================================

        const { data: dpp, error: dppError } = await supabase
          .from('dpps')
          .select('*')
          .eq('codigo', codigo)
          .maybeSingle()

        if (dppError) {
          console.error('Error buscando DPP:', dppError)
        }

        if (dpp) {

          setRegistro(dpp)
          setTipo('dpp')
          setLoading(false)

          return
        }

        setRegistro(null)
        setTipo(null)
        setLoading(false)

      } catch (err: any) {

        console.error(err)

        setError(
          err?.message ||
          'No fue posible consultar la información.'
        )

        setLoading(false)
      }
    }

    cargar()

  }, [codigo])


  // ============================================================
  // CARGANDO
  // ============================================================

  if (loading) {

    return (

      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui'
        }}
      >

        <div style={{ textAlign: 'center' }}>

          <div
            style={{
              fontSize: 22,
              fontWeight: 900
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              marginTop: 10,
              color: '#a1a1aa'
            }}
          >
            Verificando identidad digital...
          </div>

        </div>

      </div>
    )
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: 'white',
          padding: 40,
          textAlign: 'center',
          fontFamily: 'system-ui'
        }}
      >

        <h2>Error de verificación</h2>

        <p style={{ color: '#a1a1aa' }}>
          {error}
        </p>

      </div>
    )
  }


  // ============================================================
  // NO ENCONTRADO
  // ============================================================

  if (!registro) {

    return (

      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
          padding: 20
        }}
      >

        <div
          style={{
            maxWidth: 450,
            width: '100%',
            textAlign: 'center'
          }}
        >

          <div
            style={{
              fontSize: 24,
              fontWeight: 900
            }}
          >
            VINCULAB
          </div>

          <h2>
            Registro no encontrado
          </h2>

          <p style={{ color: '#a1a1aa' }}>
            No existe información asociada al código:
          </p>

          <div
            style={{
              background: '#18181b',
              padding: 14,
              borderRadius: 10,
              fontFamily: 'monospace',
              color: '#ff6a00'
            }}
          >
            {codigo}
          </div>

        </div>

      </div>
    )
  }


  // ============================================================
  // LOTE NUEVO
  // ============================================================

  if (tipo === 'lote') {

    const lote = registro

    const empresa = lote.empresa
    const producto = lote.producto
    const modelo = lote.modelo

    const nombreEmpresa =
      empresa?.razon_social ||
      empresa?.nombre ||
      'Empresa no especificada'

    const nombreProducto =
      producto?.nombre ||
      'Producto'

    const nombreModelo =
      modelo?.nombre ||
      'Modelo no especificado'

    const fechaCreacion =
      lote.created_at
        ? new Date(lote.created_at).toLocaleDateString('es-CL')
        : '-'

    const urlActual =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://vinculab.cl/p/${codigo}`


    const Item = ({
      titulo,
      valor
    }: {
      titulo: string
      valor: any
    }) => (

      <div
        style={{
          background: '#f4f4f5',
          padding: 14,
          borderRadius: 10
        }}
      >

        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          {titulo}
        </div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            marginTop: 4,
            wordBreak: 'break-word'
          }}
        >
          {valor || '-'}
        </div>

      </div>
    )


    return (

      <div
        style={{
          minHeight: '100vh',
          background: '#f4f4f5',
          padding: '24px 16px',
          fontFamily: 'system-ui'
        }}
      >

        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            background: 'white',
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,.10)',
            border: '1px solid #e4e4e7'
          }}
        >

          {/* CABECERA */}

          <div
            style={{
              background: '#09090b',
              color: 'white',
              padding: 24
            }}
          >

            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 2,
                color: '#ff6a00'
              }}
            >
              VINCULAB
            </div>

            <div
              style={{
                fontSize: 11,
                color: '#a1a1aa',
                marginTop: 3
              }}
            >
              Identidad Digital de Producto
            </div>

          </div>


          <div style={{ padding: 24 }}>

            {/* EMPRESA */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 24
              }}
            >

              <img
                src="/vinculab-logo.png"
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 12,
                  objectFit: 'contain',
                  background: '#09090b'
                }}
                alt="Vinculab"
              />

              <div>

                <div
                  style={{
                    fontSize: 10,
                    color: '#71717a',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                >
                  Fabricante / Empresa
                </div>

                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900
                  }}
                >
                  {nombreEmpresa}
                </div>

              </div>

            </div>


            {/* PRODUCTO */}

            <div
              style={{
                borderBottom: '1px solid #e4e4e7',
                paddingBottom: 18,
                marginBottom: 18
              }}
            >

              <div
                style={{
                  background: '#ff6a00',
                  color: 'white',
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 9,
                  fontWeight: 900,
                  marginBottom: 8
                }}
              >
                PRODUCTO VERIFICADO
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 25,
                  lineHeight: 1.2
                }}
              >
                {nombreProducto}
              </h1>

              <p
                style={{
                  margin: '7px 0 0',
                  color: '#71717a',
                  fontSize: 14
                }}
              >
                {nombreModelo}
              </p>

            </div>


            {/* DATOS */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10
              }}
            >

              <Item
                titulo="Código"
                valor={lote.codigo}
              />

              <Item
                titulo="Cantidad"
                valor={lote.cantidad}
              />

              <Item
                titulo="Estado"
                valor={lote.estado}
              />

              <Item
                titulo="Fecha registro"
                valor={fechaCreacion}
              />

              <Item
                titulo="Producto"
                valor={nombreProducto}
              />

              <Item
                titulo="Modelo"
                valor={nombreModelo}
              />

            </div>


            {/* TRAZABILIDAD */}

            <div
              style={{
                marginTop: 20,
                background: '#ecfdf5',
                border: '1px solid #bbf7d0',
                padding: 14,
                borderRadius: 12
              }}
            >

              <div
                style={{
                  fontWeight: 900,
                  fontSize: 13,
                  color: '#166534'
                }}
              >
                ✓ Registro verificado
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: '#15803d',
                  marginTop: 4
                }}
              >
                Este código existe en la plataforma de trazabilidad Vinculab.
              </div>

            </div>


            {/* QR */}

            <div
              style={{
                textAlign: 'center',
                borderTop: '1px solid #f4f4f5',
                paddingTop: 24,
                marginTop: 24
              }}
            >

              <p
                style={{
                  fontSize: 10,
                  color: '#a1a1aa',
                  fontWeight: 800,
                  letterSpacing: 1
                }}
              >
                IDENTIDAD DIGITAL
              </p>

              <div
                style={{
                  display: 'inline-block',
                  background: 'white',
                  padding: 10,
                  borderRadius: 12,
                  border: '2px solid #09090b'
                }}
              >

                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(urlActual)}`}
                  style={{
                    display: 'block',
                    width: 160,
                    height: 160
                  }}
                  alt="QR"
                />

              </div>

              <p
                style={{
                  fontSize: 9,
                  color: '#a1a1aa',
                  marginTop: 14
                }}
              >
                Verificado por
              </p>

              <p
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: 2,
                  margin: 0
                }}
              >
                VINCULAB.CL
              </p>

              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: '#71717a',
                  marginTop: 8
                }}
              >
                {codigo}
              </p>

            </div>

          </div>

        </div>

      </div>
    )
  }


  // ============================================================
  // DPP ANTIGUO
  // ============================================================

  const dpp = registro
  const datos = dpp.datos || {}

  const isKombucha =
    dpp.plantilla === 'kombucha'

  const logo =
    isKombucha
      ? '/auka-logo.png'
      : '/hercom-logo.png'

  const urlActual =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://vinculab.cl/p/${codigo}`


  return (

    <div
      style={{
        minHeight: '100vh',
        background: '#fafaf9',
        padding: 20,
        fontFamily: 'system-ui'
      }}
    >

      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          background: 'white',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid #e7e5e4'
        }}
      >

        <div style={{ padding: 24 }}>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16
            }}
          >

            <img
              src={logo}
              onError={(e: any) =>
                e.target.src = '/vinculab-logo.png'
              }
              style={{
                width: 44,
                height: 44,
                borderRadius: 50,
                objectFit: 'cover',
                background: '#09090b'
              }}
              alt="logo"
            />

            <div>

              <div
                style={{
                  background:
                    isKombucha
                      ? '#15803d'
                      : '#ff6a00',
                  color: 'white',
                  fontSize: 9,
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 20,
                  display: 'inline-block',
                  marginBottom: 4
                }}
              >
                {
                  isKombucha
                    ? 'AUKA • KOMBUCHA'
                    : 'HERCOM • ESTRUCTURA'
                }
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 900
                }}
              >
                {dpp.descripcion}
              </h1>

              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 11,
                  color: '#71717a',
                  fontFamily: 'monospace'
                }}
              >
                {dpp.codigo}
              </p>

            </div>

          </div>


          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 14
            }}
          >

            {Object.entries(datos).map(
              ([k, v]: any) => (

                <div
                  key={k}
                  style={{
                    background: '#f4f4f5',
                    padding: 12,
                    borderRadius: 10
                  }}
                >

                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: '#71717a',
                      textTransform: 'uppercase'
                    }}
                  >
                    {k.replace(/_/g, ' ')}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      marginTop: 2,
                      wordBreak: 'break-word'
                    }}
                  >
                    {String(v).slice(0, 80)}
                  </div>

                </div>

              )
            )}

          </div>


          <div
            style={{
              textAlign: 'center',
              borderTop: '1px solid #f4f4f5',
              paddingTop: 18
            }}
          >

            <p
              style={{
                fontSize: 10,
                color: '#a1a1aa',
                fontWeight: 700,
                letterSpacing: 1
              }}
            >
              ESCANEA PARA VERIFICAR
            </p>

            <div
              style={{
                display: 'inline-block',
                background: 'white',
                padding: 10,
                borderRadius: 12,
                border: '2px solid #09090b'
              }}
            >

              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(urlActual)}`}
                style={{
                  display: 'block',
                  width: 160,
                  height: 160
                }}
                alt="QR"
              />

            </div>

            <p
              style={{
                fontSize: 9,
                color: '#a1a1aa',
                marginTop: 12
              }}
            >
              Verificado por
            </p>

            <p
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 2,
                margin: 0
              }}
            >
              VINCULAB.CL
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}
