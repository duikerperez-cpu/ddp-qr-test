'use client'

import {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  useRouter
} from 'next/navigation'

import {
  createClient
} from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================
// TIPOS
// ============================================================

type Perfil = {
  id: string
  nombre: string | null
  apellido: string | null
  cargo: string | null
  rol: string | null
  activo: boolean | null
  empresa_id: string | null
}

type Unidad = {
  id: string
  codigo: string
  numero_unidad: number
  estado: string | null

  empresa_id: string | null
  producto_id: string | null
  modelo_id: string | null
  lote_id: string

  producto_nombre?: string | null
  producto_categoria?: string | null

  modelo_nombre?: string | null
  modelo_version?: string | null

  lote_codigo?: string | null

  dpp_codigo?: string | null

  carrier_id?: string | null
}

type Evento = {
  id: string

  unidad_id: string
  codigo_unidad: string

  tipo_evento: string
  titulo: string
  descripcion: string | null

  responsable: string | null
  ubicacion: string | null

  fecha_evento: string | null
  created_at: string | null

  archivo_url: string | null
  archivo_nombre: string | null
  archivo_tipo: string | null
}

// ============================================================
// TIPOS DE EVENTO
// ============================================================

const TIPOS_EVENTO = [
  {
    value: 'fabricacion',
    label: 'Fabricación',
    icon: '⚙'
  },
  {
    value: 'control_calidad',
    label: 'Control de calidad',
    icon: '✓'
  },
  {
    value: 'despacho',
    label: 'Despacho',
    icon: '↗'
  },
  {
    value: 'recepcion',
    label: 'Recepción',
    icon: '↓'
  },
  {
    value: 'instalacion',
    label: 'Instalación',
    icon: '⌂'
  },
  {
    value: 'inspeccion',
    label: 'Inspección',
    icon: '◎'
  },
  {
    value: 'mantenimiento',
    label: 'Mantenimiento',
    icon: '⌁'
  },
  {
    value: 'reparacion',
    label: 'Reparación',
    icon: '◇'
  },
  {
    value: 'traslado',
    label: 'Traslado',
    icon: '⇄'
  },
  {
    value: 'recertificacion',
    label: 'Recertificación',
    icon: '◈'
  },
  {
    value: 'fin_vida',
    label: 'Fin de vida',
    icon: '○'
  },
  {
    value: 'otro',
    label: 'Otro evento',
    icon: '+'
  }
]

// ============================================================
// HELPERS
// ============================================================

function normalizarRol(
  rol: string | null | undefined
) {
  return String(rol || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
}

function etiquetaTipo(
  tipo: string | null | undefined
) {
  const encontrado =
    TIPOS_EVENTO.find(
      item =>
        item.value === tipo
    )

  return encontrado?.label ||
    tipo ||
    'Evento'
}

function iconoTipo(
  tipo: string | null | undefined
) {
  const encontrado =
    TIPOS_EVENTO.find(
      item =>
        item.value === tipo
    )

  return encontrado?.icon || '•'
}

function formatoFecha(
  valor: string | null | undefined
) {
  if (!valor) {
    return '-'
  }

  const fecha =
    new Date(valor)

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return valor
  }

  return new Intl.DateTimeFormat(
    'es-CL',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  ).format(fecha)
}

function fechaLocalInput() {
  const ahora =
    new Date()

  const offset =
    ahora.getTimezoneOffset()

  const local =
    new Date(
      ahora.getTime() -
      offset * 60 * 1000
    )

  return local
    .toISOString()
    .slice(0, 16)
}

// ============================================================
// PÁGINA
// ============================================================

