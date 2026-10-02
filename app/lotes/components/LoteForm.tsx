'use client'

import { useEffect, useMemo, useState } from 'react'
import { getEmpresas, getProductos, getModelos } from '../lib/queries'

export function LoteForm({ initial, onSave, onClose }: any) {

  const [form, setForm] = useState({
    codigo: initial?.codigo || '',
    cantidad: initial?.cantidad || 1,
    empresa_id: initial?.empresa_id || '',
    producto_id: initial?.producto_id || '',
    modelo_id: initial?.modelo_id || '',
    estado: initial?.estado || 'activo'
  })

  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // =========================================
  // CARGAR DATOS
  // =========================================

  useEffect(() => {

    const cargarDatos = async () => {

      try {

        setLoading(true)
        setError('')

        const [empresasRes, productosRes, modelosRes] =
          await Promise.all([
            getEmpresas(),
            getProductos(),
            getModelos()
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

        setEmpresas(empresasRes.data || [])
        setProductos(productosRes.data || [])
        setModelos(modelosRes.data || [])

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

    cargarDatos()

  }, [])

  // =========================================
  // PRODUCTOS DE LA EMPRESA
  // =========================================

  const productosFiltrados = useMemo(() => {

    if (!form.empresa_id) return []

    return productos.filter(
      (producto: any) =>
        producto.empresa_id === form.empresa_id
    )

  }, [productos, form.empresa_id])

  // =========================================
  // MODELOS DEL PRODUCTO
  // =========================================

  const modelosFiltrados = useMemo(() => {

    if (!form.empresa_id || !form.producto_id) {
      return []
    }

    return modelos.filter(
      (modelo: any) =>
        modelo.empresa_id === form.empresa_id &&
        modelo.producto_id === form.producto_id
    )

  }, [
    modelos,
    form.empresa_id,
    form.producto_id
  ])

  // =========================================
  // CAMBIAR EMPRESA
  // =========================================

  const cambiarEmpresa = (empresaId: string) => {

    setForm(prev => ({
      ...prev,
      empresa_id: empresaId,
      producto_id: '',
      modelo_id: ''
    }))

  }

  // =========================================
  // CAMBIAR PRODUCTO
  // =========================================

  const cambiarProducto = (productoId: string) => {

    setForm(prev => ({
      ...prev,
      producto_id: productoId,
      modelo_id: ''
    }))

  }

  // =========================================
  // GUARDAR
  // =========================================

  const guardar = async () => {

    setError('')

    if (!form.codigo.trim()) {
      setError('Debes ingresar un código para el lote.')
      return
    }

    if (!form.empresa_id) {
      setError('Debes seleccionar una empresa.')
      return
    }

    if (!form.producto_id) {
      setError('Debes seleccionar un producto.')
      return
    }

    if (!form.modelo_id) {
      setError('Debes seleccionar un modelo.')
      return
    }

    if (!form.cantidad || Number(form.cantidad) < 1) {
      setError('La cantidad debe ser mayor a 0.')
      return
    }

    try {

      setSaving(true)

      await onSave({
        ...form,
        codigo: form.codigo.trim(),
        cantidad: Number(form.cantidad)
      })

    } catch (err: any) {

      console.error(err)

      setError(
        err?.message ||
        'No fue posible guardar el lote.'
      )

    } finally {

      setSaving(false)

    }

  }

  // =========================================
  // ESTILOS
  // =========================================

  const inputStyle = {
    width: '100%',
    marginTop: 8,
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: 8,
    padding: '11px',
    color: 'white',
    outline: 'none'
  } as any

  return (

    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20
      }}
    >

      <div
        style={{
          background: '#18181b',
          padding: 24,
          borderRadius: 12,
          border: '1px solid #27272a',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,.5)'
        }}
      >

        <h3
          style={{
            margin: 0,
            color: 'white'
          }}
        >
          {initial ? 'Editar Lote / QR' : 'Nuevo Lote / QR'}
        </h3>

        <p
          style={{
            color: '#a1a1aa',
            fontSize: 12,
            marginTop: 6,
            marginBottom: 16
          }}
        >
          Vincula el lote con empresa, producto y modelo.
        </p>

        {error && (

          <div
            style={{
              background: '#450a0a',
              border: '1px solid #7f1d1d',
              color: '#fecaca',
              padding: 10,
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 10
            }}
          >
            {error}
          </div>

        )}

        <input
          placeholder="Código Ej: LOTE-00001"
          value={form.codigo}
          onChange={e =>
            setForm({
              ...form,
              codigo: e.target.value
            })
          }
          style={inputStyle}
        />

        <input
          type="number"
          min="1"
          placeholder="Cantidad"
          value={form.cantidad}
          onChange={e =>
            setForm({
              ...form,
              cantidad: e.target.value
            })
          }
          style={inputStyle}
        />

        {/* EMPRESA */}

        <select
          value={form.empresa_id}
          onChange={e =>
            cambiarEmpresa(e.target.value)
          }
          style={inputStyle}
          disabled={loading}
        >

          <option value="">
            {loading
              ? 'Cargando empresas...'
              : 'Seleccionar empresa'}
          </option>

          {empresas.map((empresa: any) => (

            <option
              key={empresa.id}
              value={empresa.id}
            >
              {empresa.razon_social}
            </option>

          ))}

        </select>

        {/* PRODUCTO */}

        <select
          value={form.producto_id}
          onChange={e =>
            cambiarProducto(e.target.value)
          }
          style={inputStyle}
          disabled={
            loading ||
            !form.empresa_id
          }
        >

          <option value="">

            {!form.empresa_id
              ? 'Primero selecciona una empresa'
              : productosFiltrados.length === 0
              ? 'Esta empresa no tiene productos'
              : 'Seleccionar producto'}

          </option>

          {productosFiltrados.map(
            (producto: any) => (

              <option
                key={producto.id}
                value={producto.id}
              >
                {producto.nombre}
              </option>

            )
          )}

        </select>

        {/* MODELO */}

        <select
          value={form.modelo_id}
          onChange={e =>
            setForm({
              ...form,
              modelo_id: e.target.value
            })
          }
          style={inputStyle}
          disabled={
            loading ||
            !form.producto_id
          }
        >

          <option value="">

            {!form.producto_id
              ? 'Primero selecciona un producto'
              : modelosFiltrados.length === 0
              ? 'Este producto no tiene modelos'
              : 'Seleccionar modelo'}

          </option>

          {modelosFiltrados.map(
            (modelo: any) => (

              <option
                key={modelo.id}
                value={modelo.id}
              >
                {modelo.nombre}
              </option>

            )
          )}

        </select>

        {/* ESTADO */}

        <select
          value={form.estado}
          onChange={e =>
            setForm({
              ...form,
              estado: e.target.value
            })
          }
          style={inputStyle}
        >

          <option value="activo">
            Activo
          </option>

          <option value="inactivo">
            Inactivo
          </option>

          <option value="vendido">
            Vendido
          </option>

        </select>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 20,
            justifyContent: 'flex-end'
          }}
        >

          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: '#27272a',
              border: 0,
              borderRadius: 8,
              padding: '9px 16px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            disabled={saving || loading}
            style={{
              background:
                saving || loading
                  ? '#78350f'
                  : '#ff6a00',
              border: 0,
              borderRadius: 8,
              padding: '9px 16px',
              color: 'white',
              fontWeight: 700,
              cursor:
                saving || loading
                  ? 'not-allowed'
                  : 'pointer'
            }}
          >
            {saving
              ? 'Guardando...'
              : initial
              ? 'Guardar cambios'
              : 'Crear lote'}
          </button>

        </div>

      </div>

    </div>

  )

}
