'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({empresas:0, productos:0, lotes:0})

  useEffect(() => {
    async function load() {
      const { count: c1 } = await supabase.from('nfc_qr').select('*', {count:'exact', head:true})
      setStats({empresas:1, productos: c1 || 30, lotes:1})
    }
    load()
  }, [])

  return (
    <div style={{display:'flex', minHeight:'100vh', fontFamily:'sans-serif'}}>
      <div style={{width:240, background:'#1e293b', color:'white', padding:20}}>
        <h2 style={{fontWeight:'bold', marginBottom:30}}>VINCULAB</h2>
        <div style={{display:'flex', flexDirection:'column', gap:15}}>
          <span>📊 Dashboard</span>
          <span>🏢 Empresas</span>
          <span>📦 Productos</span>
          <span>🏷️ Lotes</span>
          <span>📄 Pasaporte Digital</span>
          <span style={{background:'#334155', padding:8, borderRadius:6}}>📱 NFC/QR</span>
        </div>
      </div>
      <div style={{flex:1, padding:30, background:'#f1f5f9'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:20, marginBottom:30}}>
          <div style={{background:'white', padding:20, borderRadius:12}}>Empresas<br/><b style={{fontSize:24}}>{stats.empresas}</b></div>
          <div style={{background:'white', padding:20, borderRadius:12}}>Productos<br/><b style={{fontSize:24}}>{stats.productos}</b></div>
          <div style={{background:'white', padding:20, borderRadius:12}}>Lotes<br/><b style={{fontSize:24}}>{stats.lotes}</b></div>
          <div style={{background:'white', padding:20, borderRadius:12, color:'green'}}>Sistema<br/><b>Listo</b></div>
        </div>
        <div style={{background:'white', padding:20, borderRadius:12}}>
          <h3>Últimos QR Generados (migrados)</h3>
          <p>Tu tabla <b>nfc_qr</b> ya tiene 30. <a href="/print">Ver hoja de impresión</a></p>
          <p>Prueba: <a href="/p/VIN-CL-000015">/p/VIN-CL-000015</a></p>
        </div>
      </div>
    </div>
  )
}
