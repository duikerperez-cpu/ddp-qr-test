'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const dynamic = 'force-dynamic'

function diasParaVencer(fecha: string){
  if(!fecha) return null
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const vence = new Date(fecha); vence.setHours(0,0,0,0)
  const diff = Math.ceil((vence.getTime() - hoy.getTime()) / (1000*60*60*24))
  return diff
}

export default function DPPPublic(){
  const params = useParams()
  const codigo = params?.codigo as string
  const [dpp, setDpp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(codigo){
      supabase.from('dpps').select('*').eq('codigo', codigo).single().then(r=>{
        setDpp(r.data)
        setLoading(false)
      })
    }
  },[codigo])

  if(loading) return <div style={{background:'#09090b', minHeight:'100vh', color:'white', padding:40, textAlign:'center', fontFamily:'system-ui'}}>Verificando producto...</div>
  if(!dpp) return <div style={{background:'#09090b', minHeight:'100vh', color:'white', padding:40, textAlign:'center', fontFamily:'system-ui'}}><h2>DPP no encontrado</h2><p style={{color:'#a1a1aa'}}>Código: {codigo}</p></div>

  const esKombucha = dpp.plantilla === 'kombucha' || dpp.plantilla === 'inmobiliaria' || dpp.codigo.includes('AUKA')
  const datos = dpp.datos || {}
  const dias = esKombucha? diasParaVencer(datos.fecha_vencimiento) : null

  let estadoVenc: any = null
  if(dias!== null){
    if(dias < 0) estadoVenc = { label:`VENCIDO HACE ${Math.abs(dias)} DÍAS`, color:'#ef4444', bg:'#450a0a', border:'#ef4444' }
    else if(dias <= 7) estadoVenc = { label:`¡VENCE EN ${dias} DÍAS! - Consumir pronto`, color:'#facc15', bg:'#422006', border:'#facc15' }
    else if(dias <= 30) estadoVenc = { label:`Vence en ${dias} días`, color:'#fb923c', bg:'#431407', border:'#fb923c' }
    else estadoVenc = { label:`Vigente - ${dias} días para vencer`, color:'#4ade80', bg:'#052e16', border:'#22c55e' }
  }

  return (
    <div style={{background:'#f5f5f5', minHeight:'100vh', fontFamily:'system-ui', color:'#18181b'}}>
      {/* HEADER */}
      <div style={{background:'#09090b', color:'white', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <b style={{letterSpacing:2}}>VINCULAB</b>
        <span style={{fontSize:10, background:'#22c55e', padding:'4px 8px', borderRadius:20, fontWeight:800, color:'#052e16'}}>✓ PRODUCTO VERIFICADO</span>
      </div>

      <div style={{maxWidth:500, margin:'0 auto', background:'white', minHeight:'100vh', boxShadow:'0 0 40px rgba(0,0,0,0.08)'}}>

        {esKombucha? (
          <>
            {/* FOTO */}
            {datos.foto_url && <img src={datos.foto_url} style={{width:'100%', height:300, objectFit:'cover'}} />}

            {/* SEMAFORO VENCIMIENTO */}
            {estadoVenc && (
              <div style={{background: estadoVenc.bg, borderBottom:`2px solid ${estadoVenc.border}`, padding:12, textAlign:'center', color: estadoVenc.color, fontWeight:900, fontSize:13, letterSpacing:0.5}}>
                {estadoVenc.label}
              </div>
            )}

            <div style={{padding:20}}>
              <span style={{background:'#ff6a00', color:'white', padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:900}}>AUKA • KOMBUCHA ARTESANAL</span>
              <h1 style={{fontSize:24, fontWeight:900, margin:'10px 0 4px', lineHeight:1.1}}>{dpp.descripcion}</h1>
              <p style={{margin:0, color:'#71717a', fontSize:12, fontFamily:'monospace'}}>{dpp.codigo} • Lote {datos.lote}</p>

              {/* DATOS CLAVE */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:20}}>
                <div style={{background:'#f4f4f5', borderRadius:10, padding:12}}><p style={{margin:0, fontSize:10, color:'#71717a', fontWeight:700}}>SABOR</p><b style={{fontSize:14}}>{datos.sabor||'-'}</b></div>
                <div style={{background:'#f4f4f5', borderRadius:10, padding:12}}><p style={{margin:0, fontSize:10, color:'#71717a', fontWeight:700}}>VOLUMEN</p><b style={{fontSize:14}}>{datos.volumen||'-'}</b></div>
                <div style={{background:'#f4f4f5', borderRadius:10, padding:12}}><p style={{margin:0, fontSize:10, color:'#71717a', fontWeight:700}}>ELABORACIÓN</p><b style={{fontSize:14}}>{datos.fecha_elaboracion||'-'}</b></div>
                <div style={{background:'#f4f4f5', borderRadius:10, padding:12}}><p style={{margin:0, fontSize:10, color:'#71717a', fontWeight:700}}>VENCIMIENTO</p><b style={{fontSize:14}}>{datos.fecha_vencimiento||'-'}</b></div>
              </div>

              {/* INGREDIENTES */}
              <div style={{marginTop:20, background:'#fafafa', border:'1px solid #e4e4e7', borderRadius:12, padding:16}}>
                <h3 style={{margin:'0 0 8px', fontSize:13, fontWeight:900, letterSpacing:1}}>INGREDIENTES</h3>
                <p style={{margin:0, fontSize:13, lineHeight:1.5, color:'#27272a'}}>{datos.ingredientes||'No especificado'}</p>
                <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
                  {datos.azucar_g && <span style={{fontSize:11, background:'white', border:'1px solid #e4e4e7', padding:'4px 8px', borderRadius:6}}>Azúcar: {datos.azucar_g}</span>}
                  {datos.temperatura_conservacion && <span style={{fontSize:11, background:'white', border:'1px solid #e4e4e7', padding:'4px 8px', borderRadius:6}}>🧊 {datos.temperatura_conservacion}</span>}
                </div>
              </div>

              {/* SANITARIO */}
              <div style={{marginTop:12, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:16}}>
                <h3 style={{margin:'0 0 8px', fontSize:13, fontWeight:900, color:'#15803d'}}>✓ TRAZABILIDAD SANITARIA</h3>
                <p style={{margin:'4px 0', fontSize:12}}><b>Res. Sanitaria:</b> {datos.resolucion_sanitaria||'En trámite'}</p>
                <p style={{margin:'4px 0', fontSize:12}}><b>Certificación:</b> {datos.certificacion||'-'}</p>
                <p style={{margin:'4px 0', fontSize:12}}><b>Lote:</b> {datos.lote} • Verificado por VINCULAB</p>
              </div>

              {datos.certificado_url && <a href={datos.certificado_url} target="_blank" style={{display:'block', marginTop:16, background:'#18181b', color:'white', textAlign:'center', padding:14, borderRadius:10, fontWeight:800, textDecoration:'none', fontSize:13}}>📄 VER ANÁLISIS DE LABORATORIO</a>}
            </div>
          </>
        ) : (
          // VISTA HERCOM MINERIA
          <div style={{padding:20}}>
            {datos.foto_url && <img src={datos.foto_url} style={{width:'100%', borderRadius:12, marginBottom:16}} />}
            <span style={{background:'#18181b', color:'white', padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:900}}>HERCOM • ESTRUCTURA MINERA</span>
            <h1 style={{fontSize:22, fontWeight:900, margin:'10px 0'}}>{dpp.descripcion}</h1>
            <p style={{fontFamily:'monospace', fontSize:11, color:'#71717a'}}>{dpp.codigo}</p>
            <div style={{marginTop:16}}>
              {Object.entries(datos).map(([k,v]:any)=> v && k!=='foto_url' && k!=='certificado_url' && (
                <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f4f4f5', fontSize:13}}><span style={{color:'#71717a', textTransform:'uppercase', fontSize:11, fontWeight:700}}>{k.replace(/_/g,' ')}</span><b>{String(v).slice(0,60)}</b></div>
              ))}
            </div>
            {datos.certificado_url && <a href={datos.certificado_url} target="_blank" style={{display:'block', marginTop:16, background:'#ff6a00', color:'white', textAlign:'center', padding:14, borderRadius:10, fontWeight:800, textDecoration:'none'}}>📄 VER CERTIFICADO</a>}
          </div>
        )}

        <div style={{textAlign:'center', padding:24, borderTop:'1px solid #f4f4f5', marginTop:20}}>
          <p style={{fontSize:10, color:'#a1a1aa', letterSpacing:1}}>PASAPORTE DIGITAL VERIFICADO POR</p>
          <b style={{letterSpacing:3}}>VINCULAB.CL</b>
          <p style={{fontSize:11, color:'#71717a', marginTop:8}}>Escanea el QR en cada producto para verificar autenticidad</p>
        </div>
      </div>
    </div>
  )
}
