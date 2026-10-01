'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicPage(){
  const { codigo } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetchData = async ()=>{
      setLoading(true)
      // 1. Buscar en DPPs
      let { data: dpp } = await supabase.from('dpps').select('*').eq('codigo', codigo).single()
      if(dpp){
        // traer lote relacionado si existe
        let lote = null
        if(dpp.lote_id){
          const r = await supabase.from('lotes').select('*').eq('id', dpp.lote_id).single()
          lote = r.data
        }
        setData({ type:'dpp', dpp, lote })
        setLoading(false)
        return
      }
      // 2. Si no es DPP, buscar en Lotes
      let { data: lote } = await supabase.from('lotes').select('*').eq('codigo', codigo).single()
      if(lote){
        setData({ type:'lote', lote })
        setLoading(false)
        return
      }
      setData(null)
      setLoading(false)
    }
    if(codigo) fetchData()
  }, [codigo])

  if(loading) return <div style={{padding:40, background:'#09090b', minHeight:'100vh', color:'white'}}>Cargando {codigo}...</div>
  if(!data) return <div style={{padding:40, background:'#09090b', minHeight:'100vh', color:'white'}}>Código no encontrado: {codigo}</div>

  if(data.type==='dpp'){
    return (
      <div style={{ background:'#09090b', minHeight:'100vh', color:'white', padding:24 }}>
        <div style={{ maxWidth:600, margin:'0 auto', background:'#18181b', borderRadius:16, padding:24, border:'1px solid #27272a' }}>
          <h1 style={{color:'#ff6a00'}}>{data.dpp.codigo}</h1>
          <p style={{opacity:0.7}}>Pasaporte Digital de Producto</p>
          <div style={{marginTop:20, display:'grid', gap:12}}>
            <div><b>Descripción:</b> {data.dpp.descripcion}</div>
            <div><b>Materiales:</b> {data.dpp.materiales}</div>
            <div><b>Origen:</b> {data.dpp.origen}</div>
            <div><b>Huella Carbono:</b> {data.dpp.huella_carbono}</div>
            {data.lote && <div><b>Lote asociado:</b> {data.lote.codigo} - {data.lote.cantidad} unidades</div>}
          </div>
          <div style={{marginTop:24, padding:16, background:'#09090b', borderRadius:8, textAlign:'center'}}>
            <p style={{fontSize:12, opacity:0.5}}>Verificado por Vinculab</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://vinculab.cl/p/${data.dpp.codigo}`} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background:'#09090b', minHeight:'100vh', color:'white', padding:24 }}>
      <div style={{ maxWidth:600, margin:'0 auto', background:'#18181b', borderRadius:16, padding:24 }}>
        <h1>{data.lote.codigo}</h1>
        <p>Lote: {data.lote.cantidad} unidades</p>
        <p>Estado: {data.lote.estado}</p>
      </div>
    </div>
  )
}
