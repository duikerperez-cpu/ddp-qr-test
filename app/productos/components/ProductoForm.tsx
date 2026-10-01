'use client'
import { useEffect, useState } from 'react'
import { getEmpresasForSelect } from '../lib/queries'

export function ProductoForm({ initial, onSave, onClose }: any) {
  const [form, setForm] = useState({ nombre: initial?.nombre||'', Categoria: initial?.Categoria||'', SKU: initial?.SKU||'', empresa_id: initial?.empresa_id||'' })
  const [empresas, setEmpresas] = useState<any[]>([])
  useEffect(()=>{ getEmpresasForSelect().then(({data})=>{ if(data) setEmpresas(data) }) }, [])

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ background:'white', padding:20, borderRadius:12, width:380 }}>
        <h3>{initial?'Editar':'Nuevo'} Producto</h3>
        <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}}>
          <option value="">Selecciona empresa</option>
          {empresas.map((e:any)=><option key={e.id} value={e.id}>{e.razon_social}</option>)}
        </select>
        <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}} />
        <input placeholder="Categoría" value={form.Categoria} onChange={e=>setForm({...form, Categoria:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}} />
        <input placeholder="SKU" value={form.SKU} onChange={e=>setForm({...form, SKU:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}} />
        <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={()=>onSave(form)} style={{background:'#ff6a00', color:'white', border:0, padding:'8px 14px', borderRadius:6}}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
