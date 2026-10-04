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
  nombre: string | null
  apellido: string | null
  cargo: string | null
  rol: string | null
  activo: boolean | null
  empresa_id: string | null
}

type Empresa = {
  id: string
  razon_social?: string | null
  empresa_nombre?: string | null
  nombre?: string | null
  name?: string | null
  rut?: string | null
  pais?: string | null
  sector?: string | null
  estado?: string | null
}

export default function PortalPage() {
  const router = useRouter()

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [emailUsuario, setEmailUsuario] = useState('')
  const [loading, setLoading] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const [errorPortal, setErrorPortal] = useState('')

  useEffect(() => {
    iniciarPortal()
  }, [])

  const normalizarRol = (rol: string | null | undefined) => {
    return String(rol || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/_/g, '')
      .replace(/-/g, '')
  }

  async function iniciarPortal() {
    try {
      setLoading(true)
      setErrorPortal('')

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.replace('/login')
        return
      }

      setEmailUsuario(user.email || '')

      const { data: perfilData, error: perfilError } = await supabase
        .from('perfiles')
        .select('id, nombre, apellido, cargo, rol, activo, empresa_id')
        .eq('id', user.id)
        .maybeSingle()

      if (perfilError || !perfilData) {
        console.error('Error obteniendo perfil:', perfilError)
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      if (perfilData.activo === false) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      const rol = normalizarRol(perfilData.rol)

      // El Super Admin no utiliza el Portal Cliente.
      if (rol === 'superadmin') {
        router.replace('/admin')
        return
      }

      // Todo usuario cliente debe estar vinculado a una empresa.
      if (!perfilData.empresa_id) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      setPerfil(perfilData as Perfil)

      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .select(
          'id, razon_social, empresa_nombre, nombre, name, rut, pais, sector, estado'
        )
        .eq('id', perfilData.empresa_id)
        .maybeSingle()

      if (empresaError) {
        console.error('Error obteniendo empresa:', empresaError)
        setErrorPortal(
          'Tu cuenta está activa, pero no fue posible cargar la información de la empresa.'
        )
        return
      }

      if (!empresaData) {
        setErrorPortal(
          'No se encontró la empresa asociada a esta cuenta.'
        )
        return
      }

      setEmpresa(empresaData as Empresa)
    } catch (error) {
      console.error('Error cargando portal:', error)
      setErrorPortal(
        'No fue posible cargar el Portal Cliente. Intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function cerrarSesion() {
    try {
      setCerrando(true)
      await supabase.auth.signOut()
      router.replace('/login')
      router.refresh()
    } catch (error) {
      console.error('Error cerrando sesión:', error)
      setCerrando(false)
    }
  }

  const nombreEmpresa =
    empresa?.razon_social ||
    empresa?.empresa_nombre ||
    empresa?.nombre ||
    empresa?.name ||
    'Mi empresa'

  if (loading) {
    return (
      <main style={styles.loading}>
        <div style={styles.loadingBox}>
          <div style={styles.brand}>VINCULAB</div>

          <div style={styles.loadingTitle}>
            Cargando Portal Cliente...
          </div>

          <div style={styles.loadingText}>
            Verificando sesión y organización
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>
            VINCULAB
          </div>

          <div style={styles.brandSubtitle}>
            Portal Cliente · Identidad y trazabilidad
          </div>
        </div>

        <div style={styles.userArea}>
          <div style={styles.userInfo}>
            <div style={styles.userName}>
              {perfil?.nombre || 'Usuario'}
            </div>

            <div style={styles.userRole}>
              PORTAL CLIENTE
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

      <div style={styles.container}>
        {errorPortal && (
          <div style={styles.errorBox}>
            {errorPortal}
          </div>
        )}

        <section style={styles.welcome}>
          <div>
            <div style={styles.sectionLabel}>
              ESPACIO PRIVADO DE EMPRESA
            </div>

            <h1 style={styles.title}>
              {nombreEmpresa}
            </h1>

            <p style={styles.subtitle}>
              Gestiona la identidad digital, pasaportes de producto,
              trazabilidad y verificaciones de tu organización desde
              un único espacio Vinculab.
            </p>
          </div>

          <div style={styles.accessBadge}>
            <span style={styles.accessDot}></span>
            Acceso autorizado
          </div>
        </section>

        {empresa && (
          <section style={styles.companyBanner}>
            <div style={styles.companyIcon}>
              🏢
            </div>

            <div style={{ flex: 1 }}>
              <div style={styles.companyLabel}>
                ORGANIZACIÓN ACTIVA
              </div>

              <div style={styles.companyName}>
                {nombreEmpresa}
              </div>

              <div style={styles.companyDescription}>
                Este portal está asociado a la empresa identificada
                en tu perfil de Vinculab.
              </div>
            </div>

            <div style={styles.companyMeta}>
              {empresa.sector && (
                <span style={styles.metaBadge}>
                  {empresa.sector}
                </span>
              )}

              {empresa.pais && (
                <span style={styles.metaBadge}>
                  {empresa.pais}
                </span>
              )}

              {empresa.estado && (
                <span style={styles.statusBadge}>
                  {empresa.estado}
                </span>
              )}
            </div>
          </section>
        )}

        <section style={styles.securityNotice}>
          <div style={styles.securityIcon}>
            ◈
          </div>

          <div>
            <div style={styles.securityTitle}>
              Portal Cliente Vinculab
            </div>

            <div style={styles.securityText}>
              La cuenta y la empresa ya están separadas del entorno
              Super Admin. Los módulos de datos se habilitarán de forma
              progresiva junto con sus reglas de seguridad para evitar
              exponer información de otras organizaciones.
            </div>
          </div>
        </section>

        <section style={{ marginTop: 38 }}>
          <div style={styles.sectionLabel}>
            MÓDULOS
          </div>

          <h2 style={styles.sectionTitle}>
            Gestión de {nombreEmpresa}
          </h2>

          <div style={styles.modulesGrid}>
            <ModuleCard
              title="Productos"
              description={`Gestionar productos registrados por ${nombreEmpresa}.`}
              icon="📦"
              status="Activo"
              active
              onClick={() =>
                router.push('/productos')
              }
            />

            <ModuleCard
              title="Modelos"
              description={`Gestionar modelos y especificaciones técnicas de ${nombreEmpresa}.`}
              icon="🏷️"
              status="Activo"
              active
              onClick={() =>
                router.push('/modelos')
              }
            />

            <ModuleCard
              title="Lotes"
              description={`Gestionar lotes, unidades y QR de ${nombreEmpresa}.`}
              icon="▦"
              status="Activo"
              active
              onClick={() =>
                router.push('/lotes')
              }
            />

            <ModuleCard
              title="Unidades"
              description={`Identidades físicas individuales de ${nombreEmpresa}.`}
              icon="◈"
              status="Activo"
              highlight
              active
              onClick={() =>
                router.push('/unidades')
              }
            />

            <ModuleCard
              title="Pasaportes DPP"
              description={`Pasaportes Digitales de Producto de ${nombreEmpresa}.`}
              icon="▤"
              status="Activo"
              active
              onClick={() =>
                router.push('/dpp')
              }
            />

            <ModuleCard
              title="NFC / QR"
              description={`Identificadores físicos NFC y QR vinculados a las unidades de ${nombreEmpresa}.`}
              icon="⌁"
              status="Activo"
              active
              onClick={() =>
                router.push('/nfc-qr')
              }
            />

            <ModuleCard
              title="Certificados"
              description="Certificados digitales vinculados a productos y unidades."
              icon="✓"
              status="Próxima etapa"
            />

            <ModuleCard
              title="Trazabilidad"
              description="Historial verificable del ciclo de vida de tus productos."
              icon="↻"
              status="Próxima etapa"
            />

            <ModuleCard
              title="Verificaciones"
              description={`Consultas y verificaciones realizadas sobre los productos de ${nombreEmpresa}.`}
              icon="⌕"
              status="Activo"
              active
              onClick={() =>
                router.push('/verificaciones')
              }
            />
          </div>
        </section>

        <section style={styles.accountSection}>
          <div>
            <div style={styles.sectionLabel}>
              SESIÓN ACTUAL
            </div>

            <h2 style={styles.sectionTitle}>
              Cuenta de empresa
            </h2>
          </div>

          <div style={styles.accountGrid}>
            <Info
              label="Usuario"
              value={
                perfil?.nombre || 'Usuario'
              }
            />

            <Info
              label="Correo"
              value={
                emailUsuario || '-'
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
                perfil?.rol || '-'
              }
            />

            <Info
              label="Empresa"
              value={nombreEmpresa}
            />

            <Info
              label="ID Empresa"
              value={
                perfil?.empresa_id || '-'
              }
            />
          </div>
        </section>
      </div>

      <footer style={styles.footer}>
        <strong
          style={{
            color: '#ff6a00'
          }}
        >
          VINCULAB
        </strong>

        <span>
          Portal Cliente · Identidad digital · Trazabilidad · DPP
        </span>
      </footer>
    </main>
  )
}

function ModuleCard({
  title,
  description,
  icon,
  status,
  highlight = false,
  active = false,
  onClick
}: {
  title: string
  description: string
  icon: string
  status: string
  highlight?: boolean
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={
        active
          ? onClick
          : undefined
      }
      role={
        active
          ? 'button'
          : undefined
      }
      tabIndex={
        active
          ? 0
          : undefined
      }
      onKeyDown={(event) => {
        if (
          active &&
          onClick &&
          (
            event.key === 'Enter' ||
            event.key === ' '
          )
        ) {
          event.preventDefault()
          onClick()
        }
      }}
      style={{
        ...styles.moduleCard,
        ...(highlight
          ? styles.moduleHighlight
          : {}),
        ...(active
          ? styles.moduleActive
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

        <div style={styles.moduleStatus}>
          {status}
        </div>
      </div>

      <div style={styles.moduleLock}>
        {active
          ? '→'
          : '🔒'}
      </div>
    </div>
  )
}

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

  loading: {
    minHeight: '100vh',
    background: '#09090b',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
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
    justifyContent:
      'space-between',
    alignItems: 'center',
    padding: '14px 32px',
    background: '#0c0c0f',
    gap: 20,
    flexWrap: 'wrap'
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
    gap: 18,
    flexWrap: 'wrap'
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
    border:
      '1px solid #3f3f46',
    color: 'white',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer'
  },

  container: {
    width: '100%',
    maxWidth: 1450,
    margin: '0 auto',
    padding:
      '42px 30px 70px',
    boxSizing: 'border-box'
  },

  welcome: {
    display: 'flex',
    justifyContent:
      'space-between',
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
    maxWidth: 720,
    lineHeight: 1.6
  },

  accessBadge: {
    background: '#052e16',
    border:
      '1px solid #166534',
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
    border:
      '1px solid #7f1d1d',
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
    marginBottom: 18,
    flexWrap: 'wrap'
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

  companyMeta: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginLeft: 'auto'
  },

  metaBadge: {
    background: '#27272a',
    border:
      '1px solid #3f3f46',
    color: '#d4d4d8',
    borderRadius: 100,
    padding: '7px 10px',
    fontSize: 10,
    fontWeight: 800
  },

  statusBadge: {
    background: '#052e16',
    border:
      '1px solid #166534',
    color: '#86efac',
    borderRadius: 100,
    padding: '7px 10px',
    fontSize: 10,
    fontWeight: 800
  },

  securityNotice: {
    display: 'flex',
    gap: 15,
    background: '#111827',
    border:
      '1px solid #1f2937',
    borderRadius: 14,
    padding: 18,
    alignItems: 'flex-start'
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ff6a00',
    fontWeight: 900,
    flexShrink: 0
  },

  securityTitle: {
    fontSize: 14,
    fontWeight: 900
  },

  securityText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 1.6,
    marginTop: 5,
    maxWidth: 900
  },

  sectionTitle: {
    margin: '6px 0 18px',
    fontSize: 24
  },

  modulesGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14
  },

  moduleCard: {
    width: '100%',
    background: '#18181b',
    border:
      '1px solid #27272a',
    borderRadius: 14,
    padding: 20,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    gap: 16,
    boxSizing: 'border-box'
  },

  moduleHighlight: {
    border:
      '1px solid rgba(255,106,0,.65)',
    background:
      'linear-gradient(145deg,#18181b,#23160d)'
  },

  moduleActive: {
    border:
      '1px solid rgba(255,106,0,.75)',
    background:
      'linear-gradient(145deg,#18181b,#23160d)',
    cursor: 'pointer'
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

  moduleStatus: {
    color: '#ff6a00',
    fontSize: 10,
    fontWeight: 900,
    textTransform:
      'uppercase',
    letterSpacing: 1,
    marginTop: 10
  },

  moduleLock: {
    opacity: 0.45,
    fontSize: 14
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
    border:
      '1px solid #27272a',
    borderRadius: 10,
    padding: 16
  },

  infoLabel: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: 900,
    textTransform:
      'uppercase',
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
