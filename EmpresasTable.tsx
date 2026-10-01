'use client'
import { Empresa } from '../types'

export function EmpresasTable({ empresas, onEdit, onDelete }: { empresas: Empresa[], onEdit: (e: Empresa) => void, onDelete: (id: string) => void }) {
  return (
    <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #232326' }}>
      {empresas.map(e => (
        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #232326' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{e.razon_social}</div>
            <div style={{ opacity: 0.4, fontSize: 11 }}>{e.Pais} - {e.Sector}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(e)} style={{ background: '#27272a', border: 0, borderRadius: 6, padding: '6px 12px', color: 'white', cursor: 'pointer', fontSize: 12 }}>Editar</button>
            <button onClick={() => onDelete(e.id)} style={{ background: '#7f1d1d', border: 0, borderRadius: 6, padding: '6px 12px', color: 'white', cursor: 'pointer', fontSize: 12 }}>Borrar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
