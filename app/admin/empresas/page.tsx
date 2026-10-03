'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Empresa = {
  id: string
  nombre: string
  created_at?: string
  [key: string]: any
}

/* =========================================================
   ICONOS SVG
========================================================= */

function Icon({
  type,
  size = 16
}: {
  type: 'empresa' | 'buscar' | 'editar' | 'eliminar' | 'cerrar'
  size?: number
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  }

  if (type === 'empresa') {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" />
        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
        <path d="M9 21v-3h6v3" />
      </svg>
    )
  }

  if (type === 'buscar') {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    )
  }

  if (type === 'editar') {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    )
  }

  if (type === 'eliminar') {
    return (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 15H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/* =========================================================
   PÁGINA
========================================================= */

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Empresa | null>(null)
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarEmpresas()
  }, [])

  /* =====================================================
     CARGAR
  ===================================================== */

  async function cargarEmpresas() {
    try {
      setCargando(true)

      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setError(error.message)
        return
      }

      setEmpresas(data || [])
    } finally {
      setCargando(false)
    }
  }

  /* =====================================================
     FILTRO
  ===================================================== */

  const empresasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return empresas

    return empresas.filter((empresa) =>
      String(empresa.nombre || '')
        .toLowerCase()
        .includes(texto)
    )
  }, [empresas, busqueda])

  /* =====================================================
     NUEVA EMPRESA
  ===================================================== */

  function nuevaEmpresa() {
    setEditando(null)
    setNombre('')
    setError('')
    setModal(true)
  }

  /* =====================================================
     EDITAR
  ===================================================== */

  function editarEmpresa(empresa: Empresa) {
    setEditando(empresa)
    setNombre(empresa.nombre || '')
    setError('')
    setModal(true)
  }

  /* =====================================================
     GUARDAR
  ===================================================== */

  async function guardarEmpresa() {
    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) {
      setError('Debes ingresar el nombre de la empresa.')
      return
    }

    try {
      setGuardando(true)
      setError('')

      if (editando) {
        const { error } = await supabase
          .from('empresas')
          .update({
            nombre: nombreLimpio
          })
          .eq('id', editando.id)

        if (error) {
          setError(error.message)
          return
        }
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert({
            nombre: nombreLimpio
          })

        if (error) {
          setError(error.message)
          return
        }
      }

      setModal(false)
      setEditando(null)
      setNombre('')

      await cargarEmpresas()

    } catch (err: any) {
      console.error(err)
      setError(
        err?.message ||
        'No fue posible guardar la empresa.'
      )
    } finally {
      setGuardando(false)
    }
  }

  /* =====================================================
     ELIMINAR
  ===================================================== */

  async function eliminarEmpresa(empresa: Empresa) {
    const confirmar = window.confirm(
      `¿Eliminar la empresa "${empresa.nombre}"?\n\n` +
      'Esta acción puede fallar si la empresa tiene productos, modelos o lotes asociados.'
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', empresa.id)

    if (error) {
      alert(
        `No fue posible eliminar la empresa:\n${error.message}`
      )
      return
    }

    await cargarEmpresas()
  }

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <div
      style={{
        width: '100%',
        color: '#ffffff'
      }}
    >

      {/* CABECERA */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 24
        }}
      >

        <div>
          <div
            style={{
              color: '#ff6a00',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1.4,
              marginBottom: 6
            }}
          >
            GESTIÓN
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800
            }}
          >
            Empresas
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#768088',
              fontSize: 12
            }}
          >
            Organizaciones registradas en Vinculab.
          </p>
        </div>

        <button
          onClick={nuevaEmpresa}
          style={{
            background: '#ff6a00',
            border: 0,
            color: '#ffffff',
            borderRadius: 6,
            padding: '10px 15px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          + Nueva empresa
        </button>

      </div>

      {/* RESUMEN */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 240px))',
          gap: 12,
          marginBottom: 18
        }}
      >

        <div
          style={{
            background: '#11161d',
            border: '1px solid #1e2731',
            borderLeft: '3px solid #ff6a00',
            borderRadius: 8,
            padding: 16
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#768088',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1
            }}
          >
            EMPRESAS REGISTRADAS

            <span style={{ color: '#ff6a00' }}>
              <Icon type="empresa" />
            </span>
          </div>

          <div
            style={{
              fontSize: 27,
              fontWeight: 900,
              marginTop: 12
            }}
          >
            {cargando ? '—' : empresas.length}
          </div>
        </div>

      </div>

      {/* BUSCADOR */}

      <div
        style={{
          background: '#0d1117',
          border: '1px solid #1e2731',
          borderRadius: 8,
          padding: 12,
          marginBottom: 14
        }}
      >
        <div
          style={{
            position: 'relative',
            maxWidth: 420
          }}
        >

          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#5a6570',
              display: 'flex'
            }}
          >
            <Icon type="buscar" size={15} />
          </span>

          <input
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            placeholder="Buscar empresa..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#090a0f',
              border: '1px solid #27303a',
              borderRadius: 6,
              color: '#ffffff',
              padding: '10px 12px 10px 38px',
              outline: 'none',
              fontSize: 12
            }}
          />

        </div>
      </div>

      {/* TABLA */}

      <div
        style={{
          background: '#11161d',
          border: '1px solid #1e2731',
          borderRadius: 8,
          overflow: 'hidden'
        }}
      >

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 1fr) 180px 150px',
            padding: '10px 16px',
            background: '#0d1117',
            borderBottom: '1px solid #1e2731',
            color: '#5a6570',
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: 1
          }}
        >
          <div>EMPRESA</div>
          <div>IDENTIFICADOR</div>
          <div style={{ textAlign: 'right' }}>
            ACCIONES
          </div>
        </div>

        {cargando ? (

          <div
            style={{
              padding: 30,
              textAlign: 'center',
              color: '#768088',
              fontSize: 12
            }}
          >
            Cargando empresas...
          </div>

        ) : empresasFiltradas.length === 0 ? (

          <div
            style={{
              padding: 34,
              textAlign: 'center',
              color: '#768088',
              fontSize: 12
            }}
          >
            No se encontraron empresas.
          </div>

        ) : (

          empresasFiltradas.map((empresa) => (

            <div
              key={empresa.id}
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'minmax(220px, 1fr) 180px 150px',
                alignItems: 'center',
                padding: '13px 16px',
                borderBottom: '1px solid #1e2731'
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >

                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: 'rgba(255,106,0,.09)',
                    border: '1px solid rgba(255,106,0,.20)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff6a00',
                    flexShrink: 0
                  }}
                >
                  <Icon
                    type="empresa"
                    size={15}
                  />
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  {empresa.nombre}
                </div>

              </div>

              <div
                style={{
                  color: '#768088',
                  fontSize: 10,
                  fontFamily: 'monospace'
                }}
              >
                {empresa.id?.slice(0, 12)}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 6
                }}
              >

                <button
                  onClick={() =>
                    editarEmpresa(empresa)
                  }
                  title="Editar"
                  style={{
                    width: 31,
                    height: 31,
                    background: '#181f27',
                    border: '1px solid #27303a',
                    borderRadius: 6,
                    color: '#ff6a00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Icon
                    type="editar"
                    size={14}
                  />
                </button>

                <button
                  onClick={() =>
                    eliminarEmpresa(empresa)
                  }
                  title="Eliminar"
                  style={{
                    width: 31,
                    height: 31,
                    background: '#181f27',
                    border: '1px solid #27303a',
                    borderRadius: 6,
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Icon
                    type="eliminar"
                    size={14}
                  />
                </button>

              </div>

            </div>

          ))

        )}

      </div>

      {/* ===================================================
          MODAL
      ==================================================== */}

      {modal && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >

          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#11161d',
              border: '1px solid #27303a',
              borderRadius: 10,
              boxShadow: '0 25px 60px rgba(0,0,0,.5)'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 18px',
                borderBottom: '1px solid #1e2731'
              }}
            >

              <div>
                <div
                  style={{
                    color: '#ff6a00',
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: 1.3
                  }}
                >
                  VINCULAB
                </div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    marginTop: 4
                  }}
                >
                  {editando
                    ? 'Editar empresa'
                    : 'Nueva empresa'}
                </div>
              </div>

              <button
                onClick={() => setModal(false)}
                style={{
                  background: 'transparent',
                  border: 0,
                  color: '#768088',
                  cursor: 'pointer',
                  display: 'flex'
                }}
              >
                <Icon
                  type="cerrar"
                  size={18}
                />
              </button>

            </div>

            <div
              style={{
                padding: 18
              }}
            >

              <label
                style={{
                  display: 'block',
                  color: '#768088',
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: 1,
                  marginBottom: 7
                }}
              >
                NOMBRE DE LA EMPRESA
              </label>

              <input
                autoFocus
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    guardarEmpresa()
                  }
                }}
                placeholder="Ej: HERCOM CHILE"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#090a0f',
                  border: '1px solid #27303a',
                  borderRadius: 6,
                  padding: '11px 12px',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />

              {error && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    background: '#2a1010',
                    border: '1px solid #5f1d1d',
                    borderRadius: 6,
                    color: '#fca5a5',
                    fontSize: 11
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 20
                }}
              >

                <button
                  onClick={() =>
                    setModal(false)
                  }
                  disabled={guardando}
                  style={{
                    background: '#181f27',
                    border: '1px solid #27303a',
                    color: '#ffffff',
                    borderRadius: 6,
                    padding: '9px 14px',
                    fontSize: 11,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={guardarEmpresa}
                  disabled={guardando}
                  style={{
                    background: guardando
                      ? '#7c3a0a'
                      : '#ff6a00',
                    border: 0,
                    color: '#ffffff',
                    borderRadius: 6,
                    padding: '9px 15px',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: guardando
                      ? 'wait'
                      : 'pointer'
                  }}
                >
                  {guardando
                    ? 'Guardando...'
                    : editando
                      ? 'Guardar cambios'
                      : 'Crear empresa'}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}
