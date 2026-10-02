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
  const [archivo, setArchivo] = useState<File | null>(null)

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

  // =========================================================
  // LIMPIAR NOMBRE DE ARCHIVO
  // =========================================================

  const limpiarNombre = (nombre: string) => {
    return nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
  }

  // =========================================================
  // GUARDAR EVENTO
  // =========================================================

  const guardar = async () => {

    if (!form.titulo.trim()) {
      alert('Debes ingresar un título para el evento.')
      return
    }

    setGuardando(true)

    try {

      let archivoUrl: string | null = null
      let archivoNombre: string | null = null
      let archivoTipo: string | null = null

      // =====================================================
      // 1. SUBIR EVIDENCIA A STORAGE
      // =====================================================

      if (archivo) {

        // Máximo 10 MB
        const maxSize = 10 * 1024 * 1024

        if (archivo.size > maxSize) {
          alert('El archivo supera el máximo permitido de 10 MB.')
          setGuardando(false)
          return
        }

        const nombreSeguro = limpiarNombre(archivo.name)

        const rutaArchivo =
          `${unidad.codigo}/${Date.now()}-${nombreSeguro}`

        const { error: uploadError } = await supabase.storage
          .from('evidencias-trazabilidad')
          .upload(
            rutaArchivo,
            archivo,
            {
              cacheControl: '3600',
              upsert: false,
              contentType: archivo.type || undefined
            }
          )

        if (uploadError) {
          console.error(
            'Error subiendo evidencia:',
            uploadError
          )

          alert(
            `No fue posible subir la evidencia: ${uploadError.message}`
          )

          setGuardando(false)
          return
        }

        // ===================================================
        // 2. OBTENER URL PÚBLICA
        // ===================================================

        const { data: publicData } = supabase.storage
          .from('evidencias-trazabilidad')
          .getPublicUrl(rutaArchivo)

        archivoUrl = publicData.publicUrl
        archivoNombre = archivo.name
        archivoTipo =
          archivo.type || 'application/octet-stream'
      }

      // =====================================================
      // 3. GUARDAR EVENTO
      // =====================================================

      const { error } = await supabase
        .from('eventos_trazabilidad')
        .insert({
          unidad_id: unidad.id,
          codigo_unidad: unidad.codigo,

          tipo_evento: form.tipo_evento,

          titulo: form.titulo.trim(),

          descripcion:
            form.descripcion.trim(),

          responsable:
            form.responsable.trim(),

          ubicacion:
            form.ubicacion.trim(),

          fecha_evento:
            new Date(
              form.fecha_evento
            ).toISOString(),

          archivo_url: archivoUrl,

          archivo_nombre: archivoNombre,

          archivo_tipo: archivoTipo
        })

      if (error) {

        console.error(
          'Error guardando evento:',
          error
        )

        alert(
          `No fue posible guardar el evento: ${error.message}`
        )

        setGuardando(false)
        return
      }

      // =====================================================
      // 4. EVENTO REGISTRADO
      // =====================================================

      alert(
        archivo
          ? 'Evento y evidencia registrados correctamente.'
          : 'Evento registrado correctamente.'
      )

      if (onSaved) {
        onSaved()
      }

      onClose()

    } catch (error: any) {

      console.error(
        'Error inesperado:',
        error
      )

      alert(
        `Ocurrió un error: ${
          error?.message ||
          'Error desconocido'
        }`
      )

    } finally {

      setGuardando(false)

    }
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
          boxShadow:
            '0 20px 60px rgba(0,0,0,.5)'
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
          Unidad:{' '}
          <strong style={{ color: 'white' }}>
            {unidad?.codigo}
          </strong>
        </div>

        {/* TIPO */}

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

        {/* TITULO */}

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

        {/* DESCRIPCIÓN */}

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

        {/* RESPONSABLE */}

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

        {/* UBICACIÓN */}

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

        {/* FECHA */}

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

        {/* ================================================= */}
        {/* EVIDENCIA */}
        {/* ================================================= */}

        <div
          style={{
            marginTop: 4,
            marginBottom: 20,
            padding: 16,
            background: '#111113',
            border: '1px dashed #52525b',
            borderRadius: 10
          }}
        >

          <label style={labelStyle}>
            Evidencia / Documento
          </label>

          <div
            style={{
              color: '#71717a',
              fontSize: 12,
              marginTop: 5,
              marginBottom: 12
            }}
          >
            Puedes adjuntar una fotografía,
            PDF u otro documento.
          </div>

          <input
            type="file"
            accept="image/*,.pdf"
            disabled={guardando}
            onChange={e => {

              const file =
                e.target.files?.[0] || null

              setArchivo(file)
            }}
            style={{
              width: '100%',
              color: 'white',
              fontSize: 13
            }}
          />

          {archivo && (

            <div
              style={{
                marginTop: 12,
                background: '#18181b',
                borderRadius: 8,
                padding: 10,
                border: '1px solid #27272a'
              }}
            >

              <div
                style={{
                  color: '#22c55e',
                  fontWeight: 800,
                  fontSize: 12
                }}
              >
                ✓ Evidencia seleccionada
              </div>

              <div
                style={{
                  color: '#d4d4d8',
                  marginTop: 5,
                  fontSize: 12,
                  wordBreak: 'break-word'
                }}
              >
                {archivo.name}
              </div>

              <div
                style={{
                  color: '#71717a',
                  marginTop: 3,
                  fontSize: 11
                }}
              >
                {(archivo.size / 1024 / 1024)
                  .toFixed(2)} MB
              </div>

            </div>

          )}

        </div>

        {/* BOTONES */}

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
              cursor: guardando
                ? 'not-allowed'
                : 'pointer'
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
              ? archivo
                ? 'Subiendo evidencia...'
                : 'Guardando...'
              : 'Guardar evento'}

          </button>

        </div>

      </div>

    </div>
  )
}
