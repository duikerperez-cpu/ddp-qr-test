'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Empresa = {
  id: string
  razon_social?: string | null
  nombre?: string | null
  name?: string | null
  empresa_nombre?: string | null
}

type Producto = {
  id: string
  empresa_id: string | null
  nombre: string | null
  sku?: string | null
  categoria?: string | null
}

type Modelo = {
  id: string
  nombre: string | null
  descripcion: string | null
  empresa_id: string | null
  producto_id: string | null
  created_at: string | null
  categoria: string | null
  version: string | null
  lithium_pct: number | null
  cobalt_pct: number | null
}

type FormModelo = {
  empresa_id: string
  producto_id: string
  nombre: string
  descripcion: string
  categoria: string
  version: string
  lithium_pct: string
  cobalt_pct: string
}

const formInicial: FormModelo = {
  empresa_id: '',
  producto_id: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  version: 'V1.0',
  lithium_pct: '',
  cobalt_pct: ''
}

function nombreEmpresa(empresa?: Empresa) {
  if (!empresa) return 'Sin empresa'

  return (
    empresa.razon_social ||
    empresa.nombre ||
    empresa.name ||
    empresa.empresa_nombre ||
    'Empresa'
  )
}

export default function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modeloEditando, setModeloEditando] = useState<Modelo | null>(null)

  const [form, setForm] = useState<FormModelo>(formInicial)

  const cargarDatos = async () => {
    setCargando(true)

    try {
      const [modelosRes, empresasRes, productosRes] = await Promise.all([
        supabase
          .from('modelos')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('empresas')
          .select('*'),

        supabase
          .from('productos')
          .select('*')
          .order('nombre', { ascending: true })
      ])

      if (modelosRes.error) {
        console.error('Error modelos:', modelosRes.error)
        alert(`Error cargando modelos: ${modelosRes.error.message}`)
      }

      if (empresasRes.error) {
        console.error('Error empresas:', empresasRes.error)
        alert(`Error cargando empresas: ${empresasRes.error.message}`)
      }

      if (productosRes.error) {
        console.error('Error productos:', productosRes.error)
        alert(`Error cargando productos: ${productosRes.error.message}`)
      }

      setModelos((modelosRes.data || []) as Modelo[])
      setEmpresas((empresasRes.data || []) as Empresa[])
      setProductos((productosRes.data || []) as Producto[])
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error inesperado cargando los datos.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const mapaEmpresas = useMemo(() => {
    const mapa = new Map<string, Empresa>()

    empresas.forEach((empresa) => {
      mapa.set(empresa.id, empresa)
    })

    return mapa
  }, [empresas])

  const mapaProductos = useMemo(() => {
    const mapa = new Map<string, Producto>()

    productos.forEach((producto) => {
      mapa.set(producto.id, producto)
    })

    return mapa
  }, [productos])

  const productosEmpresa = useMemo(() => {
    if (!form.empresa_id) return []

    return productos.filter(
      (producto) => producto.empresa_id === form.empresa_id
    )
  }, [productos, form.empresa_id])

  const modelosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return modelos

    return modelos.filter((modelo) => {
      const empresa = modelo.empresa_id
        ? mapaEmpresas.get(modelo.empresa_id)
        : undefined

      const producto = modelo.producto_id
        ? mapaProductos.get(modelo.producto_id)
        : undefined

      const contenido = [
        modelo.nombre,
        modelo.descripcion,
        modelo.categoria,
        modelo.version,
        nombreEmpresa(empresa),
        producto?.nombre,
        producto?.sku
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [
    modelos,
    busqueda,
    mapaEmpresas,
    mapaProductos
  ])

  const abrirNuevo = () => {
    setModeloEditando(null)
    setForm(formInicial)
    setModalAbierto(true)
  }

  const abrirEditar = (modelo: Modelo) => {
    setModeloEditando(modelo)

    setForm({
      empresa_id: modelo.empresa_id || '',
      producto_id: modelo.producto_id || '',
      nombre: modelo.nombre || '',
      descripcion: modelo.descripcion || '',
      categoria: modelo.categoria || '',
      version: modelo.version || 'V1.0',
      lithium_pct:
        modelo.lithium_pct !== null &&
        modelo.lithium_pct !== undefined
          ? String(modelo.lithium_pct)
          : '',
      cobalt_pct:
        modelo.cobalt_pct !== null &&
        modelo.cobalt_pct !== undefined
          ? String(modelo.cobalt_pct)
          : ''
    })

    setModalAbierto(true)
  }

  const cerrarModal = () => {
    if (guardando) return

    setModalAbierto(false)
    setModeloEditando(null)
    setForm(formInicial)
  }

  const cambiarEmpresa = (empresa_id: string) => {
    setForm((actual) => ({
      ...actual,
      empresa_id,
      producto_id: ''
    }))
  }

  const guardarModelo = async () => {
    if (!form.empresa_id) {
      alert('Debes seleccionar una empresa.')
      return
    }

    if (!form.producto_id) {
      alert('Debes seleccionar un producto.')
      return
    }

    if (!form.nombre.trim()) {
      alert('Debes ingresar el nombre del modelo.')
      return
    }

    let lithium: number | null = null
    let cobalt: number | null = null

    if (form.lithium_pct !== '') {
      lithium = Number(form.lithium_pct)

      if (
        Number.isNaN(lithium) ||
        lithium < 0 ||
        lithium > 100
      ) {
        alert('El porcentaje de litio debe estar entre 0 y 100.')
        return
      }
    }

    if (form.cobalt_pct !== '') {
      cobalt = Number(form.cobalt_pct)

      if (
        Number.isNaN(cobalt) ||
        cobalt < 0 ||
        cobalt > 100
      ) {
        alert('El porcentaje de cobalto debe estar entre 0 y 100.')
        return
      }
    }

    setGuardando(true)

    const payload = {
      empresa_id: form.empresa_id,
      producto_id: form.producto_id,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      categoria: form.categoria.trim() || null,
      version: form.version.trim() || null,
      lithium_pct: lithium,
      cobalt_pct: cobalt
    }

    try {
      if (modeloEditando) {
        const { error } = await supabase
          .from('modelos')
          .update(payload)
          .eq('id', modeloEditando.id)

        if (error) {
          console.error(error)
          alert(`No fue posible actualizar el modelo: ${error.message}`)
          return
        }

        alert('Modelo actualizado correctamente.')
      } else {
        const { error } = await supabase
          .from('modelos')
          .insert(payload)

        if (error) {
          console.error(error)
          alert(`No fue posible crear el modelo: ${error.message}`)
          return
        }

        alert('Modelo creado correctamente.')
      }

      setModalAbierto(false)
      setModeloEditando(null)
      setForm(formInicial)

      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error inesperado guardando el modelo.')
    } finally {
      setGuardando(false)
    }
  }

  const formatoFecha = (fecha: string | null) => {
    if (!fecha) return '—'

    const date = new Date(fecha)

    if (Number.isNaN(date.getTime())) return '—'

    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  const porcentaje = (valor: number | null) => {
    if (valor === null || valor === undefined) return '—'

    return `${valor}%`
  }

  return (
    <div>

      {/* CABECERA */}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 28
        }}
      >
        <div>
          <div
            style={{
              color: '#ff6a00',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.2,
              marginBottom: 8
            }}
          >
            GESTIÓN
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900
            }}
          >
            Modelos
          </h1>

          <div
            style={{
              marginTop: 8,
              color: '#8291a2',
              fontSize: 13
            }}
          >
            Modelos y especificaciones técnicas de productos.
          </div>
        </div>

        <button
          onClick={abrirNuevo}
          style={{
            background: '#ff6a00',
            border: 0,
            color: 'white',
            borderRadius: 7,
            padding: '12px 18px',
            fontWeight: 900,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          + Nuevo modelo
        </button>
      </div>

      {/* TARJETA CONTADOR */}

      <div
        style={{
          width: 295,
          background: '#111820',
          border: '1px solid #26303a',
          borderLeft: '3px solid #ff6a00',
          borderRadius: 9,
          padding: '20px 20px',
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
              fontSize: 9,
              color: '#7e91a6',
              fontWeight: 900,
              letterSpacing: 1.2
            }}
          >
            MODELOS REGISTRADOS
          </span>

          <span
            style={{
              color: '#ff6a00',
              fontSize: 18
            }}
          >
            ◇
          </span>
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            marginTop: 24
          }}
        >
          {modelos.length}
        </div>
      </div>

      {/* BUSCADOR */}

      <div
        style={{
          background: '#0d1319',
          border: '1px solid #232d37',
          borderRadius: 9,
          padding: 13,
          marginBottom: 14
        }}
      >
        <div
          style={{
            maxWidth: 560,
            position: 'relative'
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#718096',
              fontSize: 13
            }}
          >
            ⌕
          </span>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar modelo, producto, empresa, categoría o versión..."
            style={{
              width: '100%',
              background: '#080c11',
              border: '1px solid #2b3540',
              borderRadius: 6,
              padding: '11px 14px 11px 42px',
              color: 'white',
              outline: 'none',
              fontSize: 13
            }}
          />
        </div>
      </div>

      {/* TABLA */}

      <div
        style={{
          background: '#0d1319',
          border: '1px solid #232d37',
          borderRadius: 9,
          overflowX: 'auto'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 1100
          }}
        >
          <thead>
            <tr>
              {[
                'MODELO',
                'PRODUCTO',
                'EMPRESA',
                'CATEGORÍA',
                'VERSIÓN',
                'LITIO',
                'COBALTO',
                'FECHA',
                'ACCIONES'
              ].map((titulo) => (
                <th
                  key={titulo}
                  style={{
                    textAlign: 'left',
                    padding: '13px 16px',
                    borderBottom: '1px solid #25303a',
                    color: '#71849a',
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: 1.2,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>

            {cargando && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: '#718096'
                  }}
                >
                  Cargando modelos...
                </td>
              </tr>
            )}

            {!cargando && modelosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: 42,
                    textAlign: 'center',
                    color: '#718096',
                    fontSize: 13
                  }}
                >
                  No se encontraron modelos.
                </td>
              </tr>
            )}

            {!cargando &&
              modelosFiltrados.map((modelo) => {
                const empresa = modelo.empresa_id
                  ? mapaEmpresas.get(modelo.empresa_id)
                  : undefined

                const producto = modelo.producto_id
                  ? mapaProductos.get(modelo.producto_id)
                  : undefined

                return (
                  <tr key={modelo.id}>

                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 800,
                          color: 'white'
                        }}
                      >
                        {modelo.nombre || 'Sin nombre'}
                      </div>

                      <div style={subStyle}>
                        ID: {modelo.id.slice(0, 10)}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div>
                        {producto?.nombre || '—'}
                      </div>

                      {producto?.sku && (
                        <div style={subStyle}>
                          SKU: {producto.sku}
                        </div>
                      )}
                    </td>

                    <td style={tdStyle}>
                      {empresa ? (
                        <span style={empresaBadge}>
                          {nombreEmpresa(empresa)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td style={tdStyle}>
                      {modelo.categoria || '—'}
                    </td>

                    <td style={tdStyle}>
                      {modelo.version || '—'}
                    </td>

                    <td style={tdStyle}>
                      {porcentaje(modelo.lithium_pct)}
                    </td>

                    <td style={tdStyle}>
                      {porcentaje(modelo.cobalt_pct)}
                    </td>

                    <td style={tdStyle}>
                      {formatoFecha(modelo.created_at)}
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() => abrirEditar(modelo)}
                        style={editButton}
                      >
                        Editar
                      </button>
                    </td>

                  </tr>
                )
              })}

          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {modalAbierto && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarModal()
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.78)',
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
              maxWidth: 620,
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#11161d',
              border: '1px solid #303943',
              borderRadius: 12,
              boxShadow: '0 25px 80px rgba(0,0,0,.65)'
            }}
          >

            <div
              style={{
                padding: '22px 24px',
                borderBottom: '1px solid #252d36'
              }}
            >
              <div
                style={{
                  color: '#ff6a00',
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: 1.2
                }}
              >
                GESTIÓN DE MODELOS
              </div>

              <h2
                style={{
                  margin: '7px 0 0',
                  fontSize: 21
                }}
              >
                {modeloEditando
                  ? 'Editar modelo'
                  : 'Nuevo modelo'}
              </h2>
            </div>

            <div
              style={{
                padding: 24
              }}
            >

              <Campo label="Empresa *">

                <select
                  value={form.empresa_id}
                  onChange={(e) =>
                    cambiarEmpresa(e.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="">
                    Seleccionar empresa
                  </option>

                  {empresas.map((empresa) => (
                    <option
                      key={empresa.id}
                      value={empresa.id}
                    >
                      {nombreEmpresa(empresa)}
                    </option>
                  ))}
                </select>

              </Campo>

              <Campo label="Producto *">

                <select
                  value={form.producto_id}
                  disabled={!form.empresa_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      producto_id: e.target.value
                    })
                  }
                  style={{
                    ...inputStyle,
                    opacity: form.empresa_id ? 1 : 0.5
                  }}
                >
                  <option value="">
                    {form.empresa_id
                      ? 'Seleccionar producto'
                      : 'Primero selecciona una empresa'}
                  </option>

                  {productosEmpresa.map((producto) => (
                    <option
                      key={producto.id}
                      value={producto.id}
                    >
                      {producto.nombre}
                      {producto.sku
                        ? ` · ${producto.sku}`
                        : ''}
                    </option>
                  ))}
                </select>

              </Campo>

              <Campo label="Nombre del modelo *">

                <input
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombre: e.target.value
                    })
                  }
                  placeholder="Ej: ESCALERA BODEGA"
                  style={inputStyle}
                />

              </Campo>

              <Campo label="Descripción">

                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      descripcion: e.target.value
                    })
                  }
                  placeholder="Descripción técnica del modelo..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical'
                  }}
                />

              </Campo>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 14
                }}
              >

                <Campo label="Categoría">
                  <input
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoria: e.target.value
                      })
                    }
                    placeholder="Ej: Battery"
                    style={inputStyle}
                  />
                </Campo>

                <Campo label="Versión">
                  <input
                    value={form.version}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        version: e.target.value
                      })
                    }
                    placeholder="V1.0"
                    style={inputStyle}
                  />
                </Campo>

              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 14
                }}
              >

                <Campo label="Litio %">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.lithium_pct}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lithium_pct: e.target.value
                      })
                    }
                    placeholder="Ej: 12"
                    style={inputStyle}
                  />
                </Campo>

                <Campo label="Cobalto %">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.cobalt_pct}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cobalt_pct: e.target.value
                      })
                    }
                    placeholder="Ej: 15"
                    style={inputStyle}
                  />
                </Campo>

              </div>

            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                padding: '18px 24px',
                borderTop: '1px solid #252d36'
              }}
            >

              <button
                onClick={cerrarModal}
                disabled={guardando}
                style={{
                  background: '#20262e',
                  border: '1px solid #343d47',
                  color: 'white',
                  padding: '10px 18px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                onClick={guardarModelo}
                disabled={guardando}
                style={{
                  background: guardando
                    ? '#7c3a08'
                    : '#ff6a00',
                  border: 0,
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: 6,
                  fontWeight: 900,
                  cursor: guardando
                    ? 'wait'
                    : 'pointer'
                }}
              >
                {guardando
                  ? 'Guardando...'
                  : modeloEditando
                    ? 'Guardar cambios'
                    : 'Crear modelo'}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

function Campo({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: 'block',
          marginBottom: 7,
          color: '#8795a5',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 1,
          textTransform: 'uppercase'
        }}
      >
        {label}
      </label>

      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#080c11',
  border: '1px solid #303944',
  borderRadius: 6,
  padding: '11px 12px',
  color: 'white',
  outline: 'none',
  fontSize: 13,
  boxSizing: 'border-box'
}

const tdStyle: React.CSSProperties = {
  padding: '15px 16px',
  borderBottom: '1px solid #232d37',
  fontSize: 12,
  color: '#b5c0cb',
  verticalAlign: 'middle'
}

const subStyle: React.CSSProperties = {
  color: '#586b7f',
  fontSize: 9,
  marginTop: 4
}

const empresaBadge: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(255,106,0,.10)',
  border: '1px solid rgba(255,106,0,.28)',
  color: '#ff812b',
  borderRadius: 5,
  padding: '5px 9px',
  fontSize: 10,
  fontWeight: 800
}

const editButton: React.CSSProperties = {
  background: '#18212a',
  border: '1px solid #2d3944',
  color: 'white',
  padding: '7px 12px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 700
}
