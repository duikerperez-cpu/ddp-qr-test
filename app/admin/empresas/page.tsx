'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Empresas(){
  const [list,setList]=useState<any[]>([])
  const [nombre,setNombre]=useState('')
  const load=async()=>{const {data}=await supabase.from('empresas').select('*').order('created_at',{ascending:false}); if(data) setList(data)}
  useEffect(()=>{load()},[])
  const crear=async()=>{ if(!nombre) return; await supabase.from('empresas').insert({nombre}); setNombre(''); load()}
  return (
    <div>
      <h1 style={{fontSize:18,fontWeight:800,margin:0}}>Empresas</h1>
      <div style={{display:'flex',gap:8,margin:'16px 0'}}><input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre empresa (AUKA, HERCOM...)" style={{background:'#11161d',border:'1px solid #1e2731',color:'white',padding:8,borderRadius:6,flex:1}}/><button onClick={crear} style={{background:'#ff6a00',border:'none',color:'white',padding:'8px 16px',borderRadius:6,fontWeight:800,cursor:'pointer'}}>Crear</button></div>
      <div style={{background:'#11161d',border:'1px solid #1e2731',borderRadius:8}}>{list.map(e=><div key={e.id} style={{padding:'10px 16px',borderBottom:'1px solid #1e2731',fontSize:12,display:'flex',justifyContent:'space-between'}}><span>{e.nombre}</span><span style={{color:'#5a6570',fontSize:10}}>{e.id.slice(0,8)}</span></div>)}</div>
    </div>
  )
}
