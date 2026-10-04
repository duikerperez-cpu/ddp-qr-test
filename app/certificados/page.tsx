'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  Certificado,
  EmpresaCertificado,
  PerfilCertificados,
  UnidadCertificado,
  cambiarEstadoCertificado,
  crearCertificado,
  getCertificados,
  getEmpresasCertificados,
  getPerfilCertificados,
  getUnidadesCertificados,
  normalizarRol,
  revocarCertificado
} from './queries'

// ============================================================
// TIPOS LOCALES
// ============================================================

type EstadoCertificado =
  | 'valido'
  | 'revocado'
  | 'vencido'
  | 'suspendido'

type TipoCertificado =
  | 'autenticidad'
  | 'conformidad'
  | 'origen'
  | 'calidad'
  | 'inspeccion'
  | 'material'
  | 'otro'

// ============================================================
// HELPERS
// ============================================================

function nombreEmpresa(
  empresa?: EmpresaCertificado | null
) {
  return (
    empresa?.razon_social ||
    empresa?.empresa_nombre ||
    empresa?.nombre ||
    empresa?.name ||
    empresa?.id ||
    'Empresa'
  )
}

function formatoFecha(
  fecha?: string | null
) {
  if (!fecha) {
    return '-'
  }

  try {
    return new Intl.DateTimeFormat(
      'es-CL',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(
      new Date(fecha)
    )
  } catch {
    return fecha
  }
}

function etiquetaTipo(
  tipo?: string | null
) {
  switch (tipo) {
    case 'autenticidad':
      return 'Autenticidad'

    case 'conformidad':
      return 'Conformidad'

    case 'origen':
      return 'Origen'

    case 'calidad':
      return 'Calidad'

    case 'inspeccion':
      return 'Inspección'

    case 'material':
      return 'Material'

    case 'otro':
      return 'Otro'

    default:
      return tipo || '-'
  }
}

function etiquetaEstado(
  estado?: string | null
) {
  switch (estado) {
    case 'valido':
      return 'Válido'

    case 'revocado':
      return 'Revocado'

    case 'vencido':
      return 'Vencido'

    case 'suspendido':
      return 'Suspendido'

    default:
      return estado || '-'
  }
}

function codigoUnidad(
  unidad?: UnidadCertificado | null
) {
  if (!unidad) {
    return '-'
  }

  return (
    unidad.codigo_publico ||
    unidad.codigo_qr ||
    unidad.id
  )
}

// ============================================================
// PÁGINA
// ============================================================

export default function CertificadosPage() {
  const router = useRouter()

  const [
    perfil,
    setPerfil
  ] = useState<PerfilCertificados | null>(
    null
  )

  const [
    empresas,
    setEmpresas
  ] = useState<EmpresaCertificado[]>([])

  const [
    unidades,
    setUnidades
  ] = useState<UnidadCertificado[]>([])

  const [
    certificados,
    setCertificados
  ] = useState<Certificado[]>([])

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    guardando,
    setGuardando
  ] = useState(false)

  const [
    error,
    setError
  ] = useState('')

  const [
    mensaje,
    setMensaje
  ] = useState('')

  const [
    busqueda,
    setBusqueda
  ] = useState('')

  const [
    filtroEstado,
    setFiltroEstado
  ] = useState('todos')

  const [
    filtroEmpresa,
    setFiltroEmpresa
  ] = useState('todas')

  const [
    mostrarEmision,
    setMostrarEmision
  ] = useState(false)

  const [
    unidadSeleccionadaId,
    setUnidadSeleccionadaId
  ] = useState('')

  const [
    tipoSeleccionado,
    setTipoSeleccionado
  ] = useState<TipoCertificado>(
    'autenticidad'
  )

  const [
    tituloCertificado,
    setTituloCertificado
  ] = useState(
    'Certificado de Autenticidad'
  )

  const [
    descripcionCertificado,
    setDescripcionCertificado
  ] = useState('')

  const [
    observaciones,
    setObservaciones
  ] = useState('')

  const [
    fechaVencimiento,
    setFechaVencimiento
  ] = useState('')

  const [
    certificadoSeleccionado,
    setCertificadoSeleccionado
  ] = useState<Certificado | null>(
    null
  )

  // ==========================================================
  // CARGA INICIAL
  // ==========================================================

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    try {
      setLoading(true)
      setError('')
      setMensaje('')

      const [
        perfilData,
        empresasData,
        unidadesData,
        certificadosData
      ] = await Promise.all([
        getPerfilCertificados(),
        getEmpresasCertificados(),
        getUnidadesCertificados(),
        getCertificados()
      ])

      setPerfil(
        perfilData
      )

      setEmpresas(
        empresasData
      )

      setUnidades(
        unidadesData
      )

      setCertificados(
        certificadosData
      )

      if (
        normalizarRol(
          perfilData.rol
        ) === 'adminempresa' &&
        perfilData.empresa_id
      ) {
        setFiltroEmpresa(
          perfilData.empresa_id
        )
      }
    } catch (err: any) {
      console.error(
        'Error cargando certificados:',
        err
      )

      setError(
        err?.message ||
          'No fue posible cargar el módulo de certificados.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // ROL
  // ==========================================================

  const rolNormalizado =
    normalizarRol(
      perfil?.rol
    )

  const esSuperAdmin =
    rolNormalizado ===
    'superadmin'

  const esAdminEmpresa =
    rolNormalizado ===
    'adminempresa'

  // ==========================================================
  // EMPRESA ACTUAL
  // ==========================================================

  const empresaActual =
    useMemo(() => {
      if (
        !perfil?.empresa_id
      ) {
        return null
      }

      return (
        empresas.find(
          (empresa) =>
            empresa.id ===
            perfil.empresa_id
        ) || null
      )
    }, [
      empresas,
      perfil
    ])

  // ==========================================================
  // UNIDAD SELECCIONADA
  // ==========================================================

  const unidadSeleccionada =
    useMemo(() => {
      return (
        unidades.find(
          (unidad) =>
            unidad.id ===
            unidadSeleccionadaId
        ) || null
      )
    }, [
      unidades,
      unidadSeleccionadaId
    ])

  // ==========================================================
  // FILTRADO DE UNIDADES
  // ==========================================================

  const unidadesDisponibles =
    useMemo(() => {
      if (
        esAdminEmpresa
      ) {
        return unidades
      }

      if (
        filtroEmpresa !==
        'todas'
      ) {
        return unidades.filter(
          (unidad) =>
            unidad.empresa_id ===
            filtroEmpresa
        )
      }

      return unidades
    }, [
      unidades,
      esAdminEmpresa,
      filtroEmpresa
    ])

  // ==========================================================
  // FILTRADO DE CERTIFICADOS
  // ==========================================================

  const certificadosFiltrados =
    useMemo(() => {
      const termino =
        busqueda
          .trim()
          .toLowerCase()

      return certificados.filter(
        (certificado) => {
          if (
            filtroEstado !==
              'todos' &&
            certificado.estado !==
              filtroEstado
          ) {
            return false
          }

          if (
            esSuperAdmin &&
            filtroEmpresa !==
              'todas' &&
            certificado.empresa_id !==
              filtroEmpresa
          ) {
            return false
          }

          if (!termino) {
            return true
          }

          const texto = [
            certificado.codigo,
            certificado.tipo,
            certificado.titulo,
            certificado.empresa_nombre,
            certificado.producto_nombre,
            certificado.modelo_nombre,
            certificado.lote_codigo,
            certificado.unidad_codigo,
            certificado.dpp_codigo,
            certificado.carrier_id,
            certificado.referencia_verificacion
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return texto.includes(
            termino
          )
        }
      )
    }, [
      certificados,
      busqueda,
      filtroEstado,
      filtroEmpresa,
      esSuperAdmin
    ])

  // ==========================================================
  // ESTADÍSTICAS
  // ==========================================================

  const totalCertificados =
    certificados.length

  const totalValidos =
    certificados.filter(
      (certificado) =>
        certificado.estado ===
        'valido'
    ).length

  const totalSuspendidos =
    certificados.filter(
      (certificado) =>
        certificado.estado ===
        'suspendido'
    ).length

  const totalRevocados =
    certificados.filter(
      (certificado) =>
        certificado.estado ===
        'revocado'
    ).length

  // ==========================================================
  // NUEVA EMISIÓN
  // ==========================================================

  function abrirEmision() {
    setError('')
    setMensaje('')

    setUnidadSeleccionadaId('')
    setTipoSeleccionado(
      'autenticidad'
    )
    setTituloCertificado(
      'Certificado de Autenticidad'
    )
    setDescripcionCertificado('')
    setObservaciones('')
    setFechaVencimiento('')

    setMostrarEmision(true)
  }

  function cerrarEmision() {
    if (guardando) {
      return
    }

    setMostrarEmision(false)
  }

  function cambiarTipo(
    tipo: TipoCertificado
  ) {
    setTipoSeleccionado(
      tipo
    )

    switch (tipo) {
      case 'autenticidad':
        setTituloCertificado(
          'Certificado de Autenticidad'
        )
        break

      case 'conformidad':
        setTituloCertificado(
          'Certificado de Conformidad'
        )
        break

      case 'origen':
        setTituloCertificado(
          'Certificado de Origen'
        )
        break

      case 'calidad':
        setTituloCertificado(
          'Certificado de Calidad'
        )
        break

      case 'inspeccion':
        setTituloCertificado(
          'Certificado de Inspección'
        )
        break

      case 'material':
        setTituloCertificado(
          'Certificado de Material'
        )
        break

      default:
        setTituloCertificado(
          'Certificado Vinculab'
        )
    }
  }

  async function emitirCertificado() {
    if (
      !unidadSeleccionada
    ) {
      setError(
        'Selecciona una unidad para emitir el certificado.'
      )

      return
    }

    if (
      !tituloCertificado.trim()
    ) {
      setError(
        'Debes indicar un título para el certificado.'
      )

      return
    }

    try {
      setGuardando(true)
      setError('')
      setMensaje('')

      const nuevo =
        await crearCertificado({
          unidad:
            unidadSeleccionada,

          tipo:
            tipoSeleccionado,

          titulo:
            tituloCertificado.trim(),

          descripcion:
            descripcionCertificado.trim() ||
            null,

          fechaVencimiento:
            fechaVencimiento
              ? new Date(
                  `${fechaVencimiento}T23:59:59`
                ).toISOString()
              : null,

          observaciones:
            observaciones.trim() ||
            null
        })

      setMostrarEmision(false)

      setMensaje(
        `Certificado ${nuevo.codigo} emitido correctamente.`
      )

      await cargar()

      setMensaje(
        `Certificado ${nuevo.codigo} emitido correctamente.`
      )
    } catch (err: any) {
      console.error(
        'Error emitiendo certificado:',
        err
      )

      setError(
        err?.message ||
          'No fue posible emitir el certificado.'
      )
    } finally {
      setGuardando(false)
    }
  }

  // ==========================================================
  // CAMBIAR ESTADO
  // ==========================================================

  async function cambiarEstado(
    certificado: Certificado,
    estado: EstadoCertificado
  ) {
    const confirmar =
      window.confirm(
        `¿Cambiar el certificado ${certificado.codigo} a "${etiquetaEstado(
          estado
        )}"?`
      )

    if (!confirmar) {
      return
    }

    try {
      setError('')
      setMensaje('')

      await cambiarEstadoCertificado(
        certificado.id,
        estado
      )

      setMensaje(
        `Estado de ${certificado.codigo} actualizado correctamente.`
      )

      await cargar()

      setMensaje(
        `Estado de ${certificado.codigo} actualizado correctamente.`
      )
    } catch (err: any) {
      console.error(
        'Error cambiando estado:',
        err
      )

      setError(
        err?.message ||
          'No fue posible cambiar el estado.'
      )
    }
  }

  // ==========================================================
  // REVOCAR
  // ==========================================================

  async function revocar(
    certificado: Certificado
  ) {
    const motivo =
      window.prompt(
        `Motivo de revocación de ${certificado.codigo}:`
      )

    if (motivo === null) {
      return
    }

    const confirmar =
      window.confirm(
        `¿Confirmas la revocación de ${certificado.codigo}? El certificado permanecerá en el historial.`
      )

    if (!confirmar) {
      return
    }

    try {
      setError('')
      setMensaje('')

      await revocarCertificado(
        certificado.id,
        motivo.trim() ||
          'Certificado revocado'
      )

      setMensaje(
        `Certificado ${certificado.codigo} revocado correctamente.`
      )

      setCertificadoSeleccionado(
        null
      )

      await cargar()

      setMensaje(
        `Certificado ${certificado.codigo} revocado correctamente.`
      )
    } catch (err: any) {
      console.error(
        'Error revocando:',
        err
      )

      setError(
        err?.message ||
          'No fue posible revocar el certificado.'
      )
    }
  }

  // ==========================================================
  // NAVEGACIÓN
  // ==========================================================

  function volver() {
    if (esSuperAdmin) {
      router.push('/admin')
      return
    }

    router.push('/portal')
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.brand}>
            VINCULAB
          </div>

          <div style={styles.loadingTitle}>
            Cargando Certificados...
          </div>

          <div style={styles.loadingText}>
            Verificando identidad,
            organización y certificados
          </div>
        </div>
      </main>
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main style={styles.page}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            style={styles.backButton}
            onClick={volver}
          >
            ←
          </button>

          <div>
            <div style={styles.brand}>
              VINCULAB
            </div>

            <div style={styles.brandSubtitle}>
              Certificados digitales
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.roleBox}>
            <div style={styles.roleLabel}>
              ACCESO
            </div>

            <div style={styles.roleValue}>
              {esSuperAdmin
                ? 'Super Admin'
                : 'Administrador de Empresa'}
            </div>
          </div>

          <button
            style={styles.primaryButton}
            onClick={abrirEmision}
          >
            + Emitir certificado
          </button>
        </div>
      </header>

      <div style={styles.container}>
        {/* ====================================================
            HERO
        ==================================================== */}

        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.sectionLabel}>
              IDENTIDAD DIGITAL VERIFICABLE
            </div>

            <h1 style={styles.heroTitle}>
              Certificados
            </h1>

            <p style={styles.heroText}>
              Emite y administra certificados
              digitales vinculados a la identidad
              física de cada producto, su DPP,
              lote y carrier NFC/QR.
            </p>
          </div>

          <div style={styles.heroSeal}>
            <div style={styles.heroSealIcon}>
              ✓
            </div>

            <div>
              <div style={styles.heroSealTitle}>
                Vinculab
              </div>

              <div style={styles.heroSealText}>
                Identidad verificable
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SEGURIDAD
        ==================================================== */}

        <section style={styles.securityBox}>
          <div style={styles.securityIcon}>
            ◈
          </div>

          <div>
            <div style={styles.securityTitle}>
              {esSuperAdmin
                ? 'Vista global protegida'
                : 'Acceso protegido por empresa'}
            </div>

            <div style={styles.securityText}>
              {esSuperAdmin
                ? 'Puedes administrar certificados de todas las organizaciones registradas en Vinculab.'
                : `Solo puedes consultar y administrar certificados asociados a ${
                    nombreEmpresa(
                      empresaActual
                    )
                  }.`}
            </div>
          </div>
        </section>

        {/* ====================================================
            ESTADÍSTICAS
        ==================================================== */}

        <section style={styles.statsGrid}>
          <StatCard
            label="CERTIFICADOS"
            value={totalCertificados}
            description="Total emitidos"
          />

          <StatCard
            label="VÁLIDOS"
            value={totalValidos}
            description="Certificados vigentes"
          />

          <StatCard
            label="SUSPENDIDOS"
            value={totalSuspendidos}
            description="Revisión temporal"
          />

          <StatCard
            label="REVOCADOS"
            value={totalRevocados}
            description="Historial preservado"
          />
        </section>

        {/* ====================================================
            MENSAJES
        ==================================================== */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {mensaje && (
          <div style={styles.successBox}>
            {mensaje}
          </div>
        )}

        {/* ====================================================
            FILTROS
        ==================================================== */}

        <section style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>
              ⌕
            </span>

            <input
              style={styles.searchInput}
              value={busqueda}
              onChange={(event) =>
                setBusqueda(
                  event.target.value
                )
              }
              placeholder="Buscar certificado, producto, unidad, DPP, lote o carrier..."
            />
          </div>

          <select
            style={styles.select}
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(
                event.target.value
              )
            }
          >
            <option value="todos">
              Todos los estados
            </option>

            <option value="valido">
              Válidos
            </option>

            <option value="suspendido">
              Suspendidos
            </option>

            <option value="vencido">
              Vencidos
            </option>

            <option value="revocado">
              Revocados
            </option>
          </select>

          {esSuperAdmin && (
            <select
              style={styles.select}
              value={filtroEmpresa}
              onChange={(event) =>
                setFiltroEmpresa(
                  event.target.value
                )
              }
            >
              <option value="todas">
                Todas las empresas
              </option>

              {empresas.map(
                (empresa) => (
                  <option
                    key={empresa.id}
                    value={empresa.id}
                  >
                    {nombreEmpresa(
                      empresa
                    )}
                  </option>
                )
              )}
            </select>
          )}

          <button
            style={styles.secondaryButton}
            onClick={cargar}
          >
            ↻ Actualizar
          </button>
        </section>

        {/* ====================================================
            LISTADO
        ==================================================== */}

        <section style={styles.listSection}>
          <div style={styles.listHeader}>
            <div>
              <div style={styles.sectionLabel}>
                REGISTRO PRODUCTIVO
              </div>

              <h2 style={styles.sectionTitle}>
                Certificados emitidos
              </h2>
            </div>

            <div style={styles.resultCount}>
              {
                certificadosFiltrados.length
              }{' '}
              resultado
              {certificadosFiltrados.length ===
              1
                ? ''
                : 's'}
            </div>
          </div>

          {certificadosFiltrados.length ===
          0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                ✓
              </div>

              <div style={styles.emptyTitle}>
                Aún no hay certificados
              </div>

              <div style={styles.emptyText}>
                Emite el primer certificado
                digital Vinculab para una unidad
                registrada.
              </div>

              <button
                style={styles.primaryButton}
                onClick={abrirEmision}
              >
                + Emitir primer certificado
              </button>
            </div>
          ) : (
            <div style={styles.cardsGrid}>
              {certificadosFiltrados.map(
                (certificado) => (
                  <CertificadoCard
                    key={certificado.id}
                    certificado={
                      certificado
                    }
                    onOpen={() =>
                      setCertificadoSeleccionado(
                        certificado
                      )
                    }
                    onPublicOpen={() =>
                      router.push(
                        `/c/${encodeURIComponent(
                          certificado.codigo
                        )}`
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* ======================================================
          MODAL EMISIÓN
      ====================================================== */}

      {mostrarEmision && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.sectionLabel}>
                  NUEVA EMISIÓN
                </div>

                <h2 style={styles.modalTitle}>
                  Emitir certificado
                </h2>
              </div>

              <button
                style={styles.closeButton}
                onClick={cerrarEmision}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              {esSuperAdmin && (
                <Field
                  label="Empresa"
                >
                  <select
                    style={styles.input}
                    value={
                      filtroEmpresa
                    }
                    onChange={(
                      event
                    ) => {
                      setFiltroEmpresa(
                        event.target
                          .value
                      )

                      setUnidadSeleccionadaId(
                        ''
                      )
                    }}
                  >
                    <option value="todas">
                      Seleccionar empresa
                    </option>

                    {empresas.map(
                      (empresa) => (
                        <option
                          key={
                            empresa.id
                          }
                          value={
                            empresa.id
                          }
                        >
                          {nombreEmpresa(
                            empresa
                          )}
                        </option>
                      )
                    )}
                  </select>
                </Field>
              )}

              <Field
                label="Unidad a certificar"
              >
                <select
                  style={styles.input}
                  value={
                    unidadSeleccionadaId
                  }
                  onChange={(event) =>
                    setUnidadSeleccionadaId(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="">
                    Seleccionar unidad
                  </option>

                  {unidadesDisponibles.map(
                    (unidad) => (
                      <option
                        key={unidad.id}
                        value={unidad.id}
                      >
                        {codigoUnidad(
                          unidad
                        )}
                        {' · '}
                        {unidad.producto_nombre ||
                          'Producto'}
                        {unidad.modelo_nombre
                          ? ` · ${unidad.modelo_nombre}`
                          : ''}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {unidadSeleccionada && (
                <div style={styles.unitPreview}>
                  <div style={styles.unitPreviewTop}>
                    <div>
                      <div style={styles.unitLabel}>
                        IDENTIDAD SELECCIONADA
                      </div>

                      <div style={styles.unitCode}>
                        {codigoUnidad(
                          unidadSeleccionada
                        )}
                      </div>
                    </div>

                    <span style={styles.activeBadge}>
                      {unidadSeleccionada.estado ||
                        'Unidad'}
                    </span>
                  </div>

                  <div style={styles.unitGrid}>
                    <MiniInfo
                      label="Producto"
                      value={
                        unidadSeleccionada.producto_nombre ||
                        '-'
                      }
                    />

                    <MiniInfo
                      label="Modelo"
                      value={
                        unidadSeleccionada.modelo_nombre ||
                        '-'
                      }
                    />

                    <MiniInfo
                      label="Lote"
                      value={
                        unidadSeleccionada.lote_codigo ||
                        '-'
                      }
                    />

                    <MiniInfo
                      label="DPP"
                      value={
                        unidadSeleccionada.dpp_codigo ||
                        'Sin DPP'
                      }
                    />

                    <MiniInfo
                      label="Carrier"
                      value={
                        unidadSeleccionada.carrier_id ||
                        'Sin carrier'
                      }
                    />

                    <MiniInfo
                      label="UID NFC"
                      value={
                        unidadSeleccionada.uid_nfc ||
                        'Sin UID'
                      }
                    />
                  </div>
                </div>
              )}

              <div style={styles.formGrid}>
                <Field label="Tipo">
                  <select
                    style={styles.input}
                    value={
                      tipoSeleccionado
                    }
                    onChange={(event) =>
                      cambiarTipo(
                        event.target
                          .value as TipoCertificado
                      )
                    }
                  >
                    <option value="autenticidad">
                      Autenticidad
                    </option>

                    <option value="conformidad">
                      Conformidad
                    </option>

                    <option value="origen">
                      Origen
                    </option>

                    <option value="calidad">
                      Calidad
                    </option>

                    <option value="inspeccion">
                      Inspección
                    </option>

                    <option value="material">
                      Material
                    </option>

                    <option value="otro">
                      Otro
                    </option>
                  </select>
                </Field>

                <Field label="Vencimiento">
                  <input
                    style={styles.input}
                    type="date"
                    value={
                      fechaVencimiento
                    }
                    onChange={(event) =>
                      setFechaVencimiento(
                        event.target
                          .value
                      )
                    }
                  />
                </Field>
              </div>

              <Field label="Título">
                <input
                  style={styles.input}
                  value={
                    tituloCertificado
                  }
                  onChange={(event) =>
                    setTituloCertificado(
                      event.target.value
                    )
                  }
                  placeholder="Título del certificado"
                />
              </Field>

              <Field label="Descripción">
                <textarea
                  style={{
                    ...styles.input,
                    minHeight: 90,
                    resize: 'vertical'
                  }}
                  value={
                    descripcionCertificado
                  }
                  onChange={(event) =>
                    setDescripcionCertificado(
                      event.target.value
                    )
                  }
                  placeholder="Descripción opcional..."
                />
              </Field>

              <Field label="Observaciones">
                <textarea
                  style={{
                    ...styles.input,
                    minHeight: 80,
                    resize: 'vertical'
                  }}
                  value={
                    observaciones
                  }
                  onChange={(event) =>
                    setObservaciones(
                      event.target.value
                    )
                  }
                  placeholder="Observaciones de emisión..."
                />
              </Field>

              <div style={styles.emissionNotice}>
                <strong>
                  Identidad congelada:
                </strong>{' '}
                al emitir, Vinculab guardará
                una copia de los datos
                principales de la unidad,
                producto, modelo, lote, DPP y
                carrier asociados.
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryButton}
                onClick={cerrarEmision}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                style={{
                  ...styles.primaryButton,
                  opacity:
                    guardando
                      ? 0.6
                      : 1
                }}
                onClick={
                  emitirCertificado
                }
                disabled={guardando}
              >
                {guardando
                  ? 'Emitiendo...'
                  : '✓ Emitir certificado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL DETALLE
      ====================================================== */}

      {certificadoSeleccionado && (
        <div style={styles.overlay}>
          <div style={styles.certificateModal}>
            <div style={styles.certificateTop}>
              <div>
                <div style={styles.brand}>
                  VINCULAB
                </div>

                <div style={styles.certificateSmall}>
                  CERTIFICADO DIGITAL
                </div>
              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setCertificadoSeleccionado(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div style={styles.certificateSeal}>
              <div style={styles.bigCheck}>
                ✓
              </div>

              <div style={styles.certificateValid}>
                {etiquetaEstado(
                  certificadoSeleccionado.estado
                )}
              </div>

              <div style={styles.certificateCode}>
                {
                  certificadoSeleccionado.codigo
                }
              </div>
            </div>

            <div style={styles.certificateContent}>
              <div style={styles.certificateLabel}>
                CERTIFICA
              </div>

              <h2 style={styles.certificateTitle}>
                {
                  certificadoSeleccionado.titulo
                }
              </h2>

              {certificadoSeleccionado.descripcion && (
                <p style={styles.certificateDescription}>
                  {
                    certificadoSeleccionado.descripcion
                  }
                </p>
              )}

              <div style={styles.certificateGrid}>
                <CertificateInfo
                  label="Empresa"
                  value={
                    certificadoSeleccionado.empresa_nombre ||
                    certificadoSeleccionado.empresa_id
                  }
                />

                <CertificateInfo
                  label="Producto"
                  value={
                    certificadoSeleccionado.producto_nombre ||
                    '-'
                  }
                />

                <CertificateInfo
                  label="Modelo"
                  value={
                    certificadoSeleccionado.modelo_nombre ||
                    '-'
                  }
                />

                <CertificateInfo
                  label="Lote"
                  value={
                    certificadoSeleccionado.lote_codigo ||
                    '-'
                  }
                />

                <CertificateInfo
                  label="Unidad"
                  value={
                    certificadoSeleccionado.unidad_codigo ||
                    certificadoSeleccionado.unidad_id ||
                    '-'
                  }
                />

                <CertificateInfo
                  label="DPP"
                  value={
                    certificadoSeleccionado.dpp_codigo ||
                    'Sin DPP'
                  }
                />

                <CertificateInfo
                  label="Carrier"
                  value={
                    certificadoSeleccionado.carrier_id ||
                    'Sin carrier'
                  }
                />

                <CertificateInfo
                  label="Tipo"
                  value={etiquetaTipo(
                    certificadoSeleccionado.tipo
                  )}
                />
              </div>

              <div style={styles.verifyBlock}>
                <div>
                  <div style={styles.verifyLabel}>
                    REFERENCIA DE VERIFICACIÓN
                  </div>

                  <div style={styles.verifyValue}>
                    {certificadoSeleccionado.referencia_verificacion ||
                      '-'}
                  </div>
                </div>

                <div style={styles.verifyIcon}>
                  ◈
                </div>
              </div>

              <div style={styles.certificateDates}>
                <div>
                  <span style={styles.muted}>
                    Emitido:
                  </span>{' '}
                  {formatoFecha(
                    certificadoSeleccionado.fecha_emision
                  )}
                </div>

                <div>
                  <span style={styles.muted}>
                    Vencimiento:
                  </span>{' '}
                  {certificadoSeleccionado.fecha_vencimiento
                    ? formatoFecha(
                        certificadoSeleccionado.fecha_vencimiento
                      )
                    : 'Sin vencimiento'}
                </div>
              </div>

              {certificadoSeleccionado.observaciones && (
                <div style={styles.observationBox}>
                  <strong>
                    Observaciones
                  </strong>

                  <div style={styles.observationText}>
                    {
                      certificadoSeleccionado.observaciones
                    }
                  </div>
                </div>
              )}
            </div>

            <div style={styles.certificateFooter}>
              {certificadoSeleccionado.estado !==
                'valido' && (
                <button
                  style={styles.secondaryButton}
                  onClick={() =>
                    cambiarEstado(
                      certificadoSeleccionado,
                      'valido'
                    )
                  }
                >
                  Marcar válido
                </button>
              )}

              {certificadoSeleccionado.estado ===
                'valido' && (
                <button
                  style={styles.secondaryButton}
                  onClick={() =>
                    cambiarEstado(
                      certificadoSeleccionado,
                      'suspendido'
                    )
                  }
                >
                  Suspender
                </button>
              )}

              {certificadoSeleccionado.estado !==
                'revocado' && (
                <button
                  style={styles.dangerButton}
                  onClick={() =>
                    revocar(
                      certificadoSeleccionado
                    )
                  }
                >
                  Revocar certificado
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

// ============================================================
// COMPONENTES
// ============================================================

function StatCard({
  label,
  value,
  description
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>
        {label}
      </div>

      <div style={styles.statValue}>
        {value}
      </div>

      <div style={styles.statDescription}>
        {description}
      </div>
    </div>
  )
}

function CertificadoCard({
  certificado,
  onOpen,
  onPublicOpen
}: {
  certificado: Certificado
  onOpen: () => void
  onPublicOpen: () => void
}) {
  return (
    <div
      style={styles.certificateCard}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <div style={styles.cardTop}>
        <div style={styles.cardSeal}>
          ✓
        </div>

        <EstadoBadge
          estado={
            certificado.estado
          }
        />
      </div>

      <div style={styles.cardCode}>
        {certificado.codigo}
      </div>

      <div style={styles.cardTitle}>
        {certificado.titulo}
      </div>

      <div style={styles.cardType}>
        {etiquetaTipo(
          certificado.tipo
        )}
      </div>

      <div style={styles.cardDivider} />

      <div style={styles.cardRows}>
        <CardRow
          label="Producto"
          value={
            certificado.producto_nombre ||
            '-'
          }
        />

        <CardRow
          label="Unidad"
          value={
            certificado.unidad_codigo ||
            certificado.unidad_id ||
            '-'
          }
        />

        <CardRow
          label="Lote"
          value={
            certificado.lote_codigo ||
            '-'
          }
        />

        <CardRow
          label="Carrier"
          value={
            certificado.carrier_id ||
            'Sin carrier'
          }
        />
      </div>

      <div style={styles.cardBottom}>
        <span>
          {formatoFecha(
            certificado.fecha_emision
          )}
        </span>

        <div style={styles.cardActions}>
          <button
            type="button"
            style={styles.cardManageButton}
            onClick={(event) => {
              event.stopPropagation()
              onOpen()
            }}
          >
            Administrar
          </button>

          <button
            type="button"
            style={styles.cardPublicButton}
            onClick={(event) => {
              event.stopPropagation()
              onPublicOpen()
            }}
          >
            Ver certificado →
          </button>
        </div>
      </div>
    </div>
  )
}

function EstadoBadge({
  estado
}: {
  estado: string
}) {
  let style =
    styles.badgeNeutral

  if (
    estado === 'valido'
  ) {
    style =
      styles.badgeValid
  }

  if (
    estado === 'revocado'
  ) {
    style =
      styles.badgeRevoked
  }

  if (
    estado === 'suspendido'
  ) {
    style =
      styles.badgeSuspended
  }

  if (
    estado === 'vencido'
  ) {
    style =
      styles.badgeExpired
  }

  return (
    <span
      style={{
        ...styles.badge,
        ...style
      }}
    >
      {etiquetaEstado(
        estado
      )}
    </span>
  )
}

function CardRow({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.cardRow}>
      <span style={styles.cardRowLabel}>
        {label}
      </span>

      <span style={styles.cardRowValue}>
        {value}
      </span>
    </div>
  )
}

function Field({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>
        {label}
      </span>

      {children}
    </label>
  )
}

function MiniInfo({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.miniInfo}>
      <div style={styles.miniLabel}>
        {label}
      </div>

      <div style={styles.miniValue}>
        {value}
      </div>
    </div>
  )
}

function CertificateInfo({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.certificateInfo}>
      <div style={styles.certificateInfoLabel}>
        {label}
      </div>

      <div style={styles.certificateInfoValue}>
        {value}
      </div>
    </div>
  )
}

// ============================================================
// ESTILOS
// ============================================================

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: '100vh',
    background: '#09090b',
    color: '#ffffff',
    fontFamily:
      'Arial, Helvetica, sans-serif'
  },

  loadingPage: {
    minHeight: '100vh',
    background: '#09090b',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily:
      'Arial, Helvetica, sans-serif'
  },

  loadingCard: {
    textAlign: 'center'
  },

  loadingTitle: {
    fontSize: 22,
    fontWeight: 900,
    marginTop: 20
  },

  loadingText: {
    color: '#71717a',
    marginTop: 8,
    fontSize: 13
  },

  header: {
    minHeight: 82,
    borderBottom:
      '1px solid #27272a',
    background: '#0c0c0f',
    padding: '14px 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: 20,
    flexWrap: 'wrap'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap'
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    border:
      '1px solid #3f3f46',
    background: '#18181b',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 20
  },

  brand: {
    color: '#ff6a00',
    fontWeight: 900,
    letterSpacing: 3,
    fontSize: 20
  },

  brandSubtitle: {
    color: '#71717a',
    fontSize: 11,
    marginTop: 4
  },

  roleBox: {
    textAlign: 'right'
  },

  roleLabel: {
    color: '#71717a',
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: 900
  },

  roleValue: {
    fontSize: 12,
    fontWeight: 900,
    marginTop: 3
  },

  primaryButton: {
    border: 0,
    borderRadius: 9,
    background: '#ff6a00',
    color: '#ffffff',
    padding: '11px 16px',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: 12
  },

  secondaryButton: {
    border:
      '1px solid #3f3f46',
    borderRadius: 9,
    background: '#18181b',
    color: '#ffffff',
    padding: '10px 14px',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 12
  },

  dangerButton: {
    border:
      '1px solid #7f1d1d',
    borderRadius: 9,
    background: '#450a0a',
    color: '#fecaca',
    padding: '10px 14px',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: 12
  },

  container: {
    width: '100%',
    maxWidth: 1450,
    margin: '0 auto',
    padding:
      '38px 30px 80px',
    boxSizing: 'border-box'
  },

  hero: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: 25,
    flexWrap: 'wrap',
    marginBottom: 22
  },

  heroContent: {
    maxWidth: 760
  },

  sectionLabel: {
    color: '#ff6a00',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.5
  },

  heroTitle: {
    fontSize: 38,
    margin: '7px 0 7px'
  },

  heroText: {
    color: '#a1a1aa',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 700
  },

  heroSeal: {
    minWidth: 230,
    background:
      'linear-gradient(145deg,#18181b,#23160d)',
    border:
      '1px solid rgba(255,106,0,.5)',
    borderRadius: 14,
    padding: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 13
  },

  heroSealIcon: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    border:
      '2px solid #ff6a00',
    color: '#ff6a00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 900
  },

  heroSealTitle: {
    fontWeight: 900
  },

  heroSealText: {
    color: '#a1a1aa',
    fontSize: 11,
    marginTop: 3
  },

  securityBox: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    background: '#111827',
    border:
      '1px solid #1f2937',
    borderRadius: 13,
    padding: 17,
    marginBottom: 22
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: '#1f2937',
    color: '#ff6a00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: 900
  },

  securityText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 1.5,
    marginTop: 4
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 12,
    marginBottom: 20
  },

  statCard: {
    background: '#18181b',
    border:
      '1px solid #27272a',
    borderRadius: 12,
    padding: 18
  },

  statLabel: {
    color: '#71717a',
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: 900
  },

  statValue: {
    fontSize: 30,
    fontWeight: 900,
    marginTop: 8
  },

  statDescription: {
    color: '#71717a',
    fontSize: 11,
    marginTop: 4
  },

  errorBox: {
    background: '#450a0a',
    border:
      '1px solid #7f1d1d',
    color: '#fecaca',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    fontSize: 12
  },

  successBox: {
    background: '#052e16',
    border:
      '1px solid #166534',
    color: '#86efac',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    fontSize: 12
  },

  toolbar: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    background: '#111113',
    border:
      '1px solid #27272a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 25
  },

  searchWrapper: {
    flex: '1 1 340px',
    position: 'relative'
  },

  searchIcon: {
    position: 'absolute',
    left: 13,
    top: '50%',
    transform:
      'translateY(-50%)',
    color: '#71717a'
  },

  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#09090b',
    border:
      '1px solid #3f3f46',
    color: '#ffffff',
    borderRadius: 8,
    padding:
      '11px 12px 11px 37px',
    outline: 'none'
  },

  select: {
    background: '#18181b',
    border:
      '1px solid #3f3f46',
    color: '#ffffff',
    borderRadius: 8,
    padding: '10px 12px',
    outline: 'none'
  },

  listSection: {
    marginTop: 12
  },

  listHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'flex-end',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 16
  },

  sectionTitle: {
    fontSize: 24,
    margin: '5px 0 0'
  },

  resultCount: {
    color: '#71717a',
    fontSize: 11
  },

  emptyState: {
    border:
      '1px dashed #3f3f46',
    borderRadius: 14,
    padding: '55px 20px',
    textAlign: 'center',
    background: '#111113'
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: '50%',
    border:
      '2px solid #ff6a00',
    color: '#ff6a00',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 27,
    fontWeight: 900
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 900,
    marginTop: 17
  },

  emptyText: {
    color: '#71717a',
    fontSize: 12,
    margin:
      '7px auto 18px',
    maxWidth: 400,
    lineHeight: 1.5
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 14
  },

  certificateCard: {
    background:
      'linear-gradient(145deg,#18181b,#131315)',
    border:
      '1px solid #27272a',
    borderRadius: 14,
    padding: 19,
    color: '#ffffff',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%'
  },

  cardTop: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 17
  },

  cardSeal: {
    width: 39,
    height: 39,
    borderRadius: '50%',
    border:
      '1px solid #ff6a00',
    color: '#ff6a00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900
  },

  badge: {
    borderRadius: 100,
    padding: '6px 9px',
    fontSize: 9,
    fontWeight: 900,
    textTransform:
      'uppercase'
  },

  badgeValid: {
    background: '#052e16',
    border:
      '1px solid #166534',
    color: '#86efac'
  },

  badgeRevoked: {
    background: '#450a0a',
    border:
      '1px solid #7f1d1d',
    color: '#fecaca'
  },

  badgeSuspended: {
    background: '#422006',
    border:
      '1px solid #854d0e',
    color: '#fde68a'
  },

  badgeExpired: {
    background: '#27272a',
    border:
      '1px solid #52525b',
    color: '#d4d4d8'
  },

  badgeNeutral: {
    background: '#27272a',
    border:
      '1px solid #52525b',
    color: '#d4d4d8'
  },

  cardCode: {
    color: '#ff6a00',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.7
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 900,
    marginTop: 7
  },

  cardType: {
    color: '#71717a',
    fontSize: 11,
    marginTop: 4
  },

  cardDivider: {
    height: 1,
    background: '#27272a',
    margin: '16px 0'
  },

  cardRows: {
    display: 'grid',
    gap: 8
  },

  cardRow: {
    display: 'flex',
    justifyContent:
      'space-between',
    gap: 15,
    fontSize: 11
  },

  cardRowLabel: {
    color: '#71717a'
  },

  cardRowValue: {
    color: '#d4d4d8',
    textAlign: 'right',
    overflowWrap: 'anywhere'
  },

  cardBottom: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    paddingTop: 13,
    borderTop:
      '1px solid #27272a',
    color: '#52525b',
    fontSize: 10
  },

  openText: {
    color: '#ff6a00',
    fontWeight: 900
  },

  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },

  cardManageButton: {
    border:
      '1px solid #3f3f46',
    borderRadius: 7,
    background: '#18181b',
    color: '#d4d4d8',
    padding: '7px 9px',
    fontSize: 9,
    fontWeight: 900,
    cursor: 'pointer'
  },

  cardPublicButton: {
    border:
      '1px solid rgba(255,106,0,.55)',
    borderRadius: 7,
    background:
      'rgba(255,106,0,.10)',
    color: '#ff6a00',
    padding: '7px 9px',
    fontSize: 9,
    fontWeight: 900,
    cursor: 'pointer'
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background:
      'rgba(0,0,0,.78)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    overflowY: 'auto'
  },

  modal: {
    width: '100%',
    maxWidth: 820,
    maxHeight: '92vh',
    overflowY: 'auto',
    background: '#111113',
    border:
      '1px solid #3f3f46',
    borderRadius: 16
  },

  modalHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: 20,
    padding: 22,
    borderBottom:
      '1px solid #27272a'
  },

  modalTitle: {
    margin: '5px 0 0',
    fontSize: 22
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 9,
    border:
      '1px solid #3f3f46',
    background: '#18181b',
    color: '#ffffff',
    fontSize: 22,
    cursor: 'pointer'
  },

  modalBody: {
    padding: 22,
    display: 'grid',
    gap: 16
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 20,
    borderTop:
      '1px solid #27272a',
    flexWrap: 'wrap'
  },

  field: {
    display: 'grid',
    gap: 7
  },

  fieldLabel: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: 900,
    textTransform:
      'uppercase',
    letterSpacing: 0.8
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#09090b',
    border:
      '1px solid #3f3f46',
    borderRadius: 8,
    color: '#ffffff',
    padding: '11px 12px',
    outline: 'none',
    fontFamily: 'inherit'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14
  },

  unitPreview: {
    background:
      'linear-gradient(145deg,#18181b,#20150d)',
    border:
      '1px solid rgba(255,106,0,.45)',
    borderRadius: 12,
    padding: 16
  },

  unitPreviewTop: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: 15,
    marginBottom: 14
  },

  unitLabel: {
    color: '#71717a',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1
  },

  unitCode: {
    fontWeight: 900,
    marginTop: 4,
    overflowWrap: 'anywhere'
  },

  activeBadge: {
    background: '#052e16',
    border:
      '1px solid #166534',
    color: '#86efac',
    borderRadius: 100,
    padding: '6px 9px',
    fontSize: 9,
    fontWeight: 900
  },

  unitGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 9
  },

  miniInfo: {
    background: '#111113',
    border:
      '1px solid #27272a',
    borderRadius: 8,
    padding: 10
  },

  miniLabel: {
    color: '#71717a',
    fontSize: 8,
    fontWeight: 900,
    textTransform:
      'uppercase'
  },

  miniValue: {
    fontSize: 11,
    fontWeight: 800,
    marginTop: 5,
    overflowWrap: 'anywhere'
  },

  emissionNotice: {
    background: '#111827',
    border:
      '1px solid #1f2937',
    color: '#9ca3af',
    borderRadius: 10,
    padding: 13,
    fontSize: 11,
    lineHeight: 1.5
  },

  certificateModal: {
    width: '100%',
    maxWidth: 850,
    maxHeight: '94vh',
    overflowY: 'auto',
    background: '#f4f0e7',
    color: '#18181b',
    borderRadius: 16,
    border:
      '1px solid #d6d3d1',
    boxShadow:
      '0 30px 80px rgba(0,0,0,.5)'
  },

  certificateTop: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    padding: 25,
    borderBottom:
      '1px solid #d6d3d1'
  },

  certificateSmall: {
    color: '#78716c',
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 5,
    fontWeight: 900
  },

  certificateSeal: {
    textAlign: 'center',
    padding: '35px 20px 20px'
  },

  bigCheck: {
    width: 76,
    height: 76,
    borderRadius: '50%',
    border:
      '3px solid #ff6a00',
    color: '#ff6a00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    fontSize: 38,
    fontWeight: 900
  },

  certificateValid: {
    color: '#166534',
    fontWeight: 900,
    textTransform:
      'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    marginTop: 14
  },

  certificateCode: {
    fontWeight: 900,
    fontSize: 16,
    marginTop: 5
  },

  certificateContent: {
    padding: '15px 32px 32px'
  },

  certificateLabel: {
    color: '#ff6a00',
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: 900,
    textAlign: 'center'
  },

  certificateTitle: {
    textAlign: 'center',
    fontSize: 28,
    margin: '7px 0 8px'
  },

  certificateDescription: {
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 620,
    margin: '0 auto 25px',
    fontSize: 13
  },

  certificateGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 10,
    marginTop: 25
  },

  certificateInfo: {
    border:
      '1px solid #d6d3d1',
    borderRadius: 9,
    padding: 13,
    background:
      'rgba(255,255,255,.45)'
  },

  certificateInfoLabel: {
    color: '#78716c',
    fontSize: 8,
    textTransform:
      'uppercase',
    fontWeight: 900,
    letterSpacing: 0.8
  },

  certificateInfoValue: {
    color: '#1c1917',
    fontSize: 12,
    fontWeight: 800,
    marginTop: 5,
    overflowWrap: 'anywhere'
  },

  verifyBlock: {
    marginTop: 22,
    border:
      '1px solid #d6d3d1',
    background: '#e7e5e4',
    borderRadius: 10,
    padding: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: 15
  },

  verifyLabel: {
    color: '#78716c',
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: 900
  },

  verifyValue: {
    fontSize: 13,
    fontWeight: 900,
    marginTop: 5,
    overflowWrap: 'anywhere'
  },

  verifyIcon: {
    width: 42,
    height: 42,
    borderRadius: 9,
    background: '#18181b',
    color: '#ff6a00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  certificateDates: {
    display: 'flex',
    justifyContent:
      'space-between',
    gap: 15,
    flexWrap: 'wrap',
    marginTop: 20,
    fontSize: 11
  },

  muted: {
    color: '#78716c'
  },

  observationBox: {
    marginTop: 20,
    borderTop:
      '1px solid #d6d3d1',
    paddingTop: 16,
    fontSize: 11
  },

  observationText: {
    color: '#57534e',
    marginTop: 5,
    lineHeight: 1.5
  },

  certificateFooter: {
    borderTop:
      '1px solid #d6d3d1',
    padding: 20,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
    background: '#e7e5e4'
  }
}
