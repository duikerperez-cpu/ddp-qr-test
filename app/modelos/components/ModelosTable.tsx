'use client'

import { Modelo } from '../types'

type Props = {
  modelos: Modelo[]
  onEdit: (modelo: Modelo) => void
  onDelete: (id: string) => void
}

export function ModelosTable({
  modelos,
  onEdit,
  onDelete
}: Props) {
  if (modelos.length === 0) {
    return (
      <div
        style={{
          background: '#18181b',
          borderRadius: 12,
          border: '1px solid #27272a',
          padding: 35,
          textAlign: 'center',
          color: '#71717a',
          fontSize: 13
        }}
      >
        No hay modelos registrados.
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
      {modelos.map(modelo => (
        <div
          key={modelo.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            padding: '18px 22px',
            borderBottom: '1px solid #27272a'
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: '#f4f4f5',
                fontSize: 15,
                fontWeight: 600
              }}
            >
              {modelo.nombre}
            </div>

            <div
              style={{
                color: '#71717a',
                fontSize: 11,
                marginTop: 5
              }}
            >
              {modelo.id}
            </div>

            {modelo.categoria && (
              <div
                style={{
                  color: '#a1a1aa',
                  fontSize: 12,
                  marginTop: 6
                }}
              >
                Categoría: {modelo.categoria}
              </div>
            )}

            {modelo.descripcion && (
              <div
                style={{
                  color: '#a1a1aa',
                  fontSize: 12,
                  marginTop: 4
                }}
              >
                {modelo.descripcion}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexShrink: 0
            }}
          >
            <button
              onClick={() => onEdit(modelo)}
              style={{
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: 7,
                padding: '8px 14px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 400
              }}
            >
              Editar
            </button>

            <button
              onClick={() => onDelete(modelo.id)}
              style={{
                background: '#7f1d1d',
                border: '1px solid #991b1b',
                borderRadius: 7,
                padding: '8px 14px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 400
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
