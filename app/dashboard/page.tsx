'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Perfil = {
  id: string
  email?: string | null
  nombre: string | null
  cargo: string | null
  rol: string | null
  activo: boolean | null
  empresa_id: string | null
}

type Empresa = {
  id: string
  razon_social?: string | null
  empresa_nombre?: string | null
}

type Stats = {
  empresas: number
  productos: number
  modelos: number
  lotes: number
  unidades: number
  eventos: number
}

export default function DashboardPage() {
  const router = useRouter()

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [emailUsuario, setEmailUsuario] = useState('')

  const [stats, setStats] = useState<Stats>({
    empresas: 0,
    productos: 0,
    modelos: 0,
    lotes: 0,
    unidades: 0,
    eventos: 0
  })

  const [loading, setLoading] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const [errorDashboard, setErrorDashboard] = useState('')

  useEffect(() => {
    iniciarDashboard()
  }, [])

  async function iniciarDashboard() {
    try {
      setLoading(true)
      setErrorDashboard('')

      // ==========================================
      // 1. COMPROBAR SESIÓN
      // ==========================================

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.replace('/login')
        return
      }

      setEmailUsuario(user.email || '')

      // ==========================================
      // 2. OBTENER PERFIL
      // ==========================================

      const { data: perfilData, error: perfilError } =
        await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

      if (perfilError) {
        console.error('Error obteniendo perfil:', perfilError)
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      if (!perfilData) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      if (perfilData.activo === false) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      // ==========================================
      // 3. VALIDAR ROL
      // ==========================================

      const esSuperadmin = perfilData.rol === 'superadmin'
      const esAdminEmpresa = perfilData.rol === 'admin_empresa'

      if (!esSuperadmin && !esAdminEmpresa) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      if (esAdminEmpresa && !perfilData.empresa_id) {
        console.error(
          'El administrador de empresa no tiene empresa_id.'
        )

        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      setPerfil(perfilData)

      // ==========================================
      // 4. OBTENER EMPRESA DEL USUARIO
      // ==========================================

      if (esAdminEmpresa && perfilData.empresa_id) {
        const { data: empresaData, error: empresaError } =
          await supabase
            .from('empresas')
            .select('id, razon_social, empresa_nombre')
            .eq('id', perfilData.empresa_id)
            .maybeSingle()

        if (empresaError) {
          console.error(
            'Error obteniendo empresa:',
            empresaError
          )
        }

        if (empresaData) {
          setEmpresa(empresaData)
        }
      } else {
        setEmpresa(null)
      }

      // ==========================================
      // 5. CARGAR ESTADÍSTICAS
      // RLS DETERMINA QUÉ REGISTROS PUEDE VER
      // ==========================================

      await cargarEstadisticas(esSuperadmin)

    } catch (error) {
      console.error('Error cargando dashboard:', error)

      setErrorDashboard(
        'No fue posible cargar completamente el panel.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function cargarEstadisticas(
    esSuperadmin: boolean
  ) {
    try {
      const [
        productosResult,
        modelosResult,
        lotesResult,
        unidadesResult,
        eventosResult
      ] = await Promise.all([
        supabase
          .from('productos')
          .select('*', {
            count: 'exact',
            head: true
          }),

        supabase
          .from('modelos')
          .select('*', {
            count: 'exact',
            head: true
          }),

        supabase
          .from('lotes')
          .select('*', {
            count: 'exact',
            head: true
          }),

        supabase
          .from('unidades')
          .select('*', {
            count: 'exact',
            head: true
          }),

        supabase
          .from('eventos_trazabilidad')
          .select('*', {
            count: 'exact',
            head: true
          })
      ])

      let totalEmpresas = 0

      // Solo el superadmin necesita el total global.
      if (esSuperadmin) {
        const empresasResult = await supabase
          .from('empresas')
          .select('*', {
            count: 'exact',
            head: true
          })

        totalEmpresas = empresasResult.count ?? 0
      }

      setStats({
        empresas: totalEmpresas,
        productos: productosResult.count ?? 0,
        modelos: modelosResult.count ?? 0,
        lotes: lotesResult.count ?? 0,
        unidades: unidadesResult.count ?? 0,
        eventos: eventosResult.count ?? 0
      })

    } catch (error) {
      console.error(
        'Error obteniendo estadísticas:',
        error
      )
    }
  }

  async function cerrarSesion() {
    try {
      setCerrando(true)

      await supabase.auth.signOut()

      router.replace('/login')

    } catch (error) {
      console.error(
        'Error cerrando sesión:',
        error
      )

      setCerrando(false)
    }
  }

  const ir = (ruta: string) => {
    router.push(ruta)
  }

  // ============================================
  // VARIABLES DE ACCESO
  // ============================================

  const esSuperadmin =
    perfil?.rol === 'superadmin'

  const esAdminEmpresa =
    perfil?.rol === 'admin_empresa'

  const nombreEmpresa =
    empresa?.razon_social ||
    empresa?.empresa_nombre ||
    'Mi empresa'

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <main style={styles.loading}>
        <div style={styles.loadingBox}>

          <div style={styles.brand}>
            VINCULAB
          </div>

          <div style={styles.loadingTitle}>
            Cargando plataforma...
          </div>

          <div style={styles.loadingText}>
            Verificando acceso y trazabilidad
          </div>

        </div>
      </main>
    )
  }

  // ============================================
  // DASHBOARD
  // ============================================

  return (
    <main style={styles.page}>

      {/* =======================================
          HEADER
      ======================================= */}

      <header style={styles.header}>

        <div>

          <div style={styles.brand}>
            VINCULAB
          </div>

          <div style={styles.brandSubtitle}>
            Plataforma de identidad y trazabilidad
          </div>

        </div>

        <div style={styles.userArea}>

          <div style={styles.userInfo}>

            <div style={styles.userName}>
              {perfil?.nombre || 'Administrador'}
            </div>

            <div style={styles.userRole}>
              {esSuperadmin
                ? 'SUPERADMIN'
                : esAdminEmpresa
                  ? 'ADMINISTRADOR EMPRESA'
                  : perfil?.rol || 'USUARIO'}
            </div>

          </div>

          <button
            onClick={cerrarSesion}
            disabled={cerrando}
            style={styles.logoutButton}
          >
            {cerrando
              ? 'Cerrando...'
              : 'Cerrar sesión'}
          </button>

        </div>

      </header>

      {/* =======================================
          CONTENIDO
      ======================================= */}

      <div style={styles.container}>

        {errorDashboard && (
          <div style={styles.errorBox}>
            {errorDashboard}
          </div>
        )}

        {/* =====================================
            BIENVENIDA
        ===================================== */}

        <section style={styles.welcome}>

          <div>

            <div style={styles.sectionLabel}>
              {esSuperadmin
                ? 'ADMINISTRACIÓN GLOBAL'
                : 'PANEL DE EMPRESA'}
            </div>

            <h1 style={styles.title}>
              {esSuperadmin
                ? 'Dashboard Vinculab'
                : nombreEmpresa}
            </h1>

            <p style={styles.subtitle}>
              {esSuperadmin
                ? (
                  <>
                    Control central de empresas,
                    identidad digital, trazabilidad
                    y ciclo de vida de productos.
                  </>
                )
                : (
                  <>
                    Gestión de productos, modelos,
                    lotes, identidades digitales
                    y trazabilidad de {nombreEmpresa}.
                  </>
                )}
            </p>

          </div>

          <div style={styles.accessBadge}>
            <span style={styles.accessDot}></span>

            {esSuperadmin
              ? 'Acceso global'
              : 'Acceso autorizado'}
          </div>

        </section>

        {/* =====================================
            IDENTIFICACIÓN EMPRESA
        ===================================== */}

        {esAdminEmpresa && (
          <section style={styles.companyBanner}>

            <div style={styles.companyIcon}>
              🏢
            </div>

            <div>

              <div style={styles.companyLabel}>
                ORGANIZACIÓN ACTIVA
              </div>

              <div style={styles.companyName}>
                {nombreEmpresa}
              </div>

              <div style={styles.companyDescription}>
                Los registros visibles en este panel
                corresponden únicamente a esta empresa.
              </div>

            </div>

          </section>
        )}

        {/* =====================================
            ESTADÍSTICAS
        ===================================== */}

        <section style={styles.statsGrid}>

          {esSuperadmin && (
            <StatCard
              title="Empresas"
              value={stats.empresas}
              description="Organizaciones registradas"
              icon="🏢"
            />
          )}

          <StatCard
            title="Productos"
            value={stats.productos}
            description={
              esSuperadmin
                ? 'Productos registrados'
                : 'Productos de la empresa'
            }
            icon="📦"
          />

          <StatCard
            title="Modelos"
            value={stats.modelos}
            description={
              esSuperadmin
                ? 'Modelos de productos'
                : 'Modelos de la empresa'
            }
            icon="🏷️"
          />

          <StatCard
            title="Lotes"
            value={stats.lotes}
            description={
              esSuperadmin
                ? 'Lotes de producción'
                : 'Lotes de la empresa'
            }
            icon="▦"
          />

          <StatCard
            title="Identidades digitales"
            value={stats.unidades}
            description="Unidades individuales"
            icon="◈"
            highlight
          />

          <StatCard
            title="Eventos"
            value={stats.eventos}
            description="Registros de trazabilidad"
            icon="↻"
          />

        </section>

        {/* =====================================
            MÓDULOS
        ===================================== */}

        <section style={{ marginTop: 42 }}>

          <div style={styles.sectionLabel}>
            MÓDULOS
          </div>

          <h2 style={styles.sectionTitle}>
            {esSuperadmin
              ? 'Administración Vinculab'
              : `Administración ${nombreEmpresa}`}
          </h2>

          <div style={styles.modulesGrid}>

            {/* SOLO SUPERADMIN */}

            {esSuperadmin && (
              <ModuleCard
                title="Empresas"
                description="Administrar organizaciones y fabricantes registrados en la plataforma."
                icon="🏢"
                onClick={() => ir('/empresas')}
              />
            )}

            {/* SUPERADMIN + ADMIN EMPRESA */}

            <ModuleCard
              title="Productos"
              description={
                esSuperadmin
                  ? 'Gestionar productos, categorías y elementos asociados.'
                  : 'Crear y administrar los productos de tu empresa.'
              }
              icon="📦"
              onClick={() => ir('/productos')}
            />

            <ModuleCard
              title="Modelos"
              description={
                esSuperadmin
                  ? 'Administrar modelos vinculados a los productos.'
                  : 'Crear y administrar modelos asociados a tus productos.'
              }
              icon="🏷️"
              onClick={() => ir('/modelos')}
            />

            <ModuleCard
              title="Lotes / QR"
              description={
                esSuperadmin
                  ? 'Crear lotes, generar identidades digitales y códigos QR.'
                  : 'Crear lotes y generar códigos QR para tus productos.'
              }
              icon="▦"
              onClick={() => ir('/lotes')}
              highlight
            />

            <ModuleCard
              title="Identidades digitales"
              description={
                esSuperadmin
                  ? 'Consultar unidades individuales y su ciclo de vida.'
                  : 'Consultar las unidades individuales y su identidad digital.'
              }
              icon="◈"
              onClick={() => ir('/unidades')}
            />

            <ModuleCard
              title="Trazabilidad"
              description={
                esSuperadmin
                  ? 'Historial de fabricación, calidad, despacho, mantenimiento y otros eventos.'
                  : 'Registrar y consultar eventos del ciclo de vida de tus productos.'
              }
              icon="↻"
              onClick={() => ir('/trazabilidad')}
            />

          </div>

        </section>

        {/* =====================================
            INFORMACIÓN DEL USUARIO
        ===================================== */}

        <section style={styles.accountSection}>

          <div>

            <div style={styles.sectionLabel}>
              SESIÓN ACTUAL
            </div>

            <h2 style={styles.sectionTitle}>
              {esSuperadmin
                ? 'Cuenta administrativa'
                : 'Cuenta de empresa'}
            </h2>

          </div>

          <div style={styles.accountGrid}>

            <Info
              label="Usuario"
              value={
                perfil?.nombre ||
                'Administrador'
              }
            />

            <Info
              label="Correo"
              value={
                emailUsuario ||
                perfil?.email ||
                '-'
              }
            />

            <Info
              label="Cargo"
              value={
                perfil?.cargo || '-'
              }
            />

            <Info
              label="Rol"
              value={
                esSuperadmin
                  ? 'Superadministrador'
                  : esAdminEmpresa
                    ? 'Administrador de empresa'
                    : perfil?.rol || '-'
              }
            />

            {esAdminEmpresa && (
              <Info
                label="Empresa"
                value={nombreEmpresa}
              />
            )}

          </div>

        </section>

      </div>

      {/* =======================================
          FOOTER
      ======================================= */}

      <footer style={styles.footer}>

        <strong style={{ color: '#ff6a00' }}>
          VINCULAB
        </strong>

        <span>
          Identidad digital · Trazabilidad · Ciclo de vida
        </span>

      </footer>

    </main>
  )
}

// =============================================
// COMPONENTE ESTADÍSTICA
// =============================================

function StatCard({
  title,
  value,
  description,
  icon,
  highlight = false
}: {
  title: string
  value: number
  description: string
  icon: string
  highlight?: boolean
}) {
  return (
    <div
      style={{
        ...styles.statCard,
        ...(highlight
          ? styles.statHighlight
          : {})
      }}
    >

      <div style={styles.statTop}>

        <div style={styles.statIcon}>
          {icon}
        </div>

        {highlight && (
          <div style={styles.primaryBadge}>
            PRINCIPAL
          </div>
        )}

      </div>

      <div style={styles.statValue}>
        {value}
      </div>

      <div style={styles.statTitle}>
        {title}
      </div>

      <div style={styles.statDescription}>
        {description}
      </div>

    </div>
  )
}

// =============================================
// COMPONENTE MÓDULO
// =============================================

function ModuleCard({
  title,
  description,
  icon,
  onClick,
  highlight = false
}: {
  title: string
  description: string
  icon: string
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.moduleCard,
        ...(highlight
          ? styles.moduleHighlight
          : {})
      }}
    >

      <div style={styles.moduleIcon}>
        {icon}
      </div>

      <div style={styles.moduleContent}>

        <div style={styles.moduleTitle}>
          {title}
        </div>

        <div style={styles.moduleDescription}>
          {description}
        </div>

      </div>

      <div style={styles.moduleArrow}>
        →
      </div>

    </button>
  )
}

