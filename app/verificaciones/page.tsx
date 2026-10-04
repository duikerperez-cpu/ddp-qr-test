'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Verificacion = {
  id: string
  unidad_id: string
  empresa_id: string
  codigo_unidad: string
  carrier_id?: string | null
  origen: string
  resultado: string
  dispositivo?: string | null
  user_agent?: string | null
  created_at: string
}

type Perfil = {
  id?: string
  rol?: string | null
  empresa_id?: string | null
  estado?: string | null
}

function normalizarRol(valor?: string | null) {
  return String(valor || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]/g, '')
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) return '-'

  try {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return fecha
  }
}

function origenLabel(origen?: string | null) {
  const valor = String(origen || '').toLowerCase()

  if (valor === 'qr') return 'QR'
  if (valor === 'nfc') return 'NFC'
  if (valor === 'web') return 'WEB'
  if (valor === 'certificado') return 'CERTIFICADO'

  return valor ? valor.toUpperCase() : 'OTRO'
}

function dispositivoLabel(dispositivo?: string | null) {
  const valor = String(dispositivo || '').toLowerCase()

  if (valor === 'movil') return 'Móvil'
  if (valor === 'tablet') return 'Tablet'
  if (valor === 'escritorio') return 'Escritorio'

  return dispositivo || 'No identificado'
}

