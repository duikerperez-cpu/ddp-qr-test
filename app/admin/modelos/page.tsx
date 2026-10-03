'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Empresa = {
  id: string
  nombre?: string | null
  razon_social?: string | null
  name?: string | null
  empresa_nombre?: string | null
  sector?: string | null
}

type Producto = {
  id: string
  empresa_id: string
  nombre: string
  categoria?: string | null
  sku?: string | null
}

type Modelo = {
  id: string
  nombre: string
  descripcion?: string | null
  empresa_id: string
  producto_id: string
  categoria?: string | null
  version?: string | null
  created_at?: string | null
}

type Atributo = {
  id?: string
  modelo_id?: string
  nombre: string
  valor: string
  unidad: string
  grupo: string
  orden: number
}

type FormState = {
  empresa_id: string
  producto_id: string
  nombre: string
  descripcion: string
  categoria: string
  version: string
}

const EMPTY_FORM: FormState = {
  empresa_id: '',
  producto_id: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  version: 'V1.0',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  background: '#090d12',
  border: '1px solid #2a3440',
  borderRadius: 7,
  color: '#fff',
  padding: '0 13px',
  outline: 'none',
  fontSize: 14,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#88a0bd',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.1,
  marginBottom: 8,
}

function empresaNombre(empresa?: Empresa) {
  if (!empresa) return '—'

  return (
    empresa.razon_social ||
    empresa.nombre ||
    empresa.name ||
    empresa.empresa_nombre ||
    'Empresa'
  )
}

function normalizar(texto?: string | null) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function sugerenciasPorCategoria(
  categoriaProducto?: string | null,
  sectorEmpresa?: string | null
): Atributo[] {
  const texto = normalizar(
    `${categoriaProducto || ''} ${sectorEmpresa || ''}`
  )

  // ALIMENTOS / BEBIDAS / KOMBUCHA
  if (
    texto.includes('alimento') ||
    texto.includes('bebida') ||
    texto.includes('kombucha') ||
    texto.includes('ferment') ||
    texto.includes('food')
  ) {
    return [
      {
        nombre: 'Tipo de producto',
        valor: '',
        unidad: '',
        grupo: 'Producto',
        orden: 10,
      },
      {
        nombre: 'Sabor / variedad',
        valor: '',
        unidad: '',
        grupo: 'Producto',
        orden: 20,
      },
      {
        nombre: 'Tipo de fermentación',
        valor: '',
        unidad: '',
        grupo: 'Proceso',
        orden: 30,
      },
      {
        nombre: 'Tiempo de fermentación',
        valor: '',
        unidad: 'días',
        grupo: 'Proceso',
        orden: 40,
      },
      {
        nombre: 'Recipiente de fermentación',
        valor: '',
        unidad: '',
        grupo: 'Proceso',
        orden: 50,
      },
      {
        nombre: 'Contenido neto',
        valor: '',
        unidad: 'ml',
        grupo: 'Presentación',
        orden: 60,
      },
      {
        nombre: 'Condición de conservación',
        valor: '',
        unidad: '',
        grupo: 'Conservación',
        orden: 70,
      },
    ]
  }

  // ESTRUCTURAS / METAL / INDUSTRIAL
  if (
    texto.includes('estructura') ||
    texto.includes('metal') ||
    texto.includes('industrial') ||
    texto.includes('acero') ||
    texto.includes('minera')
  ) {
    return [
      {
        nombre: 'Material',
        valor: '',
        unidad: '',
        grupo: 'Materiales',
        orden: 10,
      },
      {
        nombre: 'Altura',
        valor: '',
        unidad: 'm',
        grupo: 'Dimensiones',
        orden: 20,
      },
      {
        nombre: 'Largo',
        valor: '',
        unidad: 'm',
        grupo: 'Dimensiones',
        orden: 30,
      },
      {
        nombre: 'Ancho',
        valor: '',
        unidad: 'm',
        grupo: 'Dimensiones',
        orden: 40,
      },
      {
        nombre: 'Peso',
        valor: '',
        unidad: 'kg',
        grupo: 'Características',
        orden: 50,
      },
      {
        nombre: 'Terminación',
        valor: '',
        unidad: '',
        grupo: 'Características',
        orden: 60,
      },
      {
        nombre: 'Capacidad de carga',
        valor: '',
        unidad: 'kg',
        grupo: 'Características',
        orden: 70,
      },
      {
        nombre: 'Norma / certificación',
        valor: '',
        unidad: '',
        grupo: 'Cumplimiento',
        orden: 80,
      },
    ]
  }

  // TEXTIL
  if (
    texto.includes('textil') ||
    texto.includes('ropa') ||
    texto.includes('vestuario')
  ) {
    return [
      {
        nombre: 'Material',
        valor: '',
        unidad: '',
        grupo: 'Composición',
        orden: 10,
      },
      {
        nombre: 'Talla',
        valor: '',
        unidad: '',
        grupo: 'Características',
        orden: 20,
      },
      {
        nombre: 'Color',
        valor: '',
        unidad: '',
        grupo: 'Características',
        orden: 30,
      },
      {
        nombre: 'Composición',
        valor: '',
        unidad: '%',
        grupo: 'Composición',
        orden: 40,
      },
      {
        nombre: 'País de fabricación',
        valor: '',
        unidad: '',
        grupo: 'Origen',
        orden: 50,
      },
    ]
  }

  // ELECTRÓNICA / BATERÍAS
  if (
    texto.includes('electron') ||
    texto.includes('bateria') ||
    texto.includes('battery') ||
    texto.includes('electrico')
  ) {
    return [
      {
        nombre: 'Tecnología',
        valor: '',
        unidad: '',
        grupo: 'Características',
        orden: 10,
      },
      {
        nombre: 'Voltaje',
        valor: '',
        unidad: 'V',
        grupo: 'Características',
        orden: 20,
      },
      {
        nombre: 'Capacidad',
        valor: '',
        unidad: 'Ah',
        grupo: 'Características',
        orden: 30,
      },
      {
        nombre: 'Litio',
        valor: '',
        unidad: '%',
        grupo: 'Composición',
        orden: 40,
      },
      {
        nombre: 'Cobalto',
        valor: '',
        unidad: '%',
        grupo: 'Composición',
        orden: 50,
      },
    ]
  }

  // GENÉRICO
  return [
    {
      nombre: 'Característica',
      valor: '',
      unidad: '',
      grupo: 'Especificaciones',
      orden: 10,
    },
  ]
}

