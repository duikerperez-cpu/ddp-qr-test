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
  pais?: string | null
  sector?: string | null
  estado?: string | null
  nombre?: string | null
  name?: string | null
  empresa_nombre?: string | null
  rut?: string | null
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [form, setForm] = useState({
    razon_social: '',
    rut: '',
    pais: 'Chile',
    sector: '',
  })

  const cargarEmpresas = async () => {
    setCargando(true)
    setError('')

    const { data, error } = await supabase
      .from('empresas')
      .select('*')

    if (error) {
      console.error(error)
      setError(error.message)
      setEmpresas([])
    } else {
      setEmpresas(data || [])
    }

    setCargando(false)
  }

  useEffect(() => {
    cargarEmpresas()
  }, [])

  const nombreEmpresa = (empresa: Empresa) => {
    return (
      empresa.razon_social ||
      empresa.nombre ||
      empresa.name ||
      empresa.empresa_nombre ||
      'Empresa sin nombre'
    )
  }

  const empresasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim()

    if (!texto) return empresas

    return empresas.filter((empresa) => {
      const contenido = [
        empresa.razon_social,
        empresa.nombre,
        empresa.name,
        empresa.empresa_nombre,
        empresa.rut,
        empresa.pais,
        empresa.sector,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [empresas, busqueda])

  const crearEmpresa = async () => {
    if (!form.razon_social.trim()) {
      alert('Debes ingresar la razón social.')
      return
    }

    setGuardando(true)

    const { error } = await supabase
      .from('empresas')
      .insert({
        razon_social: form.razon_social.trim(),
        nombre: form.razon_social.trim(),
        name: form.razon_social.trim(),
        empresa_nombre: form.razon_social.trim(),
        rut: form.rut.trim() || null,
        pais: form.pais.trim() || null,
        sector: form.sector.trim() || null,
        estado: 'activa',
      })

    setGuardando(false)

    if (error) {
      console.error(error)
      alert(`No fue posible crear la empresa: ${error.message}`)
      return
    }

    setForm({
      razon_social: '',
      rut: '',
      pais: 'Chile',
      sector: '',
    })

    setMostrarFormulario(false)
    await cargarEmpresas()
  }

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
            Empresas
          </h1>

          <div
            style={{
              color: '#7d8b99',
              fontSize: 13,
              marginTop: 6,
            }}
          >
            Organizaciones registradas en Vinculab.
          </div>
        </div>

        <button
          onClick={() => setMostrarFormulario(true)}
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
          + Nueva empresa
        </button>
      </div>

      {/* TARJETA TOTAL */}

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
            EMPRESAS REGISTRADAS
          </div>

          <div
            style={{
              color: '#ff6a00',
              fontSize: 18,
            }}
          >
            ▥
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 29,
            fontWeight: 900,
          }}
        >
          {empresas.length}
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
            placeholder="Buscar empresa..."
            style={{
              width: '100%',
              maxWidth: 440,
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
            padding: '12px 16px',
            borderBottom: '1px solid #202a34',
            fontSize: 8,
            color: '#657382',
            fontWeight: 900,
            letterSpacing: 1.2,
          }}
        >
          <div>EMPRESA</div>
          <div>RUT</div>
          <div>SECTOR</div>
          <div>PAÍS</div>
          <div>ESTADO</div>
        </div>

        {cargando && (
          <div
            style={{
              padding: 35,
              textAlign: 'center',
              color: '#71808f',
              fontSize: 12,
            }}
          >
            Cargando empresas...
          </div>
        )}

        {!cargando && error && (
          <div
            style={{
              padding: 35,
              textAlign: 'center',
              color: '#ef4444',
              fontSize: 12,
            }}
          >
            Error al cargar empresas: {error}
          </div>
        )}

        {!cargando &&
          !error &&
          empresasFiltradas.length === 0 && (
            <div
              style={{
                padding: 35,
                textAlign: 'center',
                color: '#71808f',
                fontSize: 12,
              }}
            >
              No se encontraron empresas.
            </div>
          )}

        {!cargando &&
          !error &&
          empresasFiltradas.map((empresa) => (
            <div
              key={empresa.id}
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '2fr 1fr 1fr 1fr 120px',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid #1c252e',
                fontSize: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    color: '#f3f4f6',
                  }}
                >
                  {nombreEmpresa(empresa)}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    color: '#596674',
                    fontSize: 9,
                  }}
                >
                  ID: {empresa.id?.slice(0, 8)}
                </div>
              </div>

              <div style={{ color: '#a8b3be' }}>
                {empresa.rut || '—'}
              </div>

              <div style={{ color: '#a8b3be' }}>
                {empresa.sector || '—'}
              </div>

              <div style={{ color: '#a8b3be' }}>
                {empresa.pais || '—'}
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '5px 9px',
                    borderRadius: 20,
                    background:
                      empresa.estado === 'activa'
                        ? 'rgba(34,197,94,.12)'
                        : '#1b222a',
                    color:
                      empresa.estado === 'activa'
                        ? '#4ade80'
                        : '#8b98a5',
                    fontSize: 9,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                  }}
                >
                  {empresa.estado || 'Sin estado'}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL NUEVA EMPRESA */}

      {mostrarFormulario && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.75)',
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
              maxWidth: 480,
              background: '#11161d',
              border: '1px solid #29333e',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 25px 80px rgba(0,0,0,.6)',
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
              Nueva empresa
            </h2>

            <div
              style={{
                color: '#778491',
                fontSize: 12,
                marginBottom: 22,
              }}
            >
              Registra una nueva organización en la plataforma.
            </div>

            <Campo
              label="Razón social"
              value={form.razon_social}
              placeholder="Ej: Hercom Chile"
              onChange={(value) =>
                setForm({
                  ...form,
                  razon_social: value,
                })
              }
            />

            <Campo
              label="RUT"
              value={form.rut}
              placeholder="Ej: 76.123.456-7"
              onChange={(value) =>
                setForm({
                  ...form,
                  rut: value,
                })
              }
            />

            <Campo
              label="Sector"
              value={form.sector}
              placeholder="Ej: Industrial"
              onChange={(value) =>
                setForm({
                  ...form,
                  sector: value,
                })
              }
            />

            <Campo
              label="País"
              value={form.pais}
              placeholder="Chile"
              onChange={(value) =>
                setForm({
                  ...form,
                  pais: value,
                })
              }
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 8,
              }}
            >
              <button
                onClick={() => setMostrarFormulario(false)}
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
                onClick={crearEmpresa}
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
                  : 'Crear empresa'}
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
      <label
        style={{
          display: 'block',
          fontSize: 9,
          color: '#7c8996',
          fontWeight: 900,
          letterSpacing: 1,
          marginBottom: 7,
        }}
      >
        {label.toUpperCase()}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: '#080b10',
          border: '1px solid #29333e',
          borderRadius: 6,
          padding: '11px 12px',
          color: 'white',
          outline: 'none',
          fontSize: 12,
        }}
      />
    </div>
  )
}
