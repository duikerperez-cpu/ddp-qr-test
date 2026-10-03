'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Icon({
  type,
  size = 15
}: {
  type: string
  size?: number
}) {

  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#ff6a00',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  }

  if (type === 'dashboard') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    )
  }

  if (type === 'empresa') {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" />
        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
        <path d="M9 21v-3h6v3" />
      </svg>
    )
  }

  if (type === 'producto') {
    return (
      <svg {...common}>
        <path d="M21 8l-9 5-9-5" />
        <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
        <path d="M12 13v8" />
      </svg>
    )
  }

  if (type === 'modelo') {
    return (
      <svg {...common}>
        <path d="M20 12l-8 8-9-9V4h7z" />
        <circle cx="7.5" cy="8" r="1" />
      </svg>
    )
  }

  if (type === 'lote') {
    return (
      <svg {...common}>
        <path d="M4 5h16v4H4z" />
        <path d="M4 10h16v4H4z" />
        <path d="M4 15h16v4H4z" />
      </svg>
    )
  }

  if (type === 'unidad') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  }

  if (type === 'dpp') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 9h6M7 13h10M7 16h6" />
      </svg>
    )
  }

  if (type === 'qr') {
    return (
      <svg {...common}>
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" />
        <path d="M14 14h3v3h-3zM18 18h3v3h-3zM18 14h3" />
      </svg>
    )
  }

  if (type === 'certificado') {
    return (
      <svg {...common}>
        <circle cx="12" cy="9" r="6" />
        <path d="M9 9l2 2 4-4" />
        <path d="M8 14l-1 7 5-3 5 3-1-7" />
      </svg>
    )
  }

  if (type === 'trazabilidad') {
    return (
      <svg {...common}>
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="18" r="2" />
        <path d="M7 6h5a4 4 0 014 4v1" />
        <path d="M16 11l-2-2M16 11l2-2" />
        <path d="M17 18h-5a4 4 0 01-4-4v-1" />
      </svg>
    )
  }

  return null
}

export default function AdminSidebar() {

  const pathname = usePathname()

  const menu = [
    {
      titulo: 'PRINCIPAL',
      items: [
        {
          nombre: 'Dashboard',
          href: '/admin',
          icono: 'dashboard'
        }
      ]
    },

    {
      titulo: 'GESTIÓN',
      items: [
        {
          nombre: 'Empresas',
          href: '/empresas',
          icono: 'empresa'
        },
        {
          nombre: 'Productos',
          href: '/productos',
          icono: 'producto'
        },
        {
          nombre: 'Modelos',
          href: '/modelos',
          icono: 'modelo'
        },
        {
          nombre: 'Lotes',
          href: '/lotes',
          icono: 'lote'
        },
        {
          nombre: 'Productos Individuales',
          href: '/unidades',
          icono: 'unidad'
        }
      ]
    },

    {
      titulo: 'IDENTIDAD DIGITAL',
      items: [
        {
          nombre: 'DPP',
          href: '/dpp',
          icono: 'dpp'
        },
        {
          nombre: 'NFC / QR',
          href: '/lotes',
          icono: 'qr'
        },
        {
          nombre: 'Certificados',
          href: '/certificados',
          icono: 'certificado'
        },
        {
          nombre: 'Trazabilidad',
          href: '/trazabilidad',
          icono: 'trazabilidad'
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
        color: '#ffffff'
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


      {/* MENU */}

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
                    type={item.icono}
                    size={15}
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
