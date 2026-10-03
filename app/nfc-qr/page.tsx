'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import QRWithLogo from '../components/QRWithLogo'

import {
  asignarCarrier,
  actualizarUidNfc,
  cambiarEstadoCarrier,
  getPerfilActual,
  getUnidadesNfcQr,
  type PerfilActual,
  type UnidadNfcQr
} from './queries'

export default function NfcQrPage() {
  const router = useRouter()

  const [perfil, setPerfil] = useState<PerfilActual | null>(null)
  const [unidades, setUnidades] = useState<UnidadNfcQr[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [empresaFiltro, setEmpresaFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')

  const [unidadSeleccionada, setUnidadSeleccionada] =
    useState<UnidadNfcQr | null>(null)

  const [uidNfc, setUidNfc] = useState('')
  const [guardando, setGuardando] = useState(false)

  /* ============================================================
     CARGA
  ============================================================ */

  const cargar = async () => {
    try {
      setLoading(true)
      setError('')

      const perfilActual = await getPerfilActual()
      const unidadesActuales = await getUnidadesNfcQr()

      setPerfil(perfilActual)
      setUnidades(unidadesActuales)

      if (unidadSeleccionada) {
        const actualizada = unidadesActuales.find(
          u => u.id === unidadSeleccionada.id
        )

        if (actualizada) {
          setUnidadSeleccionada(actualizada)
          setUidNfc(actualizada.carrier?.uid_nfc || '')
        }
      }
    } catch (e: any) {
      setError(e?.message || 'No fue posible cargar NFC/QR.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ============================================================
     EMPRESAS DISPONIBLES
  ============================================================ */

  const empresas = useMemo(() => {
    const mapa = new Map<string, string>()

    unidades.forEach(unidad => {
      if (unidad.empresa_id) {
        mapa.set(
          unidad.empresa_id,
          unidad.empresa_nombre
        )
      }
    })

    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({
        id,
        nombre
      }))
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      )
  }, [unidades])

  /* ============================================================
     FILTROS
  ============================================================ */

  const unidadesFiltradas = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase()

    return unidades.filter(unidad => {
      if (
        empresaFiltro &&
        unidad.empresa_id !== empresaFiltro
      ) {
        return false
      }

      if (
        estadoFiltro === 'asignado' &&
        !unidad.carrier
      ) {
        return false
      }

      if (
        estadoFiltro === 'sin_asignar' &&
        unidad.carrier
      ) {
        return false
      }

      if (!texto) {
        return true
      }

      const contenido = [
        unidad.codigo,
        unidad.empresa_nombre,
        unidad.producto_nombre,
        unidad.modelo_nombre,
        unidad.lote_codigo,
        unidad.carrier?.id_carrier,
        unidad.carrier?.uid_nfc
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [
    unidades,
    busqueda,
    empresaFiltro,
    estadoFiltro
  ])

  /* ============================================================
     ESTADÍSTICAS
  ============================================================ */

  const total = unidades.length

  const asignadas = unidades.filter(
    u => !!u.carrier
  ).length

  const sinAsignar = total - asignadas

  const conNfc = unidades.filter(
    u => !!u.carrier?.uid_nfc
  ).length

  /* ============================================================
     SELECCIONAR
  ============================================================ */

  const seleccionarUnidad = (
    unidad: UnidadNfcQr
  ) => {
    setUnidadSeleccionada(unidad)
    setUidNfc(
      unidad.carrier?.uid_nfc || ''
    )

    setError('')
    setMensaje('')
  }

  /* ============================================================
     ASIGNAR
  ============================================================ */

  const handleAsignar = async () => {
    if (!unidadSeleccionada) return

    try {
      setGuardando(true)
      setError('')
      setMensaje('')

      await asignarCarrier({
        unidad_id: unidadSeleccionada.id,
        codigo_unidad:
          unidadSeleccionada.codigo,
        uid_nfc:
          uidNfc.trim() || null,
        tipo: 'NFC_QR'
      })

      setMensaje(
        'Identificador NFC/QR asignado correctamente.'
      )

      await cargar()
    } catch (e: any) {
      setError(
        e?.message ||
          'No fue posible asignar el identificador.'
      )
    } finally {
      setGuardando(false)
    }
  }

  /* ============================================================
     ACTUALIZAR NFC
  ============================================================ */

  const handleActualizarNfc = async () => {
    if (
      !unidadSeleccionada?.carrier
    ) {
      return
    }

    try {
      setGuardando(true)
      setError('')
      setMensaje('')

      await actualizarUidNfc(
        unidadSeleccionada.carrier.id_carrier,
        uidNfc.trim() || null
      )

      setMensaje(
        'UID NFC actualizado correctamente.'
      )

      await cargar()
    } catch (e: any) {
      setError(
        e?.message ||
          'No fue posible actualizar el UID NFC.'
      )
    } finally {
      setGuardando(false)
    }
  }

  /* ============================================================
     ESTADO CARRIER
  ============================================================ */

  const handleEstado = async (
    estado: string
  ) => {
    if (
      !unidadSeleccionada?.carrier
    ) {
      return
    }

    try {
      setGuardando(true)
      setError('')
      setMensaje('')

      await cambiarEstadoCarrier(
        unidadSeleccionada.carrier.id_carrier,
        estado
      )

      setMensaje(
        estado === 'asignado'
          ? 'Identificador activado.'
          : 'Identificador marcado como inactivo.'
      )

      await cargar()
    } catch (e: any) {
      setError(
        e?.message ||
          'No fue posible cambiar el estado.'
      )
    } finally {
      setGuardando(false)
    }
  }

  /* ============================================================
     COPIAR
  ============================================================ */

  const copiar = async (
    texto: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        texto
      )

      setMensaje(
        'Enlace copiado al portapapeles.'
      )
    } catch {
      setError(
        'No fue posible copiar el enlace.'
      )
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading && !perfil) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loader} />

        <div style={styles.loadingText}>
          Cargando Centro NFC / QR...
        </div>
      </main>
    )
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <header style={styles.header}>
          <div>
            <button
              type="button"
              style={styles.backButton}
              onClick={() =>
                router.push('/dashboard')
              }
            >
              ← Dashboard
            </button>

            <div style={styles.eyebrow}>
              IDENTIDAD FÍSICA
            </div>

            <h1 style={styles.title}>
              Centro NFC / QR
            </h1>

            <p style={styles.subtitle}>
              Vincula cada unidad física con su
              identidad digital registrada en
              Vinculab.
            </p>
          </div>

          <div style={styles.profileCard}>
            <div style={styles.profileLabel}>
              ACCESO
            </div>

            <div style={styles.profileRole}>
              {perfil?.rol === 'superadmin'
                ? 'Super Admin'
                : 'Administrador de Empresa'}
            </div>

            <div style={styles.profileName}>
              {perfil?.nombre ||
                'Usuario Vinculab'}
            </div>
          </div>
        </header>

        {/* SEGURIDAD */}

        <section style={styles.securityBar}>
          <div style={styles.securityIcon}>
            ✓
          </div>

          <div>
            <strong>
              Acceso protegido por empresa
            </strong>

            <div style={styles.securityText}>
              {perfil?.rol === 'superadmin'
                ? 'Puedes administrar identificadores de todas las empresas registradas.'
                : 'Solo puedes administrar unidades pertenecientes a tu empresa.'}
            </div>
          </div>
        </section>

        {/* MENSAJES */}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {mensaje && (
          <div style={styles.success}>
            {mensaje}
          </div>
        )}

        {/* STATS */}

        <section style={styles.statsGrid}>
          <StatCard
            label="UNIDADES"
            value={total}
            text="Unidades disponibles"
          />

          <StatCard
            label="ASIGNADAS"
            value={asignadas}
            text="Con identidad física"
          />

          <StatCard
            label="PENDIENTES"
            value={sinAsignar}
            text="Sin carrier asignado"
          />

          <StatCard
            label="NFC"
            value={conNfc}
            text="Con UID NFC registrado"
          />
        </section>

        {/* FILTROS */}

        <section style={styles.filters}>
          <div style={styles.searchWrapper}>
            <div style={styles.fieldLabel}>
              BUSCAR
            </div>

            <input
              style={styles.input}
              value={busqueda}
              onChange={e =>
                setBusqueda(e.target.value)
              }
              placeholder="Unidad, lote, producto, modelo, carrier o NFC..."
            />
          </div>

          {perfil?.rol === 'superadmin' && (
            <div style={styles.filterItem}>
              <div style={styles.fieldLabel}>
                EMPRESA
              </div>

              <select
                style={styles.select}
                value={empresaFiltro}
                onChange={e =>
                  setEmpresaFiltro(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todas
                </option>

                {empresas.map(empresa => (
                  <option
                    key={empresa.id}
                    value={empresa.id}
                  >
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.filterItem}>
            <div style={styles.fieldLabel}>
              ESTADO
            </div>

            <select
              style={styles.select}
              value={estadoFiltro}
              onChange={e =>
                setEstadoFiltro(
                  e.target.value
                )
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="sin_asignar">
                Sin asignar
              </option>

              <option value="asignado">
                Asignados
              </option>
            </select>
          </div>
        </section>

        {/* CONTENT */}

        <section style={styles.contentGrid}>

          {/* LISTADO */}

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelEyebrow}>
                  UNIDADES
                </div>

                <h2 style={styles.panelTitle}>
                  Identidades disponibles
                </h2>
              </div>

              <div style={styles.resultCount}>
                {unidadesFiltradas.length}
              </div>
            </div>

            <div style={styles.unitList}>
              {unidadesFiltradas.length ===
              0 ? (
                <div style={styles.empty}>
                  No hay unidades que coincidan
                  con los filtros.
                </div>
              ) : (
                unidadesFiltradas.map(
                  unidad => {
                    const selected =
                      unidadSeleccionada?.id ===
                      unidad.id

                    return (
                      <button
                        key={unidad.id}
                        type="button"
                        onClick={() =>
                          seleccionarUnidad(
                            unidad
                          )
                        }
                        style={{
                          ...styles.unitCard,
                          ...(selected
                            ? styles.unitCardSelected
                            : {})
                        }}
                      >
                        <div
                          style={
                            styles.unitCardTop
                          }
                        >
                          <div>
                            <div
                              style={
                                styles.unitCode
                              }
                            >
                              {unidad.codigo}
                            </div>

                            <div
                              style={
                                styles.unitCompany
                              }
                            >
                              {
                                unidad.empresa_nombre
                              }
                            </div>
                          </div>

                          <StatusBadge
                            assigned={
                              !!unidad.carrier
                            }
                            estado={
                              unidad.carrier
                                ?.estado
                            }
                          />
                        </div>

                        <div
                          style={
                            styles.unitHierarchy
                          }
                        >
                          <span>
                            {
                              unidad.producto_nombre
                            }
                          </span>

                          <span>›</span>

                          <span>
                            {
                              unidad.modelo_nombre
                            }
                          </span>

                          <span>›</span>

                          <span>
                            Lote{' '}
                            {
                              unidad.lote_codigo
                            }
                          </span>
                        </div>

                        {unidad.carrier && (
                          <div
                            style={
                              styles.carrierMini
                            }
                          >
                            {
                              unidad.carrier
                                .id_carrier
                            }

                            {unidad.carrier
                              .uid_nfc && (
                              <>
                                {' · NFC '}
                                {
                                  unidad
                                    .carrier
                                    .uid_nfc
                                }
                              </>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  }
                )
              )}
            </div>
          </div>

          {/* DETALLE */}

          <div style={styles.detailPanel}>
            {!unidadSeleccionada ? (
              <div style={styles.noSelection}>
                <div
                  style={
                    styles.noSelectionIcon
                  }
                >
                  ◈
                </div>

                <h2
                  style={
                    styles.noSelectionTitle
                  }
                >
                  Selecciona una unidad
                </h2>

                <p
                  style={
                    styles.noSelectionText
                  }
                >
                  Selecciona una unidad del
                  listado para consultar o
                  asignar su identidad física
                  NFC / QR.
                </p>
              </div>
            ) : (
              <UnidadDetalle
                unidad={
                  unidadSeleccionada
                }
                uidNfc={uidNfc}
                setUidNfc={setUidNfc}
                guardando={guardando}
                onAsignar={handleAsignar}
                onActualizarNfc={
                  handleActualizarNfc
                }
                onEstado={handleEstado}
                onCopiar={copiar}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

/* ============================================================
   DETALLE
============================================================ */

function UnidadDetalle({
  unidad,
  uidNfc,
  setUidNfc,
  guardando,
  onAsignar,
  onActualizarNfc,
  onEstado,
  onCopiar
}: {
  unidad: UnidadNfcQr
  uidNfc: string
  setUidNfc: (value: string) => void
  guardando: boolean
  onAsignar: () => void
  onActualizarNfc: () => void
  onEstado: (estado: string) => void
  onCopiar: (texto: string) => void
}) {
  const carrier = unidad.carrier

  const qrUrl =
    carrier?.qr_url ||
    `https://vinculab.cl/u/${encodeURIComponent(
      unidad.codigo
    )}`

  return (
    <>
      <div style={styles.detailHeader}>
        <div>
          <div style={styles.panelEyebrow}>
            UNIDAD SELECCIONADA
          </div>

          <h2 style={styles.detailCode}>
            {unidad.codigo}
          </h2>

          <div style={styles.detailCompany}>
            {unidad.empresa_nombre}
          </div>
        </div>

        <StatusBadge
          assigned={!!carrier}
          estado={carrier?.estado}
        />
      </div>

      <div style={styles.identityPath}>
        <IdentityItem
          label="PRODUCTO"
          value={unidad.producto_nombre}
        />

        <IdentityItem
          label="MODELO"
          value={unidad.modelo_nombre}
        />

        <IdentityItem
          label="LOTE"
          value={unidad.lote_codigo}
        />

        <IdentityItem
          label="N° UNIDAD"
          value={String(
            unidad.numero_unidad
          )}
        />
      </div>

      {carrier ? (
        <>
          <div style={styles.qrSection}>
            <div style={styles.qrBox}>
              <QRWithLogo
                data={qrUrl}
                logo="/vinculab-logo.png"
                fallback="/vinculab-logo.png"
                size={190}
              />
            </div>

            <div style={styles.qrInfo}>
              <div style={styles.fieldLabel}>
                CARRIER
              </div>

              <div style={styles.carrierId}>
                {carrier.id_carrier}
              </div>

              <div
                style={styles.publicLabel}
              >
                IDENTIDAD DIGITAL
              </div>

              <div style={styles.publicUrl}>
                {qrUrl}
              </div>

              <div
                style={
                  styles.actionButtonsRow
                }
              >
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() =>
                    onCopiar(qrUrl)
                  }
                >
                  Copiar enlace
                </button>

                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() =>
                    window.open(
                      qrUrl,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  Ver identidad
                </button>
              </div>
            </div>
          </div>

          <div style={styles.nfcSection}>
            <div style={styles.sectionTitle}>
              Identificador NFC
            </div>

            <div style={styles.sectionText}>
              Registra el UID físico del chip
              NFC asociado a esta unidad.
            </div>

            <input
              style={styles.input}
              value={uidNfc}
              onChange={e =>
                setUidNfc(
                  e.target.value
                    .trimStart()
                    .toUpperCase()
                )
              }
              placeholder="Ej: 04A1B2C3D4E5"
            />

            <button
              type="button"
              disabled={guardando}
              style={{
                ...styles.primaryButton,
                ...(guardando
                  ? styles.disabledButton
                  : {})
              }}
              onClick={onActualizarNfc}
            >
              {guardando
                ? 'Guardando...'
                : carrier.uid_nfc
                  ? 'Actualizar UID NFC'
                  : 'Registrar UID NFC'}
            </button>
          </div>

          <div style={styles.carrierInfo}>
            <InfoRow
              label="Vinculab ID"
              value={
                carrier.vinculab_id ||
                unidad.codigo
              }
            />

            <InfoRow
              label="Tipo"
              value={
                carrier.tipo || 'NFC_QR'
              }
            />

            <InfoRow
              label="Estado"
              value={
                carrier.estado ||
                'asignado'
              }
            />

            <InfoRow
              label="Asignación"
              value={
                carrier.fecha_asignacion
                  ? formatearFecha(
                      carrier.fecha_asignacion
                    )
                  : '—'
              }
            />
          </div>

          <div style={styles.stateActions}>
            {carrier.estado ===
            'inactivo' ? (
              <button
                type="button"
                disabled={guardando}
                style={
                  styles.activateButton
                }
                onClick={() =>
                  onEstado('asignado')
                }
              >
                Reactivar identificador
              </button>
            ) : (
              <button
                type="button"
                disabled={guardando}
                style={
                  styles.deactivateButton
                }
                onClick={() =>
                  onEstado('inactivo')
                }
              >
                Marcar como inactivo
              </button>
            )}
          </div>
        </>
      ) : (
        <div style={styles.assignBox}>
          <div style={styles.assignIcon}>
            +
          </div>

          <h3 style={styles.assignTitle}>
            Asignar identidad física
          </h3>

          <p style={styles.assignText}>
            Se creará un carrier Vinculab y un
            QR asociado permanentemente a esta
            unidad.
          </p>

          <div style={styles.previewUrl}>
            <div style={styles.fieldLabel}>
              URL PÚBLICA
            </div>

            <div style={styles.publicUrl}>
              {qrUrl}
            </div>
          </div>

          <div style={styles.nfcOptional}>
            <div style={styles.fieldLabel}>
              UID NFC · OPCIONAL
            </div>

            <input
              style={styles.input}
              value={uidNfc}
              onChange={e =>
                setUidNfc(
                  e.target.value
                    .trimStart()
                    .toUpperCase()
                )
              }
              placeholder="Puedes registrarlo ahora o después"
            />
          </div>

          <button
            type="button"
            disabled={guardando}
            style={{
              ...styles.primaryButton,
              ...(guardando
                ? styles.disabledButton
                : {})
            }}
            onClick={onAsignar}
          >
            {guardando
              ? 'Asignando...'
              : 'Asignar NFC / QR'}
          </button>

          <div style={styles.assignNotice}>
            La empresa, producto, modelo, lote y
            unidad no podrán cambiarse mediante
            este módulo después de la
            asignación.
          </div>
        </div>
      )}
    </>
  )
}

/* ============================================================
   COMPONENTES
============================================================ */

function StatCard({
  label,
  value,
  text
}: {
  label: string
  value: number
  text: string
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>
        {label}
      </div>

      <div style={styles.statValue}>
        {value}
      </div>

      <div style={styles.statText}>
        {text}
      </div>
    </div>
  )
}

function StatusBadge({
  assigned,
  estado
}: {
  assigned: boolean
  estado?: string | null
}) {
  if (!assigned) {
    return (
      <span style={styles.badgePending}>
        SIN ASIGNAR
      </span>
    )
  }

  if (estado === 'inactivo') {
    return (
      <span style={styles.badgeInactive}>
        INACTIVO
      </span>
    )
  }

  return (
    <span style={styles.badgeActive}>
      ASIGNADO
    </span>
  )
}

function IdentityItem({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.identityItem}>
      <div style={styles.fieldLabel}>
        {label}
      </div>

      <div style={styles.identityValue}>
        {value}
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <span style={styles.infoValue}>
        {value}
      </span>
    </div>
  )
}

function formatearFecha(
  fecha: string
) {
  try {
    return new Intl.DateTimeFormat(
      'es-CL',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    ).format(new Date(fecha))
  } catch {
    return fecha
  }
}

/* ============================================================
   ESTILOS
============================================================ */

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #08090b 0%, #0c0e12 100%)',
    color: '#f4f4f5',
    padding: '32px 18px 70px'
  },

  container: {
    width: '100%',
    maxWidth: 1380,
    margin: '0 auto'
  },

  loadingPage: {
    minHeight: '100vh',
    background: '#08090b',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 16
  },

  loader: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: '3px solid #27272a',
    borderTopColor: '#ffffff'
  },

  loadingText: {
    color: '#a1a1aa',
    fontSize: 14
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 30,
    flexWrap: 'wrap',
    marginBottom: 28
  },

  backButton: {
    background: 'transparent',
    color: '#a1a1aa',
    border: 0,
    padding: 0,
    marginBottom: 22,
    cursor: 'pointer',
    fontSize: 14
  },

  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.18em',
    color: '#71717a',
    fontWeight: 800,
    marginBottom: 8
  },

  title: {
    margin: 0,
    fontSize: 'clamp(32px, 5vw, 54px)',
    lineHeight: 1,
    letterSpacing: '-0.045em'
  },

  subtitle: {
    margin: '14px 0 0',
    color: '#a1a1aa',
    maxWidth: 620,
    fontSize: 15,
    lineHeight: 1.7
  },

  profileCard: {
    minWidth: 230,
    border: '1px solid #27272a',
    background: '#111318',
    borderRadius: 18,
    padding: 18
  },

  profileLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.15em'
  },

  profileRole: {
    marginTop: 7,
    fontWeight: 800,
    fontSize: 15
  },

  profileName: {
    marginTop: 4,
    color: '#a1a1aa',
    fontSize: 12
  },

  securityBar: {
    border: '1px solid #1f3b31',
    background: '#0d1915',
    borderRadius: 18,
    padding: 17,
    display: 'flex',
    gap: 13,
    alignItems: 'center',
    marginBottom: 20
  },

  securityIcon: {
    width: 30,
    height: 30,
    flex: '0 0 auto',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: '#153c2c',
    color: '#86efac',
    fontWeight: 900
  },

  securityText: {
    marginTop: 4,
    color: '#86a89a',
    fontSize: 12
  },

  error: {
    border: '1px solid #7f1d1d',
    background: '#240d0d',
    color: '#fecaca',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18
  },

  success: {
    border: '1px solid #14532d',
    background: '#0c2115',
    color: '#bbf7d0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 18
  },

  statCard: {
    border: '1px solid #24262c',
    background: '#111318',
    borderRadius: 18,
    padding: 18
  },

  statLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.15em'
  },

  statValue: {
    marginTop: 9,
    fontSize: 31,
    fontWeight: 900,
    letterSpacing: '-0.04em'
  },

  statText: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 3
  },

  filters: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    border: '1px solid #24262c',
    background: '#101217',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18
  },

  searchWrapper: {
    flex: '1 1 360px'
  },

  filterItem: {
    flex: '1 1 180px',
    maxWidth: 260
  },

  fieldLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.13em',
    marginBottom: 7
  },

  input: {
    width: '100%',
    minHeight: 44,
    boxSizing: 'border-box',
    borderRadius: 12,
    border: '1px solid #303238',
    background: '#0a0b0e',
    color: '#ffffff',
    padding: '0 13px',
    outline: 'none',
    fontSize: 14
  },

  select: {
    width: '100%',
    minHeight: 44,
    borderRadius: 12,
    border: '1px solid #303238',
    background: '#0a0b0e',
    color: '#ffffff',
    padding: '0 12px',
    outline: 'none'
  },

  contentGrid: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1.15fr) minmax(360px, 0.85fr)',
    gap: 18,
    alignItems: 'start'
  },

  panel: {
    minWidth: 0,
    border: '1px solid #24262c',
    background: '#101217',
    borderRadius: 22,
    overflow: 'hidden'
  },

  panelHeader: {
    padding: 20,
    borderBottom: '1px solid #24262c',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  panelEyebrow: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.14em'
  },

  panelTitle: {
    margin: '5px 0 0',
    fontSize: 19
  },

  resultCount: {
    minWidth: 38,
    height: 38,
    padding: '0 10px',
    borderRadius: 12,
    background: '#1c1f25',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800
  },

  unitList: {
    padding: 10,
    maxHeight: 780,
    overflowY: 'auto'
  },

  unitCard: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    border: '1px solid transparent',
    borderBottomColor: '#202228',
    background: 'transparent',
    color: '#ffffff',
    padding: 16,
    cursor: 'pointer',
    borderRadius: 14,
    marginBottom: 4
  },

  unitCardSelected: {
    background: '#181b21',
    borderColor: '#3f434d'
  },

  unitCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start'
  },

  unitCode: {
    fontWeight: 900,
    fontSize: 16,
    letterSpacing: '-0.015em',
    wordBreak: 'break-word'
  },

  unitCompany: {
    marginTop: 4,
    color: '#a1a1aa',
    fontSize: 12
  },

  unitHierarchy: {
    marginTop: 11,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    color: '#71717a',
    fontSize: 11
  },

  carrierMini: {
    marginTop: 10,
    color: '#a1a1aa',
    fontFamily: 'monospace',
    fontSize: 11
  },

  badgePending: {
    display: 'inline-flex',
    padding: '6px 9px',
    borderRadius: 999,
    background: '#292524',
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap'
  },

  badgeActive: {
    display: 'inline-flex',
    padding: '6px 9px',
    borderRadius: 999,
    background: '#123224',
    color: '#86efac',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap'
  },

  badgeInactive: {
    display: 'inline-flex',
    padding: '6px 9px',
    borderRadius: 999,
    background: '#2a1717',
    color: '#fca5a5',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap'
  },

  empty: {
    padding: 45,
    textAlign: 'center',
    color: '#71717a'
  },

  detailPanel: {
    minWidth: 0,
    border: '1px solid #24262c',
    background: '#101217',
    borderRadius: 22,
    padding: 22,
    position: 'sticky',
    top: 18
  },

  noSelection: {
    minHeight: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center'
  },

  noSelectionIcon: {
    fontSize: 46,
    color: '#3f3f46'
  },

  noSelectionTitle: {
    margin: '16px 0 7px',
    fontSize: 21
  },

  noSelectionText: {
    margin: 0,
    maxWidth: 330,
    color: '#71717a',
    lineHeight: 1.6,
    fontSize: 13
  },

  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 15,
    marginBottom: 18
  },

  detailCode: {
    margin: '5px 0 0',
    fontSize: 25,
    letterSpacing: '-0.03em',
    wordBreak: 'break-word'
  },

  detailCompany: {
    marginTop: 5,
    color: '#a1a1aa',
    fontSize: 13
  },

  identityPath: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: 9,
    marginBottom: 20
  },

  identityItem: {
    background: '#0b0d11',
    border: '1px solid #24262c',
    borderRadius: 13,
    padding: 12
  },

  identityValue: {
    fontSize: 12,
    fontWeight: 700,
    overflowWrap: 'anywhere'
  },

  qrSection: {
    display: 'flex',
    gap: 18,
    flexWrap: 'wrap',
    alignItems: 'center',
    borderTop: '1px solid #24262c',
    paddingTop: 20
  },

  qrBox: {
    flex: '0 0 auto'
  },

  qrInfo: {
    flex: '1 1 190px',
    minWidth: 0
  },

  carrierId: {
    fontSize: 20,
    fontWeight: 900,
    fontFamily: 'monospace',
    marginBottom: 18
  },

  publicLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.13em'
  },

  publicUrl: {
    marginTop: 6,
    color: '#d4d4d8',
    fontSize: 11,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },

  actionButtonsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 13
  },

  secondaryButton: {
    minHeight: 38,
    borderRadius: 10,
    border: '1px solid #34363d',
    background: '#17191e',
    color: '#ffffff',
    padding: '0 12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 11
  },

  nfcSection: {
    marginTop: 20,
    borderTop: '1px solid #24262c',
    paddingTop: 20
  },

  sectionTitle: {
    fontWeight: 900,
    fontSize: 16
  },

  sectionText: {
    margin: '5px 0 13px',
    color: '#71717a',
    fontSize: 12,
    lineHeight: 1.6
  },

  primaryButton: {
    width: '100%',
    minHeight: 46,
    marginTop: 10,
    border: 0,
    borderRadius: 12,
    background: '#f4f4f5',
    color: '#09090b',
    fontWeight: 900,
    cursor: 'pointer'
  },

  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },

  carrierInfo: {
    marginTop: 20,
    borderTop: '1px solid #24262c',
    paddingTop: 12
  },

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 15,
    padding: '9px 0',
    borderBottom: '1px solid #1d1f24',
    fontSize: 12
  },

  infoLabel: {
    color: '#71717a'
  },

  infoValue: {
    textAlign: 'right',
    fontWeight: 700,
    overflowWrap: 'anywhere'
  },

  stateActions: {
    marginTop: 18
  },

  deactivateButton: {
    width: '100%',
    minHeight: 42,
    borderRadius: 11,
    border: '1px solid #542020',
    background: '#1f1010',
    color: '#fca5a5',
    cursor: 'pointer',
    fontWeight: 800
  },

  activateButton: {
    width: '100%',
    minHeight: 42,
    borderRadius: 11,
    border: '1px solid #1e5137',
    background: '#10251b',
    color: '#86efac',
    cursor: 'pointer',
    fontWeight: 800
  },

  assignBox: {
    borderTop: '1px solid #24262c',
    paddingTop: 26,
    textAlign: 'center'
  },

  assignIcon: {
    width: 52,
    height: 52,
    margin: '0 auto',
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    background: '#1d2026',
    fontSize: 30,
    color: '#d4d4d8'
  },

  assignTitle: {
    margin: '16px 0 7px',
    fontSize: 20
  },

  assignText: {
    maxWidth: 370,
    margin: '0 auto',
    color: '#71717a',
    fontSize: 12,
    lineHeight: 1.65
  },

  previewUrl: {
    marginTop: 20,
    textAlign: 'left',
    background: '#0b0d11',
    border: '1px solid #24262c',
    borderRadius: 13,
    padding: 13
  },

  nfcOptional: {
    marginTop: 14,
    textAlign: 'left'
  },

  assignNotice: {
    marginTop: 13,
    color: '#52525b',
    fontSize: 10,
    lineHeight: 1.6
  }
}
