'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  LayoutDashboard,
  Building2,
  Package,
  Tag,
  Layers3,
  CircleDot,
  CreditCard,
  ScanLine,
  BadgeCheck,
  Route
} from 'lucide-react'

export default function AdminSidebar() {

  const pathname = usePathname()

  const menu = [
    {
      titulo: 'PRINCIPAL',
      items: [
        {
          nombre: 'Dashboard',
          href: '/admin',
          icono: LayoutDashboard
        }
      ]
    },
    {
      titulo: 'GESTIÓN',
      items: [
        {
          nombre: 'Empresas',
          href: '/empresas',
          icono: Building2
        },
        {
          nombre: 'Productos',
          href: '/productos',
          icono: Package
        },
        {
          nombre: 'Modelos',
          href: '/modelos',
          icono: Tag
        },
        {
          nombre: 'Lotes',
          href: '/lotes',
          icono: Layers3
        },
        {
          nombre: 'Productos Individuales',
          href: '/unidades',
          icono: CircleDot
        }
      ]
    },
    {
      titulo: 'IDENTIDAD DIGITAL',
      items: [
        {
          nombre: 'DPP',
          href: '/dpp',
          icono: CreditCard
        },
        {
          nombre: 'NFC / QR',
          href: '/lotes',
          icono: ScanLine
        },
        {
          nombre: 'Certificados',
          href: '/certificados',
          icono: BadgeCheck
        },
        {
          nombre: 'Trazabilidad',
          href: '/trazabilidad',
          icono: Route
        }
      ]
    }
  ]

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        minHeight: '100vh',
        background: '#0d1117',
        borderRight: '1px solid #242a32',
        color: '#fff'
      }}
    >

      {/* LOGO */}

      <div
        style={{
          padding: '24px 22px 20px',
          borderBottom: '1px solid #242a32'
        }}
      >

        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: 1
          }}
        >
          <span style={{ color: '#ffffff' }}>
            VINCUL
          </span>

          <span style={{ color: '#ff6a00' }}>
            AB
          </span>
        </div>

        <div
          style={{
            marginTop: 5,
            color: '#64748b',
            fontSize: 9,
            letterSpacing: 1.5
          }}
        >
          DIGITAL PRODUCT IDENTITY
        </div>

      </div>


      {/* MENÚ */}

      <nav
        style={{
          padding: '18px 10px'
        }}
      >

        {menu.map((grupo) => (

          <div
            key={grupo.titulo}
            style={{
              marginBottom: 24
            }}
          >

            <div
              style={{
                padding: '0 10px',
                marginBottom: 8,
                fontSize: 9,
                fontWeight: 800,
                color: '#64748b',
                letterSpacing: 1.5
              }}
            >
              {grupo.titulo}
            </div>


            {grupo.items.map((item) => {

              const Icon = item.icono

              const activo =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)

              return (

                <Link
                  key={item.nombre}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,

                    padding: '10px 12px',
                    marginBottom: 3,

                    borderRadius: 7,

                    borderLeft: activo
                      ? '3px solid #ff6a00'
                      : '3px solid transparent',

                    background: activo
                      ? 'rgba(255,106,0,.14)'
                      : 'transparent',

                    color: activo
                      ? '#ff6a00'
                      : '#94a3b8',

                    textDecoration: 'none',

                    fontSize: 14,
                    fontWeight: activo
                      ? 600
                      : 500,

                    transition: 'all .15s ease'
                  }}
                >

                  <Icon
                    size={15}
                    strokeWidth={1.8}
                    color="#ff6a00"
                  />

                  <span>
                    {item.nombre}
                  </span>

                </Link>

              )

            })}

          </div>

        ))}

      </nav>

    </aside>
  )
}
