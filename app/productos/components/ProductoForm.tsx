'use client'

import { useState } from 'react'

export function ProductoForm({
  initial,
  onSave,
  onClose
}: any) {

  const [form, setForm] = useState({
    nombre: initial?.nombre || '',
    categoria: initial?.categoria || '',
    sku: initial?.sku || ''
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const s = {
    width: '100%',
    marginTop: 8,
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: 8,
    padding: '10px',
    color: 'white',
    boxSizing: 'border-box'
  } as React.CSSProperties

  const guardar = async () => {

    setError('')

    if (!form.nombre.trim()) {
      setError('Debes ingresar el nombre del producto.')
      return
    }

    try {

      setSaving(true)

      await onSave({
        nombre: form.nombre.trim(),
        categoria: form.categoria.trim(),
        sku: form.sku.trim()
      })

    } catch (err) {

      console.error(err)
      setError('No fue posible guardar el producto.')

    } finally {

      setSaving(false)

    }
  }

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
          maxWidth: 400
        }}
      >

        <h3
          style={{
            margin: 0,
            color: 'white'
          }}
        >
          {initial ? 'Editar' : 'Nuevo'} Producto
        </h3>

        <div
          style={{
            marginTop: 8,
            marginBottom: 16,
            color: '#a1a1aa',
            fontSize: 12
          }}
        >
          El producto será asociado automáticamente a tu empresa.
        </div>

        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) =>
            setForm({
              ...form,
              nombre: e.target.value
            })
          }
          style={s}
        />

        <input
          placeholder="Categoría"
          value={form.categoria}
          onChange={(e) =>
            setForm({
              ...form,
              categoria: e.target.value
            })
          }
          style={s}
        />

        <input
          placeholder="SKU"
          value={form.sku}
          onChange={(e) =>
            setForm({
              ...form,
              sku: e.target.value
            })
          }
          style={s}
        />

        {error && (

          <div
            style={{
              marginTop: 12,
              background: '#450a0a',
              border: '1px solid #7f1d1d',
              color: '#fecaca',
              padding: 10,
              borderRadius: 8,
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
            marginTop: 16,
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
              padding: '8px 14px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            disabled={saving}
            style={{
              background: saving
                ? '#78350f'
                : '#ff6a00',
              border: 0,
              borderRadius: 8,
              padding: '8px 14px',
              color: 'white',
              fontWeight: 700,
              cursor: saving
                ? 'wait'
                : 'pointer'
            }}
          >
            {saving
              ? 'Guardando...'
              : 'Guardar'}
          </button>

        </div>

      </div>

    </div>

  )
}
