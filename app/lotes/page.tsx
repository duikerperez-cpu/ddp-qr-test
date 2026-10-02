'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  getLotes,
  createLote,
  updateLote,
  deleteLote
} from './lib/queries'
import { LoteForm } from './components/LoteForm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LotesPage() {

  const [lotes, setLotes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const [loteAbierto, setLoteAbierto] = useState<string | null>(null)
  const [unidades, setUnidades] = useState<Record<string, any[]>>({})
  const [cargandoUnidades, setCargandoUnidades] = useState<string | null>(null)

  // =========================================================
  // CARGAR LOTES
  // =========================================================

  const load = async () => {

    const { data, error } = await getLotes()

    if (error) {
      console.error('Error cargando lotes:', error)
      return
    }

    if (data) {
      setLotes(data)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // =========================================================
  // GUARDAR LOTE
  // =========================================================

  const handleSave = async (data: any) => {

    if (editing) {
      await updateLote(editing.id, data)
    } else {
      await createLote(data)
    }

    setShowForm(false)
    setEditing(null)

    await load()
  }

  // =========================================================
  // CARGAR UNIDADES DEL LOTE
  // =========================================================

  const verUnidades = async (loteId: string) => {

    // Si está abierto, cerrarlo
    if (loteAbierto === loteId) {
      setLoteAbierto(null)
      return
    }

    setLoteAbierto(loteId)

    // Si ya fueron cargadas, no consultar nuevamente
    if (unidades[loteId]) {
      return
    }

    setCargandoUnidades(loteId)

    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .eq('lote_id', loteId)
      .order('numero_unidad', { ascending: true })

    setCargandoUnidades(null)

    if (error) {
      console.error('Error cargando unidades:', error)
      alert('No fue posible cargar las unidades del lote.')
      return
    }

    setUnidades(prev => ({
      ...prev,
      [loteId]: data || []
    }))
  }

  // =========================================================
  // BORRAR LOTE
  // =========================================================

  const borrar = async (id: string) => {

    const confirmar = confirm(
      '¿Seguro que deseas borrar este lote?'
    )

    if (!confirmar) return

    const { error } = await deleteLote(id)

    if (error) {
      console.error(error)
      alert('No fue posible borrar el lote.')
      return
    }

    setLoteAbierto(null)

    setUnidades(prev => {
      const copia = { ...prev }
      delete copia[id]
      return copia
    })

    await load()
  }

  // =========================================================
  // ESTILOS
  // =========================================================

  const boton = {
    background: '#27272a',
    border: 0,
    borderRadius: 6,
    padding: '7px 11px',
    color: 'white',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 14
  } as any

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (

    <div
      style={{
        padding: 24,
        background: '#09090b',
        minHeight: '100vh',
        color: 'white'
      }}
    >

      {/* CABECERA */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap'
        }}
      >

        <div>

          <h1 style={{ marginBottom: 5 }}>
            Lotes / QR - Trazabilidad
          </h1>

          <div
            style={{
              color: '#a1a1aa',
              fontSize: 14
            }}
          >
            Gestión de lotes e identidades digitales
          </div>

        </div>

        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          style={{
            background: '#ff6a00',
            border: 0,
            borderRadius: 8,
            padding: '11px 17px',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Nuevo Lote
        </button>

      </div>

      {/* TABLA */}

      <div
        style={{
          marginTop: 25,
          border: '1px solid #27272a',
          borderRadius: 12,
          overflowX: 'auto'
        }}
      >

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 900
          }}
        >

          <thead
            style={{
              background: '#18181b'
            }}
          >

            <tr>

              <th style={{ padding: 12, textAlign: 'left' }}>
                Código
              </th>

              <th style={{ padding: 12 }}>
                Cantidad
              </th>

              <th style={{ padding: 12 }}>
                Estado
              </th>

              <th style={{ padding: 12 }}>
                Unidades
              </th>

              <th style={{ padding: 12 }}>
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {lotes.map(l => (

              <>
                {/* ================= LOTE ================= */}

                <tr
                  key={l.id}
                  style={{
                    borderTop: '1px solid #27272a'
                  }}
                >

                  <td style={{ padding: 12 }}>

                    <a
                      href={`/p/${l.codigo}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#ff6a00',
                        fontWeight: 700
                      }}
                    >
                      {l.codigo}
                    </a>

                  </td>

                  <td
                    style={{
                      padding: 12,
                      textAlign: 'center'
                    }}
                  >
                    {l.cantidad}
                  </td>

                  <td
                    style={{
                      padding: 12,
                      textAlign: 'center'
                    }}
                  >

                    <span
                      style={{
                        background:
                          l.estado === 'activo'
                            ? '#14532d'
                            : '#27272a',

                        padding: '5px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700
                      }}
                    >
                      {l.estado}
                    </span>

                  </td>

                  <td
                    style={{
                      padding: 12,
                      textAlign: 'center'
                    }}
                  >

                    <button
                      onClick={() => verUnidades(l.id)}
                      style={{
                        ...boton,
                        background:
                          loteAbierto === l.id
                            ? '#ff6a00'
                            : '#27272a'
                      }}
                    >

                      {loteAbierto === l.id
                        ? 'Ocultar unidades'
                        : `Ver unidades (${l.cantidad})`
                      }

                    </button>

                  </td>

                  <td style={{ padding: 12 }}>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap'
                      }}
                    >

                      <button
                        onClick={() => {
                          setEditing(l)
                          setShowForm(true)
                        }}
                        style={boton}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => borrar(l.id)}
                        style={{
                          ...boton,
                          background: '#7f1d1d'
                        }}
                      >
                        Borrar
                      </button>

                    </div>

                  </td>

                </tr>

                {/* ================= UNIDADES ================= */}

                {loteAbierto === l.id && (

                  <tr key={`${l.id}-unidades`}>

                    <td
                      colSpan={5}
                      style={{
                        padding: 0,
                        background: '#111113'
                      }}
                    >

                      <div
                        style={{
                          padding: 20
                        }}
                      >

                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#a1a1aa',
                            marginBottom: 14,
                            letterSpacing: 1
                          }}
                        >
                          IDENTIDADES DIGITALES DEL LOTE
                        </div>

                        {cargandoUnidades === l.id && (

                          <div
                            style={{
                              color: '#a1a1aa',
                              padding: 15
                            }}
                          >
                            Cargando unidades...
                          </div>

                        )}

                        {cargandoUnidades !== l.id &&
                          (unidades[l.id] || []).length === 0 && (

                          <div
                            style={{
                              color: '#a1a1aa',
                              padding: 15
                            }}
                          >
                            Este lote no tiene unidades individuales.
                          </div>

                        )}

                        {(unidades[l.id] || []).map(u => {

                          const url =
                            `https://vinculab.cl/u/${encodeURIComponent(u.codigo)}`

                          const qr =
                            `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`

                          const qrGrande =
                            `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(url)}`

                          return (

                            <div
                              key={u.id}
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  '80px minmax(240px,1fr) auto',
                                gap: 18,
                                alignItems: 'center',
                                background: '#18181b',
                                border: '1px solid #27272a',
                                borderRadius: 12,
                                padding: 14,
                                marginBottom: 10
                              }}
                            >

                              {/* QR */}

                              <div
                                style={{
                                  background: 'white',
                                  padding: 5,
                                  borderRadius: 8,
                                  width: 72,
                                  height: 72
                                }}
                              >

                                <img
                                  src={qr}
                                  alt={`QR ${u.codigo}`}
                                  style={{
                                    width: 62,
                                    height: 62,
                                    display: 'block'
                                  }}
                                />

                              </div>

                              {/* DATOS */}

                              <div>

                                <div
                                  style={{
                                    color: '#ff6a00',
                                    fontWeight: 900,
                                    fontSize: 16
                                  }}
                                >
                                  {u.codigo}
                                </div>

                                <div
                                  style={{
                                    marginTop: 5,
                                    color: '#a1a1aa',
                                    fontSize: 12
                                  }}
                                >
                                  Unidad Nº {u.numero_unidad}
                                  {' • '}
                                  Estado: {u.estado}
                                </div>

                              </div>

                              {/* ACCIONES */}

                              <div
                                style={{
                                  display: 'flex',
                                  gap: 8,
                                  flexWrap: 'wrap',
                                  justifyContent: 'flex-end'
                                }}
                              >

                                <a
                                  href={`/u/${encodeURIComponent(u.codigo)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    ...boton,
                                    background: '#ff6a00',
                                    fontWeight: 700
                                  }}
                                >
                                  Ver identidad
                                </a>

                                <a
                                  href={qrGrande}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={boton}
                                >
                                  Ver QR
                                </a>

                              </div>

                            </div>

                          )
                        })}

                      </div>

                    </td>

                  </tr>

                )}

              </>

            ))}

          </tbody>

        </table>

      </div>

      {/* FORMULARIO */}

      {showForm && (

        <LoteForm
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />

      )}

    </div>

  )
}
