'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function EventoForm({
  unidad,
  onClose,
  onSaved
}: any) {

  const [guardando, setGuardando] = useState(false)

  const [form, setForm] = useState({
    tipo_evento: 'control_calidad',
    titulo: '',
    descripcion: '',
    responsable: '',
    ubicacion: '',
    fecha_evento: new Date().toISOString().slice(0, 16)
  })

  const inputStyle = {
    width: '100%',
    marginTop: 6,
    marginBottom: 14,
    background: '#09090b',
    border: '1px solid #3f3f46',
    borderRadius: 8,
    padding: '11px 12px',
    color: 'white',
    fontSize: 14,
    outline: 'none'
  } as any

  const labelStyle = {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: 800,
    letterSpacing: .6,
    textTransform: 'uppercase'
  } as any

  const guardar = async () => {

    if (!form.titulo.trim()) {
      alert('Debes ingresar un título para el evento.')
      return
    }

    setGuardando(true)

    const { error } = await supabase
      .from('eventos_trazabilidad')
      .insert({
        unidad_id: unidad.id,
        codigo_unidad: unidad.codigo,
        tipo_evento: form.tipo_evento,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        responsable: form.responsable.trim(),
        ubicacion: form.ubicacion.trim(),
        fecha_evento: new Date(form.fecha_evento).toISOString()
      })

    setGuardando(false)

    if (error) {
      console.error('Error guardando evento:', error)
      alert(`No fue posible guardar el evento: ${error.message}`)
      return
    }

    alert('Evento registrado correctamente.')

    if (onSaved) {
      onSaved()
    }

    onClose()
  }

  return (

    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.78)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}
    >

      <div
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,.5)'
        }}
      >

        <div
          style={{
            color: '#ff6a00',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1
          }}
        >
          TRAZABILIDAD VINCULAB
        </div>

        <h2
          style={{
            margin: '6px 0 4px',
            color: 'white'
          }}
        >
          Nuevo evento
        </h2>

        <div
          style={{
            color: '#a1a1aa',
            fontSize: 13,
            marginBottom: 22
          }}
        >
          Unidad: <strong style={{color:'white'}}>
            {unidad?.codigo}
          </strong>
        </div>

        <label style={labelStyle}>
          Tipo de evento
        </label>

        <select
          value={form.tipo_evento}
          onChange={e =>
            setForm({
              ...form,
              tipo_evento: e.target.value
            })
          }
          style={inputStyle}
        >
          <option value="fabricacion">
            Fabricación
          </option>

          <option value="control_calidad">
            Control de calidad
          </option>

          <option value="despacho">
            Despacho
          </option>

          <option value="recepcion">
            Recepción
          </option>

          <option value="instalacion">
            Instalación
          </option>

          <option value="mantenimiento">
            Mantenimiento
          </option>

          <option value="reparacion">
            Reparación
          </option>

          <option value="transferencia">
            Cambio de propietario
          </option>

          <option value="baja">
            Baja
          </option>

          <option value="otro">
            Otro
          </option>

        </select>

        <label style={labelStyle}>
          Título
        </label>

        <input
          value={form.titulo}
          onChange={e =>
            setForm({
              ...form,
              titulo: e.target.value
            })
          }
          placeholder="Ej: Control de calidad aprobado"
          style={inputStyle}
        />

        <label style={labelStyle}>
          Descripción
        </label>

        <textarea
          value={form.descripcion}
          onChange={e =>
            setForm({
              ...form,
              descripcion: e.target.value
            })
          }
          placeholder="Describe lo ocurrido con esta unidad..."
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical'
          }}
        />

        <label style={labelStyle}>
          Responsable
        </label>

        <input
          value={form.responsable}
          onChange={e =>
            setForm({
              ...form,
              responsable: e.target.value
            })
          }
          placeholder="Ej: Hercom Chile"
          style={inputStyle}
        />

        <label style={labelStyle}>
          Ubicación
        </label>

        <input
          value={form.ubicacion}
          onChange={e =>
            setForm({
              ...form,
              ubicacion: e.target.value
            })
          }
          placeholder="Ej: San Felipe, Chile"
          style={inputStyle}
        />

        <label style={labelStyle}>
          Fecha del evento
        </label>

        <input
          type="datetime-local"
          value={form.fecha_evento}
          onChange={e =>
            setForm({
              ...form,
              fecha_evento: e.target.value
            })
          }
          style={inputStyle}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 8
          }}
        >

          <button
            onClick={onClose}
            disabled={guardando}
            style={{
              background: '#27272a',
              border: 0,
              borderRadius: 8,
              padding: '10px 16px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            disabled={guardando}
            style={{
              background: guardando
                ? '#78350f'
                : '#ff6a00',
              border: 0,
              borderRadius: 8,
              padding: '10px 16px',
              color: 'white',
              fontWeight: 800,
              cursor: guardando
                ? 'wait'
                : 'pointer'
            }}
          >
            {guardando
              ? 'Guardando...'
              : 'Guardar evento'}
          </button>

        </div>

      </div>

    </div>
  )
}
