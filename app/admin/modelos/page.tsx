'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export default function Modelos(){
  const [list,setList]=useState<any[]>([]); const [productos,setProductos]=useState<any[]>([]); const [nombre,setNombre]=useState(''); const [prodId,setProdId]=useState('')
  const load=async()=>{const {data}=await supabase.from('modelos').select('*, productos(nombre)').order('created_at',{ascending:false}); const {data:pro}=await supabase.from('productos').select('*'); if(data) setList(data); if(pro) {setProductos(pro); if(!prodId && pro[0]) setProdId(pro[0].id)}}
  useEffect(()=>{load()},[])
  const crear=async()=>{if(!nombre||!prodId) return; await supabase.from('modelos').insert({nombre, producto_id:prodId}); setNombre(''); load()}
  return (
    <div>
      <h1 style={{fontSize:18,fontWeight:800,margin:0}}>Modelos</h1>
      <div style={{display:'flex',gap:8,margin:'16px 0'}}><select value={prodId} onChange={e=>setProdId(e.target.value)} style={{background:'#11161d',border:'1px solid #1e2731',color:'white',padding:8,borderRadius:6}}>{productos.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select><input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre modelo" style={{background:'#11161d',border:'1px solid #1e2731',color:'white',padding:8,borderRadius:6,flex:1}}/><button onClick={crear} style={{background:'#ff6a00',border:'none',color:'white',padding:'8px 16px',borderRadius:6,fontWeight:800}}>Crear</button></div>
      <div style={{background:'#11161d',border:'1px solid #1e2731',borderRadius:8}}>{list.map(m=><div key={m.id} style={{padding:'10px 16px',borderBottom:'1px solid #1e2731',fontSize:12}}>{m.nombre} <span style={{color:'#5a6570'}}>— {m.productos?.nombre}</span></div>)}</div>
    </div>
  )
}
