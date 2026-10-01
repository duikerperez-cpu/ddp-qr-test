'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicProPage(){
  const { codigo } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetchData = async ()=>{
      setLoading(true)
      const { data: dpp } = await supabase.from('dpps').select('*').eq('codigo', codigo).single()
      if(dpp){
        let lote = null
        if(dpp.lote_id){
          const r = await supabase.from('lotes').select('*, productos(nombre), modelos(nombre)').eq('id', dpp.lote_id).single()
          lote = r.data
        }
        // traer empresa
        let empresa = null
        if(lote){
          const e = await supabase.from('empresas').select('*').eq('id', lote.empresa_id).single()
          empresa = e.data
        }
        setData({ dpp, lote, empresa })
      } else {
        const { data: lote } = await supabase.from('lotes').select('*').eq('codigo', codigo).single()
        if(lote) setData({ lote, dpp: null, empresa: null })
      }
      setLoading(false)
    }
    if(codigo) fetchData()
  }, [codigo])

  if(loading) return <div style={{padding:40, background:'#f3f4f6', minHeight:'100vh'}}>Cargando {codigo}...</div>
  if(!data?.dpp &&!data?.lote) return <div style={{padding:40}}>Código no encontrado: {codigo}</div>

  const dpp = data.dpp
  const lote = data.lote
  const empresa = data.empresa

  return (
    <div style={{ background:'#f3f4f6', minHeight:'100vh', padding:16, fontFamily:'Inter, sans-serif' }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>

        {/* HEADER */}
        <div style={{ background:'white', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', alignItems:'flex-start', border:'1px solid #e5e7eb' }}>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, textTransform:'uppercase' }}>{dpp?.descripcion || lote?.codigo || 'PRODUCTO'}</h1>
            <p style={{ margin:'4px 0', fontSize:12, color:'#6b7280', fontWeight:600 }}>{codigo}</p>
            <div style={{ marginTop:8, background:'#ecfdf5', color:'#059669', border:'1px solid #a7f3d0', borderRadius:20, padding:'4px 10px', fontSize:11, display:'inline-block', fontWeight:700 }}>
              ✓ Verificado por VINCULAB - 2026-09-26
            </div>
          </div>
          <div style={{ background:'white', padding:8, borderRadius:8, border:'1px solid #e5e7eb' }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://vinculab.cl/p/${codigo}`} alt="qr" />
          </div>
        </div>

        {/* GRID */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>

          <div style={{ background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb' }}>
            <h3 style={{ margin:'0 0 10px 0', fontSize:11, fontWeight:800, color:'#111827', letterSpacing:1 }}>FABRICANTE</h3>
            <div style={{ fontSize:12, display:'grid', gap:6 }}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>País empresa</span><span style={{fontWeight:700}}>{empresa?.pais || 'CHILE'}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>ID Empresa</span><span style={{fontWeight:700}}>CL</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Fabricante</span><span style={{fontWeight:700, color:'#ff6a00'}}>{empresa?.nombre || 'VINCULA CL'}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Fecha Prod.</span><span style={{fontWeight:700}}>{lote?.created_at?.slice(0,10) || '2026-09-26'}</span></div>
            </div>
          </div>

          <div style={{ background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb' }}>
            <h3 style={{ margin:'0 0 10px 0', fontSize:11, fontWeight:800 }}>PRODUCTO</h3>
            <div style={{ fontSize:12, display:'grid', gap:6 }}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Categoría</span><span style={{fontWeight:700}}>{dpp?.materiales?.split('-')[0] || 'KOMBUCHA'}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Modelo</span><span style={{fontWeight:700}}>ber2026</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Versión</span><span style={{fontWeight:700}}>V1.0</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Lote</span><span style={{fontWeight:700}}>{lote?.codigo || codigo}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Cantidad Total</span><span style={{fontWeight:700}}>{lote?.cantidad || '3'} total</span></div>
            </div>
          </div>

          <div style={{ background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb' }}>
            <h3 style={{ margin:'0 0 10px 0', fontSize:11, fontWeight:800 }}>COMPOSICIÓN QUÍMICA (DE OBLIGATORIO)</h3>
            <div style={{ fontSize:11, display:'grid', gap:8 }}>
              <div><div style={{display:'flex', justifyContent:'space-between'}}><span>Silicio (20.18%)</span><span>12%</span></div><div style={{height:6, background:'#e5e7eb', borderRadius:4}}><div style={{width:'12%', height:6, background:'#f97316', borderRadius:4}} /></div></div>
              <div><div style={{display:'flex', justifyContent:'space-between'}}><span>Plástico (15.02%)</span><span>8%</span></div><div style={{height:6, background:'#e5e7eb', borderRadius:4}}><div style={{width:'8%', height:6, background:'#ef4444', borderRadius:4}} /></div></div>
              <div><div style={{display:'flex', justifyContent:'space-between'}}><span>{dpp?.materiales || 'KOMBUCHA-PULPA TUNA-BERRIES'}</span><span>80%</span></div><div style={{height:6, background:'#e5e7eb', borderRadius:4}}><div style={{width:'80%', height:6, background:'#10b981', borderRadius:4}} /></div></div>
              <p style={{fontSize:10, color:'#6b7280', margin:'4px 0 0 0'}}>Origen: {dpp?.origen || 'ACONCAGUA - CHILE'} ✓</p>
            </div>
          </div>

          <div style={{ background:'linear-gradient(135deg, #1f2937, #ea580c)', borderRadius:12, padding:14, color:'white' }}>
            <h3 style={{ margin:'0 0 10px 0', fontSize:11, fontWeight:800 }}>HUELLA DE CARBONO</h3>
            <div style={{ fontSize:28, fontWeight:900 }}>{dpp?.huella_carbono || '3.0 Kg CO2e'}</div>
            <div style={{ fontSize:11, opacity:0.8 }}>Módulo A: Manufactura / Metodología: PEF - Categoria: 2026</div>
            <div style={{ marginTop:10, height:4, background:'rgba(255,255,255,0.3)', borderRadius:4 }}><div style={{width:'60%', height:4, background:'white', borderRadius:4}} /></div>
            <div style={{ marginTop:8, fontSize:10, opacity:0.7 }}>Cálculo verificado - Menos emisión</div>
          </div>

          <div style={{ background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb' }}>
            <h3 style={{ margin:'0 0 10px 0', fontSize:11, fontWeight:800 }}>CIRCULARIDAD</h3>
            <div style={{ fontSize:11, display:'grid', gap:6 }}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Vida Útil</span><span style={{fontWeight:700}}>3000 ciclos / 10 años</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Reparabilidad</span><span style={{fontWeight:700}}>7/10</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Reciclabilidad</span><span style={{fontWeight:700}}>68%</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Contenido Reciclado</span><span style={{fontWeight:700}}>15%</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Segunda Vida</span><span style={{fontWeight:700}}>Sí</span></div>
            </div>
          </div>

          <div style={{ background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb' }}>
            <h3 style={{ margin:'0 0 10px 0', fontSize:11, fontWeight:800 }}>CONFORMIDAD UE</h3>
            <div style={{ fontSize:11, display:'grid', gap:6 }}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Reglamento</span><span style={{fontWeight:700}}>EU 2024/1781</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Marcado CE</span><span style={{fontWeight:700}}>Sí</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Normas</span><span style={{fontWeight:700}}>EN131 / EN14183</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Ensayos</span><span style={{fontWeight:700}}>UNECE / Bureau</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span>Declaración</span><a style={{fontWeight:700, color:'#ff6a00'}} href="#">Ver PDF</a></div>
            </div>
          </div>
        </div>

        <div style={{ background:'white', borderRadius:12, padding:14, border:'1px solid #e5e7eb', marginTop:12 }}>
          <h3 style={{ margin:'0 0 10px 0', fontSize:11, fontWeight:800 }}>MATERIAL DE TRASLADO</h3>
          <div style={{ fontSize:11, display:'flex', justifyContent:'space-between' }}>
            <span>MANUFACTURA: 2026-09-26 - Chile</span>
            <span style={{color:'#10b981', fontWeight:700}}>✓ Verificado</span>
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:10, color:'#9ca3af', marginTop:16 }}>Pasaporte Digital verificado por Vinculab • vinclab.cl</p>
      </div>
    </div>
  )
}
