'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export default function Lotes(){
  const [list,setList]=useState<any[]>([]); const [modelos,setModelos]=useState<any[]>([]); const [codigo,setCodigo]=useState(''); const [modeloId,setModeloId]=useState('')
  const load=async()=>{const {data}=await supabase.from('lotes').select('*, modelos(nombre)').order('created_at',{ascending:false}); const {data:mod}=await supabase.from('modelos').select('*'); if(data) setList(data); if(mod) {setModelos(mod); if(!modeloId && mod[0]) setModeloId(mod[0].id)}}
  useEffect(()=>{load()},[])
  const crear=async()=>{if(!codigo||!modeloId) return; await supabase.from('lotes').insert({codigo, modelo_id:modeloId, cantidad:100}); setCodigo(''); load()}
  return (
    <div>
      <h1 style={{fontSize:18,fontWeight:800,margin:0}}>Lotes</h1>
      <div style={{display:'flex',gap:8,margin:'16px 0'}}><select value={modeloId} onChange={e=>setModeloId(e.target.value)} style={{background:'#11161d',border:'1px solid #1e2731',color:'white',padding:8,borderRadius:6}}>{modelos.map(m=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select><input value={codigo} onChange={e=>setCodigo(e.target.value)} placeholder="Código lote (2024-A01)" style={{background:'#11161d',border:'1px solid #1e2731',color:'white',padding:8,borderRadius:6,flex:1}}/><button onClick={crear} style={{background:'#ff6a00',border:'none',color:'white',padding:'8px 16px',borderRadius:6,fontWeight:800}}>Crear</button></div>
      <div style={{background:'#11161d',border:'1px solid #1e2731',borderRadius:8}}>{list.map(l=><div key={l.id} style={{padding:'10px 16px',borderBottom:'1px solid #1e2731',fontSize:12}}>{l.codigo} <span style={{color:'#5a6570'}}>— {l.modelos?.nombre}</span></div>)}</div>
    </div>
  )
}
