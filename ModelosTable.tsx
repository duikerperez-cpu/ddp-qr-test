'use client'
import { Modelo } from '../types'
export function ModelosTable({ modelos, onEdit, onDelete }: { modelos: Modelo[], onEdit: (m: Modelo) => void, onDelete: (id: string) => void }) {
  return (
    <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #232326' }}>
      {modelos.map(m => (
        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #232326' }}>
          <div><div style={{ fontWeight: 600 }}>{m.nombre}</div><div style={{ opacity: 0.4, fontSize: 11 }}>{m.Categoria} - {m.Descripcion}</div></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(m)} style={{ background: '#27272a', border: 0, borderRadius: 6, padding: '6px 12px', color: 'white', cursor: 'pointer', fontSize: 12 }}>Editar</button>
            <button onClick={() => onDelete(m.id)} style={{ background: '#7f1d1d', border: 0, borderRadius: 6, padding: '6px 12px', color: 'white', cursor: 'pointer', fontSize: 12 }}>Borrar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
