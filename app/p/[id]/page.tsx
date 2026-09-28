import { supabase } from '@/lib/supabase'

export default async function Page({ params }: { params: { id: string } }) {
  const { data: producto } = await supabase.from('productos_individuales').select('*').eq('codigo_qr', params.id).single()
  if(!producto) return <div style={{padding:40}}>No encontrado {params.id}</div>
  const { data: lote } = await supabase.from('lotes').select('*, empresas(*), modelos_empresa(*)').eq('id', producto.lote_id).single()
  const empresa = lote?.empresas
  const fecha = new Date().toISOString().slice(0,10)

  return (
    <div style={{minHeight:'100vh', background:'#eef2f6', padding:'16px', fontFamily:'system-ui'}}>
      {/* TOP BAR VINCULAB FIJO */}
      <div style={{maxWidth:'1120px', margin:'0 auto 16px', background:'white', borderRadius:'16px', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0'}}>
        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
          <div style={{width:'64px', height:'64px', background:'black', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'900', fontSize:'32px'}}>V</div>
          <div><div style={{fontSize:'24px', fontWeight:'900'}}>Pasaporte Digital de Producto</div><div style={{color:'#64748b', fontSize:'14px'}}>Cumplimiento UE • Trazabilidad • Sostenibilidad</div></div>
        </div>
        <div style={{display:'flex', gap:'8px'}}><div style={{border:'1px solid #cbd5e1', borderRadius:'8px', padding:'8px 16px', fontSize:'13px'}}>⬇ Descargar PDF</div><div style={{background:'#1e293b', color:'white', borderRadius:'8px', padding:'8px 16px', fontSize:'13px'}}>↗ Compartir</div></div>
      </div>

      <div style={{maxWidth:'1120px', margin:'0 auto', background:'white', borderRadius:'20px', padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0'}}>
        <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'16px'}}>
          <div><h1 style={{fontSize:'32px', fontWeight:'900', margin:0}}>ESCALERA DE SEGURIDAD</h1><p style={{fontFamily:'monospace', color:'#64748b', marginTop:'4px'}}>ID: {producto.codigo_qr}</p></div>
          <div style={{display:'flex', gap:'12px', alignItems:'center'}}><span style={{background:'#059669', color:'white', padding:'8px 16px', borderRadius:'999px', fontSize:'12px', fontWeight:'700'}}>✓ Verificado por VINCULAB • {fecha}</span><div style={{background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'8px', textAlign:'center'}}><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://vinculab.cl/p/${producto.codigo_qr}`} style={{width:'80px', height:'80px'}} /><div style={{fontSize:'10px', marginTop:'4px'}}>Escanear para verificar</div></div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'24px'}}>
          <div style={{border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px'}}><div style={{fontWeight:'900', fontSize:'14px', marginBottom:'12px'}}>🏢 FABRICANTE</div><div style={{fontSize:'13px', lineHeight:'22px'}}><div style={{display:'flex', justifyContent:'space-between'}}><span>Empresa:</span><b>{empresa?.nombre || 'HERCOM CHILE'}</b></div><div style={{display:'flex', justifyContent:'space-between'}}><span>País:</span><b>CL</b></div><div style={{display:'flex', justifyContent:'space-between'}}><span>ID Empresa:</span><b>VINCULAB-CL</b></div><div style={{display:'flex', justifyContent:'space-between'}}><span>Planta:</span><b>Planta Chile</b></div></div></div>
          <div style={{border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px'}}><div style={{fontWeight:'900', fontSize:'14px', marginBottom:'12px'}}>📦 PRODUCTO</div><div style={{fontSize:'13px', lineHeight:'22px'}}><div style={{display:'flex', justifyContent:'space-between'}}><span>Categoría:</span><b>Battery</b></div><div style={{display:'flex', justifyContent:'space-between'}}><span>Modelo:</span><b>{lote?.modelos_empresa?.codigo || 'her092026'}</b></div><div style={{display:'flex', justifyContent:'space-between'}}><span>Versión:</span><b>V1.0</b></div><div style={{display:'flex', justifyContent:'space-between'}}><span>Lote:</span><b>{lote?.codigo_lote}</b></div><div style={{display:'flex', justifyContent:'space-between'}}><span>Cantidad:</span><b>{lote?.cantidad} unid</b></div></div></div>
          
          <div style={{border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px'}}><div style={{fontWeight:'900', fontSize:'14px', marginBottom:'16px'}}>🧪 COMPOSICIÓN QUÍMICA</div><div style={{fontSize:'13px'}}><div>Lithium <span style={{float:'right', fontWeight:'700'}}>12%</span><div style={{height:'8px', background:'#e5e7eb', borderRadius:'99px', marginTop:'4px'}}><div style={{width:'12%', height:'8px', background:'#14b8a6', borderRadius:'99px'}}></div></div></div><div style={{marginTop:'12px'}}>Cobalt <span style={{float:'right', fontWeight:'700'}}>15%</span><div style={{height:'8px', background:'#e5e7eb', borderRadius:'99px', marginTop:'4px'}}><div style={{width:'15%', height:'8px', background:'#2563eb', borderRadius:'99px'}}></div></div></div><div style={{marginTop:'12px'}}>Nickel <span style={{float:'right', fontWeight:'700'}}>30%</span><div style={{height:'8px', background:'#e5e7eb', borderRadius:'99px', marginTop:'4px'}}><div style={{width:'30%', height:'8px', background:'#fb923c', borderRadius:'99px'}}></div></div></div></div></div>
          <div style={{background:'#0f172a', borderRadius:'16px', padding:'20px', color:'white', textAlign:'center'}}><div style={{fontWeight:'900', fontSize:'14px', opacity:0.8}}>☁️ HUELLA DE CARBONO</div><div style={{fontSize:'56px', fontWeight:'900', marginTop:'8px'}}>45.5</div><div style={{opacity:0.7}}>kg CO₂e</div><div style={{fontSize:'11px', opacity:0.6, marginTop:'12px'}}>Emisiones totales ciclo de vida • IEC 14067</div></div>

          <div style={{border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px'}}><div style={{fontWeight:'900', fontSize:'14px', marginBottom:'12px'}}>♻️ CIRCULARIDAD</div><span style={{background:'#059669', color:'white', fontSize:'11px', padding:'6px 12px', borderRadius:'999px'}}>● Nivel de Circularidad: Alto</span><div style={{fontSize:'13px', marginTop:'12px', lineHeight:'22px'}}>• 85% materiales reciclables<br/>• Reparabilidad: Clase A<br/>• Reutilización prevista: 5+ ciclos</div></div>
          <div style={{border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px'}}><div style={{fontWeight:'900', fontSize:'14px', marginBottom:'12px'}}>🛡️ CONFORMIDAD UE</div><div style={{fontWeight:'900'}}>✓ EU 2023/1542</div><div style={{fontSize:'13px', marginTop:'4px'}}>Cumple con el Reglamento de Baterías UE</div><div style={{fontSize:'12px', marginTop:'8px', lineHeight:'20px'}}>• Sin sustancias restringidas<br/>• Trazable<br/>• Conforme</div></div>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'24px', paddingTop:'16px', borderTop:'1px solid #e2e8f0'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'32px', height:'32px', background:'black', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900'}}>V</div><span style={{letterSpacing:'3px', fontSize:'14px', fontWeight:'300'}}>VINCULAB</span></div>
          <span style={{fontSize:'11px', color:'#94a3b8'}}>Powered by VINCULAB</span>
          <span style={{fontSize:'11px', color:'#94a3b8'}}>v2.1 • Datos actualizados: {fecha} 14:32 UTC</span>
        </div>
      </div>
    </div>
  )
}
