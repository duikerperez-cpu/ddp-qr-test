'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export default function Productos(){
  const [list,setList]=useState<any[]>([]); const [empresas,setEmpresas]=useState<any[]>([]); const [nombre,setNombre]=useState(''); const [empresaId,setEmpresaId]=useState('')
  const load=async()=>{const {data}=await supabase.from('productos').select('*, empresas(nombre)').order('created_at',{ascending:false}); const {data:emp}=await supabase.from('empresas').select('*'); if(data) setList(data); if(emp) {setEmpresas(emp); if(!empresaId && emp[0]) setEmpresaId(emp[0].id)}}
  useEffect(()=>{load()},[])
  const crear=async()=>{if(!nombre||!empresaId) return; await supabase.from('productos').insert({nombre, empresa_id:empresaId}); setNombre(''); load()}
  return (
    <div>
      <h1 style={{fontSize:18,fontWeight:800,margin:0}}>Productos</h1>
      <div style={{display:'flex',gap:8,margin:'16px 0'}}><select value={empresaId} onChange={e=>setEmpresaId(e.target.value)} style={{background:'#11161d',border:'1px solid #1e2731',color:'white',padding:8,borderRadius:6}}>{empresas.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}</select><input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre producto" style={{background:'#11161d',border:'1px solid #1e2731',color:'white',padding:8,borderRadius:6,flex:1}}/><button onClick={crear} style={{background:'#ff6a00',border:'none',color:'white',padding:'8px 16px',borderRadius:6,fontWeight:800}}>Crear</button></div>
      <div style={{background:'#11161d',border:'1px solid #1e2731',borderRadius:8}}>{list.map(p=><div key={p.id} style={{padding:'10px 16px',borderBottom:'1px solid #1e2731',fontSize:12}}>{p.nombre} <span style={{color:'#5a6570'}}>— {p.empresas?.nombre}</span></div>)}</div>
    </div>
  )
}
