'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UnidadPublicaPage() {

  const params = useParams()
  const codigo = decodeURIComponent(params?.codigo as string)

  const [unidad, setUnidad] = useState<any>(null)
  const [lote, setLote] = useState<any>(null)
  const [empresa, setEmpresa] = useState<any>(null)
  const [producto, setProducto] = useState<any>(null)
  const [modelo, setModelo] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // CARGAR IDENTIDAD DIGITAL
  // =========================================================

  useEffect(() => {

    if (!codigo) return

    const cargar = async () => {

      setLoading(true)
      setError('')

      // -------------------------------------------------------
      // 1. UNIDAD
      // -------------------------------------------------------

      const { data: unidadData, error: unidadError } =
        await supabase
          .from('unidades')
          .select('*')
          .eq('codigo', codigo)
          .maybeSingle()

      if (unidadError) {

        console.error('Error unidad:', unidadError)

        setError('No fue posible consultar la identidad digital.')
        setLoading(false)

        return
      }

      if (!unidadData) {

        setError('IDENTIDAD NO ENCONTRADA')
        setLoading(false)

        return
      }

      setUnidad(unidadData)

      // -------------------------------------------------------
      // 2. CONSULTAS RELACIONADAS
      // -------------------------------------------------------

      const consultas: Promise<any>[] = []

      consultas.push(
        unidadData.lote_id
          ? supabase
              .from('lotes')
              .select('*')
              .eq('id', unidadData.lote_id)
              .maybeSingle()
          : Promise.resolve({ data: null })
      )

      consultas.push(
        unidadData.empresa_id
          ? supabase
              .from('empresas')
              .select('*')
              .eq('id', unidadData.empresa_id)
              .maybeSingle()
          : Promise.resolve({ data: null })
      )

      consultas.push(
        unidadData.producto_id
          ? supabase
              .from('productos')
              .select('*')
              .eq('id', unidadData.producto_id)
              .maybeSingle()
          : Promise.resolve({ data: null })
      )

      consultas.push(
        unidadData.modelo_id
          ? supabase
              .from('modelos')
              .select('*')
              .eq('id', unidadData.modelo_id)
              .maybeSingle()
          : Promise.resolve({ data: null })
      )

      const [
        loteResultado,
        empresaResultado,
        productoResultado,
        modeloResultado
      ] = await Promise.all(consultas)

      setLote(loteResultado?.data || null)
      setEmpresa(empresaResultado?.data || null)
      setProducto(productoResultado?.data || null)
      setModelo(modeloResultado?.data || null)

      setLoading(false)
    }

    cargar()

  }, [codigo])

  // =========================================================
  // LOADING
  // =========================================================

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
              fontSize: 13,
              fontWeight: 900,
              color: '#ff6a00',
              letterSpacing: 2
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              marginTop: 12,
              color: '#a1a1aa'
            }}
          >
            Verificando identidad digital...
          </div>

        </div>

      </div>
    )
  }

  // =========================================================
  // ERROR / NO ENCONTRADO
  // =========================================================

  if (error || !unidad) {

    return (

      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: 'system-ui'
        }}
      >

        <div
          style={{
            maxWidth: 450,
            width: '100%',
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 18,
            padding: 30,
            textAlign: 'center',
            color: 'white'
          }}
        >

          <div
            style={{
              color: '#ff6a00',
              fontWeight: 900,
              letterSpacing: 2,
              marginBottom: 20
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              fontSize: 40,
              marginBottom: 10
            }}
          >
            ?
          </div>

          <h1
            style={{
              fontSize: 22,
              marginBottom: 8
            }}
          >
            Identidad no encontrada
          </h1>

          <p
            style={{
              color: '#a1a1aa',
              fontSize: 14
            }}
          >
            No existe una unidad registrada con el código:
          </p>

          <div
            style={{
              marginTop: 15,
              background: '#09090b',
              padding: 12,
              borderRadius: 8,
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

  // =========================================================
  // DATOS
  // =========================================================

  const urlActual =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://vinculab.cl/u/${codigo}`

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(urlActual)}`

  const fechaRegistro = unidad.created_at
    ? new Date(unidad.created_at).toLocaleDateString('es-CL')
    : '-'

  const estadoActivo =
    String(unidad.estado || '').toLowerCase() === 'activo'

  // =========================================================
  // COMPONENTE CAMPO
  // =========================================================

  const Campo = ({
    titulo,
    valor
  }: {
    titulo: string
    valor: any
  }) => (

    <div
      style={{
        background: '#f4f4f5',
        borderRadius: 12,
        padding: 14,
        minHeight: 70
      }}
    >

      <div
        style={{
          fontSize: 9,
          color: '#71717a',
          fontWeight: 900,
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 5
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          color: '#09090b',
          fontSize: 14,
          fontWeight: 800,
          wordBreak: 'break-word'
        }}
      >
        {valor || '-'}
      </div>

    </div>

  )

  // =========================================================
  // PÁGINA
  // =========================================================

  return (

    <div
      style={{
        minHeight: '100vh',
        background: '#f4f4f5',
        padding: '0 16px 40px',
        fontFamily: 'system-ui'
      }}
    >

      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          background: 'white',
          minHeight: '100vh',
          boxShadow: '0 0 35px rgba(0,0,0,0.10)'
        }}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          style={{
            background: '#09090b',
            padding: '20px 24px',
            color: 'white'
          }}
        >

          <div
            style={{
              color: '#ff6a00',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 2
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              color: '#d4d4d8',
              fontSize: 11,
              marginTop: 3
            }}
          >
            Identidad Digital de Producto
          </div>

        </div>

        {/* ===================================================
            CONTENIDO
        =================================================== */}

        <div style={{ padding: 26 }}>

          {/* FABRICANTE */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 25
            }}
          >

            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 12,
                background: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff6a00',
                fontSize: 20,
                fontWeight: 900
              }}
            >
              V
            </div>

            <div>

              <div
                style={{
                  fontSize: 9,
                  color: '#71717a',
                  fontWeight: 900,
                  letterSpacing: 1
                }}
              >
                FABRICANTE / EMPRESA
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#09090b',
                  marginTop: 3
                }}
              >
                {empresa?.razon_social || 'Empresa registrada'}
              </div>

            </div>

          </div>

          {/* ESTADO VERIFICADO */}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: estadoActivo ? '#dcfce7' : '#fef3c7',
              color: estadoActivo ? '#166534' : '#92400e',
              padding: '6px 11px',
              borderRadius: 30,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: .5
            }}
          >

            {estadoActivo ? '✓ IDENTIDAD VERIFICADA' : '● IDENTIDAD REGISTRADA'}

          </div>

          {/* PRODUCTO */}

          <h1
            style={{
              color: '#09090b',
              fontSize: 27,
              lineHeight: 1.15,
              margin: '14px 0 5px',
              fontWeight: 900
            }}
          >
            {producto?.nombre || 'Producto'}
          </h1>

          <div
            style={{
              color: '#71717a',
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 24
            }}
          >
            {modelo?.nombre || 'Modelo no especificado'}
          </div>

          <div
            style={{
              height: 1,
              background: '#e4e4e7',
              marginBottom: 20
            }}
          />

          {/* ===================================================
              DATOS DE IDENTIDAD
          =================================================== */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10
            }}
          >

            <Campo
              titulo="Código de identidad"
              valor={unidad.codigo}
            />

            <Campo
              titulo="Unidad"
              valor={`Nº ${unidad.numero_unidad}`}
            />

            <Campo
              titulo="Estado"
              valor={unidad.estado}
            />

            <Campo
              titulo="Fecha registro"
              valor={fechaRegistro}
            />

            <Campo
              titulo="Producto"
              valor={producto?.nombre}
            />

            <Campo
              titulo="Modelo"
              valor={modelo?.nombre}
            />

            <Campo
              titulo="Lote de origen"
              valor={lote?.codigo}
            />

            <Campo
              titulo="Fabricante"
              valor={empresa?.razon_social}
            />

          </div>

          {/* ===================================================
              REGISTRO VERIFICADO
          =================================================== */}

          <div
            style={{
              marginTop: 22,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 12,
              padding: 15
            }}
          >

            <div
              style={{
                color: '#047857',
                fontWeight: 900,
                fontSize: 14
              }}
            >
              ✓ Registro verificado
            </div>

            <div
              style={{
                color: '#047857',
                fontSize: 11,
                marginTop: 5,
                lineHeight: 1.5
              }}
            >
              Esta identidad existe en la plataforma de
              trazabilidad Vinculab y corresponde a una unidad
              individual registrada.
            </div>

          </div>

          {/* ===================================================
              QR
          =================================================== */}

          <div
            style={{
              textAlign: 'center',
              marginTop: 35,
              paddingTop: 25,
              borderTop: '1px solid #e4e4e7'
            }}
          >

            <div
              style={{
                fontSize: 10,
                color: '#71717a',
                fontWeight: 900,
                letterSpacing: 1.5,
                marginBottom: 12
              }}
            >
              IDENTIDAD DIGITAL
            </div>

            <div
              style={{
                display: 'inline-block',
                background: 'white',
                border: '2px solid #09090b',
                borderRadius: 15,
                padding: 12
              }}
            >

              <img
                src={qrUrl}
                alt={`QR ${unidad.codigo}`}
                style={{
                  display: 'block',
                  width: 180,
                  height: 180
                }}
              />

            </div>

            <div
              style={{
                marginTop: 15,
                color: '#09090b',
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 700,
                wordBreak: 'break-all'
              }}
            >
              {unidad.codigo}
            </div>

          </div>

          {/* ===================================================
              PIE
          =================================================== */}

          <div
            style={{
              textAlign: 'center',
              marginTop: 35,
              paddingTop: 20,
              borderTop: '1px solid #e4e4e7'
            }}
          >

            <div
              style={{
                fontSize: 9,
                color: '#a1a1aa',
                letterSpacing: 1
              }}
            >
              IDENTIDAD VERIFICADA POR
            </div>

            <div
              style={{
                color: '#09090b',
                fontWeight: 900,
                letterSpacing: 2,
                marginTop: 4
              }}
            >
              VINCULAB.CL
            </div>

            <div
              style={{
                color: '#a1a1aa',
                fontSize: 9,
                marginTop: 8
              }}
            >
              Plataforma de identidad y trazabilidad de productos
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
