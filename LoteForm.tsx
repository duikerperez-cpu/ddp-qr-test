'use client'
import { useEffect, useState } from 'react'
import { getEmpresas, getProductos, getModelos } from '../lib/queries'

export function LoteForm({ initial, onSave, onClose }: any) {
  const [form, setForm] = useState({ codigo: initial?.codigo||'', cantidad: initial?.cantidad||1, empresa_id: initial?.empresa_id||'', producto_id: initial?.producto_id||'', modelo_id: initial?.modelo_id||'', estado: initial?.estado||'activo' })
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])

  useEffect(()=>{
    getEmpresas().then(r=>{ if(r.data) setEmpresas(r.data) })
    getProductos().then(r=>{ if(r.data) setProductos(r.data) })
    getModelos().then(r=>{ if(r.data) setModelos(r.data) })
  }, [])

  const s = {width:'100%', marginTop:8, background:'#09090b', border:'1px solid #27272a', borderRadius:8, padding:'10px', color:'white'} as any
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ background:'#18181b', padding:24, borderRadius:12, border:'1px solid #27272a', width:420 }}>
        <h3 style={{ margin:0, color:'white' }}>{initial?'Editar':'Nuevo'} Lote / QR</h3>
        <input placeholder="Código Ej: CARR-00001" value={form.codigo} onChange={e=>setForm({...form, codigo:e.target.value})} style={s} />
        <input type="number" placeholder="Cantidad" value={form.cantidad} onChange={e=>setForm({...form, cantidad:e.target.value})} style={s} />
        <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={s}>
          <option value="">Empresa</option>
          {empresas.map((e:any)=><option key={e.id} value={e.id}>{e.razon_social}</option>)}
        </select>
        <select value={form.producto_id} onChange={e=>setForm({...form, producto_id:e.target.value})} style={s}>
          <option value="">Producto</option>
          {productos.filter((p:any)=>!form.empresa_id || p.empresa_id===form.empresa_id).map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={form.modelo_id} onChange={e=>setForm({...form, modelo_id:e.target.value})} style={s}>
          <option value="">Modelo</option>
          {modelos.filter((m:any)=>(!form.empresa_id || m.empresa_id===form.empresa_id) && (!form.producto_id || m.producto_id===form.producto_id)).map((m:any)=><option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <select value={form.estado} onChange={e=>setForm({...form, estado:e.target.value})} style={s}>
          <option value="activo">activo</option>
          <option value="inactivo">inactivo</option>
          <option value="vendido">vendido</option>
        </select>
        <div style={{display:'flex', gap:8, marginTop:16, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{background:'#27272a', border:0, borderRadius:8, padding:'8px 14px', color:'white'}}>Cancelar</button>
          <button onClick={()=>onSave(form)} style={{background:'#ff6a00', border:0, borderRadius:8, padding:'8px 14px', color:'white', fontWeight:700}}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
