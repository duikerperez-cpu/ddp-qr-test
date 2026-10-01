'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicDPP(){
  const params = useParams()
  const codigo = params?.codigo as string
  const [dpp, setDpp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!codigo) return
    supabase.from('dpps').select('*').eq('codigo', codigo).single().then(({data})=>{
      setDpp(data); setLoading(false)
    })
  },[codigo])

  if(loading) return <div style={{padding:40, textAlign:'center', fontFamily:'system-ui'}}>Cargando {codigo}...</div>
  if(!dpp) return <div style={{padding:40, textAlign:'center', fontFamily:'system-ui'}}>DPP no encontrado: {codigo}</div>

  const datos = dpp.datos || {}
  const isKombucha = dpp.plantilla === 'kombucha'
  const logo = isKombucha? '/auka-logo.png' : '/hercom-logo.png'
  const urlActual = typeof window!== 'undefined'? window.location.href : `https://vinculab.cl/p/${codigo}`

  return (
    <div style={{minHeight:'100vh', background:'#fafaf9', padding:20, fontFamily:'system-ui'}}>
      <div style={{maxWidth:480, margin:'0 auto', background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.08)', border:'1px solid #e7e5e4'}}>
        {datos.fecha_vencimiento && new Date(datos.fecha_vencimiento) < new Date() && (
          <div style={{background:'#7f1d1d', color:'white', textAlign:'center', padding:8, fontSize:11, fontWeight:900}}>VENCIDO HACE {Math.floor((Date.now() - new Date(datos.fecha_vencimiento).getTime())/86400000)} DIAS</div>
        )}
        <div style={{padding:24}}>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
            <img src={logo} onError={(e:any)=>e.target.src='/vinculab-logo.png'} style={{width:44, height:44, borderRadius:50, objectFit:'cover', background:'#09090b'}} alt="logo"/>
            <div>
              <div style={{background:isKombucha?'#15803d':'#ff6a00', color:'white', fontSize:9, fontWeight:900, padding:'2px 8px', borderRadius:20, display:'inline-block', marginBottom:4}}>
                {isKombucha? 'AUKA • KOMBUCHA' : 'HERCOM • ESTRUCTURA'}
              </div>
              <h1 style={{margin:0, fontSize:22, fontWeight:900}}>{dpp.descripcion}</h1>
              <p style={{margin:'4px 0 0', fontSize:11, color:'#71717a', fontFamily:'monospace'}}>{dpp.codigo}</p>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
            {Object.entries(datos).map(([k,v]:any)=>(
              <div key={k} style={{background:'#f4f4f5', padding:12, borderRadius:10}}>
                <div style={{fontSize:9, fontWeight:800, color:'#71717a', textTransform:'uppercase'}}>{k.replace(/_/g,' ')}</div>
                <div style={{fontSize:13, fontWeight:700, marginTop:2, wordBreak:'break-word'}}>{String(v).slice(0,80)}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center', borderTop:'1px solid #f4f4f5', paddingTop:18}}>
            <p style={{fontSize:10, color:'#a1a1aa', fontWeight:700, letterSpacing:1, marginBottom:10}}>ESCANEA PARA VERIFICAR</p>
            <div style={{display:'inline-block', background:'white', padding:10, borderRadius:12, border:'2px solid #09090b'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(urlActual)}`} style={{display:'block', width:160, height:160}} alt="QR"/>
            </div>
            <p style={{fontSize:9, color:'#a1a1aa', marginTop:12}}>Verificado por</p>
            <p style={{fontSize:12, fontWeight:900, letterSpacing:2, margin:0}}>VINCULAB.CL</p>
          </div>
        </div>
      </div>
    </div>
  )
}
