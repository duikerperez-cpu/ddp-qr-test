'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================================================
   TIPOS
========================================================= */

type Empresa = {
  id: string
  nombre?: string | null
  razon_social?: string | null
  empresa_nombre?: string | null
  name?: string | null
}

type Producto = {
  id: string
  empresa_id: string | null
  nombre: string | null
  categoria?: string | null
  sku?: string | null
}

type Modelo = {
  id: string
  empresa_id: string | null
  producto_id: string | null
  nombre: string | null
  categoria?: string | null
  version?: string | null
}

type Lote = {
  id: string
  codigo: string | null
  cantidad: number | null
  modelo_id: string | null
  empresa_id: string | null
  producto_id: string | null
  estado: string | null
  created_at?: string | null
  fecha_produccion?: string | null
  fecha_vencimiento?: string | null
  ubicacion?: string | null
  observaciones?: string | null
}

type ProductoIndividual = {
  id: string
  lote_id: string | null
  empresa_id: string | null
  modelo_id: string | null
  producto_id: string | null
  numero_unidad: number | null
  codigo_publico: string | null
  codigo_qr: string | null
  url_dpp: string | null
  nfc_uid: string | null
  estado: string | null
  created_at?: string | null
}

/* =========================================================
   UTILIDADES
========================================================= */

function nombreEmpresa(e?: Empresa) {
  return (
    e?.razon_social ||
    e?.nombre ||
    e?.empresa_nombre ||
    e?.name ||
    'Empresa'
  )
}

function fechaCL(value?: string | null) {
  if (!value) return '—'

  try {
    const d = new Date(value)

    if (Number.isNaN(d.getTime())) {
      return value
    }

    return d.toLocaleDateString('es-CL')
  } catch {
    return value
  }
}

function generarCodigoPublico() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  let codigo = ''

  for (let i = 0; i < 12; i++) {
    codigo += chars.charAt(
      Math.floor(Math.random() * chars.length)
    )
  }

  return codigo
}

