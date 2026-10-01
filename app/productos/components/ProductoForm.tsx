'use client'
import { useEffect, useState } from 'react'
import { getEmpresasForSelect } from '../lib/queries'
export function ProductoForm({ initial, onSave, onClose }: any) {
  const [form, setForm] = useState({ nombre: initial?.nombre||'', empresa_id: initial?.empresa_id||'', categoria: initial?.categoria||'', sku: initial?.sku||'', descripcion: initial?.descripcion||'' })
  const [empresas, setEmpresas] = useState<any[]>([])
  useEffect(()=>{ getEmpresasForSelect().then(({data})=>{ if(data) setEmpresas(data) }) }, [])
  const inputStyle = {width:'100%', marginTop:8, background:'#09090b', border:'1px solid #27272a', borderRadius:8, padding:'10px', color:'white'} as any
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ background:'#18181b', padding:24, borderRadius:12, border:'1px solid #27272a', width:420 }}>
        <h3 style={{ margin:0, color:'white' }}>{initial?'Editar':'Nuevo'} Producto</h3>
        <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={{...inputStyle, marginTop:16}}>
          <option value="">Selecciona empresa</option>
          {empresas.map((e:any)=><option key={e.id} value={e.id}>{e.razon_social}</option>)}
        </select>
        <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} style={inputStyle} />
        <input placeholder="Categoria" value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} style={inputStyle} />
        <input placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} style={inputStyle} />
        <input placeholder="Descripcion" value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} style={inputStyle} />
        <div style={{display:'flex', gap:8, marginTop:16, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{background:'#27272a', border:0, borderRadius:8, padding:'8px 14px', color:'white'}}>Cancelar</button>
          <button onClick={()=>onSave(form)} style={{background:'#ff6a00', border:0, borderRadius:8, padding:'8px 14px', color:'white', fontWeight:700}}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
