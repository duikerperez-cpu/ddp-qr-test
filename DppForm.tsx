'use client'
import { useEffect, useState } from 'react'
import { getLotes } from '../lib/queries'

export function DppForm({ initial, onSave, onClose }: any){
  const [form, setForm] = useState({
    codigo: initial?.codigo||'',
    lote_id: initial?.lote_id||'',
    descripcion: initial?.descripcion||'',
    materiales: initial?.materiales||'',
    origen: initial?.origen||'',
    huella_carbono: initial?.huella_carbono||'',
    estado: initial?.estado||'activo'
  })
  const [lotes, setLotes] = useState<any[]>([])
  useEffect(()=>{ getLotes().then(r=>{ if(r.data) setLotes(r.data) }) }, [])

  const s = {width:'100%', marginTop:8, background:'#09090b', border:'1px solid #27272a', borderRadius:8, padding:'10px', color:'white'} as any

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ background:'#18181b', padding:24, borderRadius:12, border:'1px solid #27272a', width:460 }}>
        <h3 style={{margin:0, color:'white'}}>{initial?'Editar':'Nuevo'} DPP</h3>
        <input placeholder="Código DPP (ej: DPP-CARR-00001)" value={form.codigo} onChange={e=>setForm({...form, codigo:e.target.value})} style={s} />
        <select value={form.lote_id} onChange={e=>setForm({...form, lote_id:e.target.value})} style={s}>
          <option value="">Selecciona Lote</option>
          {lotes.map((l:any)=><option key={l.id} value={l.id}>{l.codigo}</option>)}
        </select>
        <textarea placeholder="Descripción del producto" value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} style={{...s, height:60}} />
        <input placeholder="Materiales (ej: Cuero vacuno, Hilo encerado)" value={form.materiales} onChange={e=>setForm({...form, materiales:e.target.value})} style={s} />
        <input placeholder="Origen (ej: Colina, Chile)" value={form.origen} onChange={e=>setForm({...form, origen:e.target.value})} style={s} />
        <input placeholder="Huella carbono (ej: 2.1 kg CO2)" value={form.huella_carbono} onChange={e=>setForm({...form, huella_carbono:e.target.value})} style={s} />
        <select value={form.estado} onChange={e=>setForm({...form, estado:e.target.value})} style={s}>
          <option value="activo">activo</option><option value="inactivo">inactivo</option>
        </select>
        <div style={{display:'flex', gap:8, marginTop:16, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{background:'#27272a', border:0, borderRadius:8, padding:'8px 14px', color:'white'}}>Cancelar</button>
          <button onClick={()=>onSave(form)} style={{background:'#ff6a00', border:0, borderRadius:8, padding:'8px 14px', color:'white', fontWeight:700}}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
