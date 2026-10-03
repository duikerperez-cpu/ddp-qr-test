'use client'

import {
  useEffect,
  useState
} from 'react'

import {
  Modelo,
  ModeloAtributo
} from '../types'

import {
  getAtributosModelo,
  createAtributoModelo,
  updateAtributoModelo,
  deleteAtributoModelo
} from '../lib/queries'

type Props = {
  modelo: Modelo
  onClose: () => void
}

export function AtributosModelo({
  modelo,
  onClose
}: Props) {
  const [atributos, setAtributos] =
    useState<ModeloAtributo[]>([])

  const [editing, setEditing] =
    useState<ModeloAtributo | null>(null)

  const [showForm, setShowForm] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [guardando, setGuardando] =
    useState(false)

  const [error, setError] =
    useState('')

  const [form, setForm] = useState({
    nombre: '',
    valor: '',
    unidad: '',
    grupo: 'Especificaciones',
    orden: 0
  })

  const cargar = async () => {
    setLoading(true)

    const { data, error } =
      await getAtributosModelo(modelo.id)

    if (error) {
      console.error(error)
      setError(
        'No fue posible cargar los atributos.'
      )
    } else {
      setAtributos(
        (data || []) as ModeloAtributo[]
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    cargar()
  }, [modelo.id])

  const nuevo = () => {
    setEditing(null)

    setForm({
      nombre: '',
      valor: '',
      unidad: '',
      grupo: 'Especificaciones',
      orden: atributos.length * 10 + 10
    })

    setError('')
    setShowForm(true)
  }

  const editar = (
    atributo: ModeloAtributo
  ) => {
    setEditing(atributo)

    setForm({
      nombre: atributo.nombre || '',
      valor: atributo.valor || '',
      unidad: atributo.unidad || '',
      grupo:
        atributo.grupo ||
        'Especificaciones',
      orden: atributo.orden || 0
    })

    setError('')
    setShowForm(true)
  }

  const guardar = async () => {
    setError('')

    if (!form.nombre.trim()) {
      setError(
        'Debes ingresar el nombre del atributo.'
      )
      return
    }

    setGuardando(true)

    let resultado

    if (editing) {
      resultado =
        await updateAtributoModelo(
          editing.id,
          form
        )
    } else {
      resultado =
        await createAtributoModelo(
          modelo.id,
          form
        )
    }

    setGuardando(false)

    if (resultado.error) {
      setError(
        resultado.error.message
      )
      return
    }

    setShowForm(false)
    setEditing(null)

    await cargar()
  }

  const eliminar = async (
    atributo: ModeloAtributo
  ) => {
    const confirmar =
      window.confirm(
        `¿Eliminar el atributo "${atributo.nombre}"?`
      )

    if (!confirmar) return

    const resultado =
      await deleteAtributoModelo(
        atributo.id
      )

    if (resultado.error) {
      alert(
        'Error: ' +
          resultado.error.message
      )
      return
    }

    await cargar()
  }

  const grupos = atributos.reduce(
    (
      acumulado: Record<
        string,
        ModeloAtributo[]
      >,
      atributo
    ) => {
      const grupo =
        atributo.grupo ||
        'Especificaciones'

      if (!acumulado[grupo]) {
        acumulado[grupo] = []
      }

      acumulado[grupo].push(
        atributo
      )

      return acumulado
    },
    {}
  )

  const inputStyle:
    React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: '#09090b',
    border: '1px solid #3f3f46',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f4f4f5',
    fontSize: 13,
    outline: 'none'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'rgba(0,0,0,.82)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 760,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#18181b',
          border:
            '1px solid #27272a',
          borderRadius: 16,
          padding: 26
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: 20,
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div
              style={{
                color: '#ff6a00',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.4
              }}
            >
              ESPECIFICACIONES
            </div>

            <h2
              style={{
                margin: '6px 0 0',
                color: 'white',
                fontSize: 23
              }}
            >
              {modelo.nombre}
            </h2>

            <div
              style={{
                color: '#71717a',
                fontSize: 11,
                marginTop: 5
              }}
            >
              {modelo.id}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#27272a',
              border:
                '1px solid #3f3f46',
              color: 'white',
              borderRadius: 8,
              padding: '8px 13px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginTop: 28,
            marginBottom: 15
          }}
        >
          <div
            style={{
              color: '#a1a1aa',
              fontSize: 13
            }}
          >
            Atributos configurables del modelo
          </div>

          <button
            onClick={nuevo}
            style={{
              background: '#ff6a00',
              border: 0,
              borderRadius: 8,
              padding: '9px 15px',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Agregar atributo
          </button>
        </div>

        {loading && (
          <div
            style={{
              color: '#71717a',
              padding: 20
            }}
          >
            Cargando especificaciones...
          </div>
        )}

        {!loading &&
          atributos.length === 0 && (
            <div
              style={{
                border:
                  '1px dashed #3f3f46',
                borderRadius: 10,
                padding: 30,
                textAlign: 'center',
                color: '#71717a',
                fontSize: 13
              }}
            >
              Este modelo todavía no
              tiene atributos.
            </div>
          )}

        {!loading &&
          Object.entries(grupos).map(
            ([grupo, items]) => (
              <div
                key={grupo}
                style={{
                  marginBottom: 22
                }}
              >
                <div
                  style={{
                    color: '#ff6a00',
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform:
                      'uppercase',
                    letterSpacing: 1,
                    marginBottom: 8
                  }}
                >
                  {grupo}
                </div>

                <div
                  style={{
                    border:
                      '1px solid #27272a',
                    borderRadius: 10,
                    overflow: 'hidden'
                  }}
                >
                  {items.map(
                    atributo => (
                      <div
                        key={
                          atributo.id
                        }
                        style={{
                          display:
                            'grid',
                          gridTemplateColumns:
                            '1.5fr 1fr .7fr auto',
                          alignItems:
                            'center',
                          gap: 10,
                          padding:
                            '12px 14px',
                          borderBottom:
                            '1px solid #27272a'
                        }}
                      >
                        <div
                          style={{
                            color:
                              '#e4e4e7',
                            fontSize: 13
                          }}
                        >
                          {
                            atributo.nombre
                          }
                        </div>

                        <div
                          style={{
                            color:
                              '#ffffff',
                            fontSize: 13
                          }}
                        >
                          {atributo.valor ||
                            '—'}
                        </div>

                        <div
                          style={{
                            color:
                              '#a1a1aa',
                            fontSize: 12
                          }}
                        >
                          {atributo.unidad ||
                            ''}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: 6
                          }}
                        >
                          <button
                            onClick={() =>
                              editar(
                                atributo
                              )
                            }
                            style={{
                              background:
                                '#27272a',
                              border:
                                '1px solid #3f3f46',
                              color:
                                'white',
                              borderRadius:
                                6,
                              padding:
                                '6px 9px',
                              cursor:
                                'pointer',
                              fontSize: 11
                            }}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              eliminar(
                                atributo
                              )
                            }
                            style={{
                              background:
                                '#7f1d1d',
                              border: 0,
                              color:
                                'white',
                              borderRadius:
                                6,
                              padding:
                                '6px 9px',
                              cursor:
                                'pointer',
                              fontSize: 11
                            }}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          )}

        {showForm && (
          <div
            style={{
              marginTop: 25,
              background: '#09090b',
              border:
                '1px solid #3f3f46',
              borderRadius: 12,
              padding: 18
            }}
          >
            <div
              style={{
                color: 'white',
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 14
              }}
            >
              {editing
                ? 'Editar atributo'
                : 'Nuevo atributo'}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 10
              }}
            >
              <input
                placeholder="Atributo"
                value={form.nombre}
                onChange={e =>
                  setForm({
                    ...form,
                    nombre:
                      e.target.value
                  })
                }
                style={inputStyle}
              />

              <input
                placeholder="Valor"
                value={form.valor}
                onChange={e =>
                  setForm({
                    ...form,
                    valor:
                      e.target.value
                  })
                }
                style={inputStyle}
              />

              <input
                placeholder="Unidad (m, kg, mm...)"
                value={form.unidad}
                onChange={e =>
                  setForm({
                    ...form,
                    unidad:
                      e.target.value
                  })
                }
                style={inputStyle}
              />

              <input
                placeholder="Grupo"
                value={form.grupo}
                onChange={e =>
                  setForm({
                    ...form,
                    grupo:
                      e.target.value
                  })
                }
                style={inputStyle}
              />

              <input
                type="number"
                placeholder="Orden"
                value={form.orden}
                onChange={e =>
                  setForm({
                    ...form,
                    orden:
                      Number(
                        e.target.value
                      )
                  })
                }
                style={inputStyle}
              />
            </div>

            {error && (
              <div
                style={{
                  marginTop: 12,
                  color: '#fecaca',
                  background:
                    '#450a0a',
                  padding: 10,
                  borderRadius: 7,
                  fontSize: 12
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'flex-end',
                gap: 8,
                marginTop: 15
              }}
            >
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                style={{
                  background:
                    '#27272a',
                  border: 0,
                  color: 'white',
                  borderRadius: 7,
                  padding:
                    '8px 13px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                onClick={guardar}
                disabled={guardando}
                style={{
                  background:
                    '#ff6a00',
                  border: 0,
                  color: 'white',
                  borderRadius: 7,
                  padding:
                    '8px 15px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {guardando
                  ? 'Guardando...'
                  : 'Guardar atributo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
