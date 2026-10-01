'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menu = [
  { title: 'PRINCIPAL', items: [{ label: 'Dashboard', href: '/admin', icon: '◧' }] },
  { title: 'GESTIÓN', items: [
    { label: 'Empresas', href: '/admin/empresas', icon: '◫' },
    { label: 'Productos', href: '/admin/productos', icon: '⬙' },
    { label: 'Modelos', href: '/admin/modelos', icon: '◇' },
    { label: 'Lotes', href: '/admin/lotes', icon: '▤' },
    { label: 'Productos Individuales', href: '/admin/productos-individuales', icon: '◍' },
  ]},
  { title: 'IDENTIDAD DIGITAL', items: [
    { label: 'DPP', href: '/admin/dpp', icon: '▭' },
    { label: 'NFC / QR', href: '/admin/nfc-qr', icon: '⌖' },
    { label: 'Certificados', href: '/admin/certificados', icon: '✓' },
    { label: 'Trazabilidad', href: '/admin/trazabilidad', icon: '◍' },
  ]},
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090a0f', color: 'white' }}>
      <aside style={{ width: 240, background: '#0d1117', borderRight: '1px solid #1c2128', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #1c2128' }}>
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>VINCULA<span style={{ color: '#ff6a00' }}>B</span></div>
          <div style={{ fontSize: 8, color: '#768088', letterSpacing: 1, marginTop: 2 }}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menu.map(section => (
            <div key={section.title} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 8, color: '#5a6570', fontWeight: 800, letterSpacing: 1, padding: '0 8px', marginBottom: 8 }}>{section.title}</div>
              {section.items.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 6, fontSize: 12,
                    background: active ? 'rgba(255,106,0,0.12)' : 'transparent',
                    color: active ? '#ff8a3d' : '#8b949e', textDecoration: 'none',
                    borderLeft: active ? '2px solid #ff6a00' : '2px solid transparent'
                  }}>
                    <span style={{ color: '#ff6a00', fontSize: 10 }}>{item.icon}</span> {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 48, background: '#0d1117', borderBottom: '1px solid #1c2128', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div style={{ fontSize: 9, color: '#768088', letterSpacing: 1 }}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 7, color: '#5a6570' }}>USUARIO</div>
              <div style={{ fontSize: 9, fontWeight: 700 }}>Administrador</div>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: 50, background: '#ff6a00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>A</div>
          </div>
        </header>
        <main style={{ flex: 1, background: '#090a0f', padding: 24 }}>{children}</main>
      </div>
    </div>
  )
}
