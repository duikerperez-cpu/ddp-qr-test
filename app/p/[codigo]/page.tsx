'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicPage(){
  const { codigo } = useParams()
  const [dpp, setDpp] = useState<any>(null)

  useEffect(()=>{ supabase.from('dpps').select('*').eq('codigo', codigo).single().then(r=>{ console.log("DPP DESDE DB:", r.data); setDpp(r.data) }) },[codigo])
  if(!dpp) return <div style={{padding:40}}>Cargando {codigo}...</div>

  const datos = dpp.datos || {}
  const isMineria = dpp.plantilla === 'mineria'

  return (
    <div style={{background:'#f3f4f6', minHeight:'100vh', padding:12, fontFamily:'system-ui'}}>
      <div style={{maxWidth:900, margin:'0 auto', background:'white', borderRadius:12, padding:12, border:'1px solid #e5e7eb'}}>
        <p style={{fontSize:11, background:'#fffbeb', padding:8, borderRadius:6, border:'1px solid #fde68a'}}>DEBUG - Datos crudos: {JSON.stringify(datos).slice(0,300)}</p>
        <h1>{dpp.descripcion} - {dpp.codigo}</h1>
        <p>{isMineria? 'MINERIA' : 'ALIMENTOS'}</p>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12}}>
          <div>
            {Object.keys(datos).length===0? <p style={{color:'red'}}>¡DATOS VACIO! El INSERT no guardó JSONB. Corre el SQL del PASO 1</p> : Object.entries(datos).map(([k,v]:any)=><div key={k} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', padding:'6px 0'}}><span style={{color:'#666'}}>{k}</span><b>{String(v).slice(0,60)}</b></div>)}
          </div>
          <div>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://vinculab.cl/p/${codigo}`} />
            {datos.foto_url && <img src={datos.foto_url} style={{width:'100%', marginTop:10, height:150, objectFit:'cover'}} />}
            <div style={{background:'#111', color:'white', padding:12, borderRadius:8, marginTop:10}}><b style={{fontSize:20}}>{datos.carga_max || dpp.huella_carbono} KG</b><br/><small>Verificado Vinculab</small></div>
          </div>
        </div>
      </div>
    </div>
  )
}