// =============================================
// COMPONENTE INFORMACIÓN
// =============================================

function Info({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.infoBox}>

      <div style={styles.infoLabel}>
        {label}
      </div>

      <div style={styles.infoValue}>
        {value}
      </div>

    </div>
  )
}

// =============================================
// ESTILOS
// =============================================

const styles: Record<string, React.CSSProperties> = {

  page: {
    minHeight: '100vh',
    background: '#09090b',
    color: '#ffffff',
    fontFamily:
      'Arial, Helvetica, sans-serif'
  },

  loading: {
    minHeight: '100vh',
    background: '#09090b',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  loadingBox: {
    textAlign: 'center'
  },

  loadingTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginTop: 20
  },

  loadingText: {
    color: '#71717a',
    marginTop: 8
  },

  header: {
    minHeight: 82,
    borderBottom:
      '1px solid #27272a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    background: '#0c0c0f',
    gap: 20
  },

  brand: {
    color: '#ff6a00',
    fontWeight: 900,
    letterSpacing: 3,
    fontSize: 20
  },

  brandSubtitle: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 5
  },

  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 18
  },

  userInfo: {
    textAlign: 'right'
  },

  userName: {
    fontSize: 14,
    fontWeight: 800
  },

  userRole: {
    fontSize: 11,
    color: '#ff6a00',
    textTransform: 'uppercase',
    marginTop: 3,
    fontWeight: 800
  },

  logoutButton: {
    background: '#27272a',
    border: '1px solid #3f3f46',
    color: 'white',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer'
  },

  container: {
    width: '100%',
    maxWidth: 1450,
    margin: '0 auto',
    padding: '42px 30px 70px',
    boxSizing: 'border-box'
  },

  welcome: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 30,
    flexWrap: 'wrap'
  },

  sectionLabel: {
    color: '#ff6a00',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: 900
  },

  title: {
    fontSize: 38,
    margin: '8px 0 6px'
  },

  subtitle: {
    color: '#a1a1aa',
    margin: 0,
    maxWidth: 680,
    lineHeight: 1.6
  },

  accessBadge: {
    background: '#052e16',
    border: '1px solid #166534',
    color: '#86efac',
    borderRadius: 100,
    padding: '9px 14px',
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },

  accessDot: {
    width: 8,
    height: 8,
    background: '#22c55e',
    borderRadius: '50%'
  },

  errorBox: {
    background: '#450a0a',
    border: '1px solid #7f1d1d',
    color: '#fecaca',
    borderRadius: 10,
    padding: 14,
    marginBottom: 25,
    fontSize: 13
  },

  companyBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background:
      'linear-gradient(145deg,#18181b,#20150d)',
    border:
      '1px solid rgba(255,106,0,.45)',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24
  },

  companyIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    background: '#27272a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    flexShrink: 0
  },

  companyLabel: {
    color: '#ff6a00',
    fontSize: 10,
    letterSpacing: 1.3,
    fontWeight: 900
  },

  companyName: {
    fontSize: 20,
    fontWeight: 900,
    marginTop: 4
  },

  companyDescription: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 5,
    lineHeight: 1.5
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14
  },

  statCard: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: 14,
    padding: 20
  },

  statHighlight: {
    border:
      '1px solid rgba(255,106,0,.6)',
    background:
      'linear-gradient(145deg,#18181b,#23160d)'
  },

  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    minHeight: 32
  },

  statIcon: {
    fontSize: 23
  },

  primaryBadge: {
    background: '#ff6a00',
    color: 'white',
    fontSize: 9,
    fontWeight: 900,
    padding: '5px 8px',
    borderRadius: 100
  },

  statValue: {
    fontSize: 34,
    fontWeight: 900,
    marginTop: 15
  },

  statTitle: {
    fontSize: 14,
    fontWeight: 800,
    marginTop: 4
  },

  statDescription: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 6
  },

  sectionTitle: {
    margin: '6px 0 18px',
    fontSize: 24
  },

  modulesGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 14
  },

  moduleCard: {
    width: '100%',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: 14,
    padding: 20,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    cursor: 'pointer',
    gap: 16
  },

  moduleHighlight: {
    border:
      '1px solid rgba(255,106,0,.65)'
  },

  moduleIcon: {
    width: 50,
    height: 50,
    background: '#27272a',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0
  },

  moduleContent: {
    flex: 1
  },

  moduleTitle: {
    fontWeight: 900,
    fontSize: 16,
    marginBottom: 6
  },

  moduleDescription: {
    color: '#a1a1aa',
    fontSize: 12,
    lineHeight: 1.5
  },

  moduleArrow: {
    color: '#ff6a00',
    fontSize: 22,
    fontWeight: 900
  },

  accountSection: {
    marginTop: 42,
    paddingTop: 30,
    borderTop:
      '1px solid #27272a'
  },

  accountGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12
  },

  infoBox: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: 10,
    padding: 16
  },

  infoLabel: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  infoValue: {
    marginTop: 7,
    fontSize: 14,
    fontWeight: 700,
    overflowWrap: 'anywhere'
  },

  footer: {
    borderTop:
      '1px solid #27272a',
    minHeight: 70,
    padding: '0 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    color: '#52525b',
    fontSize: 11,
    flexWrap: 'wrap',
    textAlign: 'center'
  }
}
