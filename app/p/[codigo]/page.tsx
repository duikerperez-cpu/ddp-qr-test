'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicPage(){
  const { codigo } = useParams()
  const [dpp, setDpp] = useState<any>(null)
  useEffect(()=>{ supabase.from('dpps').select('*').eq('codigo', codigo).single().then(r=>setDpp(r.data)) },[codigo])
  if(!dpp) return <div style={{padding:40}}>Cargando {codigo}...</div>
  const d = dpp.datos || {}

  return (
    <div style={{background:'#f3f4f6', minHeight:'100vh', padding:12, fontFamily:'system-ui'}}>
      <div style={{maxWidth:900, margin:'0 auto'}}>
        <div style={{background:'white', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', border:'1px solid #e5e7eb'}}>
          <div>
            <h1 style={{margin:0, fontWeight:900}}>{dpp.descripcion || dpp.codigo}</h1>
            <p style={{fontSize:12, color:'#6b7280'}}>{dpp.codigo} • {dpp.plantilla}</p>
            <span style={{background:'#ecfdf5', color:'#059669', borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700}}>✓ Verificado VINCULAB - {dpp.created_at?.slice(0,10)}</span>
          </div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://vinculab.cl/p/${codigo}`} style={{borderRadius:8, border:'1px solid #eee', padding:4}} />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, color:'#ff6a00', marginBottom:12}}>ESPECIFICACIONES GUARDADAS</h3>
            {Object.keys(d).length===0? <p style={{color:'red'}}>Este DPP no tiene datos (creado antes del fix)</p> :
              Object.entries(d).map(([k,v]:any)=>{
                if(k.includes('url') || k.includes('foto')) return null
                return <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f3f4f6'}}><span style={{color:'#6b7280', textTransform:'capitalize'}}>{k.replace('_',' ')}</span><b>{String(v)}</b></div>
              })
            }
          </div>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, marginBottom:12}}>ARCHIVOS</h3>
            {d.soldador && <p>Soldador: <b>{d.soldador}</b></p>}
            {d.ubicacion_obra && <p>Obra: <b>{d.ubicacion_obra}</b></p>}
            {d.certificado_url && <a href={d.certificado_url} target="_blank" style={{display:'block', background:'#ff6a00', color:'white', padding:12, borderRadius:8, textAlign:'center', fontWeight:800, textDecoration:'none', marginTop:10}}>VER CERTIFICADO PDF →</a>}
            {d.foto_url && d.foto_url.match(/\.(jpg|jpeg|png|webp)/i)?
              <img src={d.foto_url} style={{width:'100%', marginTop:12, borderRadius:8, border:'1px solid #eee'}} /> :
              <div style={{marginTop:12, padding:12, background:'#fef2f2', borderRadius:8, fontSize:11, color:'#991b1b'}}>Foto URL no es imagen directa: {d.foto_url}<br/>Usa link.jpg,.png de Drive o Supabase Storage</div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
