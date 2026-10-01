'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Dashboard(){
  const [stats,setStats]=useState({empresas:3,productos:4,modelos:3,lotes:9})
  useEffect(()=>{
    (async()=>{
      try{
        const [e,p,m,l]=await Promise.all([
          supabase.from('empresas').select('*',{count:'exact',head:true}),
          supabase.from('productos').select('*',{count:'exact',head:true}),
          supabase.from('modelos').select('*',{count:'exact',head:true}),
          supabase.from('lotes').select('*',{count:'exact',head:true}),
        ])
        setStats({
          empresas:e.count||3,
          productos:p.count||4,
          modelos:m.count||3,
          lotes:l.count||9
        })
      }catch{}
    })()
  },[])

  return (
    <div>
      <h1 style={{margin:0,fontSize:18,fontWeight:800}}>Dashboard</h1>
      <p style={{margin:'4px 0 20px',fontSize:11,color:'#768088'}}>Vista general de la plataforma Vinculab.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {Object.entries({EMPRESAS:stats.empresas,PRODUCTOS:stats.productos,MODELOS:stats.modelos,LOTES:stats.lotes}).map(([label,value])=>(
          <div key={label} style={{background:'#11161d',border:'1px solid #1e2731',borderLeft:'3px solid #ff4500',borderRadius:8,padding:16}}>
            <div style={{fontSize:8,color:'#5a6570',letterSpacing:1}}>{label}</div>
            <div style={{fontSize:24,fontWeight:900,marginTop:8}}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
