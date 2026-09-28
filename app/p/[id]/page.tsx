import { supabase } from '@/lib/supabase'

export default async function Page({ params }: { params: { id: string } }) {
  const { data: producto } = await supabase.from('productos_individuales').select('*').eq('codigo_qr', params.id).single()
  if(!producto) return <div className="p-10">No encontrado {params.id}</div>
  const { data: lote } = await supabase.from('lotes').select('*, empresas(*), modelos_empresa(*)').eq('id', producto.lote_id).single()

  return (
    <div style={{minHeight:'100vh', background:'#f1f3f6', padding:'16px'}}>
      <div style={{maxWidth:'1024px', margin:'0 auto', background:'white', borderRadius:'24px', border:'1px solid #e2e8f0', overflow:'hidden'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'20px', borderBottom:'1px solid #e2e8f0'}}>
          <div style={{width:'48px', height:'48px', background:'black', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'22px'}}>V</div>
          <div><div style={{fontWeight:'900', letterSpacing:'4px', fontSize:'14px'}}>VINCULAB</div><div style={{fontSize:'11px', color:'#64748b'}}>Pasaporte Digital de Producto • UE</div></div>
          <div style={{marginLeft:'auto', background:'#0f172a', color:'white', fontSize:'10px', padding:'6px 12px', borderRadius:'999px'}}>PLATAFORMA OFICIAL</div>
        </div>

        <div style={{padding:'24px', background:'#f8fafc'}}>
          <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'16px'}}>
            <div><h1 style={{fontSize:'26px', fontWeight:'900', textTransform:'uppercase'}}>ESCALERA DE SEGURIDAD</h1><p style={{fontFamily:'monospace', fontSize:'13px', color:'#64748b'}}>{producto.codigo_qr} • Lote {lote?.codigo_lote} • {lote?.cantidad} unid</p></div>
            <div style={{display:'flex', gap:'12px', alignItems:'flex-start'}}><span style={{background:'#16a34a', color:'white', fontSize:'11px', padding:'8px 16px', borderRadius:'999px', fontWeight:'700'}}>✓ Verificado por VINCULAB</span><img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://vinculab.cl/p/${producto.codigo_qr}`} style={{width:'80px', height:'80px', background:'white', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'4px'}} /></div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'24px'}}>
            <div style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px', display:'flex', gap:'16px'}}>
              <div style={{width:'64px', height:'64px', background:'#f97316', color:'white', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900'}}>H</div>
              <div><p style={{fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'2px'}}>🏭 FABRICANTE</p><div style={{fontSize:'12px', marginTop:'8px', lineHeight:'20px'}}><b>{lote?.empresas?.nombre || 'HERCOM CHILE'}</b><br/>País: CL<br/>ID: VINCULAB-CL<br/>Fecha: {lote?.created_at?.slice(0,10)}</div></div>
            </div>
            <div style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px'}}><p style={{fontSize:'10px', fontWeight:'900', color:'#94a3b8'}}>📦 PRODUCTO</p><div style={{fontSize:'12px', marginTop:'8px', lineHeight:'20px'}}>Categoría: Battery<br/>Modelo: {lote?.modelos_empresa?.codigo || 'her092026'}<br/>Lote: {lote?.codigo_lote}</div></div>
            <div style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px'}}><p style={{fontSize:'10px', fontWeight:'900', color:'#94a3b8'}}>🧪 COMPOSICIÓN</p><div style={{fontSize:'12px', marginTop:'8px'}}>Lithium 12%<br/>Cobalt 15%<br/>Nickel 30%</div></div>
            <div style={{background:'#0f172a', color:'white', borderRadius:'16px', padding:'20px', textAlign:'center'}}><p style={{fontSize:'10px', opacity:0.6}}>🌍 HUELLA DE CARBONO</p><p style={{fontSize:'44px', fontWeight:'900', margin:'8px 0'}}>45.5</p><p>kg CO₂e</p></div>
          </div>

          <div style={{marginTop:'24px', borderTop:'1px solid #e2e8f0', paddingTop:'16px', display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#94a3b8'}}>
            <span>VINCULAB • Plataforma oficial de Pasaportes Digitales</span><span>vinculab.cl • {producto.codigo_qr}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