export default function ModelosPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [atributos, setAtributos] = useState<Record<string, Atributo[]>>({})

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [modal, setModal] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [especificaciones, setEspecificaciones] = useState<Atributo[]>([])

  useEffect(() => {
    cargarTodo()
  }, [])

  async function cargarTodo() {
    try {
      setLoading(true)
      setError('')

      const [
        empresasResponse,
        productosResponse,
        modelosResponse,
        atributosResponse,
      ] = await Promise.all([
        supabase.from('empresas').select('*'),
        supabase.from('productos').select('*'),
        supabase
          .from('modelos')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('modelo_atributos')
          .select('*')
          .order('orden', { ascending: true }),
      ])

      if (empresasResponse.error) throw empresasResponse.error
      if (productosResponse.error) throw productosResponse.error
      if (modelosResponse.error) throw modelosResponse.error
      if (atributosResponse.error) throw atributosResponse.error

      setEmpresas(empresasResponse.data || [])
      setProductos(productosResponse.data || [])
      setModelos(modelosResponse.data || [])

      const mapa: Record<string, Atributo[]> = {}

      ;(atributosResponse.data || []).forEach((atributo: any) => {
        if (!mapa[atributo.modelo_id]) {
          mapa[atributo.modelo_id] = []
        }

        mapa[atributo.modelo_id].push(atributo)
      })

      setAtributos(mapa)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'No fue posible cargar los modelos.')
    } finally {
      setLoading(false)
    }
  }

  const productosEmpresa = useMemo(() => {
    if (!form.empresa_id) return []

    return productos.filter(
      (producto) => producto.empresa_id === form.empresa_id
    )
  }, [productos, form.empresa_id])

  const modelosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda)

    if (!texto) return modelos

    return modelos.filter((modelo) => {
      const producto = productos.find((p) => p.id === modelo.producto_id)
      const empresa = empresas.find((e) => e.id === modelo.empresa_id)

      return normalizar(
        [
          modelo.nombre,
          modelo.categoria,
          modelo.version,
          producto?.nombre,
          empresaNombre(empresa),
        ].join(' ')
      ).includes(texto)
    })
  }, [modelos, productos, empresas, busqueda])

  function abrirNuevoModelo() {
    setForm(EMPTY_FORM)
    setEspecificaciones([])
    setError('')
    setModal(true)
  }

  function cerrarModal() {
    if (guardando) return

    setModal(false)
    setForm(EMPTY_FORM)
    setEspecificaciones([])
    setError('')
  }

  function seleccionarEmpresa(empresaId: string) {
    setForm((prev) => ({
      ...prev,
      empresa_id: empresaId,
      producto_id: '',
      categoria: '',
    }))

    setEspecificaciones([])
  }

  function seleccionarProducto(productoId: string) {
    const producto = productos.find((p) => p.id === productoId)
    const empresa = empresas.find((e) => e.id === form.empresa_id)

    const categoria = producto?.categoria || ''

    setForm((prev) => ({
      ...prev,
      producto_id: productoId,
      categoria,
    }))

    setEspecificaciones(
      sugerenciasPorCategoria(categoria, empresa?.sector)
    )
  }

  function agregarEspecificacion() {
    setEspecificaciones((prev) => [
      ...prev,
      {
        nombre: '',
        valor: '',
        unidad: '',
        grupo: 'Especificaciones',
        orden: (prev.length + 1) * 10,
      },
    ])
  }

  function actualizarEspecificacion(
    index: number,
    campo: keyof Atributo,
    valor: string
  ) {
    setEspecificaciones((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    )
  }

  function eliminarEspecificacion(index: number) {
    setEspecificaciones((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  async function crearModelo() {
    if (!form.empresa_id) {
      setError('Debes seleccionar una empresa.')
      return
    }

    if (!form.producto_id) {
      setError('Debes seleccionar un producto.')
      return
    }

    if (!form.nombre.trim()) {
      setError('Debes ingresar el nombre del modelo.')
      return
    }

    try {
      setGuardando(true)
      setError('')

      const { data: modeloCreado, error: modeloError } = await supabase
        .from('modelos')
        .insert({
          empresa_id: form.empresa_id,
          producto_id: form.producto_id,
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          categoria: form.categoria.trim() || null,
          version: form.version.trim() || 'V1.0',
        })
        .select()
        .single()

      if (modeloError) throw modeloError

      const atributosValidos = especificaciones
        .filter(
          (item) =>
            item.nombre.trim() &&
            item.valor.trim()
        )
        .map((item, index) => ({
          modelo_id: modeloCreado.id,
          nombre: item.nombre.trim(),
          valor: item.valor.trim(),
          unidad: item.unidad.trim() || null,
          grupo: item.grupo.trim() || 'Especificaciones',
          orden: (index + 1) * 10,
        }))

      if (atributosValidos.length > 0) {
        const { error: atributosError } = await supabase
          .from('modelo_atributos')
          .insert(atributosValidos)

        if (atributosError) {
          // Si fallan los atributos, eliminamos el modelo recién creado
          // para evitar dejar un registro incompleto.
          await supabase
            .from('modelos')
            .delete()
            .eq('id', modeloCreado.id)

          throw atributosError
        }
      }

      setModal(false)
      setForm(EMPTY_FORM)
      setEspecificaciones([])

      await cargarTodo()
    } catch (err: any) {
      console.error(err)
      setError(
        err?.message ||
          'No fue posible crear el modelo.'
      )
    } finally {
      setGuardando(false)
    }
  }

  function productoDeModelo(modelo: Modelo) {
    return productos.find(
      (producto) => producto.id === modelo.producto_id
    )
  }

  function empresaDeModelo(modelo: Modelo) {
    return empresas.find(
      (empresa) => empresa.id === modelo.empresa_id
    )
  }

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto' }}>
      {/* ENCABEZADO */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              color: '#ff6a00',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.4,
              marginBottom: 8,
            }}
          >
            GESTIÓN
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            Modelos
          </h1>

          <div
            style={{
              color: '#7890aa',
              fontSize: 13,
              marginTop: 7,
            }}
          >
            Modelos y especificaciones técnicas de productos.
          </div>
        </div>

        <button
          onClick={abrirNuevoModelo}
          style={{
            background: '#ff6a00',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '12px 18px',
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          + Nuevo modelo
        </button>
      </div>

      {/* CONTADOR */}

      <div
        style={{
          width: 320,
          minHeight: 125,
          background: '#111820',
          border: '1px solid #27313c',
          borderLeft: '3px solid #ff6a00',
          borderRadius: 9,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              color: '#839ab5',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.2,
            }}
          >
            MODELOS REGISTRADOS
          </span>

          <span style={{ color: '#ff6a00' }}>◇</span>
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            marginTop: 25,
          }}
        >
          {modelos.length}
        </div>
      </div>

      {/* BUSCADOR */}

      <div
        style={{
          background: '#0e141b',
          border: '1px solid #222c36',
          borderRadius: 8,
          padding: 13,
          marginBottom: 14,
        }}
      >
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar modelo, producto, categoría o empresa..."
          style={{
            ...inputStyle,
            maxWidth: 560,
          }}
        />
      </div>

      {/* ERROR */}

      {error && !modal && (
        <div
          style={{
            background: '#351010',
            border: '1px solid #762525',
            color: '#ffaaaa',
            padding: 12,
            borderRadius: 7,
            marginBottom: 15,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* TABLA */}

      <div
        style={{
          background: '#0e141b',
          border: '1px solid #222c36',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1.5fr 1.2fr 1fr 1fr .7fr .7fr',
            padding: '13px 17px',
            borderBottom: '1px solid #222c36',
            color: '#68809b',
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: 1.1,
          }}
        >
          <div>MODELO</div>
          <div>PRODUCTO</div>
          <div>EMPRESA</div>
          <div>CATEGORÍA</div>
          <div>VERSIÓN</div>
          <div>ESPEC.</div>
        </div>

        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: '#708297',
            }}
          >
            Cargando modelos...
          </div>
        ) : modelosFiltrados.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: '#708297',
            }}
          >
            No se encontraron modelos.
          </div>
        ) : (
          modelosFiltrados.map((modelo) => {
            const producto = productoDeModelo(modelo)
            const empresa = empresaDeModelo(modelo)
            const specs = atributos[modelo.id] || []

            return (
              <div
                key={modelo.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1.5fr 1.2fr 1fr 1fr .7fr .7fr',
                  padding: '15px 17px',
                  borderBottom: '1px solid #202832',
                  alignItems: 'center',
                  fontSize: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: '#fff',
                    }}
                  >
                    {modelo.nombre}
                  </div>

                  <div
                    style={{
                      color: '#526579',
                      fontSize: 9,
                      marginTop: 4,
                    }}
                  >
                    ID: {modelo.id.slice(0, 12)}
                  </div>
                </div>

                <div style={{ color: '#a8bdd2' }}>
                  {producto?.nombre || '—'}
                </div>

                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(255,106,0,.10)',
                      color: '#ff8129',
                      border: '1px solid rgba(255,106,0,.25)',
                      padding: '5px 8px',
                      borderRadius: 5,
                      fontWeight: 700,
                    }}
                  >
                    {empresaNombre(empresa)}
                  </span>
                </div>

                <div style={{ color: '#a8bdd2' }}>
                  {modelo.categoria || producto?.categoria || '—'}
                </div>

                <div style={{ color: '#a8bdd2' }}>
                  {modelo.version || '—'}
                </div>

                <div>
                  <span
                    style={{
                      background: '#17212b',
                      border: '1px solid #273441',
                      borderRadius: 20,
                      padding: '5px 9px',
                      color: '#a8bdd2',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {specs.length}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MODAL */}

      {modal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.82)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 760,
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#111820',
              border: '1px solid #303b47',
              borderRadius: 10,
              boxShadow: '0 25px 80px rgba(0,0,0,.55)',
            }}
          >
            {/* TITULO MODAL */}

            <div
              style={{
                padding: '18px 26px',
                borderBottom: '1px solid #27313b',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 23,
                  fontWeight: 900,
                }}
              >
                Nuevo modelo
              </h2>

              <div
                style={{
                  color: '#71869d',
                  fontSize: 12,
                  marginTop: 5,
                }}
              >
                Define el modelo y sus especificaciones.
              </div>
            </div>

            <div style={{ padding: 26 }}>
              {/* EMPRESA */}

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>EMPRESA *</label>

                <select
                  value={form.empresa_id}
                  onChange={(e) =>
                    seleccionarEmpresa(e.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="">Seleccionar empresa</option>

                  {empresas.map((empresa) => (
                    <option
                      key={empresa.id}
                      value={empresa.id}
                    >
                      {empresaNombre(empresa)}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRODUCTO */}

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>PRODUCTO *</label>

                <select
                  value={form.producto_id}
                  disabled={!form.empresa_id}
                  onChange={(e) =>
                    seleccionarProducto(e.target.value)
                  }
                  style={{
                    ...inputStyle,
                    opacity: form.empresa_id ? 1 : 0.5,
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
                    </option>
                  ))}
                </select>
              </div>

              {/* NOMBRE */}

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>
                  NOMBRE DEL MODELO *
                </label>

                <input
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Ej: Añejado en roble"
                  style={inputStyle}
                />
              </div>

              {/* DESCRIPCIÓN */}

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>DESCRIPCIÓN</label>

                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Descripción del modelo..."
                  style={{
                    ...inputStyle,
                    height: 95,
                    paddingTop: 12,
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* CATEGORIA + VERSION */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 15,
                  marginBottom: 25,
                }}
              >
                <div>
                  <label style={labelStyle}>CATEGORÍA</label>

                  <input
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoria: e.target.value,
                      })
                    }
                    placeholder="Ej: Alimento"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>VERSIÓN</label>

                  <input
                    value={form.version}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        version: e.target.value,
                      })
                    }
                    placeholder="V1.0"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* ESPECIFICACIONES */}

              <div
                style={{
                  borderTop: '1px solid #27313b',
                  paddingTop: 22,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: '#ff6a00',
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: 1.2,
                      }}
                    >
                      ESPECIFICACIONES
                    </div>

                    <div
                      style={{
                        color: '#71869d',
                        fontSize: 11,
                        marginTop: 4,
                      }}
                    >
                      Características propias de este modelo.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={agregarEspecificacion}
                    style={{
                      background: '#18212b',
                      color: '#ff7a1a',
                      border: '1px solid #34404d',
                      padding: '8px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: 11,
                    }}
                  >
                    + Agregar
                  </button>
                </div>

                {especificaciones.length === 0 ? (
                  <div
                    style={{
                      background: '#0b1016',
                      border: '1px dashed #303b47',
                      borderRadius: 8,
                      padding: 22,
                      color: '#71869d',
                      textAlign: 'center',
                      fontSize: 12,
                    }}
                  >
                    Selecciona un producto para cargar
                    especificaciones sugeridas o agrégalas
                    manualmente.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 9,
                    }}
                  >
                    {especificaciones.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '1.25fr 1.25fr .6fr 40px',
                          gap: 8,
                          alignItems: 'center',
                        }}
                      >
                        <input
                          value={item.nombre}
                          onChange={(e) =>
                            actualizarEspecificacion(
                              index,
                              'nombre',
                              e.target.value
                            )
                          }
                          placeholder="Característica"
                          style={inputStyle}
                        />

                        <input
                          value={item.valor}
                          onChange={(e) =>
                            actualizarEspecificacion(
                              index,
                              'valor',
                              e.target.value
                            )
                          }
                          placeholder="Valor"
                          style={inputStyle}
                        />

                        <input
                          value={item.unidad}
                          onChange={(e) =>
                            actualizarEspecificacion(
                              index,
                              'unidad',
                              e.target.value
                            )
                          }
                          placeholder="Unidad"
                          style={inputStyle}
                        />

                        <button
                          type="button"
                          title="Eliminar especificación"
                          onClick={() =>
                            eliminarEspecificacion(index)
                          }
                          style={{
                            width: 40,
                            height: 40,
                            background: '#291315',
                            color: '#ff7474',
                            border: '1px solid #562226',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 900,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ERROR MODAL */}

              {error && (
                <div
                  style={{
                    marginTop: 18,
                    background: '#351010',
                    border: '1px solid #762525',
                    color: '#ffaaaa',
                    padding: 12,
                    borderRadius: 7,
                    fontSize: 12,
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            {/* BOTONES */}

            <div
              style={{
                position: 'sticky',
                bottom: 0,
                background: '#111820',
                borderTop: '1px solid #27313b',
                padding: '16px 26px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={cerrarModal}
                disabled={guardando}
                style={{
                  background: '#1c2530',
                  border: '1px solid #34404d',
                  color: '#fff',
                  padding: '11px 20px',
                  borderRadius: 7,
                  cursor: guardando
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                Cancelar
              </button>

              <button
                onClick={crearModelo}
                disabled={guardando}
                style={{
                  background: '#ff6a00',
                  border: 'none',
                  color: '#fff',
                  padding: '11px 22px',
                  borderRadius: 7,
                  fontWeight: 900,
                  cursor: guardando
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: guardando ? 0.7 : 1,
                }}
              >
                {guardando
                  ? 'Creando modelo...'
                  : 'Crear modelo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
