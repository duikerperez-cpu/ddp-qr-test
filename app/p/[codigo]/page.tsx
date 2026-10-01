'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
  const { codigo } = useParams()
  const [d, setD] = useState<any>(null)
  const [l, setL] = useState<any>(null)
  const [e, setE] = useState<any>(null)

  useEffect(()=>{
    (async()=>{
      const {data: dpp} = await supabase.from('dpps').select('*').eq('codigo', codigo).single()
      if(dpp){
        setD(dpp)
        if(dpp.lote_id){
          const {data: lote} = await supabase.from('lotes').select('*').eq('id', dpp.lote_id).single()
          setL(lote)
          if(lote?.empresa_id){
            const {data: emp} = await supabase.from('empresas').select('*').eq('id', lote.empresa_id).single()
            setE(emp)
          }
        }
      }
    })()
  },[codigo])

  if(!d) return <div style={{padding:20}}>Cargando {codigo}...</div>

  return (
    <div style={{background:'#f3f4f6', minHeight:'100vh', padding:12, fontFamily:'system-ui'}}>
      <div style={{maxWidth:900, margin:'0 auto'}}>
        {/* HEADER */}
        <div style={{background:'white', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', border:'1px solid #e5e7eb'}}>
          <div>
            <h1 style={{margin:0, fontWeight:900}}>{d.descripcion || 'AUKA BERRIES - TUNA'}</h1>
            <p style={{margin:'4px 0', fontSize:12, color:'#6b7280'}}>{d.codigo} • Lote {l?.codigo}</p>
            <span style={{background:'#ecfdf5', color:'#059669', border:'1px solid #a7f3d0', borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700}}>✓ Verificado por VINCULAB - {d.created_at?.slice(0,10)}</span>
            <p style={{marginTop:12, fontSize:12, maxWidth:500, lineHeight:1.5}}>{d.historia}</p>
          </div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://vinculab.cl/p/${codigo}`} style={{border:'1px solid #eee', borderRadius:8, padding:4}} />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          <div style={{background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, margin:'0 0 10px'}}>FABRICANTE</h3>
            <div style={{fontSize:12, display:'grid', gap:6}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>País empresa</span><b>{e?.pais || 'CHILE'}</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>ID Empresa</span><b>{e?.rut || 'CL-77.XXX.XXX'}</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Fabricante</span><b style={{color:'#ff6a00'}}>{e?.nombre || 'VINCULA CL / AUKA'}</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Fecha Prod.</span><b>{l?.created_at?.slice(0,10) || '2026-09-26'}</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Parcela</span><b>{d.parcela}</b></div>
            </div>
          </div>

          <div style={{background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, margin:'0 0 10px'}}>PRODUCTO</h3>
            <div style={{fontSize:12, display:'grid', gap:6}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Categoría</span><b>BEBIDA FERMENTADA</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Modelo</span><b>AUKA BERRIES-TUNA</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Versión</span><b>V2.0 2026</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Lote</span><b>{l?.codigo}</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Cantidad Total</span><b>{l?.cantidad} botellas</b></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Cosecha</span><b>{d.fecha_cosecha}</b></div>
            </div>
          </div>

          <div style={{background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, margin:'0 0 10px'}}>COMPOSICIÓN REAL</h3>
            <p style={{fontSize:11, fontWeight:600}}>{d.ingredientes}</p>
            <div style={{marginTop:10, fontSize:11}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}><span>Kombucha</span><b>80%</b></div>
              <div style={{height:6, background:'#e5e7eb', borderRadius:4}}><div style={{width:'80%', height:6, background:'#10b981', borderRadius:4}} /></div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:8, marginBottom:4}}><span>Tuna Aconcagua</span><b>15%</b></div>
              <div style={{height:6, background:'#e5e7eb', borderRadius:4}}><div style={{width:'15%', height:6, background:'#f97316', borderRadius:4}} /></div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:8, marginBottom:4}}><span>Berries</span><b>5%</b></div>
              <div style={{height:6, background:'#e5e7eb', borderRadius:4}}><div style={{width:'5%', height:6, background:'#ef4444', borderRadius:4}} /></div>
            </div>
            <p style={{fontSize:10, color:'#6b7280', marginTop:8}}>Origen: {d.origen} ✓ Verificado</p>
            {d.foto_url && <img src={d.foto_url} style={{width:'100%', height:100, objectFit:'cover', borderRadius:8, marginTop:10}} />}
          </div>

          <div style={{background:'linear-gradient(135deg, #1f2937, #ea580c)', borderRadius:12, padding:14, color:'white'}}>
            <h3 style={{fontSize:11, fontWeight:800, margin:'0 0 10px'}}>HUELLA DE CARBONO</h3>
            <div style={{fontSize:28, fontWeight:900}}>{d.huella_carbono}</div>
            <div style={{fontSize:11, opacity:0.8}}>Módulo A: Manufactura / Metodología: PEF</div>
            <a href={d.link_tienda} target="_blank" style={{display:'block', marginTop:16, background:'white', color:'#ea580c', textAlign:'center', padding:'10px', borderRadius:8, fontWeight:800, fontSize:12, textDecoration:'none'}}>COMPRAR DE NUEVO →</a>
            <p style={{fontSize:10, marginTop:8, opacity:0.7}}>Devuelve la botella y gana 10% dcto. - Economía Circular</p>
          </div>
        </div>
      </div>
    </div>
  )
}