function generarCodigoLote() {
  const ahora = new Date()

  const yyyy = ahora.getFullYear()
  const mm = String(ahora.getMonth() + 1).padStart(2, '0')
  const dd = String(ahora.getDate()).padStart(2, '0')

  const hh = String(ahora.getHours()).padStart(2, '0')
  const mi = String(ahora.getMinutes()).padStart(2, '0')
  const ss = String(ahora.getSeconds()).padStart(2, '0')

  return `LOT-${yyyy}${mm}${dd}-${hh}${mi}${ss}`
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function LotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])

  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const [empresaId, setEmpresaId] = useState('')
  const [productoId, setProductoId] = useState('')
  const [modeloId, setModeloId] = useState('')

  const [codigo, setCodigo] = useState('')
  const [cantidad, setCantidad] = useState('1')

  const [fechaProduccion, setFechaProduccion] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [observaciones, setObservaciones] = useState('')

  /* =======================================================
     CARGA DE DATOS
  ======================================================= */

  async function cargarTodo() {
    setLoading(true)
    setError('')

    try {
      const [
        empresasRes,
        productosRes,
        modelosRes,
        lotesRes
      ] = await Promise.all([
        supabase.from('empresas').select('*'),

        supabase
          .from('productos')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('modelos')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('lotes')
          .select('*')
          .order('created_at', { ascending: false })
      ])

      if (empresasRes.error) {
        throw empresasRes.error
      }

      if (productosRes.error) {
        throw productosRes.error
      }

      if (modelosRes.error) {
        throw modelosRes.error
      }

      if (lotesRes.error) {
        throw lotesRes.error
      }

      setEmpresas(empresasRes.data || [])
      setProductos(productosRes.data || [])
      setModelos(modelosRes.data || [])
      setLotes(lotesRes.data || [])
    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
        'No fue posible cargar los datos.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  /* =======================================================
     FILTROS FORMULARIO
  ======================================================= */

  const productosEmpresa = useMemo(() => {
    if (!empresaId) return []

    return productos.filter(
      p => p.empresa_id === empresaId
    )
  }, [productos, empresaId])

  const modelosProducto = useMemo(() => {
    if (!productoId) return []

    return modelos.filter(
      m =>
        m.producto_id === productoId &&
        (!empresaId || m.empresa_id === empresaId)
    )
  }, [modelos, productoId, empresaId])

  /* =======================================================
     MAPAS
  ======================================================= */

  const empresaMap = useMemo(() => {
    const map = new Map<string, Empresa>()

    empresas.forEach(e => {
      map.set(e.id, e)
    })

    return map
  }, [empresas])

  const productoMap = useMemo(() => {
    const map = new Map<string, Producto>()

    productos.forEach(p => {
      map.set(p.id, p)
    })

    return map
  }, [productos])

  const modeloMap = useMemo(() => {
    const map = new Map<string, Modelo>()

    modelos.forEach(m => {
      map.set(m.id, m)
    })

    return map
  }, [modelos])

  /* =======================================================
     BUSCADOR
  ======================================================= */

  const lotesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()

    if (!q) return lotes

    return lotes.filter(lote => {
      const empresa = lote.empresa_id
        ? empresaMap.get(lote.empresa_id)
        : undefined

      const producto = lote.producto_id
        ? productoMap.get(lote.producto_id)
        : undefined

      const modelo = lote.modelo_id
        ? modeloMap.get(lote.modelo_id)
        : undefined

      return [
        lote.codigo,
        nombreEmpresa(empresa),
        producto?.nombre,
        producto?.sku,
        producto?.categoria,
        modelo?.nombre,
        modelo?.categoria,
        lote.estado,
        lote.ubicacion
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [
    lotes,
    busqueda,
    empresaMap,
    productoMap,
    modeloMap
  ])

  /* =======================================================
     MODAL
  ======================================================= */

  function abrirModal() {
    setEmpresaId('')
    setProductoId('')
    setModeloId('')

    setCodigo(generarCodigoLote())
    setCantidad('1')

    setFechaProduccion('')
    setFechaVencimiento('')
    setUbicacion('')
    setObservaciones('')

    setMensaje('')
    setError('')

    setModal(true)
  }

  function cerrarModal() {
    if (guardando) return

    setModal(false)
  }

  /* =======================================================
     CREAR IDENTIDADES
  ======================================================= */

  async function crearIdentidades(
    lote: Lote,
    total: number
  ) {
    /*
      IMPORTANTE:

      Cada unidad física obtiene:

      lote_id
      empresa_id
      producto_id
      modelo_id
      numero_unidad
      codigo_publico
      codigo_qr
      url_dpp
      nfc_uid = null
      estado = activo
    */

    const unidades: any[] = []

    for (let i = 1; i <= total; i++) {
      const codigoPublico = generarCodigoPublico()

      unidades.push({
        id: `${lote.codigo}-${String(i).padStart(4, '0')}`,

        lote_id: lote.id,

        empresa_id: lote.empresa_id,

        producto_id: lote.producto_id,

        modelo_id: lote.modelo_id,

        numero_unidad: i,

        codigo_publico: codigoPublico,

        codigo_qr: codigoPublico,

        url_dpp:
          `https://vinculab.cl/dpp/${codigoPublico}`,

        nfc_uid: null,

        estado: 'activo'
      })
    }

    /*
      Supabase permite insertar varias filas.

      Lo hacemos por bloques para que un lote grande
      no mande una solicitud excesivamente grande.
    */

    const TAMANO_BLOQUE = 250

    for (
      let inicio = 0;
      inicio < unidades.length;
      inicio += TAMANO_BLOQUE
    ) {
      const bloque = unidades.slice(
        inicio,
        inicio + TAMANO_BLOQUE
      )

      const { error } = await supabase
        .from('productos_individuales')
        .insert(bloque)

      if (error) {
        throw error
      }
    }
  }

  /* =======================================================
     GUARDAR LOTE
  ======================================================= */

  async function guardarLote() {
    setError('')
    setMensaje('')

    if (!empresaId) {
      setError('Selecciona una empresa.')
      return
    }

    if (!productoId) {
      setError('Selecciona un producto.')
      return
    }

    if (!modeloId) {
      setError('Selecciona un modelo.')
      return
    }

    const total = Number(cantidad)

    if (
      !Number.isInteger(total) ||
      total <= 0
    ) {
      setError(
        'La cantidad debe ser un número entero mayor que 0.'
      )
      return
    }

    /*
      Protección simple para evitar crear accidentalmente
      miles de identidades desde el navegador.
    */

    if (total > 5000) {
      setError(
        'Por seguridad, crea lotes de hasta 5.000 unidades por operación.'
      )
      return
    }

    setGuardando(true)

    let loteCreado: Lote | null = null

    try {
      /*
        1. Evitamos duplicar código de lote.
      */

      const { data: loteExistente, error: checkError } =
        await supabase
          .from('lotes')
          .select('id')
          .eq('codigo', codigo.trim())
          .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (loteExistente) {
        throw new Error(
          'Ya existe un lote con ese código.'
        )
      }

      /*
        2. Creamos el lote.
      */

      const payload = {
        codigo: codigo.trim(),

        empresa_id: empresaId,
        producto_id: productoId,
        modelo_id: modeloId,

        cantidad: total,

        fecha_produccion:
          fechaProduccion || null,

        fecha_vencimiento:
          fechaVencimiento || null,

        ubicacion:
          ubicacion.trim() || null,

        observaciones:
          observaciones.trim() || null,

        estado: 'activo'
      }

      const { data, error: loteError } =
        await supabase
          .from('lotes')
          .insert(payload)
          .select('*')
          .single()

      if (loteError) {
        throw loteError
      }

      loteCreado = data as Lote

      /*
        3. Comprobamos que no existan identidades
           para ese lote.

           Esto evita duplicaciones accidentales.
      */

      const {
        count,
        error: countError
      } = await supabase
        .from('productos_individuales')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('lote_id', loteCreado.id)

      if (countError) {
        throw countError
      }

      if ((count || 0) > 0) {
        throw new Error(
          'El lote ya posee productos individuales. Se canceló la generación para evitar duplicados.'
        )
      }

      /*
        4. Generamos las identidades digitales.
      */

      await crearIdentidades(
        loteCreado,
        total
      )

      /*
        5. Verificación final.
      */

      const {
        count: creadas,
        error: verifyError
      } = await supabase
        .from('productos_individuales')
        .select('*', {
          count: 'exact',
          head: true
        })
        .eq('lote_id', loteCreado.id)

      if (verifyError) {
        throw verifyError
      }

      if ((creadas || 0) !== total) {
        throw new Error(
          `El lote fue creado, pero se esperaban ${total} identidades y se encontraron ${creadas || 0}.`
        )
      }

      setMensaje(
        `Lote ${loteCreado.codigo} creado correctamente con ${total} identidades digitales.`
      )

      setModal(false)

      await cargarTodo()
    } catch (err: any) {
      console.error(
        'Error creando lote:',
        err
      )

      /*
        Si el lote alcanzó a crearse pero fallaron
        las identidades, NO ocultamos el problema.

        Tampoco generamos nuevamente automáticamente
        porque podríamos duplicar unidades.
      */

      if (loteCreado) {
        setError(
          `El lote ${loteCreado.codigo} fue creado, pero ocurrió un problema generando sus identidades: ${
            err?.message || 'Error desconocido'
          }`
        )
      } else {
        setError(
          err?.message ||
          'No fue posible crear el lote.'
        )
      }

      await cargarTodo()
    } finally {
      setGuardando(false)
    }
  }

  /* =======================================================
     ESTILOS
  ======================================================= */

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#090d12',
    border: '1px solid #28323d',
    color: '#fff',
    borderRadius: 7,
    padding: '11px 13px',
    outline: 'none',
    fontSize: 13
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 9,
    color: '#7892ad',
    letterSpacing: 1.2,
    fontWeight: 800,
    marginBottom: 7
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      style={{
        maxWidth: 1500,
        margin: '0 auto'
      }}
    >
      {/* CABECERA */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 20,
          alignItems: 'flex-start',
          marginBottom: 28
        }}
      >
        <div>
          <div
            style={{
              color: '#ff6a00',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.3,
              marginBottom: 8
            }}
          >
            GESTIÓN
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 27,
              fontWeight: 900
            }}
          >
            Lotes
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: '#7892ad',
              fontSize: 13
            }}
          >
            Gestión de lotes de producción y trazabilidad.
          </p>
        </div>

        <button
          onClick={abrirModal}
          style={{
            background: '#ff6a00',
            border: 'none',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 7,
            fontWeight: 900,
            cursor: 'pointer'
          }}
        >
          + Nuevo lote
        </button>
      </div>

      {/* MENSAJES */}

      {mensaje && (
        <div
          style={{
            background: 'rgba(0,200,120,.08)',
            border: '1px solid rgba(0,200,120,.25)',
            color: '#43df9a',
            padding: 13,
            borderRadius: 8,
            marginBottom: 18,
            fontSize: 12
          }}
        >
          {mensaje}
        </div>
      )}

      {error && (
        <div
          style={{
            background: 'rgba(255,70,70,.08)',
            border: '1px solid rgba(255,70,70,.25)',
            color: '#ff8585',
            padding: 13,
            borderRadius: 8,
            marginBottom: 18,
            fontSize: 12
          }}
        >
          {error}
        </div>
      )}

      {/* TARJETA TOTAL */}

      <div
        style={{
          width: 350,
          minHeight: 155,
          background: '#111820',
          border: '1px solid #27313b',
          borderLeft: '3px solid #ff6a00',
          borderRadius: 9,
          padding: 22,
          marginBottom: 20
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span
            style={{
              color: '#7892ad',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: 1.4
            }}
          >
            LOTES REGISTRADOS
          </span>

          <span
            style={{
              color: '#ff6a00',
              fontSize: 18
            }}
          >
            ▤
          </span>
        </div>

        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            marginTop: 30
          }}
        >
          {lotes.length}
        </div>
      </div>

      {/* BUSCADOR */}

      <div
        style={{
          background: '#0f151c',
          border: '1px solid #26313b',
          borderRadius: 9,
          padding: 14,
          marginBottom: 14
        }}
      >
        <input
          value={busqueda}
          onChange={e =>
            setBusqueda(e.target.value)
          }
          placeholder="Buscar lote, producto, modelo, empresa o código..."
          style={{
            ...inputStyle,
            maxWidth: 600
          }}
        />
      </div>

      {/* TABLA */}

      <div
        style={{
          background: '#0f151c',
          border: '1px solid #26313b',
          borderRadius: 9,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            overflowX: 'auto'
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 1050
            }}
          >
            <thead>
              <tr>
                {[
                  'LOTE',
                  'PRODUCTO / MODELO',
                  'EMPRESA',
                  'CANTIDAD',
                  'PRODUCCIÓN',
                  'ESTADO',
                  'ACCIONES'
                ].map(t => (
                  <th
                    key={t}
                    style={{
                      textAlign: 'left',
                      padding: '14px 16px',
                      fontSize: 8,
                      color: '#7892ad',
                      letterSpacing: 1.3,
                      borderBottom:
                        '1px solid #26313b'
                    }}
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: '#7892ad'
                    }}
                  >
                    Cargando lotes...
                  </td>
                </tr>
              ) : lotesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      color: '#7892ad'
                    }}
                  >
                    No se encontraron lotes.
                  </td>
                </tr>
              ) : (
                lotesFiltrados.map(lote => {
                  const empresa =
                    lote.empresa_id
                      ? empresaMap.get(
                          lote.empresa_id
                        )
                      : undefined

                  const producto =
                    lote.producto_id
                      ? productoMap.get(
                          lote.producto_id
                        )
                      : undefined

                  const modelo =
                    lote.modelo_id
                      ? modeloMap.get(
                          lote.modelo_id
                        )
                      : undefined

                  return (
                    <tr key={lote.id}>
                      <td
                        style={{
                          padding: 16,
                          borderBottom:
                            '1px solid #26313b'
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 12
                          }}
                        >
                          {lote.codigo || '—'}
                        </div>

                        <div
                          style={{
                            color: '#58708a',
                            fontSize: 9,
                            marginTop: 5
                          }}
                        >
                          ID: {lote.id.slice(0, 8)}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: 16,
                          borderBottom:
                            '1px solid #26313b'
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12
                          }}
                        >
                          {producto?.nombre || '—'}
                        </div>

                        <div
                          style={{
                            color: '#66819c',
                            fontSize: 9,
                            marginTop: 5
                          }}
                        >
                          {modelo?.nombre ||
                            'Modelo no identificado'}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: 16,
                          borderBottom:
                            '1px solid #26313b'
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            background:
                              'rgba(255,106,0,.08)',
                            border:
                              '1px solid rgba(255,106,0,.35)',
                            color: '#ff7b22',
                            borderRadius: 6,
                            padding: '6px 9px',
                            fontSize: 10,
                            fontWeight: 900
                          }}
                        >
                          {nombreEmpresa(empresa)}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: 16,
                          borderBottom:
                            '1px solid #26313b',
                          fontWeight: 900
                        }}
                      >
                        {lote.cantidad || 0}
                      </td>

                      <td
                        style={{
                          padding: 16,
                          borderBottom:
                            '1px solid #26313b',
                          fontSize: 11
                        }}
                      >
                        {fechaCL(
                          lote.fecha_produccion
                        )}

                        {lote.fecha_vencimiento && (
                          <div
                            style={{
                              color: '#66819c',
                              fontSize: 9,
                              marginTop: 5
                            }}
                          >
                            Vence:{' '}
                            {fechaCL(
                              lote.fecha_vencimiento
                            )}
                          </div>
                        )}
                      </td>

                      <td
                        style={{
                          padding: 16,
                          borderBottom:
                            '1px solid #26313b'
                        }}
                      >
                        <span
                          style={{
                            background:
                              'rgba(0,200,120,.12)',
                            color: '#31df8c',
                            padding: '6px 10px',
                            borderRadius: 20,
                            fontSize: 8,
                            fontWeight: 900
                          }}
                        >
                          {(
                            lote.estado || 'activo'
                          ).toUpperCase()}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: 16,
                          borderBottom:
                            '1px solid #26313b'
                        }}
                      >
                        <button
                          style={{
                            background: '#15202a',
                            border:
                              '1px solid #2b3946',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: 10
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================
          MODAL NUEVO LOTE
      =================================================== */}

      {modal && (
        <div
          onMouseDown={e => {
            if (
              e.target === e.currentTarget
            ) {
              cerrarModal()
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.82)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#111820',
              border: '1px solid #2a3540',
              borderRadius: 12
            }}
          >
            <div
              style={{
                padding: '18px 22px',
                borderBottom:
                  '1px solid #28323d'
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 21
                }}
              >
                Nuevo lote
              </h2>

              <div
                style={{
                  color: '#7892ad',
                  fontSize: 11,
                  marginTop: 5
                }}
              >
                Al crear el lote se generará
                automáticamente una identidad digital
                para cada unidad.
              </div>
            </div>

            <div
              style={{
                padding: 22
              }}
            >
              {error && (
                <div
                  style={{
                    background:
                      'rgba(255,70,70,.08)',
                    border:
                      '1px solid rgba(255,70,70,.25)',
                    color: '#ff8585',
                    padding: 12,
                    borderRadius: 7,
                    marginBottom: 18,
                    fontSize: 11
                  }}
                >
                  {error}
                </div>
              )}

              {/* EMPRESA */}

              <div
                style={{
                  marginBottom: 17
                }}
              >
                <label style={labelStyle}>
                  EMPRESA *
                </label>

                <select
                  value={empresaId}
                  onChange={e => {
                    setEmpresaId(
                      e.target.value
                    )

                    setProductoId('')
                    setModeloId('')
                  }}
                  style={inputStyle}
                >
                  <option value="">
                    Seleccionar empresa
                  </option>

                  {empresas.map(e => (
                    <option
                      key={e.id}
                      value={e.id}
                    >
                      {nombreEmpresa(e)}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRODUCTO */}

              <div
                style={{
                  marginBottom: 17
                }}
              >
                <label style={labelStyle}>
                  PRODUCTO *
                </label>

                <select
                  value={productoId}
                  disabled={!empresaId}
                  onChange={e => {
                    setProductoId(
                      e.target.value
                    )

                    setModeloId('')
                  }}
                  style={{
                    ...inputStyle,
                    opacity: empresaId
                      ? 1
                      : 0.5
                  }}
                >
                  <option value="">
                    Seleccionar producto
                  </option>

                  {productosEmpresa.map(p => (
                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.nombre}
                      {p.sku
                        ? ` · ${p.sku}`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* MODELO */}

              <div
                style={{
                  marginBottom: 17
                }}
              >
                <label style={labelStyle}>
                  MODELO *
                </label>

                <select
                  value={modeloId}
                  disabled={!productoId}
                  onChange={e =>
                    setModeloId(
                      e.target.value
                    )
                  }
                  style={{
                    ...inputStyle,
                    opacity: productoId
                      ? 1
                      : 0.5
                  }}
                >
                  <option value="">
                    Seleccionar modelo
                  </option>

                  {modelosProducto.map(m => (
                    <option
                      key={m.id}
                      value={m.id}
                    >
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* CODIGO + CANTIDAD */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '2fr 1fr',
                  gap: 14,
                  marginBottom: 17
                }}
              >
                <div>
                  <label style={labelStyle}>
                    CÓDIGO DEL LOTE *
                  </label>

                  <input
                    value={codigo}
                    onChange={e =>
                      setCodigo(
                        e.target.value
                          .toUpperCase()
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    CANTIDAD *
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={cantidad}
                    onChange={e =>
                      setCantidad(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* FECHAS */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: 14,
                  marginBottom: 17
                }}
              >
                <div>
                  <label style={labelStyle}>
                    FECHA PRODUCCIÓN
                  </label>

                  <input
                    type="date"
                    value={fechaProduccion}
                    onChange={e =>
                      setFechaProduccion(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    FECHA VENCIMIENTO
                  </label>

                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={e =>
                      setFechaVencimiento(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* UBICACIÓN */}

              <div
                style={{
                  marginBottom: 17
                }}
              >
                <label style={labelStyle}>
                  UBICACIÓN
                </label>

                <input
                  value={ubicacion}
                  onChange={e =>
                    setUbicacion(
                      e.target.value
                    )
                  }
                  placeholder="Ej: Bodega principal"
                  style={inputStyle}
                />
              </div>

              {/* OBSERVACIONES */}

              <div>
                <label style={labelStyle}>
                  OBSERVACIONES
                </label>

                <textarea
                  value={observaciones}
                  onChange={e =>
                    setObservaciones(
                      e.target.value
                    )
                  }
                  placeholder="Información adicional del lote..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* INFORMACIÓN AUTOMATIZACIÓN */}

              <div
                style={{
                  marginTop: 20,
                  background: '#0b1117',
                  border: '1px solid #26313b',
                  borderRadius: 8,
                  padding: 14
                }}
              >
                <div
                  style={{
                    color: '#ff7b22',
                    fontWeight: 900,
                    fontSize: 10,
                    marginBottom: 7
                  }}
                >
                  IDENTIDAD DIGITAL AUTOMÁTICA
                </div>

                <div
                  style={{
                    color: '#7892ad',
                    fontSize: 11,
                    lineHeight: 1.7
                  }}
                >
                  Este lote generará{' '}
                  <strong
                    style={{
                      color: '#fff'
                    }}
                  >
                    {Number(cantidad) || 0}
                  </strong>{' '}
                  productos individuales con código
                  público, QR y dirección DPP únicos.
                  El NFC podrá asociarse posteriormente
                  a cada unidad física.
                </div>
              </div>
            </div>

            {/* BOTONES */}

            <div
              style={{
                padding: '16px 22px',
                borderTop:
                  '1px solid #28323d',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10
              }}
            >
              <button
                disabled={guardando}
                onClick={cerrarModal}
                style={{
                  background: '#19232d',
                  border:
                    '1px solid #303d49',
                  color: '#fff',
                  padding: '10px 17px',
                  borderRadius: 7,
                  cursor: guardando
                    ? 'not-allowed'
                    : 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                disabled={guardando}
                onClick={guardarLote}
                style={{
                  background: '#ff6a00',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: 7,
                  fontWeight: 900,
                  cursor: guardando
                    ? 'wait'
                    : 'pointer',
                  opacity: guardando
                    ? 0.65
                    : 1
                }}
              >
                {guardando
                  ? 'Creando identidades...'
                  : `Crear lote + ${
                      Number(cantidad) || 0
                    } identidades`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
