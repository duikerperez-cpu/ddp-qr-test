'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Producto = {
  id: string
  empresa_id: string | null
  nombre: string | null
  categoria: string | null
  sku: string | null
  created_at: string | null
}

type Empresa = {
  id: string
  razon_social?: string | null
  nombre?: string | null
  name?: string | null
  empresa_nombre?: string | null
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])

  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [editando, setEditando] = useState<Producto | null>(null)

  const [form, setForm] = useState({
    nombre: '',
    sku: '',
    categoria: '',
    empresa_id: '',
  })

  // =========================================================
  // CARGAR DATOS
  // =========================================================

  const cargarDatos = async () => {
    setCargando(true)
    setError('')

    const [productosRes, empresasRes] = await Promise.all([
      supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('empresas')
        .select('*'),
    ])

    if (productosRes.error) {
      console.error('Error productos:', productosRes.error)
      setError(productosRes.error.message)
      setProductos([])
    } else {
      setProductos(productosRes.data || [])
    }

    if (empresasRes.error) {
      console.error('Error empresas:', empresasRes.error)
      setEmpresas([])
    } else {
      setEmpresas(empresasRes.data || [])
    }

    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // =========================================================
  // NOMBRE EMPRESA
  // =========================================================

  const nombreEmpresa = (empresa: Empresa) => {
    return (
      empresa.razon_social ||
      empresa.nombre ||
      empresa.name ||
      empresa.empresa_nombre ||
      'Empresa sin nombre'
    )
  }

  const obtenerEmpresa = (empresaId: string | null) => {
    if (!empresaId) return '—'

    const empresa = empresas.find(
      (item) => item.id === empresaId
    )

    if (!empresa) return 'Empresa no encontrada'

    return nombreEmpresa(empresa)
  }

  // =========================================================
  // BUSCADOR
  // =========================================================

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim()

    if (!texto) return productos

    return productos.filter((producto) => {
      const empresa = obtenerEmpresa(producto.empresa_id)

      const contenido = [
        producto.nombre,
        producto.sku,
        producto.categoria,
        empresa,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [productos, empresas, busqueda])

  // =========================================================
  // NUEVO PRODUCTO
  // =========================================================

  const abrirNuevo = () => {
    setEditando(null)

    setForm({
      nombre: '',
      sku: '',
      categoria: '',
      empresa_id: '',
    })

    setMostrarFormulario(true)
  }

  // =========================================================
  // EDITAR PRODUCTO
  // =========================================================

  const abrirEditar = (producto: Producto) => {
    setEditando(producto)

    setForm({
      nombre: producto.nombre || '',
      sku: producto.sku || '',
      categoria: producto.categoria || '',
      empresa_id: producto.empresa_id || '',
    })

    setMostrarFormulario(true)
  }

  // =========================================================
  // GUARDAR
  // =========================================================

  const guardarProducto = async () => {
    if (!form.nombre.trim()) {
      alert('Debes ingresar el nombre del producto.')
      return
    }

    if (!form.empresa_id) {
      alert('Debes seleccionar una empresa.')
      return
    }

    setGuardando(true)

    if (editando) {
      const { error } = await supabase
        .from('productos')
        .update({
          nombre: form.nombre.trim(),
          sku: form.sku.trim() || null,
          categoria: form.categoria.trim() || null,
          empresa_id: form.empresa_id,
        })
        .eq('id', editando.id)

      setGuardando(false)

      if (error) {
        console.error(error)

        alert(
          `No fue posible actualizar el producto: ${error.message}`
        )

        return
      }
    } else {
      const { error } = await supabase
        .from('productos')
        .insert({
          nombre: form.nombre.trim(),
          sku: form.sku.trim() || null,
          categoria: form.categoria.trim() || null,
          empresa_id: form.empresa_id,
        })

      setGuardando(false)

      if (error) {
        console.error(error)

        alert(
          `No fue posible crear el producto: ${error.message}`
        )

        return
      }
    }

    setMostrarFormulario(false)
    setEditando(null)

    setForm({
      nombre: '',
      sku: '',
      categoria: '',
      empresa_id: '',
    })

    await cargarDatos()
  }

  // =========================================================
  // FECHA
  // =========================================================

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return '—'

    try {
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(fecha))
    } catch {
      return '—'
    }
  }

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div style={{ width: '100%' }}>

      {/* CABECERA */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 26,
        }}
      >
        <div>

          <div
            style={{
              color: '#ff6a00',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            GESTIÓN
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            Productos
          </h1>

          <div
            style={{
              color: '#7d8b99',
              fontSize: 13,
              marginTop: 6,
            }}
          >
            Catálogo de productos registrados en Vinculab.
          </div>

        </div>

        <button
          onClick={abrirNuevo}
          style={{
            background: '#ff6a00',
            color: 'white',
            border: 'none',
            borderRadius: 7,
            padding: '11px 17px',
            fontSize: 12,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          + Nuevo producto
        </button>

      </div>

      {/* CONTADOR */}

      <div
        style={{
          width: 260,
          background: '#111820',
          border: '1px solid #25303a',
          borderLeft: '3px solid #ff6a00',
          borderRadius: 8,
          padding: '18px 18px',
          marginBottom: 20,
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >

          <div
            style={{
              fontSize: 9,
              color: '#778899',
              fontWeight: 900,
              letterSpacing: 1.2,
            }}
          >
            PRODUCTOS REGISTRADOS
          </div>

          <div
            style={{
              color: '#ff6a00',
              fontSize: 18,
            }}
          >
            ◇
          </div>

        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 29,
            fontWeight: 900,
          }}
        >
          {productos.length}
        </div>

      </div>

      {/* BUSCADOR */}

      <div
        style={{
          background: '#0d1218',
          border: '1px solid #202a34',
          borderRadius: 8,
          padding: 12,
          marginBottom: 14,
        }}
      >

        <div style={{ position: 'relative' }}>

          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#697684',
              fontSize: 15,
            }}
          >
            ⌕
          </span>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto, SKU, categoría o empresa..."
            style={{
              width: '100%',
              maxWidth: 520,
              boxSizing: 'border-box',
              background: '#080b10',
              border: '1px solid #29333e',
              borderRadius: 6,
              padding: '10px 12px 10px 40px',
              color: 'white',
              outline: 'none',
              fontSize: 12,
            }}
          />

        </div>

      </div>

      {/* TABLA */}

      <div
        style={{
          background: '#0d1218',
          border: '1px solid #202a34',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >

        {/* CABECERA TABLA */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1.7fr 1fr 1.3fr 1.5fr 1fr 100px',
            padding: '12px 16px',
            borderBottom: '1px solid #202a34',
            fontSize: 8,
            color: '#657382',
            fontWeight: 900,
            letterSpacing: 1.2,
          }}
        >
          <div>PRODUCTO</div>
          <div>SKU</div>
          <div>CATEGORÍA</div>
          <div>EMPRESA</div>
          <div>FECHA</div>
          <div>ACCIONES</div>
        </div>

        {/* CARGANDO */}

        {cargando && (
          <div
            style={{
              padding: 35,
              textAlign: 'center',
              color: '#71808f',
              fontSize: 12,
            }}
          >
            Cargando productos...
          </div>
        )}

        {/* ERROR */}

        {!cargando && error && (
          <div
            style={{
              padding: 35,
              textAlign: 'center',
              color: '#ef4444',
              fontSize: 12,
            }}
          >
            Error al cargar productos: {error}
          </div>
        )}

        {/* SIN RESULTADOS */}

        {!cargando &&
          !error &&
          productosFiltrados.length === 0 && (
            <div
              style={{
                padding: 35,
                textAlign: 'center',
                color: '#71808f',
                fontSize: 12,
              }}
            >
              No se encontraron productos.
            </div>
          )}

        {/* PRODUCTOS */}

        {!cargando &&
          !error &&
          productosFiltrados.map((producto) => (

            <div
              key={producto.id}
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1.7fr 1fr 1.3fr 1.5fr 1fr 100px',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid #1c252e',
                fontSize: 12,
              }}
            >

              {/* PRODUCTO */}

              <div>

                <div
                  style={{
                    fontWeight: 800,
                    color: '#f3f4f6',
                  }}
                >
                  {producto.nombre || 'Sin nombre'}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    color: '#596674',
                    fontSize: 9,
                  }}
                >
                  ID: {producto.id?.slice(0, 12)}
                </div>

              </div>

              {/* SKU */}

              <div style={{ color: '#a8b3be' }}>
                {producto.sku || '—'}
              </div>

              {/* CATEGORIA */}

              <div style={{ color: '#a8b3be' }}>
                {producto.categoria || '—'}
              </div>

              {/* EMPRESA */}

              <div>

                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(255,106,0,.08)',
                    border: '1px solid rgba(255,106,0,.18)',
                    color: '#ff8a3d',
                    padding: '5px 9px',
                    borderRadius: 5,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {obtenerEmpresa(producto.empresa_id)}
                </span>

              </div>

              {/* FECHA */}

              <div style={{ color: '#7f8b97' }}>
                {formatearFecha(producto.created_at)}
              </div>

              {/* ACCIONES */}

              <div>

                <button
                  onClick={() => abrirEditar(producto)}
                  style={{
                    background: '#1b222a',
                    border: '1px solid #29333e',
                    color: '#d5dbe1',
                    padding: '6px 10px',
                    borderRadius: 5,
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  Editar
                </button>

              </div>

            </div>

          ))}

      </div>

      {/* =====================================================
          MODAL NUEVO / EDITAR
      ===================================================== */}

      {mostrarFormulario && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.78)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >

          <div
            style={{
              width: '100%',
              maxWidth: 500,
              background: '#11161d',
              border: '1px solid #29333e',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 25px 80px rgba(0,0,0,.65)',
            }}
          >

            <div
              style={{
                color: '#ff6a00',
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: 1.4,
              }}
            >
              VINCULAB
            </div>

            <h2
              style={{
                margin: '7px 0 4px',
                fontSize: 20,
              }}
            >
              {editando
                ? 'Editar producto'
                : 'Nuevo producto'}
            </h2>

            <div
              style={{
                color: '#778491',
                fontSize: 12,
                marginBottom: 22,
              }}
            >
              {editando
                ? 'Modifica la información del producto.'
                : 'Registra un nuevo producto en la plataforma.'}
            </div>

            {/* EMPRESA */}

            <label style={labelStyle}>
              Empresa
            </label>

            <select
              value={form.empresa_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  empresa_id: e.target.value,
                })
              }
              style={inputStyle}
            >

              <option value="">
                Seleccionar empresa...
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

            {/* NOMBRE */}

            <Campo
              label="Nombre del producto"
              value={form.nombre}
              placeholder="Ej: Escalera de Seguridad"
              onChange={(value) =>
                setForm({
                  ...form,
                  nombre: value,
                })
              }
            />

            {/* SKU */}

            <Campo
              label="SKU / Código interno"
              value={form.sku}
              placeholder="Ej: GHERC-0001"
              onChange={(value) =>
                setForm({
                  ...form,
                  sku: value,
                })
              }
            />

            {/* CATEGORIA */}

            <Campo
              label="Categoría"
              value={form.categoria}
              placeholder="Ej: Estructuras Metálicas"
              onChange={(value) =>
                setForm({
                  ...form,
                  categoria: value,
                })
              }
            />

            {/* BOTONES */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 12,
              }}
            >

              <button
                onClick={() => {
                  setMostrarFormulario(false)
                  setEditando(null)
                }}
                disabled={guardando}
                style={{
                  background: '#20262d',
                  color: 'white',
                  border: 0,
                  borderRadius: 6,
                  padding: '10px 15px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>

              <button
                onClick={guardarProducto}
                disabled={guardando}
                style={{
                  background: guardando
                    ? '#8a3c00'
                    : '#ff6a00',
                  color: 'white',
                  border: 0,
                  borderRadius: 6,
                  padding: '10px 17px',
                  fontWeight: 900,
                  cursor: guardando
                    ? 'wait'
                    : 'pointer',
                }}
              >
                {guardando
                  ? 'Guardando...'
                  : editando
                  ? 'Guardar cambios'
                  : 'Crear producto'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

// =========================================================
// COMPONENTE CAMPO
// =========================================================

function Campo({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div style={{ marginBottom: 15 }}>

      <label style={labelStyle}>
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />

    </div>
  )
}

// =========================================================
// ESTILOS
// =========================================================

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 9,
  color: '#7c8996',
  fontWeight: 900,
  letterSpacing: 1,
  marginBottom: 7,
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#080b10',
  border: '1px solid #29333e',
  borderRadius: 6,
  padding: '11px 12px',
  color: 'white',
  outline: 'none',
  fontSize: 12,
  marginBottom: 15,
}
