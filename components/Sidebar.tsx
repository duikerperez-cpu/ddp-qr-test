'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menu = [
  { title: 'PRINCIPAL', items: [
    { label: 'Dashboard', href: '/' },
    { label: 'Empresas', href: '/empresas' },
  ]},
  { title: 'GESTIÓN', items: [
    { label: 'Productos', href: '/productos' },
    { label: 'Modelos', href: '/p' },
    { label: 'Lotes', href: '/print' },
  ]},
  { title: 'IDENTIDAD DIGITAL', items: [
    { label: 'DPP', href: '/dpp' },
    { label: 'NFC / QR', href: '/qr' },
  ]},
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{ width: 240, background: '#111113', borderRight: '1px solid #222', padding: '20px 12px', minHeight: '100vh' }}>
      <div style={{ fontWeight: 800, letterSpacing: 1, marginBottom: 24 }}>VINCULA<span style={{ color: '#ff6a00' }}>B</span></div>
      {menu.map(s => (
        <div key={s.title} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 8, letterSpacing: 1 }}>{s.title}</div>
          {s.items.map(i => (
            <Link key={i.href} href={i.href} style={{ 
              display: 'block', padding: '8px 10px', borderRadius: 8,
              background: path === i.href ? '#1e1e20' : 'transparent',
              color: path === i.href ? '#ff6a00' : '#ccc',
              textDecoration: 'none', marginBottom: 4, fontSize: 14
            }}>{i.label}</Link>
          ))}
        </div>
      ))}
    </aside>
  )
}
