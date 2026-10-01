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
      setDpp(data)
      setLoading(false)
    })
  },[codigo])

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Cargando {codigo}...</div>
  if(!dpp) return <div style={{padding:40, textAlign:'center'}}>DPP no encontrado: {codigo}</div>

  const datos = dpp.datos || {}
  const isKombucha = dpp.plantilla === 'kombucha'
  const logo = isKombucha? '/auka-logo.png' : '/hercom-logo.png'
  const fallbackLogo = '/vinculab-logo.png'
  const urlActual = typeof window!== 'undefined'? window.location.href : `https://vinculab.cl/p/${codigo}`

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f4', padding:20, fontFamily:'system-ui'}}>
      <div style={{maxWidth:500, margin:'0 auto', background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>

        {/* HEADER VENCIDO */}
        {datos.fecha_vencimiento && new Date(datos.fecha_vencimiento) < new Date() && (
          <div style={{background:'#7f1d1d', color:'white', textAlign:'center', padding:8, fontSize:11, fontWeight:900, letterSpacing:1}}>
            VENCIDO HACE {Math.floor((Date.now() - new Date(datos.fecha_vencimiento).getTime())/86400000)} DIAS
          </div>
        )}

        <div style={{padding:24}}>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
            <img
              src={logo}
              onError={(e:any)=>{ e.target.src = fallbackLogo }}
              style={{width:44, height:44, borderRadius:50, objectFit:'cover', background:'#09090b'}}
            />
            <div>
              <div style={{background:'#ff6a00', color:'white', fontSize:9, fontWeight:900, padding:'2px 8px', borderRadius:20, display:'inline-block', marginBottom:4}}>
                {isKombucha? 'AUKA • KOMBUCHA ARTESANAL' : 'HERCOM • ESTRUCTURA MINERA'}
              </div>
              <h1 style={{margin:0, fontSize:22, fontWeight:900, lineHeight:1.1}}>{dpp.descripcion}</h1>
              <p style={{margin:'4px 0 0', fontSize:11, color:'#71717a', fontFamily:'monospace'}}>{dpp.codigo} {datos.lote? `• Lote ${datos.lote}` : datos.lote_acero? `• Lote ${datos.lote_acero}` : ''}</p>
            </div>
          </div>

          {/* CAMPOS */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
            {Object.entries(datos).filter(([k])=>!['foto_url','certificado_url','ingredientes','certificacion','resolucion_sanitaria','azucar_g','temperatura_conservacion'].includes(k)).map(([k,v]:any)=>(
              <div key={k} style={{background:'#f4f4f5', padding:12, borderRadius:10}}>
                <div style={{fontSize:9, fontWeight:800, color:'#71717a', textTransform:'uppercase'}}>{k.replace(/_/g,' ')}</div>
                <div style={{fontSize:13, fontWeight:700, marginTop:2}}>{String(v)}</div>
              </div>
            ))}
          </div>

          {datos.ingredientes && (
            <div style={{background:'white', border:'1px solid #e4e4e7', padding:14, borderRadius:12, marginBottom:12}}>
              <div style={{fontSize:11, fontWeight:900, letterSpacing:1, marginBottom:6}}>INGREDIENTES</div>
              <div style={{fontSize:12, color:'#3f3f46', textTransform:'uppercase'}}>{datos.ingredientes}</div>
              <div style={{marginTop:10, display:'flex', gap:6, flexWrap:'wrap'}}>
                {datos.azucar_g && <span style={{fontSize:10, background:'#f4f4f5', border:'1px solid #e4e4e7', padding:'4px 8px', borderRadius:20}}>Azúcar: {datos.azucar_g}</span>}
                {datos.temperatura_conservacion && <span style={{fontSize:10, background:'#f4f4f5', border:'1px solid #e4e4e7', padding:'4px 8px', borderRadius:20}}>🧊 {datos.temperatura_conservacion}</span>}
              </div>
            </div>
          )}

          <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', padding:14, borderRadius:12, marginBottom:18}}>
            <div style={{fontSize:11, fontWeight:900, color:'#15803d'}}>✓ TRAZABILIDAD SANITARIA</div>
            {datos.resolucion_sanitaria && <div style={{fontSize:11, marginTop:6}}><b>Res. Sanitaria:</b> {datos.resolucion_sanitaria}</div>}
            {datos.certificacion && <div style={{fontSize:11, marginTop:2}}><b>Certificación:</b> {datos.certificacion}</div>}
            {datos.lote && <div style={{fontSize:11, marginTop:2}}><b>Lote:</b> {datos.lote} • Verificado por VINCULAB</div>}
          </div>

          {/* QR CON LOGO EN FICHA PÚBLICA */}
          <div style={{textAlign:'center', borderTop:'1px solid #f4f4f5', paddingTop:18}}>
            <p style={{fontSize:10, color:'#a1a1aa', fontWeight:700, letterSpacing:1, marginBottom:10}}>ESCANEA PARA VERIFICAR AUTENTICIDAD</p>
            <div style={{display:'inline-block', background:'white', padding:10, borderRadius:12, border:'2px solid #09090b'}}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlActual)}`}
                style={{display:'block', width:140, height:140}}
                alt="QR"
              />
            </div>
            <div style={{marginTop:10, display:'flex', justifyContent:'center'}}>
              <img src={logo} onError={(e:any)=>e.target.src=fallbackLogo} style={{width:24, height:24, borderRadius:20}} />
            </div>
            <p style={{fontSize:9, color:'#a1a1aa', marginTop:12}}>Pasaporte Digital verificado por</p>
            <p style={{fontSize:12, fontWeight:900, letterSpacing:2, margin:0}}>VINCULAB.CL</p>
          </div>

          {datos.foto_url && <img src={datos.foto_url} style={{width:'100%', borderRadius:12, marginTop:16}} />}
          {datos.certificado_url && <a href={datos.certificado_url} target="_blank" style={{display:'block', marginTop:12, background:'#09090b', color:'white', textAlign:'center', padding:12, borderRadius:10, textDecoration:'none', fontWeight:800, fontSize:12}}>📄 VER CERTIFICADO / ANÁLISIS LAB</a>}
        </div>
      </div>
    </div>
  )
}
