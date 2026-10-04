'use client'

import {
  Fragment,
  useEffect,
  useState
} from 'react'

import {
  useRouter
} from 'next/navigation'

import {
  getLotes,
  createLote,
  updateLote,
  deleteLote,
  getPerfilActual,
  supabase,
  PerfilActual
} from './lib/queries'

import {
  LoteForm
} from './components/LoteForm'

import {
  EventoForm
} from './components/EventoForm'

export default function LotesPage() {
  const router =
    useRouter()

  const [
    lotes,
    setLotes
  ] = useState<any[]>([])

  const [
    showForm,
    setShowForm
  ] = useState(false)

  const [
    editing,
    setEditing
  ] = useState<any>(null)

  const [
    unidadEvento,
    setUnidadEvento
  ] = useState<any>(null)

  const [
    loteAbierto,
    setLoteAbierto
  ] =
    useState<string | null>(
      null
    )

  const [
    unidades,
    setUnidades
  ] =
    useState<
      Record<string, any[]>
    >({})

  const [
    cargandoUnidades,
    setCargandoUnidades
  ] =
    useState<string | null>(
      null
    )

  const [
    perfil,
    setPerfil
  ] =
    useState<
      PerfilActual | null
    >(null)

  const [
    empresaUsuario,
    setEmpresaUsuario
  ] =
    useState<any>(null)

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState('')

  /* =========================================================
     ROLES
  ========================================================= */

  const esSuperadmin =
    perfil?.rol ===
    'superadmin'

  const nombreEmpresa =
    empresaUsuario
      ?.razon_social ||
    'Mi empresa'

  /* =========================================================
     INICIAR MÓDULO
  ========================================================= */

  useEffect(() => {
    iniciar()
  }, [])

  const iniciar =
    async () => {
      setLoading(true)
      setError('')

      try {
        /* ---------------------------------------------------
           PERFIL
        --------------------------------------------------- */

        const {
          data: perfilData,
          error: perfilError
        } =
          await getPerfilActual()

        if (
          perfilError ||
          !perfilData ||
          perfilData.activo ===
            false
        ) {
          console.error(
            'Perfil no autorizado:',
            perfilError
          )

          await supabase
            .auth
            .signOut()

          router.replace(
            '/login'
          )

          return
        }

        const superadmin =
          perfilData.rol ===
          'superadmin'

        const adminEmpresa =
          perfilData.rol ===
          'admin_empresa'

        if (
          !superadmin &&
          !adminEmpresa
        ) {
          await supabase
            .auth
            .signOut()

          router.replace(
            '/login'
          )

          return
        }

        if (
          adminEmpresa &&
          !perfilData.empresa_id
        ) {
          setError(
            'Tu usuario no tiene una empresa asociada.'
          )

          return
        }

        setPerfil(
          perfilData
        )

        /* ---------------------------------------------------
           EMPRESA DEL ADMIN
        --------------------------------------------------- */

        if (
          adminEmpresa &&
          perfilData.empresa_id
        ) {
          const {
            data:
              empresaData,
            error:
              empresaError
          } =
            await supabase
              .from(
                'empresas'
              )
              .select(
                'id, razon_social'
              )
              .eq(
                'id',
                perfilData.empresa_id
              )
              .maybeSingle()

          if (
            empresaError
          ) {
            console.error(
              'Error obteniendo empresa:',
              empresaError
            )
          }

          if (
            empresaData
          ) {
            setEmpresaUsuario(
              empresaData
            )
          }
        }

        /* ---------------------------------------------------
           LOTES
        --------------------------------------------------- */

        await load()
      } catch (
        err: any
      ) {
        console.error(err)

        setError(
          err?.message ||
          'No fue posible cargar Lotes / QR.'
        )
      } finally {
        setLoading(false)
      }
    }

  /* =========================================================
     CARGAR LOTES
  ========================================================= */

  const load =
    async () => {
      const {
        data,
        error:
          loadError
      } =
        await getLotes()

      if (loadError) {
        console.error(
          'Error cargando lotes:',
          loadError
        )

        setError(
          'No fue posible cargar los lotes.'
        )

        return
      }

      setLotes(
        data || []
      )
    }

  /* =========================================================
     CARGAR UNIDADES DESDE SUPABASE
  ========================================================= */

  const cargarUnidades =
    async (
      loteId: string
    ) => {
      setCargandoUnidades(
        loteId
      )

      const {
        data,
        error:
          unidadesError
      } =
        await supabase
          .from(
            'unidades'
          )
          .select('*')
          .eq(
            'lote_id',
            loteId
          )
          .order(
            'numero_unidad',
            {
              ascending: true
            }
          )

      setCargandoUnidades(
        null
      )

      if (
        unidadesError
      ) {
        console.error(
          'Error cargando unidades:',
          unidadesError
        )

        setError(
          'No fue posible cargar las unidades del lote.'
        )

        return false
      }

      /*
        IMPORTANTE:

        reemplazamos completamente
        las unidades almacenadas.
      */

      setUnidades(
        prev => ({
          ...prev,

          [loteId]:
            data || []
        })
      )

      return true
    }

  /* =========================================================
     GUARDAR LOTE
  ========================================================= */

  const handleSave =
    async (
      data: any
    ) => {
      let loteId:
        string | null =
        null

      setError('')

      try {
        let resultado:
          any

        /* ---------------------------------------------------
           EDITAR
        --------------------------------------------------- */

        if (editing) {
          loteId =
            editing.id

          resultado =
            await updateLote(
              editing.id,
              data
            )
        }

        /* ---------------------------------------------------
           CREAR
        --------------------------------------------------- */

        else {
          resultado =
            await createLote(
              data
            )

          loteId =
            resultado
              ?.data?.id ||
            null
        }

        /* ---------------------------------------------------
           ERROR

           Lanzamos el error para que
           LoteForm permanezca abierto
           y pueda mostrarlo.
        --------------------------------------------------- */

        if (
          resultado?.error
        ) {
          console.error(
            'Error guardando lote:',
            resultado.error
          )

          throw resultado.error
        }

        /* ---------------------------------------------------
           CERRAR FORMULARIO
        --------------------------------------------------- */

        setShowForm(false)
        setEditing(null)

        /* ---------------------------------------------------
           ACTUALIZAR LOTES
        --------------------------------------------------- */

        await load()

        /* ---------------------------------------------------
           RECARGAR UNIDADES

           Siempre desde Supabase.
        --------------------------------------------------- */

        if (loteId) {
          await cargarUnidades(
            loteId
          )

          setLoteAbierto(
            loteId
          )
        }

        return resultado
      } catch (
        err: any
      ) {
        console.error(
          'Error guardando lote:',
          err
        )

        /*
          No cerramos el formulario.

          El error vuelve al LoteForm.
        */

        throw err
      }
    }

  /* =========================================================
     VER / OCULTAR UNIDADES
  ========================================================= */

  const verUnidades =
    async (
      loteId: string
    ) => {
      if (
        loteAbierto ===
        loteId
      ) {
        setLoteAbierto(
          null
        )

        return
      }

      setLoteAbierto(
        loteId
      )

      /*
        Siempre consultar
        nuevamente Supabase.
      */

      await cargarUnidades(
        loteId
      )
    }

  /* =========================================================
     BORRAR LOTE
  ========================================================= */

  const borrar =
    async (
      id: string
    ) => {
      const confirmar =
        window.confirm(
          '¿Seguro que deseas borrar este lote?'
        )

      if (!confirmar) {
        return
      }

      setError('')

      const {
        error:
          deleteError
      } =
        await deleteLote(
          id
        )

      if (
        deleteError
      ) {
        console.error(
          deleteError
        )

        setError(
          deleteError.message ||
          'No fue posible borrar el lote.'
        )

        return
      }

      if (
        loteAbierto === id
      ) {
        setLoteAbierto(
          null
        )
      }

      setUnidades(
        prev => {
          const copia = {
            ...prev
          }

          delete copia[id]

          return copia
        }
      )

      await load()
    }

  /* =========================================================
     ESTILOS
  ========================================================= */

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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight:
            '100vh',
          background:
            '#09090b',
          color:
            'white',
          display:
            'flex',
          alignItems:
            'center',
          justifyContent:
            'center',
          fontFamily:
            'system-ui'
        }}
      >
        <div
          style={{
            textAlign:
              'center'
          }}
        >
          <div
            style={{
              color:
                '#ff6a00',
              fontWeight:
                900,
              letterSpacing:
                2
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              color:
                '#71717a',
              fontSize:
                13,
              marginTop:
                10
            }}
          >
            Cargando Lotes / QR...
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <div
      style={{
        padding: 24,
        background:
          '#09090b',
        minHeight:
          '100vh',
        color: 'white',
        fontFamily:
          'system-ui'
      }}
    >
      {/* CABECERA */}

      <div
        style={{
          display:
            'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          gap: 20,
          flexWrap:
            'wrap'
        }}
      >
        <div>
          <div
            style={{
              color:
                '#ff6a00',
              fontSize:
                11,
              fontWeight:
                900,
              letterSpacing:
                1.5
            }}
          >
            {esSuperadmin
              ? 'VINCULAB · ADMINISTRACIÓN GLOBAL'
              : `VINCULAB · ${nombreEmpresa.toUpperCase()}`}
          </div>

          <h1
            style={{
              margin:
                '6px 0 5px'
            }}
          >
            Lotes / QR - Trazabilidad
          </h1>

          <div
            style={{
              color:
                '#a1a1aa',
              fontSize:
                14
            }}
          >
            {esSuperadmin
              ? 'Gestión global de lotes e identidades digitales'
              : `Gestión de lotes e identidades digitales de ${nombreEmpresa}`}
          </div>
        </div>

        <div
          style={{
            display:
              'flex',
            gap: 10,
            flexWrap:
              'wrap'
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                esSuperadmin
                  ? '/admin'
                  : '/portal'
              )
            }
            style={{
              ...boton,
              padding:
                '11px 16px',
              background:
                '#18181b',
              border:
                '1px solid #27272a',
              fontWeight:
                700
            }}
          >
            ← Dashboard
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(
                null
              )

              setShowForm(
                true
              )
            }}
            style={{
              background:
                '#ff6a00',
              border: 0,
              borderRadius: 8,
              padding:
                '11px 17px',
              color: 'white',
              fontWeight: 700,
              cursor:
                'pointer'
            }}
          >
            + Nuevo Lote
          </button>
        </div>
      </div>

      {/* ACCESO */}

      <div
        style={{
          marginTop: 20,
          padding:
            '12px 15px',
          borderRadius: 10,
          background:
            esSuperadmin
              ? '#18181b'
              : '#111c14',
          border:
            esSuperadmin
              ? '1px solid #27272a'
              : '1px solid #1f5130',
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          gap: 12,
          flexWrap:
            'wrap'
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1,
              color:
                esSuperadmin
                  ? '#ff6a00'
                  : '#86efac'
            }}
          >
            {esSuperadmin
              ? 'SUPERADMINISTRADOR'
              : 'EMPRESA ACTIVA'}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              fontWeight: 700
            }}
          >
            {esSuperadmin
              ? 'Acceso global Vinculab'
              : nombreEmpresa}
          </div>
        </div>

        <div
          style={{
            color:
              '#71717a',
            fontSize: 11
          }}
        >
          {esSuperadmin
            ? 'Puedes administrar lotes de todas las empresas.'
            : 'Solo puedes administrar lotes, unidades y QR de tu empresa.'}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            marginTop: 18,
            padding: 12,
            borderRadius: 8,
            background:
              '#450a0a',
            border:
              '1px solid #7f1d1d',
            color:
              '#fecaca',
            fontSize: 12
          }}
        >
          {error}
        </div>
      )}

      {/* TABLA LOTES */}

      <div
        style={{
          marginTop: 25,
          border:
            '1px solid #27272a',
          borderRadius: 12,
          overflowX: 'auto'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse:
              'collapse',
            minWidth: 900
          }}
        >
          <thead
            style={{
              background:
                '#18181b'
            }}
          >
            <tr>
              <th
                style={{
                  padding: 12,
                  textAlign:
                    'left'
                }}
              >
                Código
              </th>

              <th
                style={{
                  padding: 12
                }}
              >
                Cantidad
              </th>

              <th
                style={{
                  padding: 12
                }}
              >
                Estado
              </th>

              <th
                style={{
                  padding: 12
                }}
              >
                Unidades
              </th>

              <th
                style={{
                  padding: 12
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {lotes.map(
              l => (
                <Fragment
                  key={l.id}
                >
                  {/* LOTE */}

                  <tr
                    style={{
                      borderTop:
                        '1px solid #27272a'
                    }}
                  >
                    <td
                      style={{
                        padding: 12
                      }}
                    >
                      <a
                        href={`/p/${l.codigo}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color:
                            '#ff6a00',
                          fontWeight:
                            700
                        }}
                      >
                        {l.codigo}
                      </a>
                    </td>

                    <td
                      style={{
                        padding: 12,
                        textAlign:
                          'center'
                      }}
                    >
                      {l.cantidad}
                    </td>

                    <td
                      style={{
                        padding: 12,
                        textAlign:
                          'center'
                      }}
                    >
                      <span
                        style={{
                          background:
                            l.estado ===
                            'activo'
                              ? '#14532d'
                              : '#27272a',

                          padding:
                            '5px 10px',

                          borderRadius:
                            20,

                          fontSize:
                            12,

                          fontWeight:
                            700
                        }}
                      >
                        {l.estado}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: 12,
                        textAlign:
                          'center'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          verUnidades(
                            l.id
                          )
                        }
                        style={{
                          ...boton,

                          background:
                            loteAbierto ===
                            l.id
                              ? '#ff6a00'
                              : '#27272a'
                        }}
                      >
                        {loteAbierto ===
                        l.id
                          ? 'Ocultar unidades'
                          : `Ver unidades (${l.cantidad})`}
                      </button>
                    </td>

                    <td
                      style={{
                        padding: 12
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          gap: 8,
                          flexWrap:
                            'wrap'
                        }}
                      >
                        <a
                          href={`/lotes/${l.id}/qr`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            ...boton,
                            background:
                              '#ff6a00',
                            fontWeight:
                              700
                          }}
                        >
                          Imprimir QR
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setEditing(
                              l
                            )

                            setShowForm(
                              true
                            )
                          }}
                          style={
                            boton
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            borrar(
                              l.id
                            )
                          }
                          style={{
                            ...boton,
                            background:
                              '#7f1d1d'
                          }}
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* UNIDADES */}

                  {loteAbierto ===
                    l.id && (
                    <tr>
                      <td
                        colSpan={
                          5
                        }
                        style={{
                          padding: 0,
                          background:
                            '#111113'
                        }}
                      >
                        <div
                          style={{
                            padding: 20
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                12,
                              fontWeight:
                                800,
                              color:
                                '#a1a1aa',
                              marginBottom:
                                14,
                              letterSpacing:
                                1
                            }}
                          >
                            IDENTIDADES DIGITALES DEL LOTE
                          </div>

                          {cargandoUnidades ===
                            l.id && (
                            <div
                              style={{
                                color:
                                  '#a1a1aa',
                                padding:
                                  15
                              }}
                            >
                              Actualizando unidades...
                            </div>
                          )}

                          {cargandoUnidades !==
                            l.id &&
                            (
                              unidades[
                                l.id
                              ] || []
                            ).length ===
                              0 && (
                              <div
                                style={{
                                  color:
                                    '#a1a1aa',
                                  padding:
                                    15
                                }}
                              >
                                Este lote no tiene unidades individuales.
                              </div>
                            )}

                          {(
                            unidades[
                              l.id
                            ] || []
                          ).map(
                            u => {
                              const url =
                                `https://vinculab.cl/u/${encodeURIComponent(
                                  u.codigo
                                )}`

                              const qr =
                                `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                  url
                                )}`

                              const qrGrande =
                                `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                                  url
                                )}`

                              return (
                                <div
                                  key={
                                    u.id
                                  }
                                  style={{
                                    display:
                                      'grid',

                                    gridTemplateColumns:
                                      '80px minmax(240px,1fr) auto',

                                    gap: 18,

                                    alignItems:
                                      'center',

                                    background:
                                      '#18181b',

                                    border:
                                      '1px solid #27272a',

                                    borderRadius:
                                      12,

                                    padding:
                                      14,

                                    marginBottom:
                                      10
                                  }}
                                >
                                  {/* QR */}

                                  <div
                                    style={{
                                      background:
                                        'white',

                                      padding:
                                        5,

                                      borderRadius:
                                        8,

                                      width:
                                        72,

                                      height:
                                        72
                                    }}
                                  >
                                    <img
                                      src={
                                        qr
                                      }
                                      alt={`QR ${u.codigo}`}
                                      style={{
                                        width:
                                          62,
                                        height:
                                          62,
                                        display:
                                          'block'
                                      }}
                                    />
                                  </div>

                                  {/* DATOS */}

                                  <div>
                                    <div
                                      style={{
                                        color:
                                          '#ff6a00',

                                        fontWeight:
                                          900,

                                        fontSize:
                                          16
                                      }}
                                    >
                                      {
                                        u.codigo
                                      }
                                    </div>

                                    <div
                                      style={{
                                        marginTop:
                                          5,

                                        color:
                                          '#a1a1aa',

                                        fontSize:
                                          12
                                      }}
                                    >
                                      Unidad
                                      Nº{' '}
                                      {
                                        u.numero_unidad
                                      }

                                      {' • '}

                                      Estado:{' '}
                                      {
                                        u.estado
                                      }
                                    </div>
                                  </div>

                                  {/* ACCIONES */}

                                  <div
                                    style={{
                                      display:
                                        'flex',

                                      gap: 8,

                                      flexWrap:
                                        'wrap',

                                      justifyContent:
                                        'flex-end'
                                    }}
                                  >
                                    <a
                                      href={`/u/${encodeURIComponent(
                                        u.codigo
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        ...boton,

                                        background:
                                          '#ff6a00',

                                        fontWeight:
                                          700
                                      }}
                                    >
                                      Ver identidad
                                    </a>

                                    <a
                                      href={
                                        qrGrande
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      style={
                                        boton
                                      }
                                    >
                                      Ver QR
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setUnidadEvento(
                                          u
                                        )
                                      }
                                      style={{
                                        ...boton,

                                        background:
                                          '#14532d',

                                        fontWeight:
                                          700
                                      }}
                                    >
                                      + Evento
                                    </button>
                                  </div>
                                </div>
                              )
                            }
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* FORMULARIO LOTE */}

      {showForm && (
        <LoteForm
          initial={
            editing
          }

          esSuperadmin={
            esSuperadmin
          }

          empresaUsuario={
            empresaUsuario
          }

          onSave={
            handleSave
          }

          onClose={() => {
            setShowForm(
              false
            )

            setEditing(
              null
            )
          }}
        />
      )}

      {/* FORMULARIO EVENTO */}

      {unidadEvento && (
        <EventoForm
          unidad={
            unidadEvento
          }

          onClose={() =>
            setUnidadEvento(
              null
            )
          }

          onSaved={() => {
            console.log(
              'Evento registrado'
            )
          }}
        />
      )}
    </div>
  )
}
