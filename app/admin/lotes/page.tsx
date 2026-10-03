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
  estado: string | null
  created_at: string | null
  producto_id: string | null
  fecha_produccion: string | null
  fecha_vencimiento: string | null
  ubicacion: string | null
  observaciones: string | null
}

type FormLote = {
  empresa_id: string
  producto_id: string
  modelo_id: string
  codigo: string
  cantidad: string
  fecha_produccion: string
  fecha_vencimiento: string
  ubicacion: string
  estado: string
  observaciones: string
}

const formInicial: FormLote = {
  empresa_id: '',
  producto_id: '',
  modelo_id: '',
  codigo: '',
  cantidad: '1',
  fecha_produccion: '',
  fecha_vencimiento: '',
  ubicacion: '',
  estado: 'activo',
  observaciones: '',
}

export default function LotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])

  const [form, setForm] = useState<FormLote>(formInicial)

  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarTodo()
  }, [])

  async function cargarTodo() {
    setCargando(true)
    setError('')

    try {
      const [
        lotesResult,
        empresasResult,
        productosResult,
        modelosResult,
      ] = await Promise.all([
        supabase.from('lotes').select('*'),
        supabase.from('empresas').select('*'),
        supabase.from('productos').select('*'),
        supabase.from('modelos').select('*'),
      ])

      if (lotesResult.error) throw lotesResult.error
      if (empresasResult.error) throw empresasResult.error
      if (productosResult.error) throw productosResult.error
      if (modelosResult.error) throw modelosResult.error

      const lotesOrdenados = [...(lotesResult.data || [])].sort(
        (a: any, b: any) => {
          const fechaA = a.created_at
            ? new Date(a.created_at).getTime()
            : 0

          const fechaB = b.created_at
            ? new Date(b.created_at).getTime()
            : 0

          return fechaB - fechaA
        }
      )

      setLotes(lotesOrdenados as Lote[])
      setEmpresas((empresasResult.data || []) as Empresa[])
      setProductos((productosResult.data || []) as Producto[])
      setModelos((modelosResult.data || []) as Modelo[])
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'No fue posible cargar la información.')
    } finally {
      setCargando(false)
    }
  }

  function nombreEmpresa(empresa?: Empresa) {
    if (!empresa) return '—'

    return (
      empresa.razon_social ||
      empresa.nombre ||
      empresa.name ||
      empresa.empresa_nombre ||
      'Empresa sin nombre'
    )
  }

  function buscarEmpresa(id: string | null) {
    if (!id) return undefined
    return empresas.find((empresa) => empresa.id === id)
  }

  function buscarProducto(id: string | null) {
    if (!id) return undefined
    return productos.find((producto) => producto.id === id)
  }

  function buscarModelo(id: string | null) {
    if (!id) return undefined
    return modelos.find((modelo) => modelo.id === id)
  }

  const productosEmpresa = useMemo(() => {
    if (!form.empresa_id) return []

    return productos.filter(
      (producto) => producto.empresa_id === form.empresa_id
    )
  }, [productos, form.empresa_id])

  const modelosProducto = useMemo(() => {
    if (!form.producto_id) return []

    return modelos.filter(
      (modelo) =>
        modelo.producto_id === form.producto_id &&
        (!form.empresa_id || modelo.empresa_id === form.empresa_id)
    )
  }, [modelos, form.producto_id, form.empresa_id])

  const lotesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return lotes

    return lotes.filter((lote) => {
      const empresa = buscarEmpresa(lote.empresa_id)
      const producto = buscarProducto(lote.producto_id)
      const modelo = buscarModelo(lote.modelo_id)

      const contenido = [
        lote.codigo,
        nombreEmpresa(empresa),
        producto?.nombre,
        producto?.sku,
        modelo?.nombre,
        lote.estado,
        lote.ubicacion,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [busqueda, lotes, empresas, productos, modelos])

  function cambiarCampo(
    campo: keyof FormLote,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function seleccionarEmpresa(empresaId: string) {
    setForm((anterior) => ({
      ...anterior,
      empresa_id: empresaId,
      producto_id: '',
      modelo_id: '',
    }))
  }

  function seleccionarProducto(productoId: string) {
    setForm((anterior) => ({
      ...anterior,
      producto_id: productoId,
      modelo_id: '',
    }))
  }

  function generarCodigo() {
    const empresa = buscarEmpresa(form.empresa_id)
    const producto = buscarProducto(form.producto_id)

    const empresaTexto = nombreEmpresa(empresa)
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase()

    const productoTexto = (producto?.nombre || 'PRO')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase()

    const ahora = new Date()

    const fecha =
      String(ahora.getFullYear()) +
      String(ahora.getMonth() + 1).padStart(2, '0') +
      String(ahora.getDate()).padStart(2, '0')

    const aleatorio = Math.floor(100 + Math.random() * 900)

    cambiarCampo(
      'codigo',
      `LOT-${empresaTexto || 'VIN'}-${productoTexto}-${fecha}-${aleatorio}`
    )
  }

  function nuevoLote() {
    setEditandoId(null)
    setForm(formInicial)
    setError('')
    setMensaje('')
    setModal(true)
  }

  function editarLote(lote: Lote) {
    let productoId = lote.producto_id || ''

    // Compatibilidad con lotes antiguos:
    // si no tienen producto_id, intentamos obtenerlo desde el modelo.
    if (!productoId && lote.modelo_id) {
      const modelo = buscarModelo(lote.modelo_id)

      if (modelo?.producto_id) {
        productoId = modelo.producto_id
      }
    }

    setEditandoId(lote.id)

    setForm({
      empresa_id: lote.empresa_id || '',
      producto_id: productoId,
      modelo_id: lote.modelo_id || '',
      codigo: lote.codigo || '',
      cantidad: String(lote.cantidad || 1),
      fecha_produccion: lote.fecha_produccion || '',
      fecha_vencimiento: lote.fecha_vencimiento || '',
      ubicacion: lote.ubicacion || '',
      estado: lote.estado || 'activo',
      observaciones: lote.observaciones || '',
    })

    setError('')
    setMensaje('')
    setModal(true)
  }

  function cerrarModal() {
    if (guardando) return

    setModal(false)
    setEditandoId(null)
    setForm(formInicial)
    setError('')
  }

  async function guardarLote() {
    setError('')
    setMensaje('')

    if (!form.empresa_id) {
      setError('Selecciona una empresa.')
      return
    }

    if (!form.producto_id) {
      setError('Selecciona un producto.')
      return
    }

    if (!form.modelo_id) {
      setError('Selecciona un modelo.')
      return
    }

    if (!form.codigo.trim()) {
      setError('Ingresa o genera un código de lote.')
      return
    }

    const cantidad = Number(form.cantidad)

    if (!Number.isFinite(cantidad) || cantidad < 1) {
      setError('La cantidad debe ser mayor o igual a 1.')
      return
    }

    const producto = productos.find(
      (item) => item.id === form.producto_id
    )

    const modelo = modelos.find(
      (item) => item.id === form.modelo_id
    )

    if (!producto) {
      setError('El producto seleccionado no existe.')
      return
    }

    if (producto.empresa_id !== form.empresa_id) {
      setError('El producto no pertenece a la empresa seleccionada.')
      return
    }

    if (!modelo) {
      setError('El modelo seleccionado no existe.')
      return
    }

    if (modelo.producto_id !== form.producto_id) {
      setError('El modelo no pertenece al producto seleccionado.')
      return
    }

    if (
      form.fecha_produccion &&
      form.fecha_vencimiento &&
      form.fecha_vencimiento < form.fecha_produccion
    ) {
      setError(
        'La fecha de vencimiento no puede ser anterior a la fecha de producción.'
      )
      return
    }

    setGuardando(true)

    const payload = {
      codigo: form.codigo.trim(),
      cantidad,
      empresa_id: form.empresa_id,
      producto_id: form.producto_id,
      modelo_id: form.modelo_id,
      fecha_produccion: form.fecha_produccion || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
      ubicacion: form.ubicacion.trim() || null,
      estado: form.estado || 'activo',
      observaciones: form.observaciones.trim() || null,
    }

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('lotes')
          .update(payload)
          .eq('id', editandoId)

        if (error) throw error

        setMensaje('Lote actualizado correctamente.')
      } else {
        const { error } = await supabase
          .from('lotes')
          .insert(payload)

        if (error) throw error

        setMensaje('Lote creado correctamente.')
      }

      setModal(false)
      setEditandoId(null)
      setForm(formInicial)

      await cargarTodo()
    } catch (err: any) {
      console.error(err)

      if (err?.code === '23505') {
        setError('Ya existe un lote con ese código.')
      } else {
        setError(
          err?.message ||
            'No fue posible guardar el lote.'
        )
      }
    } finally {
      setGuardando(false)
    }
  }

  function fechaBonita(fecha: string | null) {
    if (!fecha) return '—'

    const partes = fecha.substring(0, 10).split('-')

    if (partes.length !== 3) return fecha

    return `${partes[2]}-${partes[1]}-${partes[0]}`
  }

  function estadoBonito(estado: string | null) {
    if (!estado) return 'SIN ESTADO'

    return estado.replaceAll('_', ' ').toUpperCase()
  }

  return (
    <div style={styles.pagina}>
      {/* CABECERA */}

      <div style={styles.cabecera}>
        <div>
          <div style={styles.seccion}>GESTIÓN</div>

          <h1 style={styles.titulo}>Lotes</h1>

          <p style={styles.subtitulo}>
            Gestión de lotes de producción y trazabilidad.
          </p>
        </div>

        <button
          type="button"
          onClick={nuevoLote}
          style={styles.botonPrincipal}
        >
          + Nuevo lote
        </button>
      </div>

      {/* MENSAJES */}

      {error && !modal && (
        <div style={styles.alertaError}>
          {error}
        </div>
      )}

      {mensaje && (
        <div style={styles.alertaExito}>
          ● {mensaje}
        </div>
      )}

      {/* TARJETA CONTADOR */}

      <div style={styles.tarjetaContador}>
        <div>
          <div style={styles.etiqueta}>
            LOTES REGISTRADOS
          </div>

          <div style={styles.numero}>
            {lotes.length}
          </div>
        </div>

        <div style={styles.iconoNaranja}>
          ▤
        </div>
      </div>

      {/* BUSCADOR */}

      <div style={styles.buscadorCaja}>
        <span style={styles.lupa}>⌕</span>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar lote, producto, modelo, empresa o código..."
          style={styles.buscador}
        />
      </div>

      {/* TABLA */}

      <div style={styles.tablaCaja}>
        <div style={styles.tablaCabecera}>
          <div>LOTE</div>
          <div>PRODUCTO / MODELO</div>
          <div>EMPRESA</div>
          <div>CANTIDAD</div>
          <div>PRODUCCIÓN</div>
          <div>ESTADO</div>
          <div>ACCIONES</div>
        </div>

        {cargando ? (
          <div style={styles.vacio}>
            Cargando lotes...
          </div>
        ) : lotesFiltrados.length === 0 ? (
          <div style={styles.vacio}>
            No se encontraron lotes.
          </div>
        ) : (
          lotesFiltrados.map((lote) => {
            const empresa = buscarEmpresa(lote.empresa_id)

            let producto = buscarProducto(lote.producto_id)

            const modelo = buscarModelo(lote.modelo_id)

            // Lotes antiguos sin producto_id
            if (!producto && modelo?.producto_id) {
              producto = buscarProducto(modelo.producto_id)
            }

            return (
              <div
                key={lote.id}
                style={styles.fila}
              >
                <div>
                  <div style={styles.nombrePrincipal}>
                    {lote.codigo || 'SIN CÓDIGO'}
                  </div>

                  <div style={styles.idTexto}>
                    ID: {lote.id.substring(0, 8)}
                  </div>
                </div>

                <div>
                  <div style={styles.textoNormal}>
                    {producto?.nombre || '—'}
                  </div>

                  <div style={styles.textoSecundario}>
                    {modelo?.nombre || 'Modelo no identificado'}
                  </div>
                </div>

                <div>
                  <span style={styles.badgeEmpresa}>
                    {nombreEmpresa(empresa)}
                  </span>
                </div>

                <div style={styles.cantidad}>
                  {lote.cantidad ?? 0}
                </div>

                <div>
                  <div style={styles.textoNormal}>
                    {fechaBonita(lote.fecha_produccion)}
                  </div>

                  {lote.fecha_vencimiento && (
                    <div style={styles.textoSecundario}>
                      Vence: {fechaBonita(lote.fecha_vencimiento)}
                    </div>
                  )}
                </div>

                <div>
                  <span
                    style={
                      lote.estado === 'activo'
                        ? styles.badgeActivo
                        : styles.badgeNeutro
                    }
                  >
                    {estadoBonito(lote.estado)}
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => editarLote(lote)}
                    style={styles.botonEditar}
                  >
                    Editar
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MODAL */}

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitulo}>
                  {editandoId
                    ? 'Editar lote'
                    : 'Nuevo lote'}
                </h2>

                <div style={styles.modalSubtitulo}>
                  Vincula empresa, producto y modelo.
                </div>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                style={styles.cerrar}
              >
                ×
              </button>
            </div>

            <div style={styles.modalContenido}>
              {error && (
                <div style={styles.alertaError}>
                  {error}
                </div>
              )}

              {/* EMPRESA */}

              <Campo label="EMPRESA *">
                <select
                  value={form.empresa_id}
                  onChange={(e) =>
                    seleccionarEmpresa(e.target.value)
                  }
                  style={styles.input}
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
              </Campo>

              {/* PRODUCTO */}

              <Campo label="PRODUCTO *">
                <select
                  value={form.producto_id}
                  disabled={!form.empresa_id}
                  onChange={(e) =>
                    seleccionarProducto(e.target.value)
                  }
                  style={{
                    ...styles.input,
                    opacity: form.empresa_id ? 1 : 0.5,
                  }}
                >
                  <option value="">
                    {form.empresa_id
                      ? 'Seleccionar producto...'
                      : 'Primero selecciona una empresa'}
                  </option>

                  {productosEmpresa.map((producto) => (
                    <option
                      key={producto.id}
                      value={producto.id}
                    >
                      {producto.nombre || 'Producto sin nombre'}
                      {producto.sku
                        ? ` · ${producto.sku}`
                        : ''}
                    </option>
                  ))}
                </select>
              </Campo>

              {/* MODELO */}

              <Campo label="MODELO *">
                <select
                  value={form.modelo_id}
                  disabled={!form.producto_id}
                  onChange={(e) =>
                    cambiarCampo(
                      'modelo_id',
                      e.target.value
                    )
                  }
                  style={{
                    ...styles.input,
                    opacity: form.producto_id ? 1 : 0.5,
                  }}
                >
                  <option value="">
                    {form.producto_id
                      ? 'Seleccionar modelo...'
                      : 'Primero selecciona un producto'}
                  </option>

                  {modelosProducto.map((modelo) => (
                    <option
                      key={modelo.id}
                      value={modelo.id}
                    >
                      {modelo.nombre || 'Modelo sin nombre'}
                      {modelo.version
                        ? ` · ${modelo.version}`
                        : ''}
                    </option>
                  ))}
                </select>
              </Campo>

              {/* CÓDIGO */}

              <Campo label="CÓDIGO DEL LOTE *">
                <div style={styles.codigoFila}>
                  <input
                    value={form.codigo}
                    onChange={(e) =>
                      cambiarCampo(
                        'codigo',
                        e.target.value
                          .toUpperCase()
                          .replace(/\s+/g, '-')
                      )
                    }
                    placeholder="Ej: AUK-KOM-20261002-001"
                    style={{
                      ...styles.input,
                      flex: 1,
                    }}
                  />

                  <button
                    type="button"
                    onClick={generarCodigo}
                    style={styles.botonSecundario}
                  >
                    Generar
                  </button>
                </div>
              </Campo>

              <div style={styles.dosColumnas}>
                <Campo label="CANTIDAD *">
                  <input
                    type="number"
                    min="1"
                    value={form.cantidad}
                    onChange={(e) =>
                      cambiarCampo(
                        'cantidad',
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </Campo>

                <Campo label="ESTADO">
                  <select
                    value={form.estado}
                    onChange={(e) =>
                      cambiarCampo(
                        'estado',
                        e.target.value
                      )
                    }
                    style={styles.input}
                  >
                    <option value="activo">
                      Activo
                    </option>

                    <option value="en_produccion">
                      En producción
                    </option>

                    <option value="liberado">
                      Liberado
                    </option>

                    <option value="bloqueado">
                      Bloqueado
                    </option>

                    <option value="agotado">
                      Agotado
                    </option>

                    <option value="retirado">
                      Retirado
                    </option>
                  </select>
                </Campo>
              </div>

              <div style={styles.dosColumnas}>
                <Campo label="FECHA DE PRODUCCIÓN">
                  <input
                    type="date"
                    value={form.fecha_produccion}
                    onChange={(e) =>
                      cambiarCampo(
                        'fecha_produccion',
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </Campo>

                <Campo label="FECHA DE VENCIMIENTO">
                  <input
                    type="date"
                    value={form.fecha_vencimiento}
                    onChange={(e) =>
                      cambiarCampo(
                        'fecha_vencimiento',
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />

                  <div style={styles.ayuda}>
                    Opcional. Úsala solo cuando aplique al producto.
                  </div>
                </Campo>
              </div>

              <Campo label="UBICACIÓN">
                <input
                  value={form.ubicacion}
                  onChange={(e) =>
                    cambiarCampo(
                      'ubicacion',
                      e.target.value
                    )
                  }
                  placeholder="Ej: Planta San Felipe, Bodega 1, Taller..."
                  style={styles.input}
                />
              </Campo>

              <Campo label="OBSERVACIONES">
                <textarea
                  value={form.observaciones}
                  onChange={(e) =>
                    cambiarCampo(
                      'observaciones',
                      e.target.value
                    )
                  }
                  placeholder="Información adicional del lote..."
                  rows={4}
                  style={{
                    ...styles.input,
                    resize: 'vertical',
                    minHeight: 90,
                  }}
                />
              </Campo>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                style={styles.botonCancelar}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarLote}
                disabled={guardando}
                style={{
                  ...styles.botonPrincipal,
                  opacity: guardando ? 0.6 : 1,
                }}
              >
                {guardando
                  ? 'Guardando...'
                  : editandoId
                    ? 'Guardar cambios'
                    : 'Crear lote'}
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
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={styles.labelCampo}>
        {label}
      </div>

      {children}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  pagina: {
    width: '100%',
    color: '#ffffff',
  },

  cabecera: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    marginBottom: 28,
  },

  seccion: {
    fontSize: 10,
    fontWeight: 900,
    color: '#ff6a00',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  titulo: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: -0.5,
  },

  subtitulo: {
    margin: '8px 0 0',
    color: '#7890aa',
    fontSize: 13,
  },

  botonPrincipal: {
    border: 'none',
    background: '#ff6a00',
    color: '#ffffff',
    borderRadius: 7,
    padding: '12px 18px',
    fontWeight: 900,
    fontSize: 13,
    cursor: 'pointer',
  },

  tarjetaContador: {
    width: 320,
    minHeight: 125,
    padding: 20,
    borderRadius: 9,
    background: '#111820',
    border: '1px solid #26303b',
    borderLeft: '3px solid #ff6a00',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  etiqueta: {
    color: '#7590ad',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1.4,
  },

  numero: {
    fontSize: 32,
    fontWeight: 900,
    marginTop: 28,
  },

  iconoNaranja: {
    color: '#ff6a00',
    fontSize: 19,
  },

  buscadorCaja: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#0e141b',
    border: '1px solid #26303b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },

  lupa: {
    color: '#6f89a3',
    fontSize: 17,
  },

  buscador: {
    width: '100%',
    maxWidth: 520,
    background: '#080c11',
    border: '1px solid #293440',
    borderRadius: 6,
    padding: '10px 12px',
    color: '#ffffff',
    outline: 'none',
    fontSize: 13,
  },

  tablaCaja: {
    background: '#0e141b',
    border: '1px solid #26303b',
    borderRadius: 8,
    overflow: 'hidden',
  },

  tablaCabecera: {
    display: 'grid',
    gridTemplateColumns:
      '1.4fr 1.5fr 1fr .65fr .9fr .75fr .6fr',
    gap: 16,
    padding: '14px 16px',
    color: '#7089a4',
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 1.2,
    borderBottom: '1px solid #26303b',
  },

  fila: {
    display: 'grid',
    gridTemplateColumns:
      '1.4fr 1.5fr 1fr .65fr .9fr .75fr .6fr',
    gap: 16,
    padding: '15px 16px',
    alignItems: 'center',
    borderBottom: '1px solid #222b35',
    fontSize: 12,
  },

  nombrePrincipal: {
    fontWeight: 900,
    color: '#ffffff',
  },

  idTexto: {
    marginTop: 4,
    color: '#53687c',
    fontSize: 9,
  },

  textoNormal: {
    color: '#b9cee2',
    fontSize: 12,
  },

  textoSecundario: {
    color: '#62788d',
    fontSize: 9,
    marginTop: 4,
  },

  cantidad: {
    fontWeight: 900,
    fontSize: 15,
  },

  badgeEmpresa: {
    display: 'inline-block',
    background: 'rgba(255,106,0,.10)',
    border: '1px solid rgba(255,106,0,.35)',
    color: '#ff7a20',
    borderRadius: 5,
    padding: '6px 9px',
    fontWeight: 800,
    fontSize: 10,
  },

  badgeActivo: {
    display: 'inline-block',
    background: 'rgba(0,190,100,.12)',
    color: '#43dd8b',
    borderRadius: 20,
    padding: '6px 10px',
    fontWeight: 900,
    fontSize: 8,
  },

  badgeNeutro: {
    display: 'inline-block',
    background: '#18222d',
    color: '#8fa6bb',
    borderRadius: 20,
    padding: '6px 10px',
    fontWeight: 900,
    fontSize: 8,
  },

  botonEditar: {
    background: '#17212b',
    color: '#ffffff',
    border: '1px solid #293440',
    borderRadius: 6,
    padding: '7px 11px',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 11,
  },

  vacio: {
    textAlign: 'center',
    padding: 45,
    color: '#63788d',
    fontSize: 12,
  },

  alertaError: {
    background: 'rgba(180,30,30,.15)',
    border: '1px solid rgba(255,70,70,.35)',
    color: '#ff8d8d',
    padding: '11px 13px',
    borderRadius: 7,
    fontSize: 12,
    marginBottom: 15,
  },

  alertaExito: {
    background: 'rgba(0,180,90,.10)',
    border: '1px solid rgba(0,210,100,.25)',
    color: '#52dc94',
    padding: '11px 13px',
    borderRadius: 7,
    fontSize: 12,
    marginBottom: 15,
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.78)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modal: {
    width: 'min(760px, 96vw)',
    maxHeight: '92vh',
    background: '#111820',
    border: '1px solid #303b47',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 30px 100px rgba(0,0,0,.65)',
    display: 'flex',
    flexDirection: 'column',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '18px 24px',
    borderBottom: '1px solid #28323c',
  },

  modalTitulo: {
    margin: 0,
    fontSize: 21,
    fontWeight: 900,
  },

  modalSubtitulo: {
    marginTop: 5,
    color: '#71869b',
    fontSize: 11,
  },

  cerrar: {
    border: 'none',
    background: 'transparent',
    color: '#9caec0',
    fontSize: 25,
    cursor: 'pointer',
  },

  modalContenido: {
    padding: 24,
    overflowY: 'auto',
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 24px',
    borderTop: '1px solid #28323c',
    background: '#10161d',
  },

  labelCampo: {
    color: '#8199b4',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#080d12',
    color: '#ffffff',
    border: '1px solid #34404d',
    borderRadius: 6,
    padding: '11px 13px',
    fontSize: 13,
    outline: 'none',
  },

  dosColumnas: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },

  codigoFila: {
    display: 'flex',
    gap: 8,
  },

  botonSecundario: {
    background: '#17212b',
    color: '#ffffff',
    border: '1px solid #34404d',
    borderRadius: 6,
    padding: '0 16px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  botonCancelar: {
    background: '#1a232d',
    color: '#ffffff',
    border: '1px solid #34404d',
    borderRadius: 7,
    padding: '11px 18px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  ayuda: {
    marginTop: 6,
    color: '#5f7489',
    fontSize: 9,
  },
}