export default function TrazabilidadPage() {
  const router =
    useRouter()

  const [
    perfil,
    setPerfil
  ] = useState<Perfil | null>(
    null
  )

  const [
    unidades,
    setUnidades
  ] = useState<Unidad[]>([])

  const [
    eventos,
    setEventos
  ] = useState<Evento[]>([])

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    guardando,
    setGuardando
  ] = useState(false)

  const [
    error,
    setError
  ] = useState('')

  const [
    mensaje,
    setMensaje
  ] = useState('')

  const [
    busqueda,
    setBusqueda
  ] = useState('')

  const [
    unidadId,
    setUnidadId
  ] = useState('')

  const [
    tipoEvento,
    setTipoEvento
  ] = useState(
    'control_calidad'
  )

  const [
    titulo,
    setTitulo
  ] = useState('')

  const [
    descripcion,
    setDescripcion
  ] = useState('')

  const [
    responsable,
    setResponsable
  ] = useState('')

  const [
    ubicacion,
    setUbicacion
  ] = useState('')

  const [
    fechaEvento,
    setFechaEvento
  ] = useState(
    fechaLocalInput()
  )

  // ==========================================================
  // UNIDAD SELECCIONADA
  // ==========================================================

  const unidadSeleccionada =
    useMemo(
      () =>
        unidades.find(
          unidad =>
            unidad.id ===
            unidadId
        ) || null,
      [
        unidades,
        unidadId
      ]
    )

  // ==========================================================
  // FILTRO
  // ==========================================================

  const unidadesFiltradas =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase()

      if (!texto) {
        return unidades
      }

      return unidades.filter(
        unidad => {
          const contenido = [
            unidad.codigo,
            unidad.producto_nombre,
            unidad.producto_categoria,
            unidad.modelo_nombre,
            unidad.modelo_version,
            unidad.lote_codigo,
            unidad.dpp_codigo,
            unidad.carrier_id
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return contenido.includes(
            texto
          )
        }
      )
    }, [
      unidades,
      busqueda
    ])

  // ==========================================================
  // CARGA INICIAL
  // ==========================================================

  useEffect(() => {
    cargarModulo()
  }, [])

  async function cargarModulo() {
    try {
      setLoading(true)
      setError('')

      // ======================================================
      // AUTH
      // ======================================================

      const {
        data: {
          user
        },
        error: authError
      } =
        await supabase.auth.getUser()

      if (
        authError ||
        !user
      ) {
        router.replace(
          '/login'
        )

        return
      }

      // ======================================================
      // PERFIL
      // ======================================================

      const {
        data: perfilData,
        error: perfilError
      } =
        await supabase
          .from('perfiles')
          .select(`
            id,
            nombre,
            apellido,
            cargo,
            rol,
            activo,
            empresa_id
          `)
          .eq(
            'id',
            user.id
          )
          .maybeSingle()

      if (
        perfilError ||
        !perfilData
      ) {
        throw new Error(
          'No fue posible cargar tu perfil.'
        )
      }

      if (
        perfilData.activo ===
        false
      ) {
        await supabase.auth.signOut()

        router.replace(
          '/login'
        )

        return
      }

      const rol =
        normalizarRol(
          perfilData.rol
        )

      if (
        rol !== 'superadmin' &&
        rol !== 'adminempresa'
      ) {
        throw new Error(
          'No tienes permisos para administrar trazabilidad.'
        )
      }

      if (
        rol === 'adminempresa' &&
        !perfilData.empresa_id
      ) {
        throw new Error(
          'Tu cuenta no tiene una empresa asociada.'
        )
      }

      setPerfil(
        perfilData as Perfil
      )

      // ======================================================
      // CARGAR UNIDADES
      // ======================================================

      let unidadesQuery =
        supabase
          .from('unidades')
          .select(`
            id,
            codigo,
            numero_unidad,
            estado,
            empresa_id,
            producto_id,
            modelo_id,
            lote_id
          `)
          .order(
            'codigo',
            {
              ascending: true
            }
          )

      if (
        rol === 'adminempresa'
      ) {
        unidadesQuery =
          unidadesQuery.eq(
            'empresa_id',
            perfilData.empresa_id
          )
      }

      const {
        data: unidadesData,
        error: unidadesError
      } =
        await unidadesQuery

      if (unidadesError) {
        throw new Error(
          'No fue posible cargar las unidades.'
        )
      }

      const base =
        Array.isArray(
          unidadesData
        )
          ? unidadesData
          : []

      if (
        base.length === 0
      ) {
        setUnidades([])
        setEventos([])
        return
      }

      // ======================================================
      // IDS
      // ======================================================

      const productoIds =
        Array.from(
          new Set(
            base
              .map(
                item =>
                  item.producto_id
              )
              .filter(Boolean)
          )
        ) as string[]

      const modeloIds =
        Array.from(
          new Set(
            base
              .map(
                item =>
                  item.modelo_id
              )
              .filter(Boolean)
          )
        ) as string[]

      const loteIds =
        Array.from(
          new Set(
            base
              .map(
                item =>
                  item.lote_id
              )
              .filter(Boolean)
          )
        ) as string[]

      const unidadIds =
        base.map(
          item =>
            item.id
        )

      // ======================================================
      // RELACIONES EN PARALELO
      // ======================================================

      const [
        productosResponse,
        modelosResponse,
        lotesResponse,
        dppsResponse,
        carriersResponse,
        eventosResponse
      ] =
        await Promise.all([
          productoIds.length
            ? supabase
                .from(
                  'productos'
                )
                .select(
                  'id,nombre,categoria'
                )
                .in(
                  'id',
                  productoIds
                )
            : Promise.resolve({
                data: [],
                error: null
              }),

          modeloIds.length
            ? supabase
                .from(
                  'modelos'
                )
                .select(
                  'id,nombre,version'
                )
                .in(
                  'id',
                  modeloIds
                )
            : Promise.resolve({
                data: [],
                error: null
              }),

          loteIds.length
            ? supabase
                .from(
                  'lotes'
                )
                .select(
                  'id,codigo'
                )
                .in(
                  'id',
                  loteIds
                )
            : Promise.resolve({
                data: [],
                error: null
              }),

          supabase
            .from('dpps')
            .select(`
              id,
              codigo,
              unidad_id,
              estado,
              created_at
            `)
            .in(
              'unidad_id',
              unidadIds
            )
            .order(
              'created_at',
              {
                ascending: false
              }
            ),

          supabase
            .from('nfc_qr')
            .select(`
              id_carrier,
              unidad_id,
              estado,
              fecha_asignacion
            `)
            .in(
              'unidad_id',
              unidadIds
            )
            .order(
              'fecha_asignacion',
              {
                ascending: false
              }
            ),

          supabase
            .from(
              'eventos_trazabilidad'
            )
            .select(`
              id,
              unidad_id,
              codigo_unidad,
              tipo_evento,
              titulo,
              descripcion,
              responsable,
              ubicacion,
              fecha_evento,
              created_at,
              archivo_url,
              archivo_nombre,
              archivo_tipo
            `)
            .in(
              'unidad_id',
              unidadIds
            )
            .order(
              'fecha_evento',
              {
                ascending: false
              }
            )
        ])

      // ======================================================
      // MAPAS
      // ======================================================

      const productosMap =
        new Map<string, any>()

      for (
        const item of
          productosResponse.data ||
          []
      ) {
        productosMap.set(
          item.id,
          item
        )
      }

      const modelosMap =
        new Map<string, any>()

      for (
        const item of
          modelosResponse.data ||
          []
      ) {
        modelosMap.set(
          item.id,
          item
        )
      }

      const lotesMap =
        new Map<string, any>()

      for (
        const item of
          lotesResponse.data ||
          []
      ) {
        lotesMap.set(
          item.id,
          item
        )
      }

      const dppsMap =
        new Map<string, any>()

      for (
        const item of
          dppsResponse.data ||
          []
      ) {
        if (
          item.unidad_id &&
          !dppsMap.has(
            item.unidad_id
          )
        ) {
          dppsMap.set(
            item.unidad_id,
            item
          )
        }
      }

      const carriersMap =
        new Map<string, any>()

      for (
        const item of
          carriersResponse.data ||
          []
      ) {
        if (
          item.unidad_id &&
          !carriersMap.has(
            item.unidad_id
          )
        ) {
          carriersMap.set(
            item.unidad_id,
            item
          )
        }
      }

      // ======================================================
      // RESULTADO UNIDADES
      // ======================================================

      const resultado:
        Unidad[] =
        base.map(
          item => {
            const producto =
              item.producto_id
                ? productosMap.get(
                    item.producto_id
                  )
                : null

            const modelo =
              item.modelo_id
                ? modelosMap.get(
                    item.modelo_id
                  )
                : null

            const lote =
              item.lote_id
                ? lotesMap.get(
                    item.lote_id
                  )
                : null

            const dpp =
              dppsMap.get(
                item.id
              )

            const carrier =
              carriersMap.get(
                item.id
              )

            return {
              ...item,

              producto_nombre:
                producto?.nombre ||
                null,

              producto_categoria:
                producto?.categoria ||
                null,

              modelo_nombre:
                modelo?.nombre ||
                null,

              modelo_version:
                modelo?.version ||
                null,

              lote_codigo:
                lote?.codigo ||
                null,

              dpp_codigo:
                dpp?.codigo ||
                null,

              carrier_id:
                carrier?.id_carrier ||
                null
            }
          }
        )

      setUnidades(
        resultado
      )

      setEventos(
        Array.isArray(
          eventosResponse.data
        )
          ? eventosResponse.data as Evento[]
          : []
      )

    } catch (
      err: any
    ) {
      console.error(err)

      setError(
        err?.message ||
        'No fue posible cargar el módulo de trazabilidad.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // EVENTOS DE LA UNIDAD
  // ==========================================================

  const eventosUnidad =
    useMemo(
      () => {
        if (!unidadId) {
          return []
        }

        return eventos.filter(
          evento =>
            evento.unidad_id ===
            unidadId
        )
      },
      [
        eventos,
        unidadId
      ]
    )

  // ==========================================================
  // REGISTRAR EVENTO
  // ==========================================================

  async function registrarEvento() {
    if (
      !unidadSeleccionada
    ) {
      setError(
        'Selecciona una unidad.'
      )

      return
    }

    if (
      !tipoEvento
    ) {
      setError(
        'Selecciona el tipo de evento.'
      )

      return
    }

    if (
      !titulo.trim()
    ) {
      setError(
        'Ingresa un título para el evento.'
      )

      return
    }

    if (
      !fechaEvento
    ) {
      setError(
        'Selecciona la fecha del evento.'
      )

      return
    }

    try {
      setGuardando(true)
      setError('')
      setMensaje('')

      // ======================================================
      // VALIDACIÓN DE UNIDAD
      // ======================================================

      const {
        data: unidadReal,
        error: unidadError
      } =
        await supabase
          .from('unidades')
          .select(`
            id,
            codigo,
            empresa_id
          `)
          .eq(
            'id',
            unidadSeleccionada.id
          )
          .maybeSingle()

      if (
        unidadError ||
        !unidadReal
      ) {
        throw new Error(
          'La unidad seleccionada ya no existe.'
        )
      }

      const rol =
        normalizarRol(
          perfil?.rol
        )

      if (
        rol === 'adminempresa' &&
        unidadReal.empresa_id !==
          perfil?.empresa_id
      ) {
        throw new Error(
          'No puedes registrar eventos en unidades de otra empresa.'
        )
      }

      // ======================================================
      // INSERT
      // ======================================================

      const {
        data,
        error: insertError
      } =
        await supabase
          .from(
            'eventos_trazabilidad'
          )
          .insert({
            unidad_id:
              unidadReal.id,

            codigo_unidad:
              unidadReal.codigo,

            tipo_evento:
              tipoEvento,

            titulo:
              titulo.trim(),

            descripcion:
              descripcion.trim() ||
              null,

            responsable:
              responsable.trim() ||
              null,

            ubicacion:
              ubicacion.trim() ||
              null,

            fecha_evento:
              new Date(
                fechaEvento
              ).toISOString()
          })
          .select(`
            id,
            unidad_id,
            codigo_unidad,
            tipo_evento,
            titulo,
            descripcion,
            responsable,
            ubicacion,
            fecha_evento,
            created_at,
            archivo_url,
            archivo_nombre,
            archivo_tipo
          `)
          .single()

      if (insertError) {
        console.error(
          insertError
        )

        throw new Error(
          insertError.message ||
          'No fue posible registrar el evento.'
        )
      }

      setEventos(
        anteriores => [
          data as Evento,
          ...anteriores
        ]
      )

      setTitulo('')
      setDescripcion('')
      setUbicacion('')

      setFechaEvento(
        fechaLocalInput()
      )

      setMensaje(
        `Evento registrado correctamente en ${unidadReal.codigo}.`
      )

    } catch (
      err: any
    ) {
      console.error(err)

      setError(
        err?.message ||
        'No fue posible registrar el evento.'
      )
    } finally {
      setGuardando(false)
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main style={styles.loading}>
        <div style={styles.loadingBrand}>
          VINCULAB
        </div>

        <div style={styles.spinner} />

        <div style={styles.loadingText}>
          Cargando trazabilidad viva...
        </div>
      </main>
    )
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main style={styles.page}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header style={styles.header}>
        <div>
          <div style={styles.brand}>
            VINCULAB
          </div>

          <div style={styles.brandSub}>
            IDENTIDAD DIGITAL DE PRODUCTOS
          </div>
        </div>

        <button
          type="button"
          style={styles.backButton}
          onClick={() =>
            router.push(
              '/portal'
            )
          }
        >
          ← Portal
        </button>
      </header>

      <div style={styles.container}>
        {/* ===================================================
            HERO
        =================================================== */}

        <section style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>
              CICLO DE VIDA DIGITAL
            </div>

            <h1 style={styles.title}>
              Trazabilidad Viva
            </h1>

            <p style={styles.subtitle}>
              Registra eventos verificables
              durante toda la vida útil de
              cada producto identificado en
              Vinculab.
            </p>
          </div>

          <div style={styles.heroBadge}>
            <span style={styles.heroDot} />

            REGISTRO PROTEGIDO
          </div>
        </section>

        {/* ===================================================
            MENSAJES
        =================================================== */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {mensaje && (
          <div style={styles.successBox}>
            ✓ {mensaje}
          </div>
        )}

        {/* ===================================================
            MÉTRICAS
        =================================================== */}

        <section style={styles.metrics}>
          <Metric
            value={
              unidades.length
            }
            label="Unidades"
          />

          <Metric
            value={
              eventos.length
            }
            label="Eventos registrados"
          />

          <Metric
            value={
              eventos.filter(
                evento =>
                  evento.tipo_evento ===
                  'control_calidad'
              ).length
            }
            label="Controles de calidad"
          />

          <Metric
            value={
              new Set(
                eventos.map(
                  evento =>
                    evento.unidad_id
                )
              ).size
            }
            label="Unidades con historial"
          />
        </section>

        {/* ===================================================
            GRID
        =================================================== */}

        <section style={styles.mainGrid}>
          {/* =================================================
              SELECCIÓN
          ================================================= */}

          <div style={styles.panel}>
            <div style={styles.panelLabel}>
              01 · PRODUCTO
            </div>

            <h2 style={styles.panelTitle}>
              Seleccionar unidad
            </h2>

            <p style={styles.panelText}>
              Selecciona la identidad
              sobre la cual registrarás
              el nuevo evento.
            </p>

            <input
              value={busqueda}
              onChange={
                event =>
                  setBusqueda(
                    event.target.value
                  )
              }
              placeholder="Buscar VIN, producto, modelo, lote..."
              style={styles.input}
            />

            <select
              value={unidadId}
              onChange={
                event => {
                  setUnidadId(
                    event.target.value
                  )

                  setError('')
                  setMensaje('')
                }
              }
              style={styles.select}
            >
              <option value="">
                Selecciona una unidad
              </option>

              {unidadesFiltradas.map(
                unidad => (
                  <option
                    key={unidad.id}
                    value={unidad.id}
                  >
                    {unidad.codigo}
                    {' · '}
                    {unidad.producto_nombre ||
                      'Producto'}
                    {' · '}
                    {unidad.lote_codigo ||
                      'Sin lote'}
                  </option>
                )
              )}
            </select>

            {/* ===============================================
                IDENTIDAD
            =============================================== */}

            {unidadSeleccionada && (
              <div style={styles.identity}>
                <div style={styles.identityTop}>
                  <div>
                    <div style={styles.identityLabel}>
                      IDENTIDAD SELECCIONADA
                    </div>

                    <div style={styles.identityCode}>
                      {
                        unidadSeleccionada.codigo
                      }
                    </div>
                  </div>

                  <div style={styles.activeBadge}>
                    ACTIVO
                  </div>
                </div>

                <div style={styles.identityGrid}>
                  <Data
                    label="Producto"
                    value={
                      unidadSeleccionada.producto_nombre ||
                      '-'
                    }
                  />

                  <Data
                    label="Modelo"
                    value={
                      unidadSeleccionada.modelo_nombre ||
                      '-'
                    }
                  />

                  <Data
                    label="Lote"
                    value={
                      unidadSeleccionada.lote_codigo ||
                      '-'
                    }
                  />

                  <Data
                    label="Unidad"
                    value={
                      String(
                        unidadSeleccionada.numero_unidad
                      )
                    }
                  />

                  <Data
                    label="DPP"
                    value={
                      unidadSeleccionada.dpp_codigo ||
                      'Sin DPP'
                    }
                  />

                  <Data
                    label="Carrier"
                    value={
                      unidadSeleccionada.carrier_id ||
                      'Sin carrier'
                    }
                  />
                </div>

                <button
                  type="button"
                  style={styles.publicButton}
                  onClick={() =>
                    window.open(
                      `/u/${encodeURIComponent(
                        unidadSeleccionada.codigo
                      )}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  VER IDENTIDAD PÚBLICA →
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              NUEVO EVENTO
          ================================================= */}

          <div style={styles.panel}>
            <div style={styles.panelLabel}>
              02 · NUEVO EVENTO
            </div>

            <h2 style={styles.panelTitle}>
              Registrar trazabilidad
            </h2>

            <p style={styles.panelText}>
              El evento quedará asociado
              permanentemente a la unidad
              seleccionada.
            </p>

            <label style={styles.field}>
              <span style={styles.fieldLabel}>
                TIPO DE EVENTO
              </span>

              <select
                value={tipoEvento}
                onChange={
                  event =>
                    setTipoEvento(
                      event.target.value
                    )
                }
                style={styles.select}
              >
                {TIPOS_EVENTO.map(
                  item => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label style={styles.field}>
              <span style={styles.fieldLabel}>
                TÍTULO
              </span>

              <input
                value={titulo}
                onChange={
                  event =>
                    setTitulo(
                      event.target.value
                    )
                }
                placeholder="Ej: Inspección dimensional aprobada"
                style={styles.input}
              />
            </label>

            <label style={styles.field}>
              <span style={styles.fieldLabel}>
                DESCRIPCIÓN
              </span>

              <textarea
                value={descripcion}
                onChange={
                  event =>
                    setDescripcion(
                      event.target.value
                    )
                }
                placeholder="Describe el evento, resultado, condición o actividad realizada..."
                style={styles.textarea}
              />
            </label>

            <div style={styles.twoColumns}>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>
                  RESPONSABLE
                </span>

                <input
                  value={responsable}
                  onChange={
                    event =>
                      setResponsable(
                        event.target.value
                      )
                  }
                  placeholder="Nombre o área"
                  style={styles.input}
                />
              </label>

              <label style={styles.field}>
                <span style={styles.fieldLabel}>
                  UBICACIÓN
                </span>

                <input
                  value={ubicacion}
                  onChange={
                    event =>
                      setUbicacion(
                        event.target.value
                      )
                  }
                  placeholder="Ej: Planta San Felipe"
                  style={styles.input}
                />
              </label>
            </div>

            <label style={styles.field}>
              <span style={styles.fieldLabel}>
                FECHA Y HORA DEL EVENTO
              </span>

              <input
                type="datetime-local"
                value={fechaEvento}
                onChange={
                  event =>
                    setFechaEvento(
                      event.target.value
                    )
                }
                style={styles.input}
              />
            </label>

            <button
              type="button"
              disabled={
                guardando ||
                !unidadSeleccionada
              }
              onClick={
                registrarEvento
              }
              style={{
                ...styles.saveButton,

                opacity:
                  guardando ||
                  !unidadSeleccionada
                    ? 0.45
                    : 1,

                cursor:
                  guardando ||
                  !unidadSeleccionada
                    ? 'not-allowed'
                    : 'pointer'
              }}
            >
              {guardando
                ? 'REGISTRANDO...'
                : 'REGISTRAR EVENTO →'}
            </button>
          </div>
        </section>

        {/* ===================================================
            HISTORIAL
        =================================================== */}

        <section style={styles.historyPanel}>
          <div style={styles.historyHeader}>
            <div>
              <div style={styles.panelLabel}>
                03 · HISTORIAL
              </div>

              <h2 style={styles.panelTitle}>
                Ciclo de vida
              </h2>

              <p style={styles.panelText}>
                {unidadSeleccionada
                  ? `Historial de ${unidadSeleccionada.codigo}`
                  : 'Selecciona una unidad para consultar su historial.'}
              </p>
            </div>

            {unidadSeleccionada && (
              <div style={styles.eventCount}>
                {eventosUnidad.length}{' '}
                EVENTO
                {eventosUnidad.length === 1
                  ? ''
                  : 'S'}
              </div>
            )}
          </div>

          {!unidadSeleccionada ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                ↗
              </div>

              <strong>
                Selecciona una unidad
              </strong>

              <span>
                Su historial de
                trazabilidad aparecerá aquí.
              </span>
            </div>
          ) : eventosUnidad.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                +
              </div>

              <strong>
                Aún no existen eventos
              </strong>

              <span>
                Registra el primer evento
                de trazabilidad de esta
                unidad.
              </span>
            </div>
          ) : (
            <div style={styles.timeline}>
              {eventosUnidad.map(
                (
                  evento,
                  index
                ) => (
                  <div
                    key={evento.id}
                    style={styles.timelineItem}
                  >
                    <div style={styles.timelineRail}>
                      <div style={styles.timelineIcon}>
                        {iconoTipo(
                          evento.tipo_evento
                        )}
                      </div>

                      {index <
                        eventosUnidad.length -
                          1 && (
                        <div style={styles.timelineLine} />
                      )}
                    </div>

                    <div style={styles.eventCard}>
                      <div style={styles.eventTop}>
                        <div>
                          <div style={styles.eventType}>
                            {etiquetaTipo(
                              evento.tipo_evento
                            )}
                          </div>

                          <div style={styles.eventTitle}>
                            {evento.titulo}
                          </div>
                        </div>

                        <div style={styles.eventDate}>
                          {formatoFecha(
                            evento.fecha_evento
                          )}
                        </div>
                      </div>

                      {evento.descripcion && (
                        <p style={styles.eventDescription}>
                          {evento.descripcion}
                        </p>
                      )}

                      <div style={styles.eventMeta}>
                        {evento.ubicacion && (
                          <span style={styles.metaChip}>
                            UBICACIÓN ·{' '}
                            {evento.ubicacion}
                          </span>
                        )}

                        {evento.responsable && (
                          <span style={styles.metaChip}>
                            RESPONSABLE ·{' '}
                            {evento.responsable}
                          </span>
                        )}

                        {evento.archivo_nombre && (
                          <span style={styles.metaChip}>
                            EVIDENCIA ·{' '}
                            {evento.archivo_nombre}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* ===================================================
            INFO
        =================================================== */}

        <section style={styles.infoBox}>
          <div style={styles.infoIcon}>
            i
          </div>

          <div>
            <strong style={styles.infoTitle}>
              Trazabilidad Viva Vinculab
            </strong>

            <p style={styles.infoText}>
              Los datos internos como el
              responsable y los archivos de
              evidencia permanecen protegidos.
              La identidad pública muestra
              únicamente la información de
              trazabilidad definida como
              verificable.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

// ============================================================
// COMPONENTES
// ============================================================

function Metric({
  value,
  label
}: {
  value: number
  label: string
}) {
  return (
    <div style={styles.metric}>
      <div style={styles.metricValue}>
        {value}
      </div>

      <div style={styles.metricLabel}>
        {label}
      </div>
    </div>
  )
}

function Data({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.dataBox}>
      <div style={styles.dataLabel}>
        {label}
      </div>

      <div style={styles.dataValue}>
        {value}
      </div>
    </div>
  )
}

// ============================================================
// ESTILOS
// ============================================================

const styles:
  Record<string, React.CSSProperties> = {

  page: {
    minHeight: '100vh',
    background: '#08090b',
    color: '#ffffff',
    fontFamily:
      'Arial, Helvetica, sans-serif'
  },

  loading: {
    minHeight: '100vh',
    background: '#08090b',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 18,
    fontFamily:
      'Arial, Helvetica, sans-serif'
  },

  loadingBrand: {
    color: '#ff6a00',
    fontSize: 25,
    fontWeight: 900,
    letterSpacing: 5
  },

  spinner: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: '3px solid #27272a',
    borderTopColor: '#ff6a00'
  },

  loadingText: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1
  },

  header: {
    minHeight: 76,
    borderBottom:
      '1px solid #27272a',
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: 20,
    background: '#09090b'
  },

  brand: {
    color: '#ff6a00',
    fontSize: 21,
    fontWeight: 900,
    letterSpacing: 4
  },

  brandSub: {
    color: '#52525b',
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 1.5,
    marginTop: 3
  },

  backButton: {
    border:
      '1px solid #3f3f46',
    borderRadius: 8,
    background: '#18181b',
    color: '#d4d4d8',
    padding: '10px 14px',
    fontSize: 11,
    fontWeight: 900,
    cursor: 'pointer'
  },

  container: {
    maxWidth: 1220,
    margin: '0 auto',
    padding: '44px 22px 80px'
  },

  hero: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent:
      'space-between',
    gap: 30,
    flexWrap: 'wrap',
    marginBottom: 30
  },

  eyebrow: {
    color: '#ff6a00',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.8,
    marginBottom: 8
  },

  title: {
    margin: 0,
    fontSize: 42,
    letterSpacing: -1.5
  },

  subtitle: {
    color: '#a1a1aa',
    maxWidth: 620,
    lineHeight: 1.65,
    fontSize: 14,
    margin: '12px 0 0'
  },

  heroBadge: {
    border:
      '1px solid rgba(34,197,94,.35)',
    background:
      'rgba(34,197,94,.07)',
    color: '#86efac',
    borderRadius: 999,
    padding: '9px 13px',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 7
  },

  heroDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22c55e'
  },

  errorBox: {
    background:
      'rgba(239,68,68,.08)',
    border:
      '1px solid rgba(239,68,68,.35)',
    color: '#fca5a5',
    borderRadius: 10,
    padding: 14,
    fontSize: 12,
    marginBottom: 18
  },

  successBox: {
    background:
      'rgba(34,197,94,.08)',
    border:
      '1px solid rgba(34,197,94,.35)',
    color: '#86efac',
    borderRadius: 10,
    padding: 14,
    fontSize: 12,
    marginBottom: 18
  },

  metrics: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 10,
    marginBottom: 18
  },

  metric: {
    background: '#111113',
    border:
      '1px solid #27272a',
    borderRadius: 12,
    padding: 18
  },

  metricValue: {
    fontSize: 27,
    fontWeight: 900
  },

  metricLabel: {
    color: '#71717a',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1,
    textTransform:
      'uppercase',
    marginTop: 5
  },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(330px, 1fr))',
    gap: 14
  },

  panel: {
    background: '#111113',
    border:
      '1px solid #27272a',
    borderRadius: 15,
    padding: 24
  },

  panelLabel: {
    color: '#ff6a00',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1.5
  },

  panelTitle: {
    margin: '7px 0 4px',
    fontSize: 21
  },

  panelText: {
    color: '#71717a',
    fontSize: 11,
    lineHeight: 1.55,
    margin:
      '0 0 20px'
  },

  field: {
    display: 'block',
    marginTop: 14
  },

  fieldLabel: {
    display: 'block',
    color: '#71717a',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1,
    marginBottom: 7
  },

  input: {
    width: '100%',
    minHeight: 44,
    background: '#09090b',
    border:
      '1px solid #3f3f46',
    borderRadius: 9,
    color: '#ffffff',
    padding: '0 12px',
    outline: 'none',
    fontSize: 12,
    marginBottom: 10
  },

  select: {
    width: '100%',
    minHeight: 44,
    background: '#09090b',
    border:
      '1px solid #3f3f46',
    borderRadius: 9,
    color: '#ffffff',
    padding: '0 12px',
    outline: 'none',
    fontSize: 12
  },

  textarea: {
    width: '100%',
    minHeight: 100,
    resize: 'vertical',
    background: '#09090b',
    border:
      '1px solid #3f3f46',
    borderRadius: 9,
    color: '#ffffff',
    padding: 12,
    outline: 'none',
    fontSize: 12,
    fontFamily:
      'Arial, Helvetica, sans-serif'
  },

  twoColumns: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 10
  },

  identity: {
    marginTop: 18,
    background: '#09090b',
    border:
      '1px solid rgba(255,106,0,.3)',
    borderRadius: 13,
    padding: 18
  },

  identityTop: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'flex-start',
    gap: 12
  },

  identityLabel: {
    color: '#71717a',
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 1.2
  },

  identityCode: {
    fontSize: 20,
    fontWeight: 900,
    marginTop: 5
  },

  activeBadge: {
    background:
      'rgba(34,197,94,.1)',
    color: '#86efac',
    border:
      '1px solid rgba(34,197,94,.3)',
    borderRadius: 999,
    padding: '5px 8px',
    fontSize: 8,
    fontWeight: 900
  },

  identityGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
    marginTop: 16
  },

  dataBox: {
    background: '#18181b',
    borderRadius: 8,
    padding: 10
  },

  dataLabel: {
    color: '#71717a',
    fontSize: 8,
    fontWeight: 900,
    textTransform:
      'uppercase',
    marginBottom: 5
  },

  dataValue: {
    fontSize: 11,
    fontWeight: 800,
    wordBreak: 'break-word'
  },

  publicButton: {
    width: '100%',
    minHeight: 42,
    marginTop: 14,
    border:
      '1px solid #3f3f46',
    borderRadius: 9,
    background: '#18181b',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 900,
    cursor: 'pointer'
  },

  saveButton: {
    width: '100%',
    minHeight: 48,
    marginTop: 20,
    border: 0,
    borderRadius: 10,
    background: '#ff6a00',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 900
  },

  historyPanel: {
    marginTop: 14,
    background: '#111113',
    border:
      '1px solid #27272a',
    borderRadius: 15,
    padding: 24
  },

  historyHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'flex-start',
    gap: 20,
    flexWrap: 'wrap'
  },

  eventCount: {
    background: '#18181b',
    border:
      '1px solid #3f3f46',
    color: '#a1a1aa',
    borderRadius: 999,
    padding: '7px 10px',
    fontSize: 8,
    fontWeight: 900
  },

  empty: {
    minHeight: 190,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center',
    color: '#71717a',
    gap: 7
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background:
      'rgba(255,106,0,.08)',
    border:
      '1px solid rgba(255,106,0,.25)',
    color: '#ff6a00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 19,
    marginBottom: 5
  },

  timeline: {
    marginTop: 24
  },

  timelineItem: {
    display: 'grid',
    gridTemplateColumns:
      '38px 1fr',
    gap: 12
  },

  timelineRail: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column'
  },

  timelineIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: '50%',
    background: '#18181b',
    border:
      '1px solid rgba(255,106,0,.5)',
    color: '#ff6a00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 900,
    zIndex: 2
  },

  timelineLine: {
    width: 1,
    flex: 1,
    minHeight: 40,
    background: '#3f3f46'
  },

  eventCard: {
    background: '#09090b',
    border:
      '1px solid #27272a',
    borderRadius: 11,
    padding: 16,
    marginBottom: 12
  },

  eventTop: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'flex-start',
    gap: 15,
    flexWrap: 'wrap'
  },

  eventType: {
    color: '#ff6a00',
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 1,
    textTransform:
      'uppercase'
  },

  eventTitle: {
    fontSize: 15,
    fontWeight: 900,
    marginTop: 5
  },

  eventDate: {
    color: '#71717a',
    fontSize: 9,
    fontWeight: 800
  },

  eventDescription: {
    color: '#a1a1aa',
    fontSize: 11,
    lineHeight: 1.6,
    margin: '12px 0 0'
  },

  eventMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 13
  },

  metaChip: {
    background: '#18181b',
    color: '#a1a1aa',
    borderRadius: 999,
    padding: '6px 8px',
    fontSize: 8,
    fontWeight: 800
  },

  infoBox: {
    marginTop: 14,
    border:
      '1px solid rgba(59,130,246,.25)',
    background:
      'rgba(59,130,246,.05)',
    borderRadius: 13,
    padding: 18,
    display: 'flex',
    gap: 13
  },

  infoIcon: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: '50%',
    border:
      '1px solid rgba(59,130,246,.4)',
    color: '#60a5fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900
  },

  infoTitle: {
    color: '#dbeafe',
    fontSize: 11
  },

  infoText: {
    color: '#71717a',
    fontSize: 10,
    lineHeight: 1.6,
    margin: '5px 0 0'
  }
}
