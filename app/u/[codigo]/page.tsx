'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type AtributoModelo = {
  id: string
  modelo_id: string
  nombre: string
  valor?: string | null
  unidad?: string | null
  grupo?: string | null
  orden?: number | null
  created_at?: string
}

export default function UnidadPublicaPage() {

  const params = useParams()

  const codigo = decodeURIComponent(
    params?.codigo as string
  )

  const [unidad, setUnidad] =
    useState<any>(null)

  const [lote, setLote] =
    useState<any>(null)

  const [empresa, setEmpresa] =
    useState<any>(null)

  const [producto, setProducto] =
    useState<any>(null)

  const [modelo, setModelo] =
    useState<any>(null)

  const [atributos, setAtributos] =
    useState<AtributoModelo[]>([])

  const [eventos, setEventos] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  /* =========================================================
     CARGAR IDENTIDAD DIGITAL
  ========================================================= */

  useEffect(() => {

    if (!codigo) return

    const cargar = async () => {

      setLoading(true)
      setError('')

      try {

        /* =====================================================
           IDENTIDAD PÚBLICA SEGURA

           Una sola llamada RPC.
           Las tablas internas permanecen protegidas por RLS.
        ===================================================== */

        const {
          data,
          error: rpcError
        } = await supabase.rpc(
          'get_identidad_publica',
          { p_codigo: codigo }
        )

        if (rpcError) {

          console.error(
            'Error identidad pública:',
            rpcError
          )

          setError(
            'No fue posible consultar la identidad digital.'
          )

          return
        }

        if (!data) {

          setError(
            'IDENTIDAD NO ENCONTRADA'
          )

          return
        }

        const identidad =
          typeof data === 'string'
            ? JSON.parse(data)
            : data

        if (!identidad?.unidad) {

          setError(
            'IDENTIDAD NO ENCONTRADA'
          )

          return
        }

        setUnidad(
          identidad.unidad
        )

        setLote(
          identidad.lote || null
        )

        setEmpresa(
          identidad.empresa || null
        )

        setProducto(
          identidad.producto || null
        )

        setModelo(
          identidad.modelo || null
        )

        setAtributos(
          Array.isArray(identidad.atributos)
            ? identidad.atributos
            : []
        )

        setEventos(
          Array.isArray(identidad.eventos)
            ? identidad.eventos
            : []
        )

      } catch (err) {

        console.error(
          'Error cargando identidad:',
          err
        )

        setError(
          'No fue posible consultar la identidad digital.'
        )

      } finally {

        setLoading(false)
      }
    }

    cargar()

  }, [codigo])

  /* =========================================================
     LOADING
  ========================================================= */

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

          padding: 20,

          fontFamily: 'system-ui'
        }}
      >

        <div
          style={{
            textAlign: 'center'
          }}
        >

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

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error ||
    !unidad
  ) {

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

            border:
              '1px solid #27272a',

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
            No existe una unidad registrada
            con el código:
          </p>

          <div
            style={{
              marginTop: 15,
              background: '#09090b',
              padding: 12,
              borderRadius: 8,
              fontFamily: 'monospace',
              color: '#ff6a00',
              wordBreak: 'break-all'
            }}
          >
            {codigo}
          </div>

        </div>

      </div>
    )
  }

  /* =========================================================
     DATOS
  ========================================================= */

  const urlActual =
    typeof window !== 'undefined'

      ? window.location.href

      : `https://vinculab.cl/u/${encodeURIComponent(
          codigo
        )}`

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      urlActual
    )}`

  const fechaRegistro =
    unidad.created_at

      ? new Date(
          unidad.created_at
        ).toLocaleDateString(
          'es-CL'
        )

      : '-'

  const estadoActivo =
    String(
      unidad.estado || ''
    ).toLowerCase() ===
    'activo'

  /* =========================================================
     FORMATEAR FECHA
  ========================================================= */

  const formatearFecha = (
    fecha: string
  ) => {

    if (!fecha) {
      return '-'
    }

    try {

      return new Date(
        fecha
      ).toLocaleString(
        'es-CL',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      )

    } catch {

      return fecha
    }
  }

  /* =========================================================
     AGRUPAR ATRIBUTOS
  ========================================================= */

  const atributosAgrupados =
    atributos.reduce(
      (
        grupos:
          Record<
            string,
            AtributoModelo[]
          >,
        atributo
      ) => {

        const grupo =
          atributo.grupo?.trim() ||
          'Especificaciones'

        if (!grupos[grupo]) {
          grupos[grupo] = []
        }

        grupos[grupo].push(
          atributo
        )

        return grupos
      },
      {}
    )

  /* =========================================================
     COMPONENTE CAMPO
  ========================================================= */

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

          textTransform:
            'uppercase',

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

          wordBreak:
            'break-word'
        }}
      >
        {valor || '-'}
      </div>

    </div>
  )

  /* =========================================================
     PÁGINA
  ========================================================= */

  return (

    <div
      style={{
        minHeight: '100vh',

        background: '#f4f4f5',

        padding:
          '0 16px 40px',

        fontFamily:
          'system-ui'
      }}
    >

      <div
        style={{
          maxWidth: 620,

          margin: '0 auto',

          background: 'white',

          minHeight: '100vh',

          boxShadow:
            '0 0 35px rgba(0,0,0,0.10)'
        }}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={{
            background: '#09090b',

            padding:
              '20px 24px',

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

        <div
          style={{
            padding: 26
          }}
        >

          {/* =====================================================
              FABRICANTE
          ===================================================== */}

          <div
            style={{
              display: 'flex',

              alignItems:
                'center',

              gap: 14,

              marginBottom: 25
            }}
          >

            <div
              style={{
                width: 58,

                height: 58,

                borderRadius: 12,

                background:
                  '#09090b',

                display: 'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                color:
                  '#ff6a00',

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

                  color:
                    '#71717a',

                  fontWeight:
                    900,

                  letterSpacing:
                    1
                }}
              >
                FABRICANTE / EMPRESA
              </div>

              <div
                style={{
                  fontSize: 20,

                  fontWeight:
                    900,

                  color:
                    '#09090b',

                  marginTop: 3
                }}
              >
                {
                  empresa?.razon_social ||
                  'Empresa registrada'
                }
              </div>

            </div>

          </div>

          {/* =====================================================
              ESTADO DE IDENTIDAD
          ===================================================== */}

          <div
            style={{
              display:
                'inline-flex',

              alignItems:
                'center',

              gap: 6,

              background:
                estadoActivo
                  ? '#dcfce7'
                  : '#fef3c7',

              color:
                estadoActivo
                  ? '#166534'
                  : '#92400e',

              padding:
                '6px 11px',

              borderRadius:
                30,

              fontSize: 10,

              fontWeight: 900,

              letterSpacing:
                0.5
            }}
          >

            {
              estadoActivo

                ? '✓ IDENTIDAD VINCULAB REGISTRADA'

                : '● IDENTIDAD REGISTRADA'
            }

          </div>

          {/* =====================================================
              PRODUCTO
          ===================================================== */}

          <h1
            style={{
              color: '#09090b',

              fontSize: 27,

              lineHeight: 1.15,

              margin:
                '14px 0 5px',

              fontWeight: 900
            }}
          >
            {
              producto?.nombre ||
              'Producto'
            }
          </h1>

          <div
            style={{
              color: '#71717a',

              fontSize: 15,

              fontWeight: 600,

              marginBottom: 24
            }}
          >
            {
              modelo?.nombre ||
              'Modelo no especificado'
            }
          </div>

          <div
            style={{
              height: 1,

              background:
                '#e4e4e7',

              marginBottom: 20
            }}
          />

          {/* =====================================================
              IDENTIDAD DIGITAL
          ===================================================== */}

          <div
            style={{
              fontSize: 10,

              color: '#71717a',

              fontWeight: 900,

              letterSpacing: 1.5,

              marginBottom: 10
            }}
          >
            IDENTIDAD DIGITAL
          </div>

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',

              gap: 10
            }}
          >

            <Campo
              titulo="Código de identidad"
              valor={
                unidad.codigo
              }
            />

            <Campo
              titulo="Unidad"
              valor={
                `Nº ${unidad.numero_unidad}`
              }
            />

            <Campo
              titulo="Estado"
              valor={
                unidad.estado
              }
            />

            <Campo
              titulo="Fecha registro"
              valor={
                fechaRegistro
              }
            />

            <Campo
              titulo="Producto"
              valor={
                producto?.nombre
              }
            />

            <Campo
              titulo="Modelo"
              valor={
                modelo?.nombre
              }
            />

            <Campo
              titulo="Lote de origen"
              valor={
                lote?.codigo
              }
            />

            <Campo
              titulo="Fabricante"
              valor={
                empresa?.razon_social
              }
            />

          </div>

          {/* =====================================================
              REGISTRO VINCULAB
          ===================================================== */}

          <div
            style={{
              marginTop: 22,

              background:
                '#ecfdf5',

              border:
                '1px solid #a7f3d0',

              borderRadius: 12,

              padding: 15
            }}
          >

            <div
              style={{
                color:
                  '#047857',

                fontWeight: 900,

                fontSize: 14
              }}
            >
              ✓ Identidad registrada
            </div>

            <div
              style={{
                color:
                  '#047857',

                fontSize: 11,

                marginTop: 5,

                lineHeight: 1.5
              }}
            >
              Esta identidad existe en la
              plataforma Vinculab y
              corresponde a una unidad
              individual registrada.
            </div>

          </div>

          {/* =====================================================
              ESPECIFICACIONES TÉCNICAS
          ===================================================== */}

          <div
            style={{
              marginTop: 32,

              paddingTop: 24,

              borderTop:
                '1px solid #e4e4e7'
            }}
          >

            <div
              style={{
                fontSize: 10,

                color: '#71717a',

                fontWeight: 900,

                letterSpacing: 1.5
              }}
            >
              ESPECIFICACIONES TÉCNICAS
            </div>

            <h2
              style={{
                color: '#09090b',

                fontSize: 21,

                margin:
                  '6px 0 6px',

                fontWeight: 900
              }}
            >
              Características del modelo
            </h2>

            <p
              style={{
                margin:
                  '0 0 20px',

                color: '#71717a',

                fontSize: 12,

                lineHeight: 1.5
              }}
            >
              Información técnica asociada
              al modelo de esta unidad.
            </p>

            {
              atributos.length === 0

                ? (

                  <div
                    style={{
                      background:
                        '#f4f4f5',

                      borderRadius: 12,

                      padding: 18,

                      color:
                        '#71717a',

                      fontSize: 12
                    }}
                  >
                    Este modelo todavía no
                    posee especificaciones
                    técnicas registradas.
                  </div>

                )

                : (

                  Object.entries(
                    atributosAgrupados
                  ).map(
                    ([
                      grupo,
                      items
                    ]) => (

                      <div
                        key={grupo}
                        style={{
                          marginBottom: 20
                        }}
                      >

                        <div
                          style={{
                            color:
                              '#09090b',

                            fontSize: 11,

                            fontWeight:
                              900,

                            letterSpacing:
                              1,

                            textTransform:
                              'uppercase',

                            marginBottom:
                              8
                          }}
                        >
                          {grupo}
                        </div>

                        <div
                          style={{
                            border:
                              '1px solid #e4e4e7',

                            borderRadius:
                              12,

                            overflow:
                              'hidden'
                          }}
                        >

                          {
                            items.map(
                              (
                                atributo,
                                index
                              ) => (

                                <div
                                  key={
                                    atributo.id
                                  }
                                  style={{
                                    display:
                                      'grid',

                                    gridTemplateColumns:
                                      '1fr auto',

                                    gap: 15,

                                    padding:
                                      '12px 14px',

                                    background:
                                      index % 2 === 0
                                        ? '#fafafa'
                                        : 'white',

                                    borderTop:
                                      index === 0
                                        ? 'none'
                                        : '1px solid #e4e4e7'
                                  }}
                                >

                                  <div
                                    style={{
                                      color:
                                        '#52525b',

                                      fontSize:
                                        12,

                                      fontWeight:
                                        700
                                    }}
                                  >
                                    {
                                      atributo.nombre
                                    }
                                  </div>

                                  <div
                                    style={{
                                      color:
                                        '#09090b',

                                      fontSize:
                                        12,

                                      fontWeight:
                                        900,

                                      textAlign:
                                        'right'
                                    }}
                                  >

                                    {
                                      atributo.valor ||
                                      '-'
                                    }

                                    {
                                      atributo.unidad

                                        ? ` ${atributo.unidad}`

                                        : ''
                                    }

                                  </div>

                                </div>

                              )
                            )
                          }

                        </div>

                      </div>

                    )
                  )

                )
            }

          </div>

          {/* =====================================================
              HISTORIAL TRAZABILIDAD
          ===================================================== */}

          <div
            style={{
              marginTop: 32,

              paddingTop: 24,

              borderTop:
                '1px solid #e4e4e7'
            }}
          >

            <div
              style={{
                fontSize: 10,

                color: '#71717a',

                fontWeight: 900,

                letterSpacing: 1.5
              }}
            >
              HISTORIAL DE TRAZABILIDAD
            </div>

            <h2
              style={{
                color: '#09090b',

                fontSize: 21,

                margin:
                  '6px 0 6px',

                fontWeight: 900
              }}
            >
              Ciclo de vida del producto
            </h2>

            <p
              style={{
                margin:
                  '0 0 22px',

                color: '#71717a',

                fontSize: 12,

                lineHeight: 1.5
              }}
            >
              Registro cronológico asociado
              a esta identidad digital.
            </p>

            {
              eventos.length === 0

                ? (

                  <div
                    style={{
                      background:
                        '#f4f4f5',

                      borderRadius: 12,

                      padding: 18,

                      color:
                        '#71717a',

                      fontSize: 12
                    }}
                  >
                    Esta unidad todavía no
                    posee eventos de
                    trazabilidad.
                  </div>

                )

                : (

                  <div>

                    {
                      eventos.map(
                        (
                          evento,
                          index
                        ) => (

                          <div
                            key={
                              evento.id ||
                              index
                            }
                            style={{
                              display:
                                'grid',

                              gridTemplateColumns:
                                '26px 1fr',

                              gap: 10
                            }}
                          >

                            {/* LÍNEA */}

                            <div
                              style={{
                                display:
                                  'flex',

                                flexDirection:
                                  'column',

                                alignItems:
                                  'center'
                              }}
                            >

                              <div
                                style={{
                                  width: 14,

                                  height: 14,

                                  borderRadius:
                                    '50%',

                                  background:
                                    '#ff6a00',

                                  border:
                                    '3px solid #ffedd5',

                                  flexShrink: 0
                                }}
                              />

                              {
                                index <
                                  eventos.length -
                                    1 && (

                                  <div
                                    style={{
                                      width: 2,

                                      background:
                                        '#e4e4e7',

                                      flex: 1,

                                      minHeight:
                                        110
                                    }}
                                  />

                                )
                              }

                            </div>

                            {/* EVENTO */}

                            <div
                              style={{
                                background:
                                  '#fafafa',

                                border:
                                  '1px solid #e4e4e7',

                                borderRadius:
                                  14,

                                padding: 16,

                                marginBottom:
                                  index <
                                  eventos.length -
                                    1
                                    ? 14
                                    : 0
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    'flex',

                                  justifyContent:
                                    'space-between',

                                  alignItems:
                                    'flex-start',

                                  gap: 10,

                                  flexWrap:
                                    'wrap'
                                }}
                              >

                                <div
                                  style={{
                                    display:
                                      'inline-block',

                                    background:
                                      '#ffedd5',

                                    color:
                                      '#c2410c',

                                    padding:
                                      '4px 8px',

                                    borderRadius:
                                      20,

                                    fontSize: 9,

                                    fontWeight:
                                      900,

                                    letterSpacing:
                                      0.7,

                                    textTransform:
                                      'uppercase'
                                  }}
                                >
                                  {
                                    evento.tipo_evento ||
                                    'Evento'
                                  }
                                </div>

                                <div
                                  style={{
                                    color:
                                      '#a1a1aa',

                                    fontSize:
                                      10,

                                    fontWeight:
                                      700
                                  }}
                                >
                                  {
                                    formatearFecha(
                                      evento.fecha_evento
                                    )
                                  }
                                </div>

                              </div>

                              <div
                                style={{
                                  marginTop: 12,

                                  color:
                                    '#09090b',

                                  fontSize: 16,

                                  fontWeight:
                                    900
                                }}
                              >
                                {
                                  evento.titulo ||
                                  'Evento de trazabilidad'
                                }
                              </div>

                              {
                                evento.descripcion && (

                                  <div
                                    style={{
                                      color:
                                        '#52525b',

                                      fontSize:
                                        12,

                                      lineHeight:
                                        1.6,

                                      marginTop:
                                        7
                                    }}
                                  >
                                    {
                                      evento.descripcion
                                    }
                                  </div>

                                )
                              }

                              {
                                (
                                  evento.responsable ||
                                  evento.ubicacion
                                ) && (

                                  <div
                                    style={{
                                      display:
                                        'grid',

                                      gridTemplateColumns:
                                        'repeat(2, minmax(0, 1fr))',

                                      gap: 8,

                                      marginTop:
                                        14
                                    }}
                                  >

                                    {
                                      evento.responsable && (

                                        <div>

                                          <div
                                            style={{
                                              color:
                                                '#a1a1aa',

                                              fontSize:
                                                8,

                                              fontWeight:
                                                900,

                                              letterSpacing:
                                                0.8
                                            }}
                                          >
                                            RESPONSABLE
                                          </div>

                                          <div
                                            style={{
                                              color:
                                                '#27272a',

                                              fontSize:
                                                11,

                                              fontWeight:
                                                800,

                                              marginTop:
                                                3
                                            }}
                                          >
                                            {
                                              evento.responsable
                                            }
                                          </div>

                                        </div>

                                      )
                                    }

                                    {
                                      evento.ubicacion && (

                                        <div>

                                          <div
                                            style={{
                                              color:
                                                '#a1a1aa',

                                              fontSize:
                                                8,

                                              fontWeight:
                                                900,

                                              letterSpacing:
                                                0.8
                                            }}
                                          >
                                            UBICACIÓN
                                          </div>

                                          <div
                                            style={{
                                              color:
                                                '#27272a',

                                              fontSize:
                                                11,

                                              fontWeight:
                                                800,

                                              marginTop:
                                                3
                                            }}
                                          >
                                            {
                                              evento.ubicacion
                                            }
                                          </div>

                                        </div>

                                      )
                                    }

                                  </div>

                                )
                              }

                              {/* EVIDENCIA */}

                              {
                                evento.archivo_url && (

                                  <div
                                    style={{
                                      marginTop:
                                        16,

                                      paddingTop:
                                        14,

                                      borderTop:
                                        '1px solid #e4e4e7'
                                    }}
                                  >

                                    <div
                                      style={{
                                        color:
                                          '#71717a',

                                        fontSize:
                                          9,

                                        fontWeight:
                                          900,

                                        letterSpacing:
                                          0.8,

                                        marginBottom:
                                          9
                                      }}
                                    >
                                      EVIDENCIA / DOCUMENTO
                                    </div>

                                    {
                                      String(
                                        evento.archivo_tipo ||
                                        ''
                                      ).startsWith(
                                        'image/'
                                      )

                                        ? (

                                          <a
                                            href={
                                              evento.archivo_url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              textDecoration:
                                                'none'
                                            }}
                                          >

                                            <img
                                              src={
                                                evento.archivo_url
                                              }
                                              alt={
                                                evento.archivo_nombre ||
                                                'Evidencia del evento'
                                              }
                                              style={{
                                                display:
                                                  'block',

                                                width:
                                                  '100%',

                                                maxHeight:
                                                  320,

                                                objectFit:
                                                  'cover',

                                                borderRadius:
                                                  12,

                                                border:
                                                  '1px solid #e4e4e7',

                                                background:
                                                  '#f4f4f5'
                                              }}
                                            />

                                          </a>

                                        )

                                        : (

                                          <div
                                            style={{
                                              background:
                                                'white',

                                              border:
                                                '1px solid #e4e4e7',

                                              borderRadius:
                                                12,

                                              padding:
                                                12
                                            }}
                                          >

                                            <div
                                              style={{
                                                color:
                                                  '#27272a',

                                                fontSize:
                                                  12,

                                                fontWeight:
                                                  800,

                                                wordBreak:
                                                  'break-word'
                                              }}
                                            >
                                              {
                                                evento.archivo_nombre ||
                                                'Documento adjunto'
                                              }
                                            </div>

                                            {
                                              evento.archivo_tipo && (

                                                <div
                                                  style={{
                                                    color:
                                                      '#a1a1aa',

                                                    fontSize:
                                                      9,

                                                    marginTop:
                                                      4
                                                  }}
                                                >
                                                  {
                                                    evento.archivo_tipo
                                                  }
                                                </div>

                                              )
                                            }

                                          </div>

                                        )
                                    }

                                    <a
                                      href={
                                        evento.archivo_url
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display:
                                          'inline-block',

                                        marginTop:
                                          10,

                                        background:
                                          '#09090b',

                                        color:
                                          'white',

                                        padding:
                                          '8px 12px',

                                        borderRadius:
                                          8,

                                        fontSize:
                                          11,

                                        fontWeight:
                                          900,

                                        textDecoration:
                                          'none'
                                      }}
                                    >
                                      Ver evidencia
                                    </a>

                                  </div>

                                )
                              }

                            </div>

                          </div>

                        )
                      )
                    }

                  </div>

                )
            }

          </div>

          {/* =====================================================
              QR
          ===================================================== */}

          <div
            style={{
              textAlign: 'center',

              marginTop: 35,

              paddingTop: 25,

              borderTop:
                '1px solid #e4e4e7'
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
                display:
                  'inline-block',

                background: 'white',

                border:
                  '2px solid #09090b',

                borderRadius: 15,

                padding: 12
              }}
            >

              <img
                src={qrUrl}
                alt={
                  `QR ${unidad.codigo}`
                }
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

                fontFamily:
                  'monospace',

                fontSize: 11,

                fontWeight: 700,

                wordBreak:
                  'break-all'
              }}
            >
              {unidad.codigo}
            </div>

            <div
              style={{
                color: '#71717a',

                fontSize: 10,

                marginTop: 8,

                lineHeight: 1.5
              }}
            >
              Escanea este código para consultar
              la identidad digital de esta unidad.
            </div>

          </div>

          {/* =====================================================
              PIE
          ===================================================== */}

          <div
            style={{
              textAlign: 'center',

              marginTop: 35,

              paddingTop: 20,

              borderTop:
                '1px solid #e4e4e7'
            }}
          >

            <div
              style={{
                fontSize: 9,

                color: '#a1a1aa',

                letterSpacing: 1
              }}
            >
              IDENTIDAD REGISTRADA EN
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

                marginTop: 8,

                lineHeight: 1.5
              }}
            >
              Plataforma de identidad y
              trazabilidad de productos
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
