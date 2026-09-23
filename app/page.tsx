'use client'
import { useState } from 'react'

const menu = [
  {id:'dashboard', label:'Dashboard'},
  {id:'empresas', label:'Empresas'},
  {id:'productos', label:'Productos'},
  {id:'modelos', label:'Modelos'},
  {id:'lotes', label:'Lotes'},
  {id:'individuales', label:'Productos Individuales'},
  {id:'dpp', label:'DPP'},
  {id:'nfc', label:'NFC/QR'},
  {id:'confirmaciones', label:'Confirmaciones'},
  {id:'trazabilidad', label:'Trazabilidad'},
]

export default function Page() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#0a0a0a', color:'white', fontFamily:'Arial, sans-serif'}}>
      {/* SIDEBAR */}
      <div style={{width:230, background:'#000', padding:'20px 10px', borderRight:'1px solid #1a1a1a', position:'sticky', top:0, height:'100vh'}}>
        <div style={{color:'#ff6a00', fontWeight:900, fontSize:20, paddingLeft:10, marginBottom:25}}>VINCULAB</div>
        <div style={{display:'flex', flexDirection:'column', gap:4}}>
          {menu.map(m=>(
            <button key={m.id} onClick={()=>setTab(m.id)}
              style={{
                textAlign:'left', background: tab===m.id ? '#1a1a1a' : 'transparent',
                color: tab===m.id ? 'white' : '#666', border:'none',
                borderLeft: tab===m.id ? '4px solid #ff6a00' : '4px solid transparent',
                padding:'12px 14px', borderRadius:6, cursor:'pointer', fontSize:13
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{flex:1, background:'#0f0f0f', padding:30}}>
        {tab==='dashboard' && (
          <>
            <h1 style={{fontSize:32, margin:0, fontWeight:900}}>Dashboard</h1>
            <p style={{color:'#888', fontSize:13}}>Vista general de la plataforma de Identidad Digital de Productos</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:30}}>
              <div style={{background:'#1e1e1e', borderLeft:'6px solid #ff6a00', padding:20, borderRadius:8}}><div style={{fontSize:10,color:'#888'}}>EMPRESAS</div><div style={{fontSize:60,fontWeight:900}}>12</div><div style={{fontSize:12,color:'#aaa'}}>Activas · +2 este mes</div></div>
              <div style={{background:'#1e1e1e', borderLeft:'6px solid #ff6a00', padding:20, borderRadius:8}}><div style={{fontSize:10,color:'#888'}}>PRODUCTOS</div><div style={{fontSize:60,fontWeight:900}}>238</div><div style={{fontSize:12,color:'#aaa'}}>Registrados · +18 este mes</div></div>
              <div style={{background:'#1e1e1e', borderLeft:'6px solid #ff6a00', padding:20, borderRadius:8}}><div style={{fontSize:10,color:'#888'}}>MODELOS</div><div style={{fontSize:60,fontWeight:900}}>18</div><div style={{fontSize:12,color:'#aaa'}}>Plantillas activas</div></div>
              <div style={{background:'#1e1e1e', borderLeft:'6px solid #ff6a00', padding:20, borderRadius:8}}><div style={{fontSize:10,color:'#888'}}>LOTES</div><div style={{fontSize:60,fontWeight:900}}>1,042</div><div style={{fontSize:12,color:'#aaa'}}>Creados · +83 este mes</div></div>
            </div>
          </>
        )}

        {tab==='empresas' && <><h1>Empresas</h1><p style={{color:'#888'}}>Aquí va tu tabla de empresas de Supabase</p><div style={{background:'#1e1e1e', padding:20, borderRadius:8, marginTop:20}}>12 empresas activas</div></>}
        {tab==='productos' && <><h1>Productos</h1><p style={{color:'#888'}}>Tabla de productos</p></>}
        {tab==='modelos' && <><h1>Modelos</h1><p style={{color:'#888'}}>Plantillas DPP</p></>}
        {tab==='lotes' && <><h1>Lotes</h1><p style={{color:'#888'}}>Gestión de lotes</p></>}
        {tab==='individuales' && <><h1>Productos Individuales</h1><p style={{color:'#888'}}>VIN-CL-000001 al 000500</p></>}
        {tab==='dpp' && <><h1>DPP</h1><p style={{color:'#888'}}>Pasaporte Digital - prueba: /p/VIN-CL-000015</p><a href="/p/VIN-CL-000015" target="_blank" style={{color:'#ff6a00'}}>Abrir DPP de prueba →</a></>}
        {tab==='nfc' && <><h1>NFC/QR</h1><p style={{color:'#888'}}>Generador de QR</p><img src="/api/qr?data=https://ddp-qr-test-2-alpha.vercel.app/p/VIN-CL-000015" style={{marginTop:20, background:'white', padding:10, borderRadius:8}} /></>}
        {tab==='confirmaciones' && <h1>Confirmaciones</h1>}
        {tab==='trazabilidad' && <h1>Trazabilidad</h1>}
      </div>
    </div>
  )
}
