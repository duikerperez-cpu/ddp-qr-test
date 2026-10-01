export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 260,
        background: '#09090b',
        color: 'white',
        padding: 20,
        borderRight: '1px solid #27272a',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>VINCULAB</span>
          <span style={{ background: '#ff6a00', color: 'white', fontSize: 11, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>B</span>
        </div>

        <div style={{ fontSize: 10, color: '#71717a', fontWeight: 800, letterSpacing: 1, marginBottom: 12 }}>PLATAFORMA DE IDENTIDAD</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <a href="/admin" style={{ padding: '10px 12px', borderRadius: 8, color: '#e4e4e7', textDecoration: 'none', fontSize: 13 }}>📊 Dashboard</a>
          <a href="/admin/dpp" style={{ padding: '10px 12px', borderRadius: 8, background: '#18181b', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>🏷️ Crear DPP / QR</a>
          <a href="/admin/productos" style={{ padding: '10px 12px', borderRadius: 8, color: '#a1a1aa', textDecoration: 'none', fontSize: 13 }}>📦 Productos</a>
          <a href="/admin/lotes" style={{ padding: '10px 12px', borderRadius: 8, color: '#a1a1aa', textDecoration: 'none', fontSize: 13 }}>🧪 Lotes</a>
        </nav>

        <div style={{ height: 1, background: '#27272a', margin: '20px 0' }} />
        <div style={{ fontSize: 10, color: '#52525b', padding: '0 12px' }}>v1.0 • Admin</div>
      </aside>

      <main style={{ flex: 1, background: '#f4f4f5', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
