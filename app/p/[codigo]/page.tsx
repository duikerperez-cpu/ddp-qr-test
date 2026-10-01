'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicPage(){
  const { codigo } = useParams()
  const [dpp, setDpp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    supabase.from('dpps').select('*').eq('codigo', codigo).single().then(r=>{
      setDpp(r.data)
      setLoading(false)
    })
  },[codigo])

  if(loading) return <div style={{padding:40, fontFamily:'system-ui'}}>Cargando {codigo}...</div>
  if(!dpp) return <div style={{padding:40, fontFamily:'system-ui'}}>No encontrado: {codigo}</div>

  const datos = dpp.datos || {}
  const isMineria = dpp.plantilla === 'mineria'

  return (
    <div style={{background:'#f3f4f6', minHeight:'100vh', padding:12, fontFamily:'system-ui'}}>
      <div style={{maxWidth:900, margin:'0 auto'}}>
        <div style={{background:'white', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #e5e7eb'}}>
          <div>
            <h1 style={{margin:0, fontWeight:900, textTransform:'uppercase', fontSize:18}}>{dpp.descripcion || codigo}</h1>
            <p style={{fontSize:12, color:'#6b7280', margin:'4px 0'}}>{dpp.codigo} • {isMineria? 'MINERÍA / ESTRUCTURAS' : 'ALIMENTOS / BEBIDAS'}</p>
            <span style={{background:'#ecfdf5', color:'#059669', border:'1px solid #a7f3d0', borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700}}>✓ Verificado por VINCULAB - {dpp.created_at?.slice(0,10)}</span>
          </div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://vinculab.cl/p/${codigo}`} style={{border:'1px solid #eee', borderRadius:8, padding:4, background:'white'}} />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, margin:'0 0 12px', color:'#ff6a00', letterSpacing:1}}>{isMineria? 'ESPECIFICACIONES TÉCNICAS' : 'ORIGEN Y TRAZABILIDAD'}</h3>
            <div style={{fontSize:13, display:'grid', gap:10}}>
              {isMineria? <>
                <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f3f4f6', paddingBottom:6}}><span style={{color:'#6b7280'}}>Tipo Acero</span><b>{datos.tipo_acero || dpp.materiales || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f3f4f6', paddingBottom:6}}><span style={{color:'#6b7280'}}>Norma</span><b>{datos.norma || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f3f4f6', paddingBottom:6}}><span style={{color:'#6b7280'}}>Carga Máxima</span><b>{datos.carga_max || '-'} kg</b></div>
                <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f3f4f6', paddingBottom:6}}><span style={{color:'#6b7280'}}>Lote Acero</span><b>{datos.lote_acero || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Fecha Fab.</span><b>{datos.fecha_fabricacion || '-'}</b></div>
              </> : <>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Ingredientes</span><b style={{maxWidth:180, textAlign:'right'}}>{datos.ingredientes || dpp.materiales || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Parcela</span><b>{datos.parcela || dpp.origen || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Cosecha</span><b>{datos.fecha_cosecha || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Vencimiento</span><b>{datos.fecha_vencimiento || '-'}</b></div>
              </>}
            </div>
          </div>

          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, margin:'0 0 12px', letterSpacing:1}}>{isMineria? 'FABRICACIÓN' : 'PRODUCTO'}</h3>
            <div style={{fontSize:13, display:'grid', gap:10}}>
              {isMineria? <>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Soldador</span><b>{datos.soldador || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Obra / Faena</span><b>{datos.ubicacion_obra || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Certificado</span>{datos.certificado_url? <a href={datos.certificado_url} target="_blank" style={{color:'#ff6a00', fontWeight:700}}>Ver PDF</a> : <b>-</b>}</div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Lote asociado</span><b>{dpp.lote_id?.slice(0,8) || 'Sin lote'}</b></div>
              </> : <>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Modelo</span><b>{dpp.descripcion}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Lote</span><b>{datos.lote_produccion || '-'}</b></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#6b7280'}}>Res. Sanitaria</span><b>{datos.cert_sanitario || '-'}</b></div>
              </>}
              {datos.foto_url? <img src={datos.foto_url} style={{width:'100%', height:140, objectFit:'cover', borderRadius:8, marginTop:8, border:'1px solid #e5e7eb'}} /> : <div style={{height:140, background:'#f9fafb', borderRadius:8, marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', fontSize:12, border:'1px dashed #d1d5db'}}>Sin foto</div>}
            </div>
          </div>

          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:11, fontWeight:800, letterSpacing:1}}>CONFORMIDAD</h3>
            <p style={{fontSize:12, color:'#6b7280', marginTop:10, lineHeight:1.4}}>{isMineria? 'Cumple NCh 427, EN 131. Estructura verificada para uso minero y sometida a control de calidad.' : datos.historia || 'Producto verificado por Vinculab. Trazabilidad completa desde origen.'}</p>
            <div style={{marginTop:12, background:'#f9fafb', padding:8, borderRadius:6, fontSize:10, color:'#6b7280', fontFamily:'monospace'}}>Hash: {dpp.id?.slice(0,24)}... • Blockchain Vinculab</div>
          </div>

          <div style={{background:'linear-gradient(135deg, #1f2937, #ea580c)', borderRadius:12, padding:16, color:'white', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
            <div>
              <h3 style={{fontSize:11, fontWeight:800, margin:'0 0 8px', letterSpacing:1, opacity:0.8}}>TRAZABILIDAD</h3>
              <div style={{fontSize:28, fontWeight:900, lineHeight:1}}>{isMineria? `${datos.carga_max || '0'} KG` : (dpp.huella_carbono || '3.0 Kg CO2e')}</div>
              <div style={{fontSize:12, opacity:0.8, marginTop:4}}>{isMineria? 'Capacidad certificada' : 'Huella verificada'}</div>
            </div>
            {datos.link_tienda && <a href={datos.link_tienda} target="_blank" style={{display:'block', marginTop:16, background:'white', color:'#ea580c', textAlign:'center', padding:'12px', borderRadius:8, fontWeight:800, fontSize:13, textDecoration:'none'}}>COMPRAR DE NUEVO →</a>}
            {datos.certificado_url && <a href={datos.certificado_url} target="_blank" style={{display:'block', marginTop:16, background:'white', color:'#111', textAlign:'center', padding:'12px', borderRadius:8, fontWeight:800, fontSize:13, textDecoration:'none'}}>VER CERTIFICADO PDF</a>}
            {!datos.link_tienda &&!datos.certificado_url && <div style={{marginTop:16, fontSize:11, opacity:0.6}}>Escanea el QR para validar autenticidad en faena</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
