'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import {
  Building2,
  Package,
  Tag,
  Layers3
} from 'lucide-react'

import AdminSidebar from './components/AdminSidebar'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


export default function AdminPage() {

  const [stats, setStats] = useState({
    empresas: 0,
    productos: 0,
    modelos: 0,
    lotes: 0
  })


  useEffect(() => {

    cargarDatos()

  }, [])


  async function cargarDatos() {

    try {

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

    }

  }


  const tarjetas = [

    {
      nombre: 'EMPRESAS',
      cantidad: stats.empresas,
      icono: Building2
    },

    {
      nombre: 'PRODUCTOS',
      cantidad: stats.productos,
      icono: Package
    },

    {
      nombre: 'MODELOS',
      cantidad: stats.modelos,
      icono: Tag
    },

    {
      nombre: 'LOTES',
      cantidad: stats.lotes,
      icono: Layers3
    }

  ]


  return (

    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#080b10',
        color: '#ffffff'
      }}
    >

      {/* ==========================
          SIDEBAR
      ========================== */}

      <AdminSidebar />


      {/* ==========================
          CONTENIDO
      ========================== */}

      <main
        style={{
          flex: 1,
          minWidth: 0
        }}
      >


        {/* HEADER */}

        <header
          style={{
            height: 70,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            padding: '0 28px',

            borderBottom: '1px solid #242a32',

            background: '#0d1117'
          }}
        >

          <div
            style={{
              color: '#64748b',
              fontSize: 10,
              letterSpacing: 1.6
            }}
          >
            PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS
          </div>


          <div
            style={{
              textAlign: 'right'
            }}
          >

            <div
              style={{
                color: '#64748b',
                fontSize: 8
              }}
            >
              USUARIO
            </div>

            <div
              style={{
                fontSize: 12,
                fontWeight: 700
              }}
            >
              Administrador
            </div>

          </div>

        </header>


        {/* DASHBOARD */}

        <section
          style={{
            padding: '28px'
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
              marginTop: 5,
              marginBottom: 25
            }}
          >
            Vista general de la plataforma Vinculab.
          </p>


          {/* TARJETAS */}

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(auto-fit, minmax(210px, 1fr))',

              gap: 14
            }}
          >

            {tarjetas.map((tarjeta) => {

              const Icon =
                tarjeta.icono

              return (

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
                      '20px 18px',

                    minHeight: 110
                  }}
                >


                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
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


                    <Icon
                      size={17}
                      strokeWidth={1.7}
                      color="#ff6a00"
                    />

                  </div>


                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 27,
                      fontWeight: 900
                    }}
                  >
                    {tarjeta.cantidad}
                  </div>


                </div>

              )

            })}

          </div>

        </section>

      </main>

    </div>

  )
}
