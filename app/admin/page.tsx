'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================================================
   ICONOS SVG
   No requiere lucide-react ni ninguna librería externa
========================================================= */

function StatIcon({
  type,
  size = 20
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

  return null
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function AdminPage() {

  const [stats, setStats] = useState({
    empresas: 0,
    productos: 0,
    modelos: 0,
    lotes: 0
  })

  const [cargando, setCargando] = useState(true)

  const [usuario, setUsuario] = useState({
    nombre: 'Administrador',
    rol: 'SUPERADMIN'
  })


  /* =====================================================
     CARGAR INFORMACIÓN
  ===================================================== */

  useEffect(() => {

    cargarDashboard()
    cargarUsuario()

  }, [])


  /* =====================================================
     ESTADÍSTICAS
  ===================================================== */

  async function cargarDashboard() {

    try {

      setCargando(true)

      const [
        empresas,
        productos,
        modelos,
        lotes
      ] = await Promise.all([

        supabase
          .from('empresas')
          .select('*', {
            count: 'exact',
            head: true
          }),

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
          })

      ])


      setStats({

        empresas:
          empresas.count ?? 0,

        productos:
          productos.count ?? 0,

        modelos:
          modelos.count ?? 0,

        lotes:
          lotes.count ?? 0

      })

    } catch (error) {

      console.error(
        'Error cargando estadísticas:',
        error
      )

    } finally {

      setCargando(false)

    }

  }


  /* =====================================================
     USUARIO ACTUAL
  ===================================================== */

  async function cargarUsuario() {

    try {

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, rol')
        .eq('id', user.id)
        .maybeSingle()

      if (perfil) {

        setUsuario({
          nombre:
            perfil.nombre ||
            'Administrador',

          rol:
            (
              perfil.rol ||
              'superadmin'
            ).toUpperCase()
        })

      }

    } catch (error) {

      console.error(
        'Error cargando usuario:',
        error
      )

    }

  }


  /* =====================================================
     CERRAR SESIÓN
  ===================================================== */

  async function cerrarSesion() {

    await supabase.auth.signOut()

    window.location.href = '/login'

  }


  /* =====================================================
     TARJETAS
  ===================================================== */

  const tarjetas = [

    {
      nombre: 'EMPRESAS',
      cantidad: stats.empresas,
      tipo: 'empresa'
    },

    {
      nombre: 'PRODUCTOS',
      cantidad: stats.productos,
      tipo: 'producto'
    },

    {
      nombre: 'MODELOS',
      cantidad: stats.modelos,
      tipo: 'modelo'
    },

    {
      nombre: 'LOTES',
      cantidad: stats.lotes,
      tipo: 'lote'
    }

  ]


  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (

    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#080b10',
        color: '#ffffff',
        fontFamily:
          'Arial, Helvetica, sans-serif'
      }}
    >


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <AdminSidebar />


      {/* =================================================
          ÁREA PRINCIPAL
      ================================================= */}

      <main
        style={{
          flex: 1,
          minWidth: 0
        }}
      >


        {/* ===============================================
            HEADER
        =============================================== */}

        <header
          style={{
            minHeight: 70,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            padding: '0 28px',

            borderBottom:
              '1px solid #242a32',

            background:
              '#0d1117'
          }}
        >


          {/* TEXTO HEADER */}

          <div
            style={{
              color: '#64748b',
              fontSize: 10,
              letterSpacing: 1.6,
              fontWeight: 600
            }}
          >
            PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS
          </div>


          {/* USUARIO */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}
          >

            <div
              style={{
                textAlign: 'right'
              }}
            >

              <div
                style={{
                  color: '#64748b',
                  fontSize: 8,
                  letterSpacing: 1
                }}
              >
                USUARIO
              </div>


              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 2
                }}
              >
                {usuario.nombre}
              </div>


              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#ff6a00',
                  marginTop: 2
                }}
              >
                {usuario.rol}
              </div>

            </div>


            <button
              onClick={cerrarSesion}
              style={{
                background: '#18181b',
                border:
                  '1px solid #3f3f46',
                borderRadius: 7,

                color: '#ffffff',

                padding:
                  '9px 13px',

                fontSize: 12,

                cursor: 'pointer'
              }}
            >
              Cerrar sesión
            </button>

          </div>

        </header>


        {/* ===============================================
            CONTENIDO
        =============================================== */}

        <section
          style={{
            padding: '30px 28px'
          }}
        >


          {/* TÍTULO */}

          <div
            style={{
              marginBottom: 26
            }}
          >

            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800
              }}
            >
              Dashboard
            </h1>


            <p
              style={{
                color: '#8290a3',
                fontSize: 13,
                marginTop: 6,
                marginBottom: 0
              }}
            >
              Vista general de la plataforma Vinculab.
            </p>

          </div>


          {/* =============================================
              TARJETAS
          ============================================= */}

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(4, minmax(180px, 1fr))',

              gap: 14
            }}
          >

            {tarjetas.map((tarjeta) => (

              <div
                key={tarjeta.nombre}

                style={{
                  background: '#111820',

                  border:
                    '1px solid #27303a',

                  borderLeft:
                    '3px solid #ff6a00',

                  borderRadius: 8,

                  padding:
                    '18px 18px 20px',

                  minHeight: 110
                }}
              >


                {/* CABECERA TARJETA */}

                <div
                  style={{
                    display: 'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'space-between'
                  }}
                >

                  <div
                    style={{
                      color: '#64748b',

                      fontSize: 9,

                      fontWeight: 700,

                      letterSpacing: 1.3
                    }}
                  >
                    {tarjeta.nombre}
                  </div>


                  <StatIcon
                    type={tarjeta.tipo}
                    size={17}
                  />

                </div>


                {/* CANTIDAD */}

                <div
                  style={{
                    marginTop: 15,

                    fontSize: 28,

                    lineHeight: 1,

                    fontWeight: 900,

                    color: '#ffffff'
                  }}
                >

                  {cargando
                    ? '—'
                    : tarjeta.cantidad}

                </div>

              </div>

            ))}

          </div>


          {/* =============================================
              INFORMACIÓN INFERIOR
          ============================================= */}

          <div
            style={{
              marginTop: 30,

              border:
                '1px solid #242a32',

              background:
                '#0d1117',

              borderRadius: 8,

              padding: 22
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >

              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#22c55e'
                }}
              />

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#ffffff'
                }}
              >
                Plataforma operativa
              </div>

            </div>


            <p
              style={{
                margin:
                  '9px 0 0',

                color:
                  '#64748b',

                fontSize:
                  12,

                lineHeight:
                  1.6
              }}
            >
              Gestión centralizada de productos,
              lotes, identidades digitales y
              trazabilidad.
            </p>

          </div>


        </section>

      </main>

    </div>

  )

}
