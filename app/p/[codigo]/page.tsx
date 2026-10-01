'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicPage(){
  const { codigo } = useParams()
  const [dpp, setDpp] = useState<any>(null)
  useEffect(()=>{ supabase.from('dpps').select('*').eq('codigo', codigo).single().then(r=>setDpp(r.data)) },[codigo])
  if(!dpp) return <div style={{padding:40, fontFamily:'system-ui'}}>Cargando {codigo}...</div>
  const d = dpp.datos || {}

  return (
    <div style={{background:'#f3f4f6', minHeight:'100vh', padding:12, fontFamily:'system-ui'}}>
      <div style={{maxWidth:900, margin:'0 auto'}}>
        <div style={{background:'white', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', border:'1px solid #e5e7eb'}}>
          <div>
            <h1 style={{margin:0, fontWeight:900, fontSize:20}}>{dpp.descripcion || dpp.codigo}</h1>
            <p style={{fontSize:12, color:'#6b7280', margin:'4px 0'}}>{dpp.codigo} • {(dpp.plantilla||'').toUpperCase()} • {dpp.created_at?.slice(0,10)}</p>
            <span style={{background:'#ecfdf5', color:'#059669', border:'1px solid #a7f3d0', borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700}}>✓ Verificado VINCULAB</span>
          </div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://vinculab.cl/p/${codigo}`} style={{borderRadius:8, border:'1px solid #eee', padding:4}} />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, color:'#ff6a00', margin:'0 0 12px', letterSpacing:1}}>ESPECIFICACIONES GUARDADAS</h3>
            {Object.keys(d).filter(k=>!k.includes('foto') &&!k.includes('certificado') &&!k.includes('link')).map(k=>{
              return (
                <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f3f4f6'}}>
                  <span style={{color:'#6b7280', textTransform:'capitalize', fontSize:13}}>{k.replaceAll('_',' ')}</span>
                  <b style={{fontSize:13, color:'#111'}}>{String(d[k])}</b>
                </div>
              )
            })}
          </div>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            {d.foto_url && (
              <>
                <p style={{fontSize:11, fontWeight:800, margin:'0 0 8px'}}>FOTO EVIDENCIA</p>
                <img src={d.foto_url} style={{width:'100%', borderRadius:8, border:'1px solid #eee', maxHeight:250, objectFit:'cover'}} onError={(e:any)=>{e.target.src='https://via.placeholder.com/400x300?text=Foto+no+disponible'}} />
              </>
            )}
            {d.certificado_url && (
              <a href={d.certificado_url} target="_blank" style={{display:'block', background:'#ff6a00', color:'white', padding:14, borderRadius:10, textAlign:'center', fontWeight:800, textDecoration:'none', marginTop:12}}>VER CERTIFICADO PDF →</a>
            )}
            {d.soldador && <p style={{fontSize:13, marginTop:12}}><span style={{color:'#6b7280'}}>Soldador:</span> <b>{d.soldador}</b></p>}
            {d.ubicacion_obra && <p style={{fontSize:13}}><span style={{color:'#6b7280'}}>Obra:</span> <b>{d.ubicacion_obra}</b></p>}
          </div>
        </div>
      </div>
    </div>
  )
}
