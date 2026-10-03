'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================================================
   TIPOS
========================================================= */

type ProductoIndividual = {
  id: string
  lote_id: string | null
  empresa_id: string | null
  producto_id: string | null
  modelo_id: string | null
  numero_unidad: number | null
  codigo_publico: string | null
  codigo_qr: string | null
  nfc_uid: string | null
  url_dpp: string | null
  estado: string | null
  created_at: string | null
}

type Empresa = {
  id: string
  nombre?: string | null
  razon_social?: string | null
  empresa_nombre?: string | null
  name?: string | null
}

type Producto = {
  id: string
  nombre: string | null
}

type Modelo = {
  id: string
  nombre: string | null
}

type Lote = {
  id: string
  codigo: string | null
  empresa_id: string | null
  producto_id: string | null
  modelo_id: string | null
}

/* =========================================================
   PÁGINA
========================================================= */

export default function ProductosIndividualesPage() {
  const [identidades, setIdentidades] = useState<ProductoIndividual[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])

  const [buscar, setBuscar] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  /* =======================================================
     CARGAR DATOS
  ======================================================= */

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    setError('')

    try {
      const [
        resIdentidades,
        resEmpresas,
        resProductos,
        resModelos,
        resLotes,
      ] = await Promise.all([
        supabase
          .from('productos_individuales')
          .select('*'),

        supabase
          .from('empresas')
          .select('*'),

        supabase
          .from('productos')
          .select('id,nombre'),

        supabase
          .from('modelos')
          .select('id,nombre'),

        supabase
          .from('lotes')
          .select('id,codigo,empresa_id,producto_id,modelo_id'),
      ])

      if (resIdentidades.error) throw resIdentidades.error
      if (resEmpresas.error) throw resEmpresas.error
      if (resProductos.error) throw resProductos.error
      if (resModelos.error) throw resModelos.error
      if (resLotes.error) throw resLotes.error

      setIdentidades(
        (resIdentidades.data || []) as ProductoIndividual[]
      )

      setEmpresas(
        (resEmpresas.data || []) as Empresa[]
      )

      setProductos(
        (resProductos.data || []) as Producto[]
      )

      setModelos(
        (resModelos.data || []) as Modelo[]
      )

      setLotes(
        (resLotes.data || []) as Lote[]
      )
    } catch (err: any) {
      console.error('ERROR PRODUCTOS INDIVIDUALES:', err)

      setError(
        err?.message ||
        'No fue posible cargar las identidades digitales.'
      )
    } finally {
      setCargando(false)
    }
  }

  /* =======================================================
     FUNCIONES AUXILIARES
  ======================================================= */

  function obtenerLote(loteId: string | null) {
    if (!loteId) return undefined

    return lotes.find(
      lote => lote.id === loteId
    )
  }

  function obtenerEmpresa(item: ProductoIndividual) {
    let empresaId = item.empresa_id

    if (!empresaId) {
      empresaId =
        obtenerLote(item.lote_id)?.empresa_id || null
    }

    if (!empresaId) return '—'

    const empresa = empresas.find(
      e => e.id === empresaId
    )

    if (!empresa) return '—'

    return (
      empresa.nombre ||
      empresa.razon_social ||
      empresa.empresa_nombre ||
      empresa.name ||
      'Empresa'
    )
  }

  function obtenerProducto(item: ProductoIndividual) {
    let productoId = item.producto_id

    if (!productoId) {
      productoId =
        obtenerLote(item.lote_id)?.producto_id || null
    }

    if (!productoId) {
      return 'Producto no identificado'
    }

    return (
      productos.find(
        producto => producto.id === productoId
      )?.nombre ||
      'Producto no identificado'
    )
  }

  function obtenerModelo(item: ProductoIndividual) {
    let modeloId = item.modelo_id

    if (!modeloId) {
      modeloId =
        obtenerLote(item.lote_id)?.modelo_id || null
    }

    if (!modeloId) {
      return 'Modelo no identificado'
    }

    return (
      modelos.find(
        modelo => modelo.id === modeloId
      )?.nombre ||
      'Modelo no identificado'
    )
  }

  function obtenerCodigoLote(item: ProductoIndividual) {
    if (!item.lote_id) return '—'

    const lote = obtenerLote(item.lote_id)

    if (lote?.codigo) return lote.codigo

    return item.lote_id.slice(0, 12)
  }

  /* =======================================================
     ESTADÍSTICAS
  ======================================================= */

  const total = identidades.length

  const totalQR = identidades.filter(
    item => Boolean(item.codigo_qr)
  ).length

  const totalNFC = identidades.filter(
    item => Boolean(item.nfc_uid)
  ).length

  const totalActivas = identidades.filter(item => {
    const estado = (
      item.estado || 'activo'
    ).toLowerCase()

    return estado === 'activo'
  }).length

  /* =======================================================
     FILTRO
  ======================================================= */

  const filtradas = useMemo(() => {
    const texto = buscar
      .trim()
      .toLowerCase()

    const resultado = identidades.filter(item => {
      if (!texto) return true

      const contenido = [
        item.id,
        item.codigo_publico,
        item.codigo_qr,
        item.nfc_uid,
        obtenerCodigoLote(item),
        obtenerEmpresa(item),
        obtenerProducto(item),
        obtenerModelo(item),
        item.estado,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })

    return resultado.sort((a, b) => {
      const fechaA = a.created_at
        ? new Date(a.created_at).getTime()
        : 0

      const fechaB = b.created_at
        ? new Date(b.created_at).getTime()
        : 0

      return fechaB - fechaA
    })
  }, [
    buscar,
    identidades,
    empresas,
    productos,
    modelos,
    lotes,
  ])

  /* =======================================================
     ABRIR DPP
  ======================================================= */

  function abrirDPP(item: ProductoIndividual) {
    if (item.codigo_publico) {
      window.open(
        `/dpp/${encodeURIComponent(item.codigo_publico)}`,
        '_blank'
      )

      return
    }

    if (item.url_dpp) {
      window.open(item.url_dpp, '_blank')
      return
    }

    alert(
      'Esta identidad todavía no tiene un DPP público.'
    )
  }

  /* =======================================================
     INTERFAZ
  ======================================================= */

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
      }}
    >

      {/* ===============================================
          CABECERA
      =============================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              color: '#ff6a00',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.4,
              marginBottom: 8,
            }}
          >
            IDENTIDAD DIGITAL
          </div>

          <h1
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            Productos Individuales
          </h1>

          <div
            style={{
              color: '#7690aa',
              fontSize: 13,
              marginTop: 7,
            }}
          >
            Unidades físicas con identidad digital única.
          </div>
        </div>

        <button
          onClick={cargarDatos}
          style={{
            background: '#151d26',
            border: '1px solid #2a3541',
            color: '#ffffff',
            borderRadius: 7,
            padding: '11px 17px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ↻ Actualizar
        </button>
      </div>

      {/* ===============================================
          ESTADÍSTICAS
      =============================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, minmax(170px, 1fr))',
          gap: 14,
          marginBottom: 22,
          maxWidth: 1050,
        }}
      >
        <StatCard
          titulo="IDENTIDADES"
          valor={total}
          icono="◉"
        />

        <StatCard
          titulo="CON QR"
          valor={totalQR}
          icono="⌖"
        />

        <StatCard
          titulo="CON NFC"
          valor={totalNFC}
          icono="◆"
        />

        <StatCard
          titulo="ACTIVAS"
          valor={totalActivas}
          icono="✓"
        />
      </div>

      {/* ===============================================
          BUSCADOR
      =============================================== */}

      <div
        style={{
          background: '#0e141b',
          border: '1px solid #222d38',
          borderRadius: 8,
          padding: 13,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            maxWidth: 700,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 11,
              color: '#65809b',
              fontSize: 14,
            }}
          >
            ⌕
          </div>

          <input
            type="text"
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar identidad, lote, producto, modelo o empresa..."
            style={{
              width: '100%',
              height: 40,
              boxSizing: 'border-box',
              background: '#090e14',
              border: '1px solid #293542',
              borderRadius: 6,
              outline: 'none',
              color: '#ffffff',
              padding: '0 15px 0 42px',
              fontSize: 12,
            }}
          />
        </div>
      </div>

      {/* ===============================================
          ERROR
      =============================================== */}

      {error && (
        <div
          style={{
            background: '#331111',
            border: '1px solid #762323',
            color: '#ff9c9c',
            borderRadius: 7,
            padding: 14,
            marginBottom: 14,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* ===============================================
          TABLA
      =============================================== */}

      <div
        style={{
          background: '#0e141b',
          border: '1px solid #222d38',
          borderRadius: 8,
          overflowX: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: 1150,
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <Th>IDENTIDAD</Th>
              <Th>PRODUCTO / MODELO</Th>
              <Th>LOTE</Th>
              <Th>EMPRESA</Th>
              <Th>QR</Th>
              <Th>NFC</Th>
              <Th>ESTADO</Th>
              <Th>ACCIONES</Th>
            </tr>
          </thead>

          <tbody>

            {/* CARGANDO */}

            {cargando && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 55,
                    textAlign: 'center',
                    color: '#70869c',
                    fontSize: 12,
                  }}
                >
                  Cargando identidades digitales...
                </td>
              </tr>
            )}

            {/* SIN DATOS */}

            {!cargando &&
              filtradas.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 55,
                      textAlign: 'center',
                      color: '#70869c',
                      fontSize: 12,
                    }}
                  >
                    No se encontraron identidades digitales.
                  </td>
                </tr>
              )}

            {/* REGISTROS */}

            {!cargando &&
              filtradas.map(item => (
                <tr
                  key={item.id}
                  style={{
                    borderTop:
                      '1px solid #202a34',
                  }}
                >

                  {/* IDENTIDAD */}

                  <Td>
                    <div
                      style={{
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: 12,
                      }}
                    >
                      {item.codigo_publico ||
                        item.codigo_qr ||
                        item.id.slice(0, 14)}
                    </div>

                    <div
                      style={{
                        color: '#55718b',
                        fontSize: 9,
                        marginTop: 4,
                      }}
                    >
                      ID: {item.id.slice(0, 14)}
                    </div>

                    {item.numero_unidad !== null && (
                      <div
                        style={{
                          color: '#55718b',
                          fontSize: 9,
                          marginTop: 2,
                        }}
                      >
                        Unidad #{item.numero_unidad}
                      </div>
                    )}
                  </Td>

                  {/* PRODUCTO / MODELO */}

                  <Td>
                    <div
                      style={{
                        color: '#c9d9e8',
                        fontSize: 12,
                      }}
                    >
                      {obtenerProducto(item)}
                    </div>

                    <div
                      style={{
                        color: '#64819c',
                        fontSize: 9,
                        marginTop: 4,
                      }}
                    >
                      {obtenerModelo(item)}
                    </div>
                  </Td>

                  {/* LOTE */}

                  <Td>
                    <div
                      style={{
                        color: '#b7cee4',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {obtenerCodigoLote(item)}
                    </div>
                  </Td>

                  {/* EMPRESA */}

                  <Td>
                    <span
                      style={{
                        display: 'inline-block',
                        background:
                          'rgba(255,106,0,.10)',
                        border:
                          '1px solid rgba(255,106,0,.35)',
                        color: '#ff812e',
                        padding: '5px 8px',
                        borderRadius: 5,
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {obtenerEmpresa(item)}
                    </span>
                  </Td>

                  {/* QR */}

                  <Td>
                    <Indicador
                      activo={Boolean(
                        item.codigo_qr
                      )}
                      texto="QR"
                    />
                  </Td>

                  {/* NFC */}

                  <Td>
                    <Indicador
                      activo={Boolean(
                        item.nfc_uid
                      )}
                      texto="NFC"
                    />
                  </Td>

                  {/* ESTADO */}

                  <Td>
                    <Estado
                      estado={
                        item.estado || 'activo'
                      }
                    />
                  </Td>

                  {/* ACCIONES */}

                  <Td>
                    <button
                      onClick={() =>
                        abrirDPP(item)
                      }
                      style={{
                        background: '#151f29',
                        border:
                          '1px solid #293746',
                        color: '#ffffff',
                        borderRadius: 6,
                        padding: '7px 12px',
                        fontSize: 10,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Ver DPP
                    </button>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ===============================================
          PIE
      =============================================== */}

      {!cargando && (
        <div
          style={{
            color: '#526b82',
            fontSize: 10,
            marginTop: 11,
          }}
        >
          Mostrando {filtradas.length} de{' '}
          {identidades.length} identidades digitales.
        </div>
      )}
    </div>
  )
}

/* =========================================================
   TARJETA ESTADÍSTICA
========================================================= */

function StatCard({
  titulo,
  valor,
  icono,
}: {
  titulo: string
  valor: number
  icono: string
}) {
  return (
    <div
      style={{
        minHeight: 105,
        background: '#111923',
        border: '1px solid #27313c',
        borderLeft: '3px solid #ff6a00',
        borderRadius: 8,
        padding: '18px 20px',
        position: 'relative',
      }}
    >
      <div
        style={{
          color: '#7894af',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 1.2,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          color: '#ffffff',
          fontSize: 29,
          fontWeight: 900,
          marginTop: 18,
        }}
      >
        {valor}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 18,
          top: 17,
          color: '#ff6a00',
          fontSize: 14,
          fontWeight: 900,
        }}
      >
        {icono}
      </div>
    </div>
  )
}

/* =========================================================
   TH
========================================================= */

function Th({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '13px 15px',
        color: '#6f8ca8',
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  )
}

/* =========================================================
   TD
========================================================= */

function Td({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <td
      style={{
        padding: '14px 15px',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </td>
  )
}

/* =========================================================
   INDICADOR QR / NFC
========================================================= */

function Indicador({
  activo,
  texto,
}: {
  activo: boolean
  texto: string
}) {
  if (!activo) {
    return (
      <span
        style={{
          color: '#536779',
          fontSize: 11,
        }}
      >
        —
      </span>
    )
  }

  return (
    <span
      style={{
        display: 'inline-block',
        background: '#073524',
        color: '#31e790',
        borderRadius: 20,
        padding: '5px 8px',
        fontSize: 8,
        fontWeight: 900,
      }}
    >
      ✓ {texto}
    </span>
  )
}

/* =========================================================
   ESTADO
========================================================= */

function Estado({
  estado,
}: {
  estado: string
}) {
  const activo =
    estado.toLowerCase() === 'activo'

  return (
    <span
      style={{
        display: 'inline-block',
        background: activo
          ? '#073524'
          : '#202833',
        color: activo
          ? '#31e790'
          : '#94a3b3',
        borderRadius: 20,
        padding: '5px 9px',
        fontSize: 8,
        fontWeight: 900,
        textTransform: 'uppercase',
      }}
    >
      {estado}
    </span>
  )
}