export default function VerificacionesPage() {
  const [verificaciones, setVerificaciones] = useState<Verificacion[]>([])
  const [perfil, setPerfil] = useState<Perfil | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroOrigen, setFiltroOrigen] = useState('todos')
  const [filtroResultado, setFiltroResultado] = useState('todos')

  /* =========================================================
     CARGAR VERIFICACIONES
  ========================================================= */

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError('')

      try {
        /* =====================================================
           USUARIO
        ===================================================== */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          window.location.href = '/login'
          return
        }

        /* =====================================================
           PERFIL
        ===================================================== */

        const { data: perfilData, error: perfilError } =
          await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        if (perfilError) {
          console.error('Error perfil:', perfilError)

          setError(
            'No fue posible consultar el perfil del usuario.'
          )

          return
        }

        if (!perfilData) {
          await supabase.auth.signOut()
          window.location.href = '/login'
          return
        }

        const perfilActual = perfilData as Perfil

        setPerfil(perfilActual)

        const rol = normalizarRol(perfilActual.rol)

        const esSuperAdmin =
          rol === 'superadmin'

        const esAdminEmpresa =
          rol === 'adminempresa'

        if (!esSuperAdmin && !esAdminEmpresa) {
          setError(
            'Tu usuario no posee permisos para consultar verificaciones.'
          )

          return
        }

        if (
          esAdminEmpresa &&
          !perfilActual.empresa_id
        ) {
          setError(
            'Tu perfil no posee una empresa asociada.'
          )

          return
        }

        /* =====================================================
           VERIFICACIONES

           RLS también protege la consulta.
           El filtro empresa agrega una segunda capa explícita.
        ===================================================== */

        let query = supabase
          .from('verificaciones')
          .select(`
            id,
            unidad_id,
            empresa_id,
            codigo_unidad,
            carrier_id,
            origen,
            resultado,
            dispositivo,
            user_agent,
            created_at
          `)
          .order('created_at', {
            ascending: false,
          })
          .limit(1000)

        if (
          esAdminEmpresa &&
          perfilActual.empresa_id
        ) {
          query = query.eq(
            'empresa_id',
            perfilActual.empresa_id
          )
        }

        const {
          data: verificacionesData,
          error: verificacionesError,
        } = await query

        if (verificacionesError) {
          console.error(
            'Error verificaciones:',
            verificacionesError
          )

          setError(
            'No fue posible cargar las verificaciones.'
          )

          return
        }

        setVerificaciones(
          (verificacionesData || []) as Verificacion[]
        )
      } catch (err) {
        console.error(
          'Error cargando verificaciones:',
          err
        )

        setError(
          'Ocurrió un error al cargar el módulo.'
        )
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  /* =========================================================
     DATOS FILTRADOS
  ========================================================= */

  const verificacionesFiltradas = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase()

    return verificaciones.filter((item) => {
      const coincideBusqueda =
        !texto ||
        String(item.codigo_unidad || '')
          .toLowerCase()
          .includes(texto) ||
        String(item.carrier_id || '')
          .toLowerCase()
          .includes(texto) ||
        String(item.dispositivo || '')
          .toLowerCase()
          .includes(texto) ||
        String(item.resultado || '')
          .toLowerCase()
          .includes(texto)

      const coincideOrigen =
        filtroOrigen === 'todos' ||
        item.origen === filtroOrigen

      const coincideResultado =
        filtroResultado === 'todos' ||
        item.resultado === filtroResultado

      return (
        coincideBusqueda &&
        coincideOrigen &&
        coincideResultado
      )
    })
  }, [
    verificaciones,
    busqueda,
    filtroOrigen,
    filtroResultado,
  ])

  /* =========================================================
     MÉTRICAS
  ========================================================= */

  const metricas = useMemo(() => {
    const hoy = new Date()

    const inicioHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    )

    const verificacionesHoy =
      verificaciones.filter((item) => {
        if (!item.created_at) return false

        return (
          new Date(item.created_at) >=
          inicioHoy
        )
      }).length

    const unidades = new Set(
      verificaciones.map(
        (item) => item.codigo_unidad
      )
    )

    const qr = verificaciones.filter(
      (item) => item.origen === 'qr'
    ).length

    const nfc = verificaciones.filter(
      (item) => item.origen === 'nfc'
    ).length

    const web = verificaciones.filter(
      (item) => item.origen === 'web'
    ).length

    return {
      total: verificaciones.length,
      hoy: verificacionesHoy,
      unidades: unidades.size,
      qr,
      nfc,
      web,
    }
  }, [verificaciones])

  /* =========================================================
     ÚLTIMA VERIFICACIÓN
  ========================================================= */

  const ultimaVerificacion =
    verificaciones.length > 0
      ? verificaciones[0]
      : null

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: '#ff6a00',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              marginTop: 12,
              color: '#a1a1aa',
              fontSize: 14,
            }}
          >
            Cargando verificaciones...
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 18,
            padding: 28,
            color: '#ffffff',
          }}
        >
          <div
            style={{
              color: '#ff6a00',
              fontWeight: 900,
              letterSpacing: 2,
              fontSize: 13,
            }}
          >
            VINCULAB
          </div>

          <h1
            style={{
              margin: '14px 0 8px',
              fontSize: 22,
            }}
          >
            Verificaciones
          </h1>

          <div
            style={{
              color: '#fca5a5',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================
     COMPONENTE MÉTRICA
  ========================================================= */

  const Metrica = ({
    titulo,
    valor,
    detalle,
  }: {
    titulo: string
    valor: string | number
    detalle: string
  }) => (
    <div
      style={{
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: 16,
        padding: 18,
      }}
    >
      <div
        style={{
          color: '#a1a1aa',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          marginTop: 8,
          color: '#ffffff',
          fontSize: 28,
          lineHeight: 1,
          fontWeight: 900,
        }}
      >
        {valor}
      </div>

      <div
        style={{
          marginTop: 8,
          color: '#71717a',
          fontSize: 10,
          lineHeight: 1.4,
        }}
      >
        {detalle}
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
        background: '#09090b',
        color: '#ffffff',
        fontFamily: 'system-ui',
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          borderBottom: '1px solid #27272a',
          background: '#09090b',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                color: '#ff6a00',
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              VINCULAB
            </div>

            <div
              style={{
                marginTop: 3,
                color: '#71717a',
                fontSize: 10,
              }}
            >
              Identidad digital y trazabilidad
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/portal'
            }}
            style={{
              minHeight: 38,
              padding: '0 14px',
              borderRadius: 9,
              border: '1px solid #3f3f46',
              background: '#18181b',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ← VOLVER AL PORTAL
          </button>
        </div>
      </div>

      <main
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '28px 20px 60px',
        }}
      >
        {/* ===================================================
            TÍTULO
        =================================================== */}

        <div
          style={{
            marginBottom: 24,
          }}
        >
          <div
            style={{
              color: '#ff6a00',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            IDENTIDAD DIGITAL
          </div>

          <h1
            style={{
              margin: '6px 0 6px',
              fontSize: 'clamp(26px, 4vw, 38px)',
              lineHeight: 1.05,
              fontWeight: 900,
            }}
          >
            Verificaciones
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 720,
              color: '#a1a1aa',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Registro de consultas y verificaciones realizadas
            sobre las identidades digitales Vinculab.
          </p>
        </div>

        {/* ===================================================
            MÉTRICAS
        =================================================== */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
            marginBottom: 22,
          }}
        >
          <Metrica
            titulo="Total verificaciones"
            valor={metricas.total}
            detalle="Registros almacenados"
          />

          <Metrica
            titulo="Verificaciones hoy"
            valor={metricas.hoy}
            detalle="Actividad del día"
          />

          <Metrica
            titulo="Unidades verificadas"
            valor={metricas.unidades}
            detalle="Identidades únicas"
          />

          <Metrica
            titulo="QR"
            valor={metricas.qr}
            detalle="Origen identificado como QR"
          />

          <Metrica
            titulo="NFC"
            valor={metricas.nfc}
            detalle="Origen identificado como NFC"
          />

          <Metrica
            titulo="Web"
            valor={metricas.web}
            detalle="Accesos web directos"
          />
        </div>

        {/* ===================================================
            ÚLTIMA VERIFICACIÓN
        =================================================== */}

        {ultimaVerificacion && (
          <div
            style={{
              marginBottom: 22,
              background:
                'linear-gradient(135deg, #18181b 0%, #111113 100%)',
              border: '1px solid #3f3f46',
              borderRadius: 18,
              padding: 20,
            }}
          >
            <div
              style={{
                color: '#ff6a00',
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: 1.3,
              }}
            >
              ÚLTIMA VERIFICACIÓN
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 18,
                flexWrap: 'wrap',
                marginTop: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#ffffff',
                  }}
                >
                  {ultimaVerificacion.codigo_unidad}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color: '#a1a1aa',
                    fontSize: 11,
                  }}
                >
                  {ultimaVerificacion.carrier_id ||
                    'Sin carrier asociado'}
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {origenLabel(
                    ultimaVerificacion.origen
                  )}
                  {' · '}
                  {dispositivoLabel(
                    ultimaVerificacion.dispositivo
                  )}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color: '#71717a',
                    fontSize: 10,
                  }}
                >
                  {formatearFecha(
                    ultimaVerificacion.created_at
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            FILTROS
        =================================================== */}

        <div
          style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(220px, 2fr) repeat(2, minmax(150px, 1fr))',
              gap: 10,
            }}
          >
            <input
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar unidad, carrier, dispositivo..."
              style={{
                width: '100%',
                minHeight: 42,
                borderRadius: 9,
                border: '1px solid #3f3f46',
                background: '#09090b',
                color: '#ffffff',
                padding: '0 12px',
                outline: 'none',
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            />

            <select
              value={filtroOrigen}
              onChange={(e) =>
                setFiltroOrigen(e.target.value)
              }
              style={{
                width: '100%',
                minHeight: 42,
                borderRadius: 9,
                border: '1px solid #3f3f46',
                background: '#09090b',
                color: '#ffffff',
                padding: '0 10px',
                outline: 'none',
                fontSize: 12,
              }}
            >
              <option value="todos">
                Todos los orígenes
              </option>

              <option value="qr">
                QR
              </option>

              <option value="nfc">
                NFC
              </option>

              <option value="web">
                Web
              </option>

              <option value="certificado">
                Certificado
              </option>

              <option value="otro">
                Otro
              </option>
            </select>

            <select
              value={filtroResultado}
              onChange={(e) =>
                setFiltroResultado(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                minHeight: 42,
                borderRadius: 9,
                border: '1px solid #3f3f46',
                background: '#09090b',
                color: '#ffffff',
                padding: '0 10px',
                outline: 'none',
                fontSize: 12,
              }}
            >
              <option value="todos">
                Todos los resultados
              </option>

              <option value="identidad_valida">
                Identidad válida
              </option>

              <option value="identidad_no_encontrada">
                Identidad no encontrada
              </option>

              <option value="carrier_invalido">
                Carrier inválido
              </option>

              <option value="otro">
                Otro
              </option>
            </select>
          </div>
        </div>

        {/* ===================================================
            RESULTADOS
        =================================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            alignItems: 'center',
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              color: '#a1a1aa',
              fontSize: 11,
            }}
          >
            Mostrando{' '}
            <strong
              style={{
                color: '#ffffff',
              }}
            >
              {verificacionesFiltradas.length}
            </strong>{' '}
            verificaciones
          </div>

          <div
            style={{
              color: '#71717a',
              fontSize: 10,
            }}
          >
            Rol: {perfil?.rol || '-'}
          </div>
        </div>

        {/* ===================================================
            TABLA
        =================================================== */}

        <div
          style={{
            border: '1px solid #27272a',
            borderRadius: 16,
            overflow: 'hidden',
            background: '#18181b',
          }}
        >
          {verificacionesFiltradas.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 15,
                }}
              >
                Sin verificaciones
              </div>

              <div
                style={{
                  color: '#71717a',
                  fontSize: 11,
                  marginTop: 6,
                }}
              >
                No existen registros para los filtros
                seleccionados.
              </div>
            </div>
          ) : (
            <div
              style={{
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#111113',
                    }}
                  >
                    {[
                      'Fecha',
                      'Unidad',
                      'Carrier',
                      'Origen',
                      'Dispositivo',
                      'Resultado',
                      'Acción',
                    ].map((titulo) => (
                      <th
                        key={titulo}
                        style={{
                          padding: '12px 14px',
                          textAlign: 'left',
                          color: '#71717a',
                          fontSize: 9,
                          fontWeight: 900,
                          letterSpacing: 1,
                          textTransform:
                            'uppercase',
                          borderBottom:
                            '1px solid #27272a',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {verificacionesFiltradas.map(
                    (item) => {
                      const valida =
                        item.resultado ===
                        'identidad_valida'

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom:
                              '1px solid #27272a',
                          }}
                        >
                          <td
                            style={{
                              padding:
                                '14px',
                              color:
                                '#a1a1aa',
                              fontSize: 11,
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {formatearFecha(
                              item.created_at
                            )}
                          </td>

                          <td
                            style={{
                              padding:
                                '14px',
                            }}
                          >
                            <div
                              style={{
                                color:
                                  '#ffffff',
                                fontFamily:
                                  'monospace',
                                fontSize: 12,
                                fontWeight: 900,
                              }}
                            >
                              {
                                item.codigo_unidad
                              }
                            </div>
                          </td>

                          <td
                            style={{
                              padding:
                                '14px',
                              color:
                                '#a1a1aa',
                              fontFamily:
                                'monospace',
                              fontSize: 11,
                            }}
                          >
                            {item.carrier_id ||
                              '-'}
                          </td>

                          <td
                            style={{
                              padding:
                                '14px',
                            }}
                          >
                            <span
                              style={{
                                display:
                                  'inline-flex',
                                padding:
                                  '5px 8px',
                                borderRadius:
                                  20,
                                background:
                                  '#27272a',
                                color:
                                  '#ffffff',
                                fontSize: 9,
                                fontWeight: 900,
                                letterSpacing:
                                  0.5,
                              }}
                            >
                              {origenLabel(
                                item.origen
                              )}
                            </span>
                          </td>

                          <td
                            style={{
                              padding:
                                '14px',
                              color:
                                '#d4d4d8',
                              fontSize: 11,
                            }}
                          >
                            {dispositivoLabel(
                              item.dispositivo
                            )}
                          </td>

                          <td
                            style={{
                              padding:
                                '14px',
                            }}
                          >
                            <span
                              style={{
                                display:
                                  'inline-flex',
                                alignItems:
                                  'center',
                                padding:
                                  '5px 8px',
                                borderRadius:
                                  20,
                                background:
                                  valida
                                    ? '#14532d'
                                    : '#7f1d1d',
                                color:
                                  valida
                                    ? '#bbf7d0'
                                    : '#fecaca',
                                fontSize: 9,
                                fontWeight: 900,
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {valida
                                ? '✓ IDENTIDAD VÁLIDA'
                                : item.resultado
                                    .replace(
                                      /_/g,
                                      ' '
                                    )
                                    .toUpperCase()}
                            </span>
                          </td>

                          <td
                            style={{
                              padding:
                                '14px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  `/u/${encodeURIComponent(
                                    item.codigo_unidad
                                  )}`,
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }
                              style={{
                                minHeight: 34,
                                border: 0,
                                borderRadius:
                                  8,
                                padding:
                                  '0 11px',
                                background:
                                  '#ff6a00',
                                color:
                                  '#ffffff',
                                fontSize: 9,
                                fontWeight: 900,
                                cursor:
                                  'pointer',
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              VER IDENTIDAD →
                            </button>
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===================================================
            PIE
        =================================================== */}

        <div
          style={{
            marginTop: 22,
            textAlign: 'center',
            color: '#52525b',
            fontSize: 9,
            lineHeight: 1.6,
          }}
        >
          VINCULAB · SISTEMA DE VERIFICACIÓN DE
          IDENTIDADES DIGITALES
        </div>
      </main>

      {/* =====================================================
          RESPONSIVE
      ===================================================== */}

      <style jsx>{`
        @media (max-width: 760px) {
          main {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          div[style*='grid-template-columns: minmax(220px, 2fr)'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
