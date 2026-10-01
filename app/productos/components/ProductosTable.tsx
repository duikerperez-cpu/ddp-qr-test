'use client'
import { Producto } from '../types'
export function ProductosTable({ productos, onEdit, onDelete }: { productos: Producto[], onEdit: (p: Producto)=>void, onDelete: (id: string)=>void }) {
  return (
    <table style={{ width:'100%', background:'white', borderRadius:8, borderCollapse:'collapse' }}>
      <thead><tr style={{ textAlign:'left', opacity:0.5, fontSize:12 }}><th style={{padding:10}}>Nombre</th><th>Categoría</th><th>SKU</th><th></th></tr></thead>
      <tbody>{productos.map(p=>(
        <tr key={p.id} style={{ borderTop:'1px solid #eee' }}>
          <td style={{padding:10, fontWeight:600}}>{p.nombre}</td><td>{p.Categoria}</td><td>{p.SKU}</td>
          <td><button onClick={()=>onEdit(p)}>Editar</button> <button onClick={()=>onDelete(p.id)} style={{color:'red'}}>Borrar</button></td>
        </tr>
      ))}</tbody>
    </table>
  )
}
