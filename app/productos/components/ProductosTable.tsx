'use client'

import { Producto } from '../types'

export function ProductosTable({
  productos,
  onEdit,
  onDelete
}: {
  productos: Producto[]
  onEdit: (p: Producto) => void
  onDelete: (id: string) => void
}) {

  if (productos.length === 0) {
    return (
      <div
        style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center'
        }}
      >

        <div
          style={{
            color: '#ffffff',
            fontSize: 15,
            fontWeight: 600
          }}
        >
          No hay productos registrados
        </div>

        <div
          style={{
            color: '#71717a',
            fontSize: 12,
            marginTop: 6
          }}
        >
          Crea tu primer producto utilizando el botón Nuevo producto.
        </div>

      </div>
    )
  }

  return (

    <div
      style={{
        background: '#18181b',
        borderRadius: 12,
        border: '1px solid #27272a',
        overflow: 'hidden'
      }}
    >

      {productos.map((p, index) => (

        <div
          key={p.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            padding: '17px 20px',

            borderBottom:
              index < productos.length - 1
                ? '1px solid #27272a'
                : 'none'
          }}
        >

          {/* INFORMACIÓN PRODUCTO */}

          <div
            style={{
              flex: 1,
              minWidth: 0
            }}
          >

            <div
              style={{
                color: '#f4f4f5',
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.4
              }}
            >
              {p.nombre}
            </div>


            <div
              style={{
                color: '#71717a',
                fontSize: 11,
                fontWeight: 400,
                marginTop: 3,
                wordBreak: 'break-all'
              }}
            >
              {p.id}
            </div>


            {p.categoria && (

              <div
                style={{
                  color: '#a1a1aa',
                  fontSize: 11,
                  fontWeight: 400,
                  marginTop: 5
                }}
              >
                Categoría: {p.categoria}
              </div>

            )}


            {p.sku && (

              <div
                style={{
                  color: '#71717a',
                  fontSize: 11,
                  fontWeight: 400,
                  marginTop: 3
                }}
              >
                SKU: {p.sku}
              </div>

            )}

          </div>


          {/* BOTONES */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0
            }}
          >

            <button
              type="button"

              onClick={() => onEdit(p)}

              style={{
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: 7,
                padding: '8px 14px',

                color: '#f4f4f5',

                cursor: 'pointer',

                fontSize: 12,
                fontWeight: 500
              }}
            >
              Editar
            </button>


            <button
              type="button"

              onClick={() => onDelete(p.id)}

              style={{
                background: '#7f1d1d',
                border: '1px solid #991b1b',
                borderRadius: 7,

                padding: '8px 14px',

                color: '#ffffff',

                cursor: 'pointer',

                fontSize: 12,
                fontWeight: 500
              }}
            >
              Borrar
            </button>

          </div>

        </div>

      ))}

    </div>

  )
}
