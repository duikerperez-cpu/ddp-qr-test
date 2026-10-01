'use client'
import { Producto } from '../types'
export function ProductosTable({ productos, onEdit, onDelete }: { productos: Producto[], onEdit: (p: Producto)=>void, onDelete: (id: string)=>void }) {
  return (
    <div style={{ background: '#18181b', borderRadius: 12, border: '1px solid #232326' }}>
      {productos.map(p=>(
        <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid #232326' }}>
          <div><div style={{ fontWeight:600 }}>{p.nombre}</div><div style={{ opacity:0.4, fontSize:11 }}>{p.id}</div></div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>onEdit(p)} style={{ background:'#27272a', border:0, borderRadius:6, padding:'6px 12px', color:'white', cursor:'pointer', fontSize:12 }}>Editar</button>
            <button onClick={()=>onDelete(p.id)} style={{ background:'#7f1d1d', border:0, borderRadius:6, padding:'6px 12px', color:'white', cursor:'pointer', fontSize:12 }}>Borrar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
