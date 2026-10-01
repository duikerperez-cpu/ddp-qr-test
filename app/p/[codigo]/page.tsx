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
  const isMineria = dpp.plantilla === 'mineria'

  return (
    <div style={{background:'#f3f4f6', minHeight:'100vh', padding:12, fontFamily:'system-ui'}}>
      <div style={{maxWidth:900, margin:'0 auto'}}>
        <div style={{background:'white', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', border:'1px solid #e5e7eb'}}>
          <div>
            <h1 style={{margin:0, fontWeight:900}}>{dpp.descripcion}</h1>
            <p style={{fontSize:12, color:'#6b7280'}}>{dpp.codigo} • {isMineria? 'MINERÍA / ESTRUCTURAS' : 'ALIMENTOS / BEBIDAS'}</p>
            <span style={{background:'#ecfdf5', color:'#059669', border:'1px solid #a7f3d0', borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700}}>✓ Verificado por VINCULAB - {dpp.created_at?.slice(0,10)}</span>
          </div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://vinculab.cl/p/${codigo}`} style={{borderRadius:8, border:'1px solid #eee', padding:4}} />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, color:'#ff6a00'}}>ESPECIFICACIONES</h3>
            {isMineria? <>
              <p><span style={{color:'#6b7280'}}>Tipo Acero:</span> <b>{d.tipo_acero}</b></p>
              <p><span style={{color:'#6b7280'}}>Norma:</span> <b>{d.norma}</b></p>
              <p><span style={{color:'#6b7280'}}>Carga:</span> <b>{d.carga_max} kg</b></p>
              <p><span style={{color:'#6b7280'}}>Lote:</span> <b>{d.lote_acero}</b></p>
              <p><span style={{color:'#6b7280'}}>Fecha:</span> <b>{d.fecha_fabricacion}</b></p>
            </>:<>
              <p><span style={{color:'#6b7280'}}>Ingredientes:</span> <b>{d.ingredientes}</b></p>
              <p><span style={{color:'#6b7280'}}>Parcela:</span> <b>{d.parcela}</b></p>
              <p><span style={{color:'#6b7280'}}>Cosecha:</span> <b>{d.fecha_cosecha}</b></p>
              <p><span style={{color:'#6b7280'}}>Vencimiento:</span> <b>{d.fecha_vencimiento}</b></p>
            </>}
          </div>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800}}>FABRICACIÓN / PRODUCTO</h3>
            {isMineria? <>
              <p><span style={{color:'#6b7280'}}>Soldador:</span> <b>{d.soldador}</b></p>
              <p><span style={{color:'#6b7280'}}>Obra:</span> <b>{d.ubicacion_obra}</b></p>
              {d.certificado_url && <a href={d.certificado_url} target="_blank" style={{color:'#ff6a00', fontWeight:800}}>Ver Certificado PDF →</a>}
            </>:<>
              <p><span style={{color:'#6b7280'}}>Lote:</span> <b>{d.lote_produccion}</b></p>
              <p><span style={{color:'#6b7280'}}>Res. Sanitaria:</span> <b>{d.cert_sanitario}</b></p>
              {d.link_tienda && <a href={d.link_tienda} target="_blank" style={{display:'block', background:'#ff6a00', color:'white', padding:12, borderRadius:8, textAlign:'center', fontWeight:800, textDecoration:'none', marginTop:10}}>COMPRAR DE NUEVO →</a>}
            </>}
            {d.foto_url && <img src={d.foto_url} style={{width:'100%', height:180, objectFit:'cover', borderRadius:8, marginTop:12, border:'1px solid #eee'}} />}
          </div>
        </div>
      </div>
    </div>
  )
}
