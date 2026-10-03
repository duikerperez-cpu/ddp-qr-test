'use client'

import { useEffect, useMemo, useState } from 'react'
import { Empresa, Modelo, Producto } from '../types'

type Props = {
  initial?: Modelo | null
  empresas: Empresa[]
  productos: Producto[]
  onSave: (data: any) => Promise<void> | void
  onClose: () => void
}

export function ModeloForm({
  initial,
  empresas,
  productos,
  onSave,
  onClose
}: Props) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    empresa_id: '',
    producto_id: ''
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        nombre: initial.nombre || '',
        descripcion: initial.descripcion || '',
        categoria: initial.categoria || '',
        empresa_id: initial.empresa_id || '',
        producto_id: initial.producto_id || ''
      })
    } else {
      setForm({
        nombre: '',
        descripcion: '',
        categoria: '',
        empresa_id: '',
        producto_id: ''
      })
    }
  }, [initial])

  const productosFiltrados = useMemo(() => {
    if (!form.empresa_id) return []

    return productos.filter(
      producto => producto.empresa_id === form.empresa_id
    )
  }, [productos, form.empresa_id])

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 8,
    background: '#09090b',
    border: '1px solid #3f3f46',
    borderRadius: 8,
    padding: '11px 12px',
    color: '#f4f4f5',
    fontSize: 14,
    outline: 'none'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginTop: 16,
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5
  }

  const guardar = async () => {
    setError('')

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

    setGuardando(true)

    try {
      await onSave(form)
    } catch (err) {
      console.error(err)
      setError('No fue posible guardar el modelo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
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
          padding: 26,
          borderRadius: 14,
          border: '1px solid #27272a',
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 25px 70px rgba(0,0,0,.5)'
        }}
      >
        <div
          style={{
            color: '#ff6a00',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.5,
            marginBottom: 6
          }}
        >
          VINCULAB
        </div>

        <h3
          style={{
            margin: 0,
            color: '#ffffff',
            fontSize: 22,
            fontWeight: 700
          }}
        >
          {initial ? 'Editar modelo' : 'Nuevo modelo'}
        </h3>

        <label style={labelStyle}>EMPRESA</label>

        <select
          value={form.empresa_id}
          onChange={e =>
            setForm({
              ...form,
              empresa_id: e.target.value,
              producto_id: ''
            })
          }
          style={inputStyle}
        >
          <option value="">Seleccionar empresa...</option>

          {empresas.map(empresa => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.razon_social}
            </option>
          ))}
        </select>

        <label style={labelStyle}>PRODUCTO</label>

        <select
          value={form.producto_id}
          disabled={!form.empresa_id}
          onChange={e =>
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
            {!form.empresa_id
              ? 'Primero selecciona una empresa...'
              : 'Seleccionar producto...'}
          </option>

          {productosFiltrados.map(producto => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre}
            </option>
          ))}
        </select>

        <label style={labelStyle}>NOMBRE DEL MODELO</label>

        <input
          value={form.nombre}
          onChange={e =>
            setForm({
              ...form,
              nombre: e.target.value
            })
          }
          placeholder="Ej: Escalera Industrial 3M"
          style={inputStyle}
        />

        <label style={labelStyle}>CATEGORÍA</label>

        <input
          value={form.categoria}
          onChange={e =>
            setForm({
              ...form,
              categoria: e.target.value
            })
          }
          placeholder="Ej: Estructuras metálicas"
          style={inputStyle}
        />

        <label style={labelStyle}>DESCRIPCIÓN</label>

        <textarea
          value={form.descripcion}
          onChange={e =>
            setForm({
              ...form,
              descripcion: e.target.value
            })
          }
          placeholder="Descripción del modelo"
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 11,
              borderRadius: 8,
              background: '#450a0a',
              border: '1px solid #7f1d1d',
              color: '#fecaca',
              fontSize: 12
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 22,
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            disabled={guardando}
            style={{
              background: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: 8,
              padding: '9px 16px',
              color: '#e4e4e7',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            disabled={guardando}
            style={{
              background: guardando ? '#78350f' : '#ff6a00',
              border: 0,
              borderRadius: 8,
              padding: '9px 18px',
              color: 'white',
              fontWeight: 700,
              cursor: guardando ? 'wait' : 'pointer'
            }}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
