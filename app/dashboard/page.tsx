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
  email: string | null
  nombre: string | null
  cargo: string | null
  rol: string | null
  activo: boolean | null
  empresa_id: string | null
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

  useEffect(() => {
    iniciarDashboard()
  }, [])

  async function iniciarDashboard() {
    try {
      setLoading(true)

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

      setPerfil(perfilData)

      // ==========================================
      // 3. CARGAR ESTADÍSTICAS
      // ==========================================

      await cargarEstadisticas()

    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cargarEstadisticas() {
    try {
      const [
        empresasResult,
        productosResult,
        modelosResult,
        lotesResult,
        unidadesResult,
        eventosResult
      ] = await Promise.all([
        supabase
          .from('empresas')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('productos')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('modelos')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('lotes')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('unidades')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('eventos_trazabilidad')
          .select('*', { count: 'exact', head: true })
      ])

      setStats({
        empresas: empresasResult.count ?? 0,
        productos: productosResult.count ?? 0,
        modelos: modelosResult.count ?? 0,
        lotes: lotesResult.count ?? 0,
        unidades: unidadesResult.count ?? 0,
        eventos: eventosResult.count ?? 0
      })

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
    }
  }

  async function cerrarSesion() {
    try {
      setCerrando(true)

      await supabase.auth.signOut()

      router.replace('/login')

    } catch (error) {
      console.error('Error cerrando sesión:', error)
      setCerrando(false)
    }
  }

  const ir = (ruta: string) => {
    router.push(ruta)
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <main style={styles.loading}>
        <div style={styles.loadingBox}>
          <div style={styles.brand}>VINCULAB</div>

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
              {perfil?.rol || 'usuario'}
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

        <section style={styles.welcome}>

          <div>

            <div style={styles.sectionLabel}>
              PANEL DE ADMINISTRACIÓN
            </div>

            <h1 style={styles.title}>
              Dashboard
            </h1>

            <p style={styles.subtitle}>
              Control central de identidad digital,
              trazabilidad y ciclo de vida de productos.
            </p>

          </div>

          <div style={styles.accessBadge}>
            <span style={styles.accessDot}></span>

            Acceso autorizado
          </div>

        </section>

        {/* =====================================
            ESTADÍSTICAS
        ===================================== */}

        <section style={styles.statsGrid}>

          <StatCard
            title="Empresas"
            value={stats.empresas}
            description="Organizaciones registradas"
            icon="🏢"
          />

          <StatCard
            title="Productos"
            value={stats.productos}
            description="Productos registrados"
            icon="📦"
          />

          <StatCard
            title="Modelos"
            value={stats.modelos}
            description="Modelos de productos"
            icon="🏷️"
          />

          <StatCard
            title="Lotes"
            value={stats.lotes}
            description="Lotes de producción"
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
            Administración Vinculab
          </h2>

          <div style={styles.modulesGrid}>

            <ModuleCard
              title="Empresas"
              description="Administrar organizaciones y fabricantes registrados en la plataforma."
              icon="🏢"
              onClick={() => ir('/empresas')}
            />

            <ModuleCard
              title="Productos"
              description="Gestionar productos, categorías y elementos asociados."
              icon="📦"
              onClick={() => ir('/productos')}
            />

            <ModuleCard
              title="Modelos"
              description="Administrar modelos vinculados a los productos."
              icon="🏷️"
              onClick={() => ir('/modelos')}
            />

            <ModuleCard
              title="Lotes / QR"
              description="Crear lotes, generar identidades digitales y códigos QR."
              icon="▦"
              onClick={() => ir('/lotes')}
              highlight
            />

            <ModuleCard
              title="Identidades digitales"
              description="Consultar unidades individuales y su ciclo de vida."
              icon="◈"
              onClick={() => ir('/unidades')}
            />

            <ModuleCard
              title="Trazabilidad"
              description="Historial de fabricación, calidad, despacho, mantenimiento y otros eventos."
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
              Cuenta administrativa
            </h2>

          </div>

          <div style={styles.accountGrid}>

            <Info
              label="Usuario"
              value={perfil?.nombre || 'Administrador'}
            />

            <Info
              label="Correo"
              value={perfil?.email || '-'}
            />

            <Info
              label="Cargo"
              value={perfil?.cargo || '-'}
            />

            <Info
              label="Rol"
              value={perfil?.rol || '-'}
            />

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
}: any) {

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
}: any) {

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
}: any) {

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
    background: '#0c0c0f'
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
    padding: '42px 30px 70px'
  },

  welcome: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 30
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
    maxWidth: 620,
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
      'repeat(auto-fit, minmax(350px, 1fr))',
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
    fontWeight: 700
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
    fontSize: 11
  }
}
