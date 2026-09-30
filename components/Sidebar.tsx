'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menu = [
  { title: 'PRINCIPAL', items: [
    { label: 'Dashboard', href: '/', icon: '◧' },
  ]},
  { title: 'GESTIÓN', items: [
    { label: 'Empresas', href: '/empresas', icon: '◧' },
    { label: 'Productos', href: '/productos', icon: '◧' },
    { label: 'Modelos', href: '/modelos', icon: '◧' },
    { label: 'Lotes', href: '/lotes', icon: '◧' },
    { label: 'Productos Individuales', href: '/individuales', icon: '◧' },
  ]},
  { title: 'IDENTIDAD DIGITAL', items: [
    { label: 'DPP', href: '/dpp', icon: '◧' },
    { label: 'NFC / QR', href: '/qr', icon: '✓' },
    { label: 'Certificados', href: '/certificados', icon: '✓' },
    { label: 'Trazabilidad', href: '/trazabilidad', icon: '◉' },
  ]},
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{ width: 250, background: '#0f0f0f', borderRight: '1px solid #1e1e1e', minHeight: '100vh', padding: '20px 12px' }}>
      <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, marginBottom: 30, paddingLeft: 8 }}>
        VINCULA <span style={{ background: '#ff6a00', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 14 }}>B</span>
      </div>
      {menu.map(s => (
        <div key={s.title} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.3, marginBottom: 10, paddingLeft: 8 }}>{s.title}</div>
          {s.items.map(i => {
            const active = path === i.href
            return (
              <Link key={i.href} href={i.href} style={{
                display: 'flex', gap: 8, alignItems: 'center',
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                background: active ? '#1c1c1e' : 'transparent',
                borderLeft: active ? '3px solid #ff6a00' : '3px solid transparent',
                color: active ? 'white' : '#888',
                textDecoration: 'none', fontSize: 13.5
              }}>
                <span style={{ fontSize: 10 }}>{i.icon}</span> {i.label}
              </Link>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
