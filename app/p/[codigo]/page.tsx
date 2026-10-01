'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicPage(){
  const { codigo } = useParams()
  const [dpp, setDpp] = useState<any>(null)

  useEffect(()=>{
    supabase.from('dpps').select('*').eq('codigo', codigo).single().then(r=>{
      console.log("DATOS REALES DE DB:", r.data);
      setDpp(r.data)
    })
  },[codigo])

  if(!dpp) return <div style={{padding:40}}>Cargando {codigo}...</div>
  const d = dpp.datos || {}

  return (
    <div style={{background:'#f3f4f6', minHeight:'100vh', padding:12, fontFamily:'system-ui'}}>
      <div style={{maxWidth:900, margin:'0 auto'}}>
        <div style={{background:'white', padding:12, borderRadius:8, marginBottom:12, fontSize:11, border:'1px solid #e5e7eb', wordBreak:'break-all'}}>
          <b>DEBUG DB:</b> {JSON.stringify(d)}
        </div>

        <div style={{background:'white', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', border:'1px solid #e5e7eb'}}>
          <div>
            <h1 style={{margin:0, fontSize:20, fontWeight:900}}>{dpp.descripcion || 'Sin descripcion'}</h1>
            <p style={{fontSize:12, color:'#6b7280'}}>{dpp.codigo} • {(dpp.plantilla||'').toUpperCase()}</p>
            <span style={{background:'#ecfdf5', color:'#059669', border:'1px solid #a7f3d0', borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700}}>✓ Verificado VINCULAB - {dpp.created_at?.slice(0,10)}</span>
          </div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://vinculab.cl/p/${codigo}`} style={{borderRadius:8, border:'1px solid #eee', padding:4}} />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, color:'#ff6a00'}}>DATOS GUARDADOS</h3>
            <div style={{marginTop:10}}>
              <p>Tipo Acero: <b>{d.tipo_acero || '— VACIO —'}</b></p>
              <p>Norma: <b>{d.norma || '— VACIO —'}</b></p>
              <p>Carga: <b>{d.carga_max || '— VACIO —'} kg</b></p>
              <p>Lote: <b>{d.lote_acero || '— VACIO —'}</b></p>
              <p>Fecha: <b>{d.fecha_fabricacion || '— VACIO —'}</b></p>
            </div>
          </div>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <p>Soldador: <b>{d.soldador || '— VACIO —'}</b></p>
            <p>Obra: <b>{d.ubicacion_obra || '— VACIO —'}</b></p>
            {d.certificado_url? <a href={d.certificado_url} target="_blank" style={{color:'#ff6a00', fontWeight:800}}>Ver Certificado PDF → {d.certificado_url}</a> : <p>Cert: — VACIO —</p>}
            {d.foto_url? <div style={{marginTop:12}}><p style={{fontSize:11}}>Foto URL: {d.foto_url}</p><img src={d.foto_url} onError={(e:any)=>e.target.style.display='none'} style={{width:'100%', maxHeight:200, objectFit:'contain', border:'1px solid #eee', borderRadius:8}} /></div> : <p>Foto: — VACIO —</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
