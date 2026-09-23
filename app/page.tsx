'use client'
import { useState } from 'react'

const menu = [
  {section:'PRINCIPAL', items:[{id:'dashboard', label:'Dashboard', icon:'⌂'}]},
  {section:'GESTIÓN', items:[
    {id:'empresas', label:'Empresas', icon:'◫'},
    {id:'productos', label:'Productos', icon:'⬙'},
    {id:'modelos', label:'Modelos', icon:'◇'},
    {id:'lotes', label:'Lotes', icon:'☰'},
    {id:'individuales', label:'Productos Individuales', icon:'◉'},
  ]},
  {section:'IDENTIDAD DIGITAL', items:[
    {id:'dpp', label:'DPP', icon:'▤'},
    {id:'nfc', label:'NFC / QR', icon:'≋'},
    {id:'certificados', label:'Certificados', icon:'✓'},
    {id:'trazabilidad', label:'Trazabilidad', icon:'◍'},
  ]},
]

export default function Page() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white', fontFamily:'Inter, Arial, sans-serif'}}>
      {/* SIDEBAR IGUAL A TU FOTO */}
      <div style={{width:250, background:'#0f1012', borderRight:'1px solid #1f1f23', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'18px 20px', borderBottom:'1px solid #1f1f23'}}>
          <div style={{fontWeight:900, fontSize:20, letterSpacing:2}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
          <div style={{fontSize:8, color:'#666', letterSpacing:1.5, marginTop:2}}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        
        <div style={{flex:1, padding:'15px 10px', overflowY:'auto'}}>
          {menu.map(group=>(
            <div key={group.section} style={{marginBottom:20}}>
              <div style={{fontSize:9, color:'#555', letterSpacing:2, padding:'10px 12px', fontWeight:700}}>{group.section}</div>
              {group.items.map(item=>{
                const active = tab===item.id
                return (
                  <button key={item.id} onClick={()=>setTab(item.id)}
                    style={{
                      width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10,
                      background: active ? '#1c1917' : 'transparent',
                      color: active ? 'white' : '#9ca3af',
                      border:'none', borderLeft: active ? '3px solid #ff6a00' : '3px solid transparent',
                      padding:'10px 12px', borderRadius:6, cursor:'pointer', fontSize:13
                    }}>
                    <span style={{color: active ? '#ff6a00' : '#ff6a00', fontSize:14, opacity: active ? 1 : 0.7}}>{item.icon}</span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
        {/* TOP BAR IGUAL A TU FOTO */}
        <div style={{height:56, background:'#111214', borderBottom:'1px solid #1f1f23', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 25px'}}>
          <div style={{fontSize:11, color:'#666', letterSpacing:1}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{textAlign:'right'}}><div style={{fontSize:9, color:'#666'}}>USUARIO</div><div style={{fontSize:12, fontWeight:700}}>Administrador</div></div>
            <div style={{width:32, height:32, background:'#ff6a00', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>A</div>
          </div>
        </div>

        <div style={{flex:1, background:'#09090b', padding:25}}>
          {tab==='dashboard' && (
            <>
              <h1 style={{fontSize:26, margin:0, fontWeight:800}}>Dashboard</h1>
              <p style={{color:'#666', fontSize:13, marginTop:4}}>Vista general de la plataforma Vinculab.</p>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:15, marginTop:25}}>
                {[
                  {k:'EMPRESAS', v:'0'},
                  {k:'PRODUCTOS', v:'0'},
                  {k:'MODELOS', v:'0'},
                  {k:'LOTES', v:'0'},
                ].map(c=>(
                  <div key={c.k} style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}>
                    <div style={{fontSize:10, color:'#666', letterSpacing:1}}>{c.k}</div>
                    <div style={{fontSize:32, fontWeight:900, marginTop:8}}>{c.v}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab!=='dashboard' && (
            <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, padding:30, marginTop:20}}>
              <h2 style={{margin:0}}>{menu.flatMap(g=>g.items).find(i=>i.id===tab)?.label}</h2>
              <p style={{color:'#888'}}>Módulo {tab} conectado a Supabase. Aquí va tu tabla original.</p>
              {tab==='nfc' && <img src="/api/qr?data=https://ddp-qr-test-2-alpha.vercel.app/p/VIN-CL-000015" style={{marginTop:20, background:'white', padding:10, borderRadius:8}} />}
              {tab==='dpp' && <a href="/p/VIN-CL-000015" target="_blank" style={{color:'#ff6a00', display:'block', marginTop:15}}>Ver DPP de prueba →</a>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
