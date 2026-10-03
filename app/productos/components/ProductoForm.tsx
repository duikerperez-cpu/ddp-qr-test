'use client'

import { useEffect, useState } from 'react'

type Empresa = {
  id: string
  razon_social: string | null
  empresa_nombre?: string | null
}

type Props = {
  initial?: any
  onSave: (data: any) => Promise<any>
  onClose: () => void

  esSuperadmin: boolean

  empresaUsuario?: Empresa | null

  empresas?: Empresa[]
}

export function ProductoForm({
  initial,
  onSave,
  onClose,
  esSuperadmin,
  empresaUsuario = null,
  empresas = []
}: Props) {

  const [form, setForm] = useState({
    nombre: initial?.nombre || '',
    categoria: initial?.categoria || '',
    sku: initial?.sku || '',

    empresa_id:
      initial?.empresa_id ||
      empresaUsuario?.id ||
      ''
  })

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  /* =========================================================
     SINCRONIZAR EMPRESA
  ========================================================= */

  useEffect(() => {
    if (
      !esSuperadmin &&
      empresaUsuario?.id
    ) {
      setForm((actual) => ({
        ...actual,
        empresa_id: empresaUsuario.id
      }))
    }
  }, [
    esSuperadmin,
    empresaUsuario?.id
  ])

  /* =========================================================
     ESTILOS
  ========================================================= */

  const inputStyle: React.CSSProperties = {
    width: '100%',
    marginTop: 8,
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: 8,
    padding: '11px 12px',
    color: 'white',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: 13
  }

  const labelStyle: React.CSSProperties = {
    color: '#d4d4d8',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1,
    display: 'block',
    marginTop: 16
  }

  /* =========================================================
     GUARDAR
  ========================================================= */

  const guardar = async () => {
    setError('')

    if (!form.nombre.trim()) {
      setError(
        'Debes ingresar el nombre del producto.'
      )
      return
    }

    /*
      Solo al crear un producto el superadmin
      necesita seleccionar empresa.

      Al editar NO permitimos cambiar la empresa.
    */

    if (
      !initial &&
      esSuperadmin &&
      !form.empresa_id
    ) {
      setError(
        'Debes seleccionar la empresa del producto.'
      )
      return
    }

    try {
      setSaving(true)

      const resultado = await onSave({
        nombre: form.nombre.trim(),
        categoria: form.categoria.trim(),
        sku: form.sku.trim(),

        /*
          El servidor lógico de queries.ts decidirá
          si realmente utiliza empresa_id.
        */

        empresa_id:
          form.empresa_id || null
      })

      /*
        Si onSave devuelve un resultado Supabase
        con error, lo mostramos.
      */

      if (resultado?.error) {
        setError(
          resultado.error.message ||
          'No fue posible guardar el producto.'
        )
      }

    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
        'No fue posible guardar el producto.'
      )

    } finally {
      setSaving(false)
    }
  }

  /* =========================================================
     NOMBRE EMPRESA
  ========================================================= */

  const nombreEmpresaUsuario =
    empresaUsuario?.razon_social ||
    empresaUsuario?.empresa_nombre ||
    'Empresa asociada'

  const empresaProductoActual =
    empresas.find(
      (empresa) =>
        empresa.id === initial?.empresa_id
    )

  const nombreEmpresaProductoActual =
    empresaProductoActual?.razon_social ||
    empresaProductoActual?.empresa_nombre ||
    initial?.empresa_id ||
    'Empresa'

  /* =========================================================
     UI
  ========================================================= */

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
          padding: 24,
          borderRadius: 14,
          border: '1px solid #27272a',
          width: '100%',
          maxWidth: 440,
          boxShadow:
            '0 25px 70px rgba(0,0,0,.45)'
        }}
      >
        {/* ENCABEZADO */}

        <div
          style={{
            color: '#ff6a00',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 1.5,
            marginBottom: 7
          }}
        >
          VINCULAB
        </div>

        <h3
          style={{
            margin: 0,
            color: 'white',
            fontSize: 21
          }}
        >
          {initial
            ? 'Editar producto'
            : 'Nuevo producto'}
        </h3>

        <div
          style={{
            marginTop: 8,
            marginBottom: 8,
            color: '#a1a1aa',
            fontSize: 12,
            lineHeight: 1.5
          }}
        >
          {esSuperadmin
            ? initial
              ? 'Editando producto como Superadministrador de Vinculab.'
              : 'Selecciona la empresa propietaria del producto.'
            : `El producto quedará asociado a ${nombreEmpresaUsuario}.`}
        </div>

        {/* =========================================
            EMPRESA
        ========================================= */}

        <label style={labelStyle}>
          EMPRESA
        </label>

        {esSuperadmin && !initial ? (

          <select
            value={form.empresa_id}
            disabled={saving}
            onChange={(e) =>
              setForm({
                ...form,
                empresa_id: e.target.value
              })
            }
            style={{
              ...inputStyle,
              cursor: 'pointer'
            }}
          >
            <option value="">
              Seleccionar empresa...
            </option>

            {empresas.map((empresa) => (
              <option
                key={empresa.id}
                value={empresa.id}
              >
                {empresa.razon_social ||
                  empresa.empresa_nombre ||
                  empresa.id}
              </option>
            ))}
          </select>

        ) : (

          <div
            style={{
              ...inputStyle,
              background: '#111113',
              color: '#a1a1aa',
              cursor: 'not-allowed'
            }}
          >
            {esSuperadmin
              ? nombreEmpresaProductoActual
              : nombreEmpresaUsuario}
          </div>

        )}

        {!esSuperadmin && (
          <div
            style={{
              color: '#71717a',
              fontSize: 10,
              marginTop: 6,
              lineHeight: 1.4
            }}
          >
            La empresa se determina automáticamente
            según tu cuenta.
          </div>
        )}

        {/* =========================================
            NOMBRE
        ========================================= */}

        <label style={labelStyle}>
          NOMBRE DEL PRODUCTO
        </label>

        <input
          placeholder="Ej: Escalera industrial"
          value={form.nombre}
          disabled={saving}
          onChange={(e) =>
            setForm({
              ...form,
              nombre: e.target.value
            })
          }
          style={inputStyle}
        />

        {/* =========================================
            CATEGORÍA
        ========================================= */}

        <label style={labelStyle}>
          CATEGORÍA
        </label>

        <input
          placeholder="Ej: Estructuras metálicas"
          value={form.categoria}
          disabled={saving}
          onChange={(e) =>
            setForm({
              ...form,
              categoria: e.target.value
            })
          }
          style={inputStyle}
        />

        {/* =========================================
            SKU
        ========================================= */}

        <label style={labelStyle}>
          SKU
        </label>

        <input
          placeholder="Ej: GHERC-0001"
          value={form.sku}
          disabled={saving}
          onChange={(e) =>
            setForm({
              ...form,
              sku: e.target.value
            })
          }
          style={inputStyle}
        />

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: 16,
              background: '#450a0a',
              border: '1px solid #7f1d1d',
              color: '#fecaca',
              padding: 11,
              borderRadius: 8,
              fontSize: 12,
              lineHeight: 1.5
            }}
          >
            {error}
          </div>
        )}

        {/* BOTONES */}

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 22,
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: '#27272a',
              border:
                '1px solid #3f3f46',
              borderRadius: 8,
              padding: '9px 15px',
              color: 'white',
              cursor:
                saving
                  ? 'not-allowed'
                  : 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            style={{
              background:
                saving
                  ? '#78350f'
                  : '#ff6a00',
              border: 0,
              borderRadius: 8,
              padding: '9px 16px',
              color: 'white',
              fontWeight: 800,
              cursor:
                saving
                  ? 'wait'
                  : 'pointer'
            }}
          >
            {saving
              ? 'Guardando...'
              : initial
                ? 'Guardar cambios'
                : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
