'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    supabase.from('nfc_qr').select('*', {count:'exact', head:true}).then(({count})=>setCount(count||0))
  }, [])

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#0a0a0a', color:'white', fontFamily:'Arial'}}>
      {/* SIDEBAR NEGRO COMO TU FOTO */}
      <div style={{width:220, background:'#000', borderRight:'1px solid #222', padding:15}}>
        <div style={{color:'#ff6a00', fontWeight:'bold', fontSize:18, marginBottom:25}}>VINCULAB</div>
        <div style={{display:'flex', flexDirection:'column', gap:12, fontSize:13, color:'#aaa'}}>
          <span style={{color:'white', background:'#1a1a1a', padding:'8px 10px', borderRadius:6, borderLeft:'3px solid #ff6a00'}}>◼ Dashboard</span>
          <span>🏢 Empresas</span>
          <span>📦 Productos</span>
          <span>🏷️ Modelos</span>
          <span>🏷️ Lotes</span>
          <span>🔢 Productos Individuales</span>
          <span style={{marginTop:10, fontSize:10, color:'#555'}}>OPERACIONES</span>
          <span>📄 DPP</span>
          <span>📱 NFC/QR</span>
          <span>✓ Confirmaciones</span>
          <span>📍 Trazabilidad</span>
        </div>
      </div>

      {/* MAIN COMO TU FOTO */}
      <div style={{flex:1, padding:25, background:'#0f0f0f'}}>
        <h2 style={{fontSize:14, marginBottom:20}}>Dashboard <span style={{fontWeight:'normal', color:'#666', fontSize:11, display:'block'}}>Vista general de la plataforma de Identidad Digital de Productos</span></h2>
        
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:15}}>
          {[
            {label:'EMPRESAS', val:1},
            {label:'PRODUCTOS', val:count},
            {label:'MODELOS', val:1},
            {label:'LOTES', val:1},
          ].map(c=>(
            <div key={c.label} style={{background:'#1a1a1a', border:'1px solid #222', borderLeft:'3px solid #ff6a00', padding:15, borderRadius:4}}>
              <div style={{fontSize:9, color:'#666', letterSpacing:1}}>{c.label}</div>
              <div style={{fontSize:22, fontWeight:'bold', marginTop:5}}>{c.val}</div>
            </div>
          ))}
        </div>

        <div style={{marginTop:30, background:'#151515', border:'1px solid #222', padding:20, borderRadius:6}}>
          <h3 style={{fontSize:13}}>Últimos QR Generados (migrados)</h3>
          <p style={{fontSize:12, color:'#888'}}>Tu tabla nfc_qr ya tiene {count} items migrados a Supabase.</p>
          <a href="/print" style={{color:'#ff6a00', fontSize:12}}>Ver hoja de impresión →</a><br/>
          <a href="/p/VIN-CL-000015" style={{color:'#ff6a00', fontSize:12}}>Probar /p/VIN-CL-000015 →</a>
        </div>
      </div>
    </div>
  )
}
